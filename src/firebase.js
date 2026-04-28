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
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

// 從 Firebase Console 取得的設定
const firebaseConfig = {
  apiKey: "AIzaSyCmpjx_6dPQtGfubTFcYZOpNpDVJD0-LwU",
  authDomain: "chuanlien-system.firebaseapp.com",
  projectId: "chuanlien-system",
  storageBucket: "chuanlien-system.firebasestorage.app",
  messagingSenderId: "535615404579",
  appId: "1:535615404579:web:6df27827b85c7af65f0f96",
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
// 角色判斷
// 根據 email 自動推斷角色,初期簡化版
// 日後若公司規模變大,可改為從 Firestore users collection 讀取
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

// 從 email 推斷角色 + 部門
export const inferUserProfile = (email) => {
  if (!email) return { role: ROLES.MEMBER, dept: "未知" };
  const lower = email.toLowerCase();

  let role = ROLES.MEMBER;
  let dept = "未指定";

  if (lower.startsWith("admin")) {
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
  } else {
    // 兼容舊測試帳號
    role = ROLES.ADMIN;
    dept = "營運與管理層";
  }

  // 從 email 推斷顯示名稱
  const localPart = email.split("@")[0];
  const displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

  return { role, dept, displayName };
};

