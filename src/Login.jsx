import React, { useState } from "react";
import { login } from "./firebase";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

const C = {
  bg: "#F8F6F0",
  surface: "#FFFFFF",
  border: "#D8D5CC",
  text: "#2C2826",
  textMid: "#6E6862",
  textLight: "#A09B92",
  accent: "#3D4A5C",
  accentLight: "#E5E8EE",
  highlight: "#B85450",
  danger: "#8C3A3A",
  dangerLight: "#F2E2DD",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      // 登入成功後 App.jsx 的 onAuthStateChanged 會自動切換畫面
    } catch (err) {
      let msg = "登入失敗,請檢查帳號密碼";
      if (err.code === "auth/user-not-found") msg = "找不到此帳號";
      else if (err.code === "auth/wrong-password") msg = "密碼錯誤";
      else if (err.code === "auth/invalid-email") msg = "電子郵件格式不正確";
      else if (err.code === "auth/invalid-credential") msg = "帳號或密碼錯誤";
      else if (err.code === "auth/too-many-requests") msg = "嘗試次數過多,請稍後再試";
      else if (err.code === "auth/network-request-failed") msg = "網路連線異常";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #F7FBFF 0%, #EAF3FC 60%, #F4EFE6 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: C.surface,
          borderRadius: 14,
          padding: "40px 36px",
          boxShadow: "0 8px 40px rgba(31, 78, 121, 0.08), 0 1px 3px rgba(0,0,0,0.04)",
          border: "1px solid " + C.border,
        }}
      >
        {/* Logo + 標題 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: C.accent,
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 14,
              boxShadow: "0 4px 12px " + C.accent + "40",
            }}
          >
            串
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: C.text }}>
            串連股份有限公司
          </h1>
          <div style={{ fontSize: 13, color: C.textMid }}>管理層決策輔助系統</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: C.textMid,
                marginBottom: 6,
                fontWeight: 500,
                display: "block",
              }}
            >
              電子郵件
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              autoComplete="email"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid " + C.border,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                background: C.surface,
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontSize: 12,
                color: C.textMid,
                marginBottom: 6,
                fontWeight: 500,
                display: "block",
              }}
            >
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid " + C.border,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                background: C.surface,
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: C.dangerLight,
                border: "1px solid " + C.danger + "30",
                borderRadius: 6,
                fontSize: 12,
                color: C.danger,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* 登入按鈕 */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: loading || !email || !password ? C.textLight : C.accent,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !email || !password ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                登入中...
              </>
            ) : (
              <>
                <LogIn size={15} />
                登入
              </>
            )}
          </button>
        </form>

        {/* 注意事項 */}
        <div
          style={{
            marginTop: 22,
            padding: "12px 14px",
            background: C.bg,
            borderRadius: 8,
            fontSize: 11,
            color: C.textMid,
            lineHeight: 1.7,
          }}
        >
          <div style={{ fontWeight: 500, color: C.text, marginBottom: 4 }}>
            🔒 內部系統存取限制
          </div>
          僅限串連股份有限公司員工使用。如需開通帳號,請洽資訊部門。
        </div>

        {/* 版本資訊 */}
        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11,
            color: C.textLight,
          }}
        >
          資管導論 第 13 組 · v2.0
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
