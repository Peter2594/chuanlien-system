import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// 本版本已改用 Firebase 作為儲存後端
// 所有資料存取都透過 src/firebase.js 統一處理

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
