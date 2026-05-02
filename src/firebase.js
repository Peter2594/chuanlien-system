// ============================================================
// Firebase 連線設定
// 集中管理 Firebase 初始化,讓其他檔案統一從這裡 import
// ============================================================
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";

// 從環境變數讀取 Firebase 設定
// 若未提供,退回 demo 預設值以避免本機開發中斷。
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmpjx_6dPQtGfubTFcYZOpNpDVJD0-LwU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chuanlien-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chuanlien-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chuanlien-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "535615404579",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:535615404579:web:6df27827b85c7af65f0f96",
};

// 初始化
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ============================================================
// 驗證相關
// ============================================================
export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const register = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const watchAuth = (callback) => onAuthStateChanged(auth, callback);

// ============================================================
// Firestore 資料存取
// 採用「公司共用文件」的模式:整間公司共用一份資料
// 每個 collection 用單一文件 "shared",所有人讀寫同一份
// ============================================================
const COMPANY_ID = "chuanlien"; // 未來支援多公司可改用使用者所屬

// 取得某個 collection 的共用資料
export const fetchCollection = async (collectionName, fallback) => {
  try {
    const ref = doc(db, "companies", COMPANY_ID, "data", collectionName);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return data.value !== undefined ? data.value : fallback;
    }
    return fallback;
  } catch (err) {
    console.error(`fetchCollection(${collectionName}) failed:`, err);
    return fallback;
  }
};

// 寫入某個 collection 的共用資料
export const saveCollection = async (collectionName, value) => {
  try {
    const ref = doc(db, "companies", COMPANY_ID, "data", collectionName);
    await setDoc(ref, {
      value,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error(`saveCollection(${collectionName}) failed:`, err);
    return false;
  }
};

// ============================================================
// Firestore 單筆文件 collection 存取
// 用於 blockers 等需要單筆查詢、單筆權限與避免整包覆蓋的資料
// 路徑: companies/{companyId}/{collectionName}/{documentId}
// ============================================================
export const fetchDocumentCollection = async (collectionName, fallback = []) => {
  try {
    const ref = collection(db, "companies", COMPANY_ID, collectionName);
    const snap = await getDocs(ref);
    const items = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
    return items.length ? items : fallback;
  } catch (err) {
    console.error(`fetchDocumentCollection(${collectionName}) failed:`, err);
    return fallback;
  }
};

const makeStableDocId = (collectionName, item, index) => {
  const raw = item.id || item.employeeId || item.userId || item.email || item.name || `${collectionName}-${index}`;
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `${collectionName}-${index}`;
};

export const upsertDocument = async (collectionName, item, index = 0) => {
  try {
    const id = makeStableDocId(collectionName, item, index);
    const itemRef = doc(db, "companies", COMPANY_ID, collectionName, id);
    await setDoc(itemRef, { ...item, id }, { merge: true });
    return true;
  } catch (err) {
    console.error(`upsertDocument(${collectionName}) failed:`, err);
    return false;
  }
};

// 以 updatedAt 作為最小版衝突檢查:
// 若 expectedUpdatedAt 與雲端目前值不同,回傳 conflict 而不覆蓋。
export const upsertDocumentWithVersionCheck = async (
  collectionName,
  item,
  expectedUpdatedAt,
  index = 0
) => {
  try {
    const id = makeStableDocId(collectionName, item, index);
    const itemRef = doc(db, "companies", COMPANY_ID, collectionName, id);
    const snap = await getDoc(itemRef);
    const cloud = snap.exists() ? snap.data() : null;
    const cloudUpdatedAt = cloud?.updatedAt;
    if (
      snap.exists() &&
      expectedUpdatedAt &&
      cloudUpdatedAt &&
      cloudUpdatedAt !== expectedUpdatedAt
    ) {
      return { ok: false, conflict: true, id };
    }

    await setDoc(itemRef, { ...item, id }, { merge: true });
    return { ok: true, conflict: false, id };
  } catch (err) {
    console.error(`upsertDocumentWithVersionCheck(${collectionName}) failed:`, err);
    return { ok: false, conflict: false };
  }
};

export const deleteDocument = async (collectionName, documentId) => {
  try {
    if (!documentId) return false;
    const itemRef = doc(db, "companies", COMPANY_ID, collectionName, documentId);
    await deleteDoc(itemRef);
    return true;
  } catch (err) {
    console.error(`deleteDocument(${collectionName}) failed:`, err);
    return false;
  }
};

export const saveDocumentCollection = async (collectionName, value) => {
  try {
    const ref = collection(db, "companies", COMPANY_ID, collectionName);
    const snap = await getDocs(ref);
    const batch = writeBatch(db);
    const normalized = value.map((item, index) => ({
      ...item,
      id: makeStableDocId(collectionName, item, index),
    }));
    const nextIds = new Set(normalized.map((item) => item.id).filter(Boolean));

    snap.docs.forEach((item) => {
      if (!nextIds.has(item.id)) {
        batch.delete(item.ref);
      }
    });

    normalized.forEach((item) => {
      const itemRef = doc(db, "companies", COMPANY_ID, collectionName, item.id);
      batch.set(itemRef, item, { merge: true });
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error(`saveDocumentCollection(${collectionName}) failed:`, err);
    return false;
  }
};

// ============================================================
// 角色常數
// 正式權限來源應由 companies/{companyId}/users/{userId} 或後端驗證提供。
// inferUserProfile 只作為無使用者資料時的安全 fallback,不可當正式授權。
// ============================================================
export const ROLES = {
  ADMIN: "admin",       // 管理層:看全部、可下決策
  MANAGER: "manager",   // 部門主管:看自己部門 + 跨部門協作
  MEMBER: "member",     // 一般員工:只看自己的資料
};

export const ROLE_LABELS = {
  admin: "管理層",
  manager: "部門主管",
  member: "一般員工",
};

// 安全 fallback:未知帳號一律給 member,避免陌生 email 變成 admin。
export const inferUserProfile = (email) => {
  if (!email) return { role: ROLES.MEMBER, dept: "未知" };
  const lower = email.toLowerCase();

  let role = ROLES.MEMBER;
  let dept = "未指定";

  if (lower === "admin@test.com" || lower.startsWith("admin@")) {
    role = ROLES.ADMIN;
    dept = "營運與管理層";
  } else if (lower.startsWith("manager")) {
    role = ROLES.MANAGER;
    if (lower.includes("research")) dept = "投資研究部";
    else if (lower.includes("biz")) dept = "業務開發部";
    else if (lower.includes("asset")) dept = "資產管理部";
    else dept = "未指定部門";
  } else if (lower.startsWith("member")) {
    role = ROLES.MEMBER;
    dept = "業務開發部"; // 預設
  }

  // 從 email 推斷顯示名稱
  const localPart = email.split("@")[0];
  const displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

  return { role, dept, displayName };
};

