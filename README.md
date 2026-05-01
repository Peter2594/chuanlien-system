# 串連股份有限公司 · 管理層決策輔助系統

資管導論 第 13 組 · v2.0(Firebase 雲端版)

---

## 🚀 第一次啟動(本機)

### 步驟 1:安裝 Node.js

到 https://nodejs.org 下載 **LTS 版本**,一路下一步安裝完。

確認版本(打開 cmd):

```cmd
node -v
```

需要 v18 以上。

---

### 步驟 2:安裝套件(只需第一次)

在這個資料夾執行:

```cmd
npm install
```

會跑 1–3 分鐘下載 React、Firebase 等套件。

---

### 步驟 3:啟動

```cmd
npm run dev
```

成功會看到:

```
VITE v5.4.8  ready in 523 ms
➜  Local:   http://localhost:5173/
```

瀏覽器自動打開,看到登入畫面就成功 🎉

---

## 🔑 登入資訊

預先建立的測試帳號(在 Firebase Console 建立的):

```
Email: admin@test.com
密碼:test1234
```

如需新增更多帳號:打開 https://console.firebase.google.com → 你的專案 → Authentication → Users → 新增使用者

---

## ☁️ 部署到網路上(讓全組可以用)

### 推薦方式:Vercel(免費、最快)

#### 步驟 A:準備 GitHub 帳號

1. 到 https://github.com 註冊或登入帳號
2. 點右上角 + → New repository
3. Repository name:`chuanlien-system`(隨便取)
4. **不要**勾選任何初始化選項(README、.gitignore 等都不勾)
5. 點 Create repository
6. **保留下一頁的網址**(類似 `https://github.com/你的帳號/chuanlien-system.git`)

#### 步驟 B:上傳專案到 GitHub

