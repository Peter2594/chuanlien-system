import React from "react";
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from "lucide-react";

export default function SyncStatusPanel({ syncStatus, syncConflicts = [], onRetry, colors }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color:
            syncStatus === "error"
              ? colors.danger
              : syncStatus === "syncing"
                ? colors.warn
                : colors.success,
          padding: "6px 8px",
          background:
            syncStatus === "error"
              ? colors.dangerLight
              : syncStatus === "syncing"
                ? colors.warnLight
                : colors.successLight,
          borderRadius: 6,
        }}
      >
        {syncStatus === "syncing" && (
          <>
            <RefreshCw size={11} style={{ animation: "spin 1s linear infinite" }} />
            同步中...
          </>
        )}
        {syncStatus === "idle" && (
          <>
            <Cloud size={11} />
            已同步至雲端
          </>
        )}
        {syncStatus === "error" && (
          <>
            <CloudOff size={11} />
            同步失敗
            <button
              onClick={onRetry}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: colors.danger,
                fontSize: 10,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              重試
            </button>
          </>
        )}
      </div>

      {syncConflicts.length > 0 && (
        <div
          style={{
            marginTop: 6,
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 10,
            color: colors.warn,
            background: colors.warnLight,
            display: "flex",
            gap: 6,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={11} style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            偵測到資料版本衝突：{syncConflicts.join(", ")}。已停止覆蓋，請按「重試」先拉最新資料。
          </div>
        </div>
      )}
    </div>
  );
}