確認你電腦有裝 git(沒有的話到 https://git-scm.com 下載)。

在 cmd **這個專案資料夾**裡執行:

```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的帳號/chuanlien-system.git
git push -u origin main
```

第一次 push 時 git 會跳出 GitHub 登入視窗,登入即可。

完成後重新整理 GitHub 頁面,會看到所有檔案上傳了。

#### 步驟 C:部署到 Vercel

1. 到 https://vercel.com 點 **Sign Up**
2. 選 **Continue with GitHub**(用 GitHub 帳號登入最方便)
3. 登入後點 **Add New** → **Project**
4. 找到剛剛建立的 `chuanlien-system` repo,點 **Import**
5. 設定頁面:
   - Framework Preset:會自動偵測為 **Vite**
   - 其他全部保持預設
6. 點 **Deploy**
7. 等 1–2 分鐘,完成後會給你一個網址,類似:
   `https://chuanlien-system.vercel.app`

**這個網址就是你的系統網址!** 全組任何人在任何電腦只要打開網址就能用。

#### 步驟 D:設定 Firebase 允許這個網址

讓 Firebase 知道你的新網址是合法的:

1. 到 https://console.firebase.google.com → 你的專案
2. 點 **Authentication** → **Settings** → **Authorized domains**
3. 點 **Add domain**,輸入你的 Vercel 網址(不用 https://,只要 `chuanlien-system.vercel.app`)
4. 儲存

完成!現在全組所有人都可以用這個網址登入系統了 🌐

---

### 之後要更新系統怎麼辦?

修改程式碼後,在 cmd 執行:

```cmd
git add .
git commit -m "更新功能"
git push
```

Vercel 會**自動偵測**你的更新,大約 1 分鐘後新版上線。

---

## 📂 檔案結構

```
project/
├── package.json          ← 套件設定(含 firebase)
├── vite.config.js        ← Vite 設定
├── index.html            ← HTML 進入點
├── src/
│   ├── main.jsx          ← React 啟動檔
│   ├── firebase.js       ← Firebase 連線管理(集中設定)
│   ├── Login.jsx         ← 登入畫面
│   └── App.jsx           ← 系統主程式(8 大功能)
└── README.md
```

---

## 🎯 Demo 操作建議流程

1. **登入**(`admin@test.com` / `test1234`)
2. **Dashboard** 一覽:統計卡 → 共同議題 → 卡點警示(歷史分位數)→ 系統性異常 → 決策追蹤
3. **點任一卡點** → 看完整統計分析(直方圖、分位數、系統建議)
4. **週報填寫** → 當場填一筆 → 回 Dashboard 看數字即時變化
5. **案件交接** → 故意漏填欄位 → 按鈕變灰
6. **決策追蹤** → 看逾期決策 → 新增一個決策
7. **員工負載** → 點過載員工 → 看負載組成
8. **卡點分析** → 看 demo seed 右偏歷史資料 + 直方圖
9. **歷史搜尋** → 打 FinTech → 點進案件看完整始末

---

## 📌 卡點分析重構說明

這版已把卡點分析從「週報文字 + 推算天數 + 常態分佈 z-score」改成「單筆 blocker 資料 + createdAt/resolvedAt 時間戳 + 歷史經驗分位數」。

- 週報可新增 0 到多筆卡點,不再把整段文字當成一個卡點。
- 卡點會寫入 `companies/{companyId}/blockers/{blockerId}`。
- 每筆卡點包含 `title`, `description`, `dept`, `owner`, `category`, `status`, `createdAt`, `updatedAt`, `resolvedAt`, `weekId`, `sourceReportId`, `relatedDepartments`, `caseId`。
- 未解決卡點用 `today - createdAt` 算已卡天數；已解決卡點用 `resolvedAt - createdAt` 算解決天數。
- 風險等級用歷史分位數判定:P75 以下正常、P75-P90 關注、P90-P95 高風險、P95 以上極高風險。
- 同類歷史少於 5 筆時改用全公司歷史；全公司也不足 5 筆時只顯示資料不足與 SLA 提醒,不輸出假百分位。
- 分類只是「初步關鍵字分類」,可人工覆蓋；不是 NLP,也不是正式風控或績效模型。
- Demo 歷史卡點是固定右偏範例資料,用來展示統計介面,不是企業真實資料。

## 🧱 非 LINE Bot 的正式化調整

LINE Bot 目前仍保留前端推播預覽,尚未串接 Messaging API、Webhook 或排程服務。除此之外,這版已先把幾個容易被問爆的 demo 設計收斂掉:

- `reports`, `handoffs`, `decisions`, `blockers`, `customMeetings`, `meetingHistory` 改用 `companies/{companyId}/{collection}/{documentId}` 的單筆 document collection,不再把主要資料整包 array 寫進同一份 shared document。
- `employees`, `departments`, `users` 也改成 Firestore collection seed,前端只保留 demo fallback,方便後續由 HR 或管理者維護組織資料。
- 未知 email 不再預設為管理層；角色優先讀 `users` collection,讀不到時才用安全 fallback 並給一般員工權限。
- 週報填寫支援 0 到多筆卡點,卡點數量異常改看實際 blocker 筆數,不再用標點符號切句硬算。
- 新增 client-side `auditLogs` collection,記錄主要資料的 create/update/delete、actor、before/after、時間。這是 prototype 可追蹤版本；正式不可竄改 audit log 仍應放到後端或 Cloud Functions。
- 員工負載與管理提醒已改成中性措辭,定位為「管理提醒訊號」,不直接當作績效、人事或心理狀態判斷。

### Firestore rules 範本

目前專案仍是 React + Firebase prototype,正式導入前應再做後端不可竄改 audit log。不要把正式環境維持在 `allow read, write: if request.auth != null`。較合理的方向是用 `users` collection 管角色與部門:

```js
function signedIn() {
  return request.auth != null;
}

function userDoc(companyId) {
  return get(/databases/$(database)/documents/companies/$(companyId)/users/$(request.auth.uid));
}

function role(companyId) {
  return userDoc(companyId).data.role;
}

function dept(companyId) {
  return userDoc(companyId).data.dept;
}

match /companies/{companyId}/users/{userId} {
  allow read: if signedIn() && (role(companyId) == "admin" || request.auth.uid == userId);
  allow write: if signedIn() && role(companyId) == "admin";
}

match /companies/{companyId}/reports/{reportId} {
  allow read: if signedIn() && (
    role(companyId) == "admin" ||
    resource.data.dept == dept(companyId)
  );
  allow write: if signedIn() && (
    role(companyId) == "admin" ||
    request.resource.data.dept == dept(companyId)
  );
}

match /companies/{companyId}/{collectionName}/{docId} {
  allow read, write: if signedIn() && role(companyId) == "admin";
}
```

實際部署時還要依 `managerRelations`、資料保存期限、匯出權限與審計需求再細分。

---

## 🛠 疑難排解

**Q: 登入時說「帳號或密碼錯誤」**
→ 到 Firebase Console → Authentication → Users 確認帳號真的存在,密碼至少 6 字

**Q: 登入後一直轉圈圈**
→ 可能是 Firestore 規則沒設定。Demo 測試可暫時放寬,但正式或共享環境請改用上面的角色/部門規則方向,不要長期使用全登入者可讀寫。

**Q: 同步狀態顯示「同步失敗」**
→ 點旁邊的「重試」按鈕。如果一直失敗,檢查網路或 Firebase 規則

**Q: Vercel 部署失敗**
→ 通常是 Node 版本問題,在 Vercel 專案設定裡把 Node 版本設為 18.x

**Q: 別台電腦看到舊資料**
→ 關掉瀏覽器分頁重開,或按側邊欄「重試」按鈕

---

## 💰 成本

整套系統使用以下免費服務:

- **Firebase**: 每天 50,000 次讀 / 20,000 次寫(20 人公司用一輩子都不會超過)
- **Vercel**: 每月 100GB 流量(完全用不完)
- **GitHub**: 私人 repo 免費

**期末 Demo 完全 0 元**。
