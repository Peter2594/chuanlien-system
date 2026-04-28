import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  ArrowRightLeft,
  Search,
  MessageCircle,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ChevronRight,
  Paperclip,
  Send,
  Building2,
  TrendingUp,
  X,
  Check,
  BarChart3,
  Flame,
  Info,
  Activity,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import Login from "./Login.jsx";
import {
  watchAuth,
  logout,
  fetchCollection,
  saveCollection,
  inferUserProfile,
  ROLES,
  ROLE_LABELS,
} from "./firebase.js";

// ===== 初始範例資料 =====
const SEED_REPORTS = [
  {
    id: "r1",
    dept: "投資研究部",
    week: "第 42 週",
    author: "周世倫",
    submittedAt: "2025-10-17 16:32",
    cases: "• A 新創 Pre-A 輪盡職調查\n• B 公司產業分析報告\n• C 標的二次訪談紀錄",
    blockers: "A 新創財務資料尚未收齊,已兩週",
    needHelp: "請業開部協助聯繫 A 新創財務長",
    nextWeek: "完成 B 公司產業分析初稿",
    keywords: ["A 新創", "FinTech", "Pre-A", "盡調"],
  },
  {
    id: "r2",
    dept: "業務開發部",
    week: "第 42 週",
    author: "林聿平",
    submittedAt: "2025-10-17 17:05",
    cases: "• A 新創投資條件書草擬\n• Q4 新客戶開發\n• D 客戶 NDA 簽訂",
    blockers: "A 新創財務長行程難安排",
    needHelp: "需管理層確認 Q4 募資節奏",
    nextWeek: "推進 A 新創簽約流程",
    keywords: ["A 新創", "Q4", "募資", "NDA"],
  },
  {
    id: "r3",
    dept: "資產管理部",
    week: "第 42 週",
    author: "梁嘉芫",
    submittedAt: "2025-10-17 17:48",
    cases: "• 既有投資組合季度回顧\n• Q4 募資方案評估\n• 法遵審核排程",
    blockers: "法遵審核等待管理層決議已 5 天",
    needHelp: "需研究部提供 A 新創風險評估",
    nextWeek: "完成 Q4 募資資金配置",
    keywords: ["Q4", "募資", "法遵", "A 新創"],
  },
];

const SEED_HANDOFFS = [
  {
    id: "h1",
    from: "業開部",
    to: "投研部",
    caseId: "C-2025-042",
    title: "A 新創 Pre-A 輪產業分析委託",
    background: "A 新創為 FinTech 領域 Pre-A 輪標的,已完成初步接觸。客戶端希望於 11 月中完成投資條件書。需研究部進行產業競品分析。",
    progress: "已取得 A 新創簡報、創辦人訪談逐字稿、初步財報。",
    todo: "完成 FinTech 三大競品比較表、估值區間建議、風險評估。",
    attachments: ["A新創簡報.pdf", "訪談逐字稿", "財報摘要.xlsx"],
    status: "已簽收",
    sender: "林聿平",
    receiver: "鍾皓明",
    createdAt: "2025-10-15",
  },
  {
    id: "h2",
    from: "業開部",
    to: "資管部",
    caseId: "C-2025-048",
    title: "D 客戶 NDA 草案審閱",
    background: "D 客戶擬投資金額 3000 萬,需先完成 NDA 後進入盡調。",
    progress: "NDA 草案已擬定,待資管部法務審閱。",
    todo: "審閱 NDA 條款並回覆修改意見。",
    attachments: ["NDA_草案_v2.docx"],
    status: "待簽收",
    sender: "林聿平",
    receiver: "梁嘉芫",
    createdAt: "2025-10-14",
    hoursOverdue: 72,
  },
  {
    id: "h3",
    from: "投研部",
    to: "業開部",
    caseId: "C-2025-051",
    title: "E 標的訪談紀錄整理",
    background: "E 標的為教育科技新創,業開部需訪談紀錄進行下一步接觸。",
    progress: "創辦人訪談 2 小時已完成,逐字稿整理中。",
    todo: "審閱訪談重點並決定是否推進。",
    attachments: ["E標的訪談逐字稿.docx", "財務初步評估.xlsx"],
    status: "待簽收",
    sender: "鍾皓明",
    receiver: "林欣逸",
    createdAt: "2025-10-15",
    hoursOverdue: 56,
  },
];

const SEED_HISTORY = [
  {
    id: "k1",
    title: "K 公司支付 SaaS 投資評估",
    date: "2024-Q2",
    tags: ["FinTech", "Pre-A", "SaaS", "估值"],
    summary: "FinTech 領域 Pre-A 輪估值案例,最終採 SaaS 營收倍數 8–12x 區間。",
    owner: "周世倫",
    handoffs: 2,
    outcome: "投資 · 報酬率 2.3x",
    detail: {
      background: "K 公司為 B2B SaaS 支付解決方案提供商,2024 年 3 月進入我們視野。創辦團隊具備金融科技與支付處理經驗,主要客群為中大型電商平台。",
      process: "歷時 3 個月完成盡職調查,包含財務審閱、客戶訪談、技術架構審查、市場競品分析。過程中兩次跨部門交接,分別由業開部轉至研究部、再由研究部轉至資管部簽核。",
      valuation: "最終以 SaaS 年經常性營收(ARR)的 10x 倍數作為估值基礎,投資金額 2,500 萬台幣,持股 8%。",
      keyInsights: [
        "客戶留存率 94%,遠高於同業平均的 78%",
        "毛利率達 72%,符合成熟 SaaS 標準",
        "創辦人在支付產業有 12 年經驗",
      ],
      result: "截至 2025 Q3,K 公司 ARR 已從投資時的 2,400 萬成長至 5,800 萬,估值成長 2.3 倍。",
      lessons: "本案建立了本公司後續 FinTech 類標的的估值框架,尤其是 SaaS 營收倍數區間的判斷依據。",
    },
  },
  {
    id: "k2",
    title: "M 新創理財平台盡職調查",
    date: "2024-Q4",
    tags: ["FinTech", "理財", "盡調", "競品"],
    summary: "相似產業競品比較架構,含三家可對標公司財務模型。",
    owner: "梁嘉芫",
    handoffs: 3,
    outcome: "觀望",
    detail: {
      background: "M 平台為針對 25–35 歲年輕族群的理財顧問服務,採訂閱制收費。於 2024 年 10 月主動接觸我司。",
      process: "完成完整三輪盡調,包含產品體驗、財務審閱、管理層會議。因創辦人估值期待過高(要求 15x ARR),且當時市場上相似標的估值區間為 8–12x,最終未能達成共識。",
      valuation: "我方估值:6,500 萬;創辦人期待:1.2 億。差距約一倍。",
      keyInsights: [
        "產品有差異化,但規模效應尚未建立",
        "CAC(客戶獲取成本)偏高,回本週期 18 個月",
        "監管風險需持續追蹤",
      ],
      result: "雙方協議觀望至 2025 年中,待 M 平台用戶數達 10 萬再重啟評估。",
      lessons: "早期接觸時應先對齊估值期待,避免雙方投入大量時間後才發現差距過大。",
    },
  },
  {
    id: "k3",
    title: "P 金融科技 A 輪追加投資",
    date: "2023-Q3",
    tags: ["FinTech", "保險科技", "A 輪", "估值"],
    summary: "估值方法論可參考,但產業細分(保險科技)與本次標的不同。",
    owner: "林欣逸",
    handoffs: 1,
    outcome: "投資 · 仍持有",
    detail: {
      background: "P 公司為保險科技新創,我司於 Seed 輪已投資,本次為 A 輪追加。",
      process: "作為既有投資人,追加評估以董事會資料為主,補充市場擴張計畫審閱。交接單僅 1 張(Seed 輪檔案沿用)。",
      valuation: "A 輪估值較 Seed 輪成長 3.2 倍,反映 ARR 翻倍成長與客戶集中度下降。",
      keyInsights: [
        "從單一保險公司客戶擴展至 8 家",
        "推出核保自動化工具後毛利率改善",
        "進入東南亞市場的時程延後一年",
      ],
      result: "持股比例維持約 6%,目前仍持有等待 B 輪或退場機會。",
      lessons: "既有投資追加的盡調可簡化,但需特別審視前次投資後的 KPI 達成狀況。",
    },
  },
  {
    id: "k4",
    title: "S 加密支付新創 Seed 輪",
    date: "2023-Q1",
    tags: ["Web3", "支付", "Seed"],
    summary: "早期新創,團隊背景強但市場時機未到。",
    owner: "周世倫",
    handoffs: 2,
    outcome: "未投資",
    detail: {
      background: "S 公司為跨境加密支付解決方案,2023 年 1 月由知名天使投資人介紹。",
      process: "完成初步技術審查與法遵風險評估。由於加密資產監管環境不明,且本公司當時投資委員會對 Web3 類標的保守,最終決議不投。",
      valuation: "Seed 輪估值 3 億,我方評估合理區間為 1.5–2 億。",
      keyInsights: [
        "團隊技術實力強,但創辦人沒有支付產業經驗",
        "法遵風險為首要考量",
        "產品 PMF(產品市場契合度)尚未驗證",
      ],
      result: "未投資。S 公司於 2024 年完成 A 輪,由其他 VC 領投。",
      lessons: "建立本公司對 Web3 類標的的評估標準,主要關注法遵環境與創辦人產業經驗。",
    },
  },
];

// ============================================================
// 歷史卡點資料庫
// 模擬過去 6 個月(第 16–41 週)累積的 60 筆已解決卡點
// 每筆資料包含:類別、涉及部門數、案件金額級別、實際解決天數
// 用於:統計分析 + 異常檢測 + z-score 排序
// ============================================================
const BLOCKER_CATEGORIES = [
  { key: "法遵", label: "法遵審核", keywords: ["法遵", "合規", "法律", "審核", "NDA"], color: "#A32D2D" },
  { key: "資金", label: "資金調度", keywords: ["資金", "募資", "Q4", "配置", "分潤"], color: "#534AB7" },
  { key: "資料", label: "資料取得", keywords: ["財務", "財報", "資料", "盡調", "訪談"], color: "#B36B00" },
  { key: "跨部門", label: "跨部門協調", keywords: ["聯繫", "協助", "對接", "溝通"], color: "#0F6E56" },
  { key: "決策", label: "決策等待", keywords: ["決議", "決策", "簽核", "委員會"], color: "#1F4E79" },
];

// 類別對應的實際統計參數(用於生成合理範例資料的母體)
const CATEGORY_STATS_PARAMS = {
  法遵: { mean: 8.5, std: 3.2, n: 14 },
  資金: { mean: 5.8, std: 2.4, n: 10 },
  資料: { mean: 6.2, std: 3.8, n: 15 },
  跨部門: { mean: 4.5, std: 2.1, n: 12 },
  決策: { mean: 7.8, std: 4.5, n: 9 },
};

// 以 seed 產生可重現的隨機常態分佈
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function normalSample(rnd, mean, std) {
  const u1 = rnd() || 0.001;
  const u2 = rnd();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(1, Math.round(mean + z * std));
}

// 產生歷史卡點範例
const SEED_BLOCKER_HISTORY = (() => {
  const rnd = seededRandom(42);
  const data = [];
  const depts = ["投資研究部", "業務開發部", "資產管理部"];
  const caseSizeLevels = ["S", "M", "L", "XL"];
  const titles = {
    法遵: ["NDA 條款審閱", "法遵合規檢查", "投資契約審核", "監管風險評估"],
    資金: ["Q3 資金配置", "募資方案評估", "分潤機制調整", "備用金撥款"],
    資料: ["財務資料收齊", "盡調資料整理", "訪談紀錄補件", "財報翻譯校對"],
    跨部門: ["部門資訊同步", "跨部門對接窗口", "聯絡外部單位", "會議資料整合"],
    決策: ["投資委員會決議", "投資條件書簽核", "退出決策評估", "追加投資決議"],
  };

  let id = 1;
  Object.entries(CATEGORY_STATS_PARAMS).forEach(([cat, params]) => {
    for (let i = 0; i < params.n; i++) {
      const days = normalSample(rnd, params.mean, params.std);
      const weekNum = 16 + Math.floor(rnd() * 25);
      data.push({
        id: "bh" + id++,
        category: cat,
        title: titles[cat][i % titles[cat].length] + (i > 3 ? ` · 案件 ${i}` : ""),
        dept: depts[Math.floor(rnd() * 3)],
        crossDepts: 1 + Math.floor(rnd() * 3),
        caseSize: caseSizeLevels[Math.floor(rnd() * 4)],
        daysToResolve: days,
        resolvedAt: `第 ${weekNum} 週`,
        weekNum,
      });
    }
  });
  return data.sort((a, b) => a.weekNum - b.weekNum);
})();

// ============================================================
// 決策追蹤資料庫(Decision Log)
// ============================================================
const SEED_DECISIONS = [
  {
    id: "d1",
    title: "A 新創 Pre-A 輪投資金額上限",
    content: "決議對 A 新創 Pre-A 輪投資上限為 3,000 萬,估值不得高於 4 億。",
    decidedBy: "投資委員會",
    decidedAt: "2025-10-08",
    dueDate: "2025-10-22",
    assignedDept: "投資研究部",
    status: "執行中",
    linkedCases: ["C-2025-042"],
    notes: "需於 10/22 前完成投資條件書草擬。",
  },
  {
    id: "d2",
    title: "Q4 分潤機制檢討",
    content: "決議調整資產管理部 Q4 分潤比例,由 80/20 改為 75/25,激勵管理效益。",
    decidedBy: "董事會",
    decidedAt: "2025-09-25",
    dueDate: "2025-10-15",
    assignedDept: "資產管理部",
    status: "逾期",
    linkedCases: [],
    notes: "預期 10/15 上線,實際延後中。",
  },
  {
    id: "d3",
    title: "設立法遵專員職位",
    content: "因應近期法遵案件增加,董事會決議年底前招募 1 位法遵專員。",
    decidedBy: "董事會",
    decidedAt: "2025-09-10",
    dueDate: "2025-12-31",
    assignedDept: "營運與管理層",
    status: "執行中",
    linkedCases: [],
    notes: "人事部已開始徵才流程。",
  },
  {
    id: "d4",
    title: "年度預算追加 500 萬",
    content: "因應新案件量增加,決議追加 Q4 營運預算 500 萬。",
    decidedBy: "董事會",
    decidedAt: "2025-09-18",
    dueDate: "2025-10-01",
    assignedDept: "營運與管理層",
    status: "已完成",
    linkedCases: [],
    notes: "撥款已於 9/30 完成。",
    completedAt: "2025-09-30",
  },
  {
    id: "d5",
    title: "暫停評估 Web3 類標的",
    content: "因應監管環境不明,決議暫停所有 Web3 類新案件的深度盡調。",
    decidedBy: "投資委員會",
    decidedAt: "2025-10-02",
    dueDate: "即時生效",
    assignedDept: "投資研究部",
    status: "已完成",
    linkedCases: [],
    notes: "研究部已暫停 2 筆 Web3 案件評估。",
    completedAt: "2025-10-03",
  },
];

// ============================================================
// 歷史共同議題追蹤(用於慢性議題偵測)
// 模擬過去 8 週的共同議題紀錄
// ============================================================
const SEED_TOPIC_HISTORY = [
  { week: 34, topics: ["B 公司", "Q3 結算"] },
  { week: 35, topics: ["B 公司", "Q3 結算", "法遵"] },
  { week: 36, topics: ["Q3 結算", "法遵"] },
  { week: 37, topics: ["法遵", "A 新創"] },
  { week: 38, topics: ["A 新創", "Q4", "法遵"] },
  { week: 39, topics: ["A 新創", "Q4", "募資"] },
  { week: 40, topics: ["A 新創", "Q4", "募資"] },
  { week: 41, topics: ["A 新創", "Q4", "募資", "法遵"] },
];

// ============================================================
// 歷史週報活動統計(用於週報異常偵測)
// 每週每部門的:協助請求數、卡點數、案件數
// ============================================================
const SEED_REPORT_ACTIVITY = (() => {
  const rnd = seededRandom(88);
  const depts = ["投資研究部", "業務開發部", "資產管理部"];
  const data = [];
  // 過去 8 週(34–41)的活動基礎值
  const deptBase = {
    投資研究部: { help: 1.5, blockers: 0.8, cases: 3.5 },
    業務開發部: { help: 2.0, blockers: 0.9, cases: 4.2 },
    資產管理部: { help: 1.2, blockers: 0.6, cases: 3.0 },
  };
  for (let w = 34; w <= 41; w++) {
    depts.forEach((d) => {
      const b = deptBase[d];
      data.push({
        week: w,
        dept: d,
        helpRequests: Math.max(0, Math.round(normalSample(rnd, b.help, 0.9))),
        blockers: Math.max(0, Math.round(normalSample(rnd, b.blockers, 0.6))),
        cases: Math.max(1, Math.round(normalSample(rnd, b.cases, 1.2))),
      });
    });
  }
  return data;
})();

// ============================================================
// 統計分析模組
// ============================================================
const stats = {
  mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  },

  std(arr) {
    if (arr.length < 2) return 0;
    const m = stats.mean(arr);
    const variance = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1);
    return Math.sqrt(variance);
  },

  percentile(arr, p) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (sorted.length - 1) * (p / 100);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
  },

  zscore(value, arr) {
    const m = stats.mean(arr);
    const s = stats.std(arr);
    if (s === 0) return 0;
    return (value - m) / s;
  },

  // 常態分佈 CDF 近似(Abramowitz & Stegun)
  zToPercentile(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? (1 - p) * 100 : p * 100;
  },

  histogram(arr, bins = 8) {
    if (!arr.length) return [];
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    const binWidth = range / bins;
    const counts = new Array(bins).fill(0);
    arr.forEach((x) => {
      const idx = Math.min(bins - 1, Math.floor((x - min) / binWidth));
      counts[idx]++;
    });
    return counts.map((count, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count,
    }));
  },
};

// 卡點分類(text mining)
function classifyBlocker(text) {
  if (!text) return "跨部門";
  const scores = {};
  BLOCKER_CATEGORIES.forEach((c) => {
    scores[c.key] = 0;
    c.keywords.forEach((kw) => {
      if (text.includes(kw)) scores[c.key] += 1;
    });
  });
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : "跨部門";
}

// 卡點風險分析
function analyzeBlockerRisk(currentDays, category, historyDB) {
  const sameCategoryDays = historyDB
    .filter((h) => h.category === category)
    .map((h) => h.daysToResolve);

  if (sameCategoryDays.length < 3) {
    return { hasData: false, category };
  }

  const mean = stats.mean(sameCategoryDays);
  const std = stats.std(sameCategoryDays);
  const median = stats.percentile(sameCategoryDays, 50);
  const p75 = stats.percentile(sameCategoryDays, 75);
  const p90 = stats.percentile(sameCategoryDays, 90);
  const z = stats.zscore(currentDays, sameCategoryDays);
  const pct = stats.zToPercentile(z);

  let level, levelLabel;
  if (z >= 2) {
    level = "critical";
    levelLabel = "極高風險";
  } else if (z >= 1) {
    level = "high";
    levelLabel = "高風險";
  } else if (z >= 0) {
    level = "medium";
    levelLabel = "關注中";
  } else {
    level = "normal";
    levelLabel = "正常範圍";
  }

  const riskScore = Math.min(99, Math.max(0, Math.round(pct)));

  return {
    hasData: true,
    category,
    currentDays,
    mean: mean.toFixed(1),
    std: std.toFixed(1),
    median,
    p75,
    p90,
    z: z.toFixed(2),
    percentile: Math.round(pct),
    sampleSize: sameCategoryDays.length,
    level,
    levelLabel,
    riskScore,
    daysOverP75: Math.max(0, currentDays - p75).toFixed(1),
  };
}

function analyzeBlockerText(text, daysElapsed, historyDB) {
  const category = classifyBlocker(text);
  return {
    ...analyzeBlockerRisk(daysElapsed, category, historyDB),
    originalText: text,
    categoryInfo: BLOCKER_CATEGORIES.find((c) => c.key === category),
  };
}

// ============================================================
// 週報異常偵測
// 比對某部門本週活動量(協助請求、卡點)是否偏離過去 8 週歷史平均
// 使用 z-score:當 z ≥ 1.5 時觸發警示
// ============================================================
function detectReportAnomaly(currentReports, activityHistory) {
  const depts = ["投資研究部", "業務開發部", "資產管理部"];
  const anomalies = [];

  depts.forEach((dept) => {
    const r = currentReports.find((x) => x.dept === dept);
    if (!r) return;

    // 計算本週該部門的活動量(簡化:用內容長度估)
    const currentHelp = (r.needHelp || "").split(/[、,.。\n]/).filter((s) => s.trim()).length;
    const currentBlockers = (r.blockers || "").split(/[、,.。\n]/).filter((s) => s.trim()).length;

    // 歷史資料
    const history = activityHistory.filter((h) => h.dept === dept);
    const helpHistory = history.map((h) => h.helpRequests);
    const blockerHistoryArr = history.map((h) => h.blockers);

    // 計算 z-score
    const helpZ = stats.zscore(currentHelp, helpHistory);
    const blockerZ = stats.zscore(currentBlockers, blockerHistoryArr);

    if (helpZ >= 1.5) {
      anomalies.push({
        dept,
        type: "help",
        typeLabel: "跨部門協助請求異常",
        currentValue: currentHelp,
        historyMean: stats.mean(helpHistory).toFixed(1),
        z: helpZ.toFixed(2),
        severity: helpZ >= 2 ? "critical" : "high",
        description: `${dept}本週需協助事項 ${currentHelp} 項,遠高於歷史平均 ${stats.mean(helpHistory).toFixed(1)} 項`,
      });
    }
    if (blockerZ >= 1.5) {
      anomalies.push({
        dept,
        type: "blocker",
        typeLabel: "卡點數量異常",
        currentValue: currentBlockers,
        historyMean: stats.mean(blockerHistoryArr).toFixed(1),
        z: blockerZ.toFixed(2),
        severity: blockerZ >= 2 ? "critical" : "high",
        description: `${dept}本週回報卡點 ${currentBlockers} 項,遠高於歷史平均 ${stats.mean(blockerHistoryArr).toFixed(1)} 項`,
      });
    }
  });

  return anomalies;
}

// ============================================================
// 慢性議題偵測
// 檢查某議題連續出現在共同議題中 N 週以上,視為慢性議題
// ============================================================
function detectChronicTopics(topicHistory, currentTopics, threshold = 3) {
  const topicCounts = {};
  const topicWeeks = {};

  // 從最新週往回數,統計連續週數
  const allWeeks = [...topicHistory].sort((a, b) => b.week - a.week);
  const currentWeek = Math.max(...topicHistory.map((t) => t.week)) + 1;

  // 把當前週也算進去
  const allTopicsRecent = [{ week: currentWeek, topics: currentTopics.map((t) => t.kw) }, ...allWeeks];

  // 收集所有出現過的議題
  const allTopicNames = new Set();
  allTopicsRecent.forEach((w) => w.topics.forEach((t) => allTopicNames.add(t)));

  const chronic = [];
  allTopicNames.forEach((topicName) => {
    // 從最新週開始算連續出現
    let streak = 0;
    for (let i = 0; i < allTopicsRecent.length; i++) {
      if (allTopicsRecent[i].topics.includes(topicName)) {
        streak++;
      } else {
        break;
      }
    }
    if (streak >= threshold) {
      chronic.push({
        topic: topicName,
        weeks: streak,
        firstWeek: allTopicsRecent[streak - 1]?.week,
        severity: streak >= 5 ? "critical" : streak >= 4 ? "high" : "medium",
      });
    }
  });

  return chronic.sort((a, b) => b.weeks - a.weeks);
}

// ============================================================
// 員工負載分析
// 從 reports + handoffs 計算每個人的工作負載
// ============================================================
const KNOWN_EMPLOYEES = [
  { name: "周世倫", dept: "投資研究部", role: "研究員" },
  { name: "林聿平", dept: "業務開發部", role: "業務經理" },
  { name: "梁嘉芫", dept: "資產管理部", role: "資管專員" },
  { name: "鍾皓明", dept: "投資研究部", role: "資深研究員" },
  { name: "林欣逸", dept: "業務開發部", role: "業務專員" },
  { name: "吳君", dept: "營運與管理層", role: "營運專員" },
  { name: "陳雅文", dept: "資產管理部", role: "資管經理" },
  { name: "張偉", dept: "投資研究部", role: "研究助理" },
];

function analyzeEmployeeLoad(reports, handoffs) {
  const currentReports = reports.filter((r) => r.week === "第 42 週");

  return KNOWN_EMPLOYEES.map((emp) => {
    // 1. 本人是否有填寫週報
    const ownReport = currentReports.find((r) => r.author === emp.name);

    // 2. 被提及次數(出現在任何週報內文中)
    let mentions = 0;
    currentReports.forEach((r) => {
      const fullText = `${r.cases}\n${r.blockers}\n${r.needHelp}\n${r.nextWeek}`;
      if (r.author !== emp.name) {
        const re = new RegExp(emp.name, "g");
        mentions += (fullText.match(re) || []).length;
      }
    });

    // 3. 交接單參與度(發出 + 接收)
    const asHandoffSender = handoffs.filter((h) => h.sender === emp.name).length;
    const asHandoffReceiver = handoffs.filter((h) => h.receiver === emp.name).length;
    const pendingReceive = handoffs.filter(
      (h) => h.receiver === emp.name && h.status === "待簽收"
    ).length;

    // 4. 負載總分
    // 權重:自己填的週報案件數 * 3 + 被提及 * 2 + 交接總數 * 2 + 待處理 * 4
    const caseCount = ownReport
      ? ownReport.cases.split(/[•\n]/).filter((s) => s.trim()).length
      : 0;
    const loadScore =
      caseCount * 3 +
      mentions * 2 +
      (asHandoffSender + asHandoffReceiver) * 2 +
      pendingReceive * 4;

    // 5. 分級
    let level;
    if (loadScore >= 20) level = "overload";
    else if (loadScore >= 12) level = "high";
    else if (loadScore >= 6) level = "normal";
    else if (loadScore >= 1) level = "low";
    else level = "idle";

    return {
      ...emp,
      hasReport: !!ownReport,
      caseCount,
      mentions,
      asHandoffSender,
      asHandoffReceiver,
      pendingReceive,
      totalHandoffs: asHandoffSender + asHandoffReceiver,
      loadScore,
      level,
    };
  }).sort((a, b) => b.loadScore - a.loadScore);
}

function loadLevelInfo(level) {
  const map = {
    overload: { label: "過載", color: "#A32D2D", bg: "#FCEBEB" },
    high: { label: "高負載", color: "#B36B00", bg: "#FAEEDA" },
    normal: { label: "正常", color: "#0F6E56", bg: "#E1F5EE" },
    low: { label: "低負載", color: "#6B6860", bg: "#F0EEE7" },
    idle: { label: "閒置", color: "#9B9890", bg: "#F7F5EF" },
  };
  return map[level] || map.normal;
}

// ===== 主要樣式常數 =====
const C = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  border: "#E8E6DD",
  borderLight: "#F0EEE7",
  text: "#1A1815",
  textMid: "#6B6860",
  textLight: "#9B9890",
  accent: "#1F4E79",
  accentLight: "#DEEBF7",
  success: "#0F6E56",
  successLight: "#E1F5EE",
  warn: "#B36B00",
  warnLight: "#FAEEDA",
  danger: "#A32D2D",
  dangerLight: "#FCEBEB",
  purple: "#534AB7",
  purpleLight: "#EEEDFE",
};

// 風險等級對應顏色
const riskLevelColor = (level) => {
  const map = {
    critical: { fg: C.danger, bg: C.dangerLight },
    high: { fg: C.warn, bg: C.warnLight },
    medium: { fg: "#BA7517", bg: "#FFF4E0" },
    normal: { fg: C.success, bg: C.successLight },
  };
  return map[level] || map.normal;
};

// ===== 共用元件 =====
const Pill = ({ children, tone = "neutral", size = "sm" }) => {
  const tones = {
    neutral: { bg: "#F0EEE7", color: "#6B6860" },
    blue: { bg: C.accentLight, color: "#0C447C" },
    teal: { bg: C.successLight, color: C.success },
    warn: { bg: C.warnLight, color: "#7A4900" },
    danger: { bg: C.dangerLight, color: C.danger },
    purple: { bg: C.purpleLight, color: "#3C3489" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "sm" ? "2px 8px" : "4px 10px",
        borderRadius: 999,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 500,
        background: t.bg,
        color: t.color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

// 將文字中的關鍵字標黃
const highlightKeyword = (text, kw) => {
  if (!kw || !text) return text;
  const parts = text.split(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "g"));
  return parts.map((p, i) =>
    p === kw ? (
      <mark
        key={i}
        style={{
          background: "#FFF3B0",
          color: "#5A4300",
          padding: "0 2px",
          borderRadius: 2,
          fontWeight: 500,
        }}
      >
        {p}
      </mark>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
};

const Button = ({ children, variant = "secondary", onClick, disabled, icon: Icon, size = "md" }) => {
  const variants = {
    primary: {
      background: C.accent,
      color: "#fff",
      border: "1px solid " + C.accent,
    },
    secondary: {
      background: "#fff",
      color: C.text,
      border: "1px solid " + C.border,
    },
    success: {
      background: C.success,
      color: "#fff",
      border: "1px solid " + C.success,
    },
    ghost: {
      background: "transparent",
      color: C.textMid,
      border: "1px solid transparent",
    },
  };
  const s = variants[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        padding: size === "sm" ? "5px 12px" : "7px 16px",
        borderRadius: 6,
        fontSize: size === "sm" ? 12 : 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};

const Modal = ({ open, onClose, title, subtitle, children, maxWidth = 560 }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26, 24, 21, 0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 12,
          width: "100%",
          maxWidth,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "slideUp 0.2s ease-out",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid " + C.borderLight,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
            {subtitle && (
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: C.textLight,
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "18px 22px", overflowY: "auto" }}>{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

const Card = ({ children, style }) => (
  <div
    style={{
      background: C.surface,
      border: "1px solid " + C.border,
      borderRadius: 10,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children, color = C.purple, hint }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 10,
      color: C.text,
    }}
  >
    <span
      style={{
        width: 3,
        height: 14,
        background: color,
        borderRadius: 2,
      }}
    />
    {children}
    {hint && (
      <span style={{ fontSize: 11, color: C.textLight, fontWeight: 400 }}>
        {hint}
      </span>
    )}
  </div>
);

// ============================================================
// 管理層待決事項彙整
// 從各種資料來源抽取「需要管理層親自處理」的事項
// ============================================================
function collectActionItems({ reports, handoffs, blockerHistory, decisions, topicHistory, activityHistory }) {
  const items = [];
  const deptReports = reports.filter((r) => r.week === "第 42 週");

  // 1. 極高風險卡點(z >= 2)
  const blockerDaysMap = { 投資研究部: 14, 業務開發部: 5, 資產管理部: 9 };
  deptReports.forEach((r) => {
    if (!r.blockers || !r.blockers.trim()) return;
    const days = blockerDaysMap[r.dept] || 3;
    const a = analyzeBlockerText(r.blockers, days, blockerHistory);
    if (a.hasData && a.level === "critical") {
      items.push({
        id: "blocker-" + r.dept,
        type: "critical-blocker",
        priority: 1,
        icon: "🚨",
        title: `${r.dept} 卡點極高風險`,
        description: r.blockers,
        meta: `已卡 ${a.currentDays} 天 · z = +${a.z}σ · 超過 ${a.percentile}% 同類案件`,
        suggestion: "建議今日由管理層直接介入協調",
      });
    }
  });

  // 2. 逾期決策
  decisions.filter((d) => d.status === "逾期").forEach((d) => {
    items.push({
      id: "decision-" + d.id,
      type: "overdue-decision",
      priority: 2,
      icon: "⏰",
      title: `逾期決策:${d.title}`,
      description: d.content,
      meta: `指派 ${d.assignedDept} · 期限 ${d.dueDate}`,
      suggestion: "建議重新指派或調整時程",
      decision: d,
    });
  });

  // 3. 慢性議題(連續 4 週以上)
  const kwMap = {};
  deptReports.forEach((r) => {
    r.keywords.forEach((kw) => {
      if (!kwMap[kw]) kwMap[kw] = new Set();
      kwMap[kw].add(r.dept);
    });
  });
  const commonTopics = Object.entries(kwMap)
    .filter(([, set]) => set.size >= 2)
    .map(([kw, set]) => ({ kw, depts: Array.from(set) }));
  const chronic = detectChronicTopics(topicHistory, commonTopics, 4);
  chronic.forEach((c) => {
    items.push({
      id: "chronic-" + c.topic,
      type: "chronic-topic",
      priority: 3,
      icon: "📋",
      title: `慢性議題:${c.topic}`,
      description: `已連續 ${c.weeks} 週出現在跨部門共同議題`,
      meta: `自第 ${c.firstWeek} 週起持續至今`,
      suggestion: "建議召開跨部門協調會,評估是否需專案處理",
    });
  });

  // 4. 過載員工
  const loads = analyzeEmployeeLoad(reports, handoffs);
  loads.filter((l) => l.level === "overload").forEach((l) => {
    items.push({
      id: "overload-" + l.name,
      type: "overload",
      priority: 4,
      icon: "👥",
      title: `員工過載:${l.name}`,
      description: `${l.dept} · ${l.role} · 負載分數 ${l.loadScore}`,
      meta: `案件 ${l.caseCount} · 被提及 ${l.mentions} · 待簽收 ${l.pendingReceive}`,
      suggestion: "建議分派部分任務給負載較低的同仁",
    });
  });

  // 5. 跨部門互卡(任一部門等對方超過 1 週)
  const helpRequests = deptReports
    .filter((r) => r.needHelp && r.needHelp.trim())
    .map((r) => ({ dept: r.dept, text: r.needHelp }));
  if (helpRequests.length >= 2) {
    items.push({
      id: "crossdept-stuck",
      type: "crossdept",
      priority: 5,
      icon: "✋",
      title: "多部門相互請求協助",
      description: helpRequests.map((h) => `${h.dept}: ${h.text}`).join(" / "),
      meta: `本週 ${helpRequests.length} 個部門有跨部門請求`,
      suggestion: "建議檢視是否需釐清跨部門責任邊界",
    });
  }

  return items.sort((a, b) => a.priority - b.priority);
}

// ============================================================
// 週會 Briefing 自動產出
// ============================================================
function generateWeeklyBriefing({ reports, handoffs, blockerHistory, decisions, topicHistory, actionItems }) {
  const deptReports = reports.filter((r) => r.week === "第 42 週");
  const unsigned = handoffs.filter((h) => h.status === "待簽收");
  const overdueDec = decisions.filter((d) => d.status === "逾期");
  const inProgressDec = decisions.filter((d) => d.status === "執行中");
  const completedThisMonth = decisions.filter((d) => d.status === "已完成");

  const blockerDaysMap = { 投資研究部: 14, 業務開發部: 5, 資產管理部: 9 };
  const blockerAnalyses = deptReports
    .filter((r) => r.blockers && r.blockers.trim())
    .map((r) => ({
      dept: r.dept,
      text: r.blockers,
      ...analyzeBlockerText(r.blockers, blockerDaysMap[r.dept] || 3, blockerHistory),
    }));
  const criticalBlockers = blockerAnalyses.filter((b) => b.level === "critical");

  const chronic = detectChronicTopics(
    topicHistory,
    Object.entries(deptReports.reduce((m, r) => {
      r.keywords.forEach((kw) => {
        if (!m[kw]) m[kw] = new Set();
        m[kw].add(r.dept);
      });
      return m;
    }, {})).filter(([, s]) => s.size >= 2).map(([kw, s]) => ({ kw, depts: [...s] })),
    3
  );

  const decisionCompletionRate = decisions.length > 0
    ? Math.round((completedThisMonth.length / decisions.length) * 100)
    : 0;

  const lines = [];
  lines.push("【串連公司 · 第 42 週管理層 Briefing】");
  lines.push("");
  lines.push("📊 本週重點數據");
  lines.push(`- 進行中案件:${deptReports.reduce((s, r) => s + r.cases.split(/[•\n]/).filter(c => c.trim()).length, 0)} 件`);
  lines.push(`- 跨部門卡點:${blockerAnalyses.length} 件(${criticalBlockers.length} 件極高風險)`);
  lines.push(`- 未閉環交接:${unsigned.length} 件`);
  lines.push(`- 決策執行率:${decisionCompletionRate}%(${decisions.length} 件中 ${completedThisMonth.length} 件完成)`);
  lines.push(`- 逾期決策:${overdueDec.length} 件`);
  lines.push("");

  if (actionItems.length > 0) {
    lines.push("🚨 需管理層決議事項");
    actionItems.slice(0, 5).forEach((item, i) => {
      lines.push(`${i + 1}. ${item.title}`);
      lines.push(`   ${item.meta}`);
      lines.push(`   建議:${item.suggestion}`);
    });
    lines.push("");
  }

  if (chronic.length > 0) {
    lines.push("💡 慢性議題追蹤");
    chronic.forEach((c) => {
      lines.push(`- "${c.topic}" 已連續 ${c.weeks} 週為跨部門共同議題`);
    });
    lines.push("");
  }

  // 員工負載
  const loads = analyzeEmployeeLoad(reports, handoffs);
  const overload = loads.filter((l) => l.level === "overload");
  const idle = loads.filter((l) => l.level === "idle" || l.level === "low");
  lines.push("📈 員工負載狀況");
  if (overload.length > 0) {
    lines.push(`- 過載 ${overload.length} 人:${overload.map((l) => `${l.name}(${l.loadScore})`).join("、")}`);
  } else {
    lines.push("- 無過載員工");
  }
  if (idle.length > 0) {
    lines.push(`- 低負載/閒置 ${idle.length} 人:可考慮分派任務`);
  }
  lines.push("");

  lines.push(`本週報生成於 ${new Date().toLocaleString("zh-TW")}`);
  return lines.join("\n");
}

// ============================================================
// Dashboard 頁面
// ============================================================
function Dashboard({ reports, handoffs, blockerHistory, decisions, topicHistory, activityHistory, onNav, userProfile }) {
  const [viewReport, setViewReport] = useState(null);
  const [viewTopic, setViewTopic] = useState(null);
  const [viewBlocker, setViewBlocker] = useState(null);
  const [viewDecision, setViewDecision] = useState(null);
  const [viewAnomaly, setViewAnomaly] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const isAdmin = userProfile?.role === "admin";
  const isManager = userProfile?.role === "manager";
  const isMember = userProfile?.role === "member" || (!isAdmin && !isManager);
  const latestWeek = "第 42 週 (10/14 – 10/20)";
  const deptReports = reports.filter((r) => r.week === "第 42 週");
  const unsigned = handoffs.filter((h) => h.status === "待簽收");

  // 共同議題計算(跨部門關鍵字交集)
  const kwMap = {};
  deptReports.forEach((r) => {
    r.keywords.forEach((kw) => {
      if (!kwMap[kw]) kwMap[kw] = new Set();
      kwMap[kw].add(r.dept);
    });
  });
  const commonTopics = Object.entries(kwMap)
    .filter(([, set]) => set.size >= 2)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 3)
    .map(([kw, set]) => ({ kw, depts: Array.from(set) }));

  // 週報異常偵測
  const reportAnomalies = useMemo(
    () => detectReportAnomaly(deptReports, activityHistory),
    [deptReports, activityHistory]
  );

  // 慢性議題偵測(連續 3+ 週出現)
  const chronicTopics = useMemo(
    () => detectChronicTopics(topicHistory, commonTopics, 3),
    [topicHistory, commonTopics]
  );

  // 未落地決策
  const overdueDecisions = decisions.filter((d) => d.status === "逾期");
  const inProgressDecisions = decisions.filter((d) => d.status === "執行中");

  // 卡點抽取 + 風險分析(text mining + 統計)
  // 已卡天數:這裡用隨機但一致的值模擬(實際系統應該從資料庫查)
  const blockerDaysMap = { 投資研究部: 14, 業務開發部: 5, 資產管理部: 9 };
  const blockers = useMemo(() =>
    deptReports
      .filter((r) => r.blockers && r.blockers.trim())
      .map((r) => {
        const days = blockerDaysMap[r.dept] || 3;
        const analysis = analyzeBlockerText(r.blockers, days, blockerHistory);
        return {
          dept: r.dept,
          text: r.blockers,
          daysElapsed: days,
          analysis,
        };
      })
      .sort((a, b) => (b.analysis.riskScore || 0) - (a.analysis.riskScore || 0)),
    [deptReports, blockerHistory]
  );

  // 管理層待決事項(只給 admin 看)
  const actionItems = useMemo(
    () => isAdmin ? collectActionItems({ reports, handoffs, blockerHistory, decisions, topicHistory, activityHistory }) : [],
    [isAdmin, reports, handoffs, blockerHistory, decisions, topicHistory, activityHistory]
  );

  // Briefing 文字
  const briefingText = useMemo(
    () => isAdmin ? generateWeeklyBriefing({ reports, handoffs, blockerHistory, decisions, topicHistory, actionItems }) : "",
    [isAdmin, reports, handoffs, blockerHistory, decisions, topicHistory, actionItems]
  );

  // 標題客製化(依角色)
  const titleByRole = isAdmin
    ? "本週營運總覽"
    : isManager
    ? `${userProfile?.dept || "部門"}本週進度`
    : "我的本週工作";
  const subtitleByRole = isAdmin
    ? `${userProfile?.displayName || "管理層"} · ${latestWeek}`
    : isManager
    ? `${userProfile?.displayName || "主管"} · 部門主管視角 · ${latestWeek}`
    : `${userProfile?.displayName || "員工"} · 員工視角 · ${latestWeek}`;

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* 頂部標題 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
            {isAdmin ? "EXECUTIVE DASHBOARD" : isManager ? "MANAGER DASHBOARD" : "MY DASHBOARD"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0", color: C.text }}>
            {titleByRole}
          </h1>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
            {subtitleByRole}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isAdmin && (
            <Button variant="primary" icon={FileText} size="sm" onClick={() => setShowBriefing(true)}>
              產出週會 Briefing
            </Button>
          )}
          <div style={{ fontSize: 11, color: C.textLight }}>
            更新於週一 09:00
          </div>
        </div>
      </div>

      {/* 管理層專屬:今日待決事項面板 */}
      {isAdmin && actionItems.length > 0 && (
        <Card style={{
          padding: 18,
          marginBottom: 20,
          background: "linear-gradient(135deg, #FFF8F0 0%, #FFF4E0 100%)",
          border: "1px solid " + C.warn + "50",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Flame size={18} color={C.warn} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#7A4900" }}>
                  今日待決事項
                </div>
                <div style={{ fontSize: 11, color: "#9E5F00" }}>
                  系統自動彙整需要您親自處理的事項
                </div>
              </div>
            </div>
            <Pill tone="warn">{actionItems.length} 項</Pill>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actionItems.slice(0, 5).map((item) => {
              const colors = {
                "critical-blocker": { bg: "#FCEBEB", fg: C.danger, border: C.danger },
                "overdue-decision": { bg: "#FAEEDA", fg: C.warn, border: C.warn },
                "chronic-topic": { bg: "#EEEDFE", fg: C.purple, border: C.purple },
                "overload": { bg: "#E1F5EE", fg: C.success, border: C.success },
                "crossdept": { bg: C.accentLight, fg: C.accent, border: C.accent },
              };
              const color = colors[item.type] || colors.crossdept;

              const handleClick = () => {
                if (item.decision) setViewDecision(item.decision);
                else if (item.type === "overload") onNav("employees");
                else if (item.type === "critical-blocker") onNav("analytics");
                else if (item.type === "chronic-topic") onNav("dashboard");
              };

              return (
                <div
                  key={item.id}
                  onClick={handleClick}
                  style={{
                    background: "white",
                    border: "1px solid " + color.border + "30",
                    borderLeft: "3px solid " + color.border,
                    borderRadius: 8,
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderLeftWidth = "5px";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftWidth = "3px";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: color.fg }}>
                          {item.title}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, marginBottom: 6 }}>
                        {item.description.length > 80
                          ? item.description.slice(0, 80) + "..."
                          : item.description}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.textLight, marginBottom: 6 }}>
                        <span>📊 {item.meta}</span>
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: color.fg,
                        padding: "4px 8px",
                        background: color.bg,
                        borderRadius: 4,
                        display: "inline-block",
                      }}>
                        💡 {item.suggestion}
                      </div>
                    </div>
                    <ChevronRight size={16} color={C.textLight} style={{ marginLeft: 8, flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
            {actionItems.length > 5 && (
              <div style={{ textAlign: "center", fontSize: 11, color: C.textMid, marginTop: 4 }}>
                還有 {actionItems.length - 5} 項待決事項...
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 統計卡(依角色客製) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "進行中案件", value: 14, color: C.text },
          { label: "跨部門卡點", value: blockers.length, color: C.warn },
          { label: "未閉環交接", value: unsigned.length, color: C.danger },
          { label: "週報完成率", value: `${deptReports.length}/3`, color: C.success },
        ].map((s) => (
          <Card key={s.label} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* 本週共同議題 */}
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <SectionTitle color={C.purple} hint="兩個以上部門同時提及">
          本週共同議題
        </SectionTitle>
        {commonTopics.length === 0 ? (
          <div style={{ fontSize: 13, color: C.textLight, padding: 12 }}>
            本週各部門週報暫無重疊關鍵議題
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {commonTopics.map((t) => (
              <div
                key={t.kw}
                onClick={() => setViewTopic(t)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: C.purpleLight,
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E0DDF8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.purpleLight;
                }}
              >
                <span style={{ fontSize: 13, color: "#3C3489", fontWeight: 500 }}>{t.kw}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: C.purple }}>{t.depts.join(" · ")}</span>
                  <ChevronRight size={13} color={C.purple} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 卡點警示 + 未閉環 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card style={{ padding: 18 }}>
          <SectionTitle color={C.warn} hint="基於歷史資料風險排序">
            卡點警示
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {blockers.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight }}>本週無卡點</div>
            ) : (
              blockers.map((b, i) => {
                const a = b.analysis;
                const color = a.hasData ? riskLevelColor(a.level) : { fg: "#7A4900", bg: C.warnLight };
                return (
                  <div
                    key={i}
                    onClick={() => setViewBlocker(b)}
                    style={{
                      padding: "10px 12px",
                      background: color.bg,
                      borderRadius: 6,
                      fontSize: 12,
                      color: color.fg,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = color.fg + "40";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ fontWeight: 600 }}>{b.dept}</div>
                      {a.hasData && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Pill tone={a.level === "critical" ? "danger" : a.level === "high" ? "warn" : a.level === "medium" ? "warn" : "teal"}>
                            {a.levelLabel}
                          </Pill>
                        </div>
                      )}
                    </div>
                    <div style={{ marginBottom: 6 }}>{b.text}</div>
                    {a.hasData && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        paddingTop: 6,
                        borderTop: "1px solid " + color.fg + "20",
                        fontSize: 11,
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Activity size={11} />
                          已 {a.currentDays} 天
                        </span>
                        <span>類別:{a.category}</span>
                        <span>
                          歷史平均 {a.mean} 天
                        </span>
                        <span style={{ marginLeft: "auto", fontWeight: 600 }}>
                          z = {a.z > 0 ? "+" : ""}{a.z}σ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <SectionTitle color={C.danger}>未閉環事項</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {unsigned.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight }}>所有交接皆已閉環 ✓</div>
            ) : (
              unsigned.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onNav("handoff", h.id)}
                  style={{
                    padding: "8px 12px",
                    background: C.dangerLight,
                    borderRadius: 6,
                    fontSize: 12,
                    color: C.danger,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{h.title}</div>
                  <div>
                    {h.from} → {h.to} · 未簽收 {h.hoursOverdue}hr
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 系統性異常警示(週報異常 + 慢性議題)*/}
      {(reportAnomalies.length > 0 || chronicTopics.length > 0) && (
        <Card style={{ padding: 18, marginTop: 16, background: "#FFF8F0", border: "1px solid " + C.warn + "40" }}>
          <SectionTitle color={C.warn} hint="基於 8 週歷史趨勢比對">
            系統性異常警示
          </SectionTitle>

          {reportAnomalies.length > 0 && (
            <div style={{ marginBottom: chronicTopics.length > 0 ? 14 : 0 }}>
              <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8, fontWeight: 500 }}>
                週報活動量異常(z ≥ 1.5σ)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {reportAnomalies.map((a, i) => {
                  const color = a.severity === "critical" ? riskLevelColor("critical") : riskLevelColor("high");
                  return (
                    <div
                      key={i}
                      onClick={() => setViewAnomaly(a)}
                      style={{
                        padding: "10px 12px",
                        background: color.bg,
                        borderRadius: 6,
                        fontSize: 12,
                        color: color.fg,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>
                          {a.typeLabel} · {a.dept}
                        </div>
                        <div>{a.description}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                        <Pill tone={a.severity === "critical" ? "danger" : "warn"}>
                          z = +{a.z}σ
                        </Pill>
                        <ChevronRight size={14} color={color.fg} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chronicTopics.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8, fontWeight: 500 }}>
                慢性議題(連續 3+ 週出現)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {chronicTopics.map((c, i) => {
                  const color = riskLevelColor(c.severity);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        background: color.bg,
                        borderRadius: 6,
                        fontSize: 12,
                        color: color.fg,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.topic}</div>
                        <div>已連續 {c.weeks} 週出現在跨部門共同議題中,建議管理層介入</div>
                      </div>
                      <Pill tone={c.severity === "critical" ? "danger" : c.severity === "high" ? "warn" : "purple"}>
                        {c.weeks} 週
                      </Pill>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 管理層決策追蹤 */}
      <Card style={{ padding: 18, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <SectionTitle color={C.accent} hint={`${overdueDecisions.length} 項逾期 · ${inProgressDecisions.length} 項執行中`}>
            管理層決策追蹤
          </SectionTitle>
          <Button variant="ghost" size="sm" onClick={() => onNav("decisions")}>
            查看全部 <ChevronRight size={12} />
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...overdueDecisions, ...inProgressDecisions].slice(0, 4).map((d) => {
            const isOverdue = d.status === "逾期";
            const color = isOverdue ? riskLevelColor("critical") : { fg: C.accent, bg: C.accentLight };
            return (
              <div
                key={d.id}
                onClick={() => setViewDecision(d)}
                style={{
                  padding: "10px 12px",
                  background: color.bg,
                  borderRadius: 6,
                  fontSize: 12,
                  color: color.fg,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 11 }}>
                    {d.decidedBy} · 指派給 {d.assignedDept} · 期限 {d.dueDate}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                  <Pill tone={isOverdue ? "danger" : "blue"}>{d.status}</Pill>
                  <ChevronRight size={14} color={color.fg} />
                </div>
              </div>
            );
          })}
          {overdueDecisions.length === 0 && inProgressDecisions.length === 0 && (
            <div style={{ fontSize: 12, color: C.textLight, padding: 12 }}>
              目前所有決策皆已完成 ✓
            </div>
          )}
        </div>
      </Card>

      {/* 最新週報快覽 */}
      <Card style={{ padding: 18, marginTop: 16 }}>
        <SectionTitle color={C.accent}>本週各部門週報</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {["投資研究部", "業務開發部", "資產管理部"].map((dept) => {
            const r = deptReports.find((x) => x.dept === dept);
            const clickable = !!r;
            return (
              <div
                key={dept}
                onClick={() => clickable && setViewReport(r)}
                style={{
                  padding: "12px 14px",
                  background: C.bg,
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: clickable ? "pointer" : "default",
                  border: "1px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (clickable) {
                    e.currentTarget.style.background = C.accentLight;
                    e.currentTarget.style.borderColor = C.accent + "30";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.bg;
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{dept}</span>
                  {r ? (
                    <CheckCircle2 size={14} color={C.success} />
                  ) : (
                    <Clock size={14} color={C.textLight} />
                  )}
                </div>
                <div style={{ color: C.textMid, lineHeight: 1.6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{r ? `${r.author} · ${r.submittedAt.slice(5, 10)}` : "尚未繳交"}</span>
                  {clickable && <ChevronRight size={13} color={C.textLight} />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 週報詳情 Modal */}
      <Modal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        title={viewReport?.dept + " · 週報"}
        subtitle={viewReport && `${viewReport.author} · ${viewReport.week} · 繳交於 ${viewReport.submittedAt}`}
      >
        {viewReport && (
          <div>
            {[
              { num: "①", label: "本週進行中案件", value: viewReport.cases },
              { num: "②", label: "遇到的卡點", value: viewReport.blockers || "(無)" },
              { num: "③", label: "需其他部門配合", value: viewReport.needHelp || "(無)" },
              { num: "④", label: "下週重點", value: viewReport.nextWeek || "(無)" },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 5, fontWeight: 500 }}>
                  {f.num} {f.label}
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.bg,
                  borderRadius: 6,
                  fontSize: 13,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  color: f.value === "(無)" ? C.textLight : C.text,
                }}>
                  {f.value}
                </div>
              </div>
            ))}

            {viewReport.keywords && viewReport.keywords.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid " + C.borderLight }}>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8, fontWeight: 500 }}>
                  系統自動擷取關鍵字
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {viewReport.keywords.map((kw) => (
                    <Pill key={kw} tone="purple">{kw}</Pill>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 共同議題 Modal:展示哪些週報提到這個關鍵字 */}
      <Modal
        open={!!viewTopic}
        onClose={() => setViewTopic(null)}
        title={`共同議題:${viewTopic?.kw || ""}`}
        subtitle={viewTopic && `${viewTopic.depts.length} 個部門本週同時提及此議題`}
        maxWidth={620}
      >
        {viewTopic && (
          <div>
            <div style={{
              padding: "12px 14px",
              background: C.purpleLight,
              borderRadius: 6,
              fontSize: 13,
              color: "#3C3489",
              lineHeight: 1.7,
              marginBottom: 18,
            }}>
              <strong>{viewTopic.kw}</strong> 在本週被以下部門同時提到:{viewTopic.depts.join("、")}。
              點擊下方週報可查看各部門的完整內容。
            </div>

            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10, fontWeight: 500 }}>
              各部門週報中提到「{viewTopic.kw}」的段落
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {viewTopic.depts.map((dept) => {
                const r = deptReports.find((x) => x.dept === dept);
                if (!r) return null;

                // 找出提到這個關鍵字的段落
                const mentions = [];
                if (r.cases.includes(viewTopic.kw)) mentions.push({ label: "本週進行中案件", text: r.cases });
                if (r.blockers.includes(viewTopic.kw)) mentions.push({ label: "遇到的卡點", text: r.blockers });
                if (r.needHelp.includes(viewTopic.kw)) mentions.push({ label: "需其他部門配合", text: r.needHelp });
                if (r.nextWeek.includes(viewTopic.kw)) mentions.push({ label: "下週重點", text: r.nextWeek });

                return (
                  <Card
                    key={dept}
                    style={{
                      padding: "14px 16px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setViewTopic(null);
                      setTimeout(() => setViewReport(r), 200);
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{dept}</div>
                      <div style={{ fontSize: 11, color: C.textLight }}>
                        {r.author} · {r.submittedAt.slice(5, 10)}
                      </div>
                    </div>
                    {mentions.length > 0 ? (
                      mentions.map((m, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 11, color: C.textMid, marginBottom: 2 }}>
                            {m.label}
                          </div>
                          <div style={{
                            fontSize: 12,
                            lineHeight: 1.7,
                            color: C.text,
                            padding: "6px 10px",
                            background: C.bg,
                            borderRadius: 4,
                            whiteSpace: "pre-wrap",
                          }}>
                            {highlightKeyword(m.text, viewTopic.kw)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: C.textLight }}>
                        關鍵字存在於週報中(系統自動抓取)
                      </div>
                    )}
                    <div style={{
                      marginTop: 8,
                      paddingTop: 6,
                      borderTop: "1px solid " + C.borderLight,
                      fontSize: 11,
                      color: C.accent,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      查看完整週報 <ChevronRight size={11} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* 卡點風險分析 Modal */}
      <Modal
        open={!!viewBlocker}
        onClose={() => setViewBlocker(null)}
        title="卡點風險分析"
        subtitle={viewBlocker && `${viewBlocker.dept} · 基於歷史 ${blockerHistory.length} 筆卡點資料統計`}
        maxWidth={640}
      >
        {viewBlocker && viewBlocker.analysis && (() => {
          const a = viewBlocker.analysis;
          const color = a.hasData ? riskLevelColor(a.level) : { fg: "#7A4900", bg: C.warnLight };
          const categoryDays = blockerHistory
            .filter((h) => h.category === a.category)
            .map((h) => h.daysToResolve);
          const hist = stats.histogram(categoryDays, 7);
          const maxCount = Math.max(...hist.map((h) => h.count), 1);

          return (
            <div>
              {/* 卡點描述 */}
              <div style={{
                padding: "12px 14px",
                background: C.bg,
                borderRadius: 6,
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 18,
              }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4, fontWeight: 500 }}>
                  卡點內容
                </div>
                {viewBlocker.text}
              </div>

              {/* 分類結果 */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6, fontWeight: 500 }}>
                  <BarChart3 size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  系統自動分類(text mining)
                </div>
                <div style={{
                  padding: "10px 14px",
                  background: a.categoryInfo.color + "15",
                  border: "1px solid " + a.categoryInfo.color + "40",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: a.categoryInfo.color }}>
                      {a.categoryInfo.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>
                      同類歷史樣本數 n = {a.sampleSize}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {a.categoryInfo.keywords.map((k) => (
                      <Pill key={k} tone="purple">{k}</Pill>
                    ))}
                  </div>
                </div>
              </div>

              {/* 風險指標 */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6, fontWeight: 500 }}>
                  <Flame size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  風險指標
                </div>
                <div style={{
                  padding: 16,
                  background: color.bg,
                  border: "1px solid " + color.fg + "30",
                  borderRadius: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: color.fg }}>
                        {a.levelLabel}
                      </div>
                      <div style={{ fontSize: 12, color: color.fg, opacity: 0.8, marginTop: 2 }}>
                        超過 {a.percentile}% 歷史同類案件
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: color.fg, lineHeight: 1 }}>
                        {a.z > 0 ? "+" : ""}{a.z}σ
                      </div>
                      <div style={{ fontSize: 11, color: color.fg, opacity: 0.8, marginTop: 4 }}>
                        z-score
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 描述統計 */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6, fontWeight: 500 }}>
                  歷史資料描述統計
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}>
                  {[
                    { label: "已卡天數", value: a.currentDays + " 天", highlight: true },
                    { label: "歷史平均", value: a.mean + " 天" },
                    { label: "標準差", value: a.std + " 天" },
                    { label: "中位數", value: a.median + " 天" },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: "8px 10px",
                      background: s.highlight ? color.bg : C.bg,
                      border: s.highlight ? "1px solid " + color.fg + "30" : "1px solid " + C.borderLight,
                      borderRadius: 6,
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 10, color: C.textMid, marginBottom: 2 }}>
                        {s.label}
                      </div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: s.highlight ? color.fg : C.text,
                      }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 直方圖 + 當前位置 */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6, fontWeight: 500 }}>
                  歷史解決天數分佈(n = {a.sampleSize})
                </div>
                <div style={{
                  padding: 16,
                  background: C.bg,
                  borderRadius: 8,
                  border: "1px solid " + C.borderLight,
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    height: 110,
                    gap: 3,
                    position: "relative",
                  }}>
                    {hist.map((h, i) => {
                      const containsCurrent = a.currentDays >= h.binStart && a.currentDays < h.binEnd + 0.01;
                      return (
                        <div key={i} style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}>
                          <div style={{
                            fontSize: 10,
                            color: C.textLight,
                            minHeight: 14,
                          }}>
                            {h.count > 0 ? h.count : ""}
                          </div>
                          <div style={{
                            width: "100%",
                            height: (h.count / maxCount) * 80,
                            background: containsCurrent ? color.fg : a.categoryInfo.color,
                            opacity: containsCurrent ? 1 : 0.45,
                            borderRadius: "3px 3px 0 0",
                            transition: "all 0.3s",
                          }} />
                          <div style={{ fontSize: 9, color: C.textLight }}>
                            {h.binStart.toFixed(0)}–{h.binEnd.toFixed(0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: C.textLight, textAlign: "center", marginTop: 8 }}>
                    x 軸 = 解決天數,y 軸 = 案件數 · <span style={{ color: color.fg, fontWeight: 500 }}>當前卡點位置以深色標示</span>
                  </div>
                </div>
              </div>

              {/* 分位數標記 */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8, fontWeight: 500 }}>
                  同類案件分位數對照
                </div>
                <div style={{ position: "relative", padding: "28px 0 20px" }}>
                  {/* 基礎線 */}
                  <div style={{
                    position: "absolute",
                    left: 0, right: 0, top: 32,
                    height: 6,
                    background: "linear-gradient(to right, #E1F5EE 0%, #FFF4E0 50%, #FAEEDA 75%, #FCEBEB 100%)",
                    borderRadius: 3,
                  }} />
                  {/* 分位數刻度 */}
                  {[
                    { label: "P50 (中位)", value: a.median, pos: 50 },
                    { label: "P75", value: a.p75, pos: 75 },
                    { label: "P90", value: a.p90, pos: 90 },
                  ].map((m) => (
                    <div key={m.label} style={{
                      position: "absolute",
                      left: m.pos + "%",
                      top: 20,
                      transform: "translateX(-50%)",
                    }}>
                      <div style={{ fontSize: 10, color: C.textMid, textAlign: "center", marginBottom: 2 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 10, color: C.textLight, textAlign: "center" }}>
                        {m.value.toFixed(1)} 天
                      </div>
                      <div style={{
                        width: 1, height: 12,
                        background: C.textLight,
                        margin: "0 auto",
                      }} />
                    </div>
                  ))}
                  {/* 當前位置指示 */}
                  <div style={{
                    position: "absolute",
                    left: Math.min(98, Math.max(2, a.percentile)) + "%",
                    top: 0,
                    transform: "translateX(-50%)",
                  }}>
                    <div style={{
                      fontSize: 10,
                      color: color.fg,
                      fontWeight: 600,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}>
                      ▼ 當前 ({a.currentDays}d)
                    </div>
                  </div>
                </div>
              </div>

              {/* 建議 */}
              <div style={{
                padding: "12px 14px",
                background: C.accentLight,
                borderRadius: 6,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}>
                <Info size={14} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: C.accent, lineHeight: 1.7 }}>
                  <strong>系統建議:</strong>
                  {a.level === "critical" && `此卡點已超過 98% 同類歷史案件,強烈建議今日內由管理層介入協調。根據過去資料,繼續拖延將使解決難度顯著上升。`}
                  {a.level === "high" && `此卡點已超過 84% 同類歷史案件,建議於本週內完成處理。類似卡點通常在此區間後會快速惡化。`}
                  {a.level === "medium" && `此卡點進入關注區間,建議本週內跟進處理,避免進入高風險區間。`}
                  {a.level === "normal" && `此卡點目前在歷史正常範圍內,持續關注即可。`}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* 決策詳情 Modal */}
      <Modal
        open={!!viewDecision}
        onClose={() => setViewDecision(null)}
        title={viewDecision?.title}
        subtitle={viewDecision && `${viewDecision.decidedBy} · 決議於 ${viewDecision.decidedAt}`}
        maxWidth={580}
      >
        {viewDecision && (
          <div>
            <div style={{
              padding: "10px 14px",
              background: C.bg,
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.7,
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4, fontWeight: 500 }}>
                決議內容
              </div>
              {viewDecision.content}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { label: "指派部門", value: viewDecision.assignedDept },
                { label: "預期完成", value: viewDecision.dueDate },
                { label: "目前狀態", value: viewDecision.status,
                  tone: viewDecision.status === "逾期" ? "danger" : viewDecision.status === "已完成" ? "teal" : "blue" },
                { label: "關聯案件", value: viewDecision.linkedCases.length ? viewDecision.linkedCases.join(", ") : "—" },
              ].map((f) => (
                <div key={f.label} style={{
                  padding: "10px 12px",
                  background: C.bg,
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {f.tone ? <Pill tone={f.tone}>{f.value}</Pill> : f.value}
                  </div>
                </div>
              ))}
            </div>

            {viewDecision.notes && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 5, fontWeight: 500 }}>
                  備註
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.accentLight,
                  borderRadius: 6,
                  fontSize: 13,
                  color: C.accent,
                  lineHeight: 1.7,
                }}>
                  {viewDecision.notes}
                </div>
              </div>
            )}

            {viewDecision.status === "逾期" && (
              <div style={{
                padding: 12,
                background: C.dangerLight,
                borderRadius: 6,
                display: "flex",
                gap: 10,
                fontSize: 12,
                color: C.danger,
                lineHeight: 1.7,
              }}>
                <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong>此決策已逾期</strong> · 建議管理層於下次會議主動追蹤執行進度,確認阻礙並重新協議期限。
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 週報異常 Modal */}
      <Modal
        open={!!viewAnomaly}
        onClose={() => setViewAnomaly(null)}
        title={viewAnomaly?.typeLabel}
        subtitle={viewAnomaly && `${viewAnomaly.dept} · 基於過去 8 週趨勢比對`}
        maxWidth={560}
      >
        {viewAnomaly && (() => {
          const color = viewAnomaly.severity === "critical" ? riskLevelColor("critical") : riskLevelColor("high");
          const history = activityHistory
            .filter((h) => h.dept === viewAnomaly.dept)
            .map((h) => viewAnomaly.type === "help" ? h.helpRequests : h.blockers);
          const histMean = stats.mean(history);
          const histStd = stats.std(history);
          const maxVal = Math.max(...history, viewAnomaly.currentValue);
          return (
            <div>
              {/* 警示摘要 */}
              <div style={{
                padding: 14,
                background: color.bg,
                border: "1px solid " + color.fg + "30",
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, color: color.fg, lineHeight: 1.7 }}>
                  {viewAnomaly.description}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: color.fg }}>
                  <span>本週值:<strong>{viewAnomaly.currentValue}</strong></span>
                  <span>8 週平均:<strong>{viewAnomaly.historyMean}</strong></span>
                  <span>z-score:<strong>+{viewAnomaly.z}σ</strong></span>
                </div>
              </div>

              {/* 歷史趨勢圖(簡易條狀圖) */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8, fontWeight: 500 }}>
                  過去 8 週 + 本週趨勢
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  height: 100,
                  gap: 4,
                  padding: "10px 0",
                  borderBottom: "1px solid " + C.borderLight,
                }}>
                  {[...history, viewAnomaly.currentValue].map((v, i) => {
                    const isCurrent = i === history.length;
                    return (
                      <div key={i} style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <div style={{ fontSize: 10, color: isCurrent ? color.fg : C.textLight }}>
                          {v}
                        </div>
                        <div style={{
                          width: "100%",
                          height: (v / maxVal) * 70,
                          background: isCurrent ? color.fg : C.textLight,
                          opacity: isCurrent ? 1 : 0.35,
                          borderRadius: "3px 3px 0 0",
                        }} />
                        <div style={{ fontSize: 9, color: C.textLight }}>
                          {isCurrent ? "本週" : `W${34 + i}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{
                padding: "10px 12px",
                background: C.accentLight,
                borderRadius: 6,
                fontSize: 12,
                color: C.accent,
                lineHeight: 1.7,
              }}>
                <strong>系統建議:</strong>
                {viewAnomaly.type === "help"
                  ? `${viewAnomaly.dept}本週協助請求量異常增加,可能代表:(1) 該部門遇到需跨部門解決的系統性問題 (2) 內部資源不足 (3) 有新類型案件進入。建議管理層與該部門主管一對一溝通釐清。`
                  : `${viewAnomaly.dept}本週卡點數量異常增加,可能代表該部門工作流程出現瓶頸。建議召開快速協調會釐清各卡點的根本原因。`}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* 週會 Briefing Modal(管理層專屬) */}
      <Modal
        open={showBriefing}
        onClose={() => setShowBriefing(false)}
        title="本週管理層 Briefing"
        subtitle="可一鍵複製並貼到 LINE / Email"
        maxWidth={680}
      >
        <div>
          <div style={{
            padding: "12px 14px",
            background: C.accentLight,
            borderRadius: 6,
            fontSize: 12,
            color: C.accent,
            marginBottom: 14,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}>
            <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ lineHeight: 1.7 }}>
              此 Briefing 由系統根據本週資料自動產出,涵蓋待決事項、卡點分析、決策狀態、員工負載等管理層關注重點。
            </div>
          </div>

          <pre style={{
            padding: 16,
            background: "#1A1815",
            color: "#E8E6DD",
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.8,
            fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
            maxHeight: "50vh",
            overflowY: "auto",
          }}>
            {briefingText}
          </pre>

          <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
            <Button
              variant="secondary"
              icon={Paperclip}
              onClick={() => {
                navigator.clipboard.writeText(briefingText);
                alert("已複製到剪貼簿");
              }}
            >
              複製內容
            </Button>
            <Button variant="primary" onClick={() => setShowBriefing(false)}>
              關閉
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// 週報填寫
// ============================================================
function WeeklyReport({ reports, setReports }) {
  const [dept, setDept] = useState("投資研究部");
  const [author, setAuthor] = useState("");
  const [cases, setCases] = useState("");
  const [blockers, setBlockers] = useState("");
  const [needHelp, setNeedHelp] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const extractKeywords = (text) => {
    const pool = ["A 新創", "B 公司", "C 標的", "D 客戶", "E 標的", "FinTech", "SaaS", "Pre-A", "A 輪", "Q4", "募資", "盡調", "NDA", "法遵", "競品", "估值", "產業分析"];
    return pool.filter((kw) => text.includes(kw));
  };

  const submit = () => {
    if (!cases.trim() || !author.trim()) return;
    const full = `${cases}\n${blockers}\n${needHelp}\n${nextWeek}`;
    const newReport = {
      id: "r" + Date.now(),
      dept,
      week: "第 42 週",
      author,
      submittedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      cases,
      blockers,
      needHelp,
      nextWeek,
      keywords: extractKeywords(full),
    };
    setReports([...reports.filter((r) => !(r.dept === dept && r.week === "第 42 週")), newReport]);
    setCases("");
    setBlockers("");
    setNeedHelp("");
    setNextWeek("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid " + C.border,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    background: C.surface,
    color: C.text,
    resize: "vertical",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 12,
    color: C.textMid,
    marginBottom: 5,
    fontWeight: 500,
    display: "block",
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 720 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
          WEEKLY REPORT
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>本週週報填寫</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          第 42 週 (10/14 – 10/20) · 請於週五下班前完成
        </div>
      </div>

      <Card style={{ padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>所屬部門</label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option>投資研究部</option>
              <option>業務開發部</option>
              <option>資產管理部</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>填寫人</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="請輸入姓名"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>① 本週進行中案件</label>
          <textarea
            rows={3}
            value={cases}
            onChange={(e) => setCases(e.target.value)}
            placeholder="• A 新創 Pre-A 輪盡職調查&#10;• B 公司產業分析報告"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>② 遇到的卡點</label>
          <textarea
            rows={2}
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="描述目前遇到的阻礙(若無可留空)"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>③ 需其他部門配合</label>
            <textarea
              rows={2}
              value={needHelp}
              onChange={(e) => setNeedHelp(e.target.value)}
              placeholder="需哪個部門協助什麼"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>④ 下週重點</label>
            <textarea
              rows={2}
              value={nextWeek}
              onChange={(e) => setNextWeek(e.target.value)}
              placeholder="下週優先事項"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid " + C.borderLight }}>
          <span style={{ fontSize: 12, color: justSaved ? C.success : C.textLight }}>
            {justSaved ? "✓ 已送出,Dashboard 已更新" : "系統會自動擷取關鍵字供跨部門分析"}
          </span>
          <Button variant="primary" icon={Send} onClick={submit} disabled={!cases.trim() || !author.trim()}>
            送出週報
          </Button>
        </div>
      </Card>

      {/* 已提交清單 */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle color={C.success}>本週已提交週報 ({reports.filter(r => r.week === "第 42 週").length}/3)</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.filter(r => r.week === "第 42 週").map((r) => (
            <Card key={r.id} style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.dept}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                    {r.author} · {r.submittedAt}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {r.keywords.slice(0, 4).map((kw) => (
                    <Pill key={kw} tone="purple">{kw}</Pill>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 交接檢核表
// ============================================================
function Handoff({ handoffs, setHandoffs, focusId }) {
  const [mode, setMode] = useState(focusId ? "view" : "list");
  const [currentId, setCurrentId] = useState(focusId || null);

  // 新建表單狀態
  const [form, setForm] = useState({
    from: "業開部",
    to: "投研部",
    title: "",
    background: "",
    progress: "",
    todo: "",
    attachments: "",
    sender: "",
    receiver: "",
  });

  useEffect(() => {
    if (focusId) {
      setCurrentId(focusId);
      setMode("view");
    }
  }, [focusId]);

  const resetForm = () =>
    setForm({
      from: "業開部",
      to: "投研部",
      title: "",
      background: "",
      progress: "",
      todo: "",
      attachments: "",
      sender: "",
      receiver: "",
    });

  const isComplete = (f) =>
    f.title.trim() && f.background.trim() && f.progress.trim() && f.todo.trim() && f.sender.trim() && f.receiver.trim();

  const submit = () => {
    if (!isComplete(form)) return;
    const newH = {
      id: "h" + Date.now(),
      caseId: "C-2025-" + Math.floor(Math.random() * 900 + 100),
      from: form.from,
      to: form.to,
      title: form.title,
      background: form.background,
      progress: form.progress,
      todo: form.todo,
      attachments: form.attachments.split(",").map((s) => s.trim()).filter(Boolean),
      status: "待簽收",
      sender: form.sender,
      receiver: form.receiver,
      createdAt: new Date().toISOString().slice(0, 10),
      hoursOverdue: 0,
    };
    setHandoffs([...handoffs, newH]);
    resetForm();
    setMode("list");
  };

  const signOff = (id) => {
    setHandoffs(handoffs.map((h) => (h.id === id ? { ...h, status: "已簽收" } : h)));
    setMode("list");
  };

  const current = handoffs.find((h) => h.id === currentId);

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid " + C.border,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    background: C.surface,
    resize: "vertical",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, color: C.textMid, marginBottom: 5, fontWeight: 500, display: "block" };

  if (mode === "create") {
    const complete = isComplete(form);
    return (
      <div style={{ padding: "24px 28px", maxWidth: 720 }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
              NEW HANDOFF
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>建立交接單</h1>
          </div>
          <Button variant="ghost" onClick={() => { resetForm(); setMode("list"); }}>取消</Button>
        </div>

        <Card style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end", marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>交接方</label>
              <select value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>業開部</option>
                <option>投研部</option>
                <option>資管部</option>
              </select>
            </div>
            <div style={{ paddingBottom: 10, color: C.textLight }}>→</div>
            <div>
              <label style={labelStyle}>接手方</label>
              <select value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>投研部</option>
                <option>業開部</option>
                <option>資管部</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>案件標題 *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例:A 新創 Pre-A 輪產業分析委託" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>① 案件背景(三句話內) *</label>
            <textarea rows={3} value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} placeholder="簡述案件脈絡與時程" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>② 目前進度 *</label>
            <textarea rows={2} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} placeholder="已完成事項" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>③ 接手方需完成任務 *</label>
            <textarea rows={2} value={form.todo} onChange={(e) => setForm({ ...form, todo: e.target.value })} placeholder="具體任務與預期產出" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>④ 相關資料(以逗號分隔檔名)</label>
            <input type="text" value={form.attachments} onChange={(e) => setForm({ ...form, attachments: e.target.value })} placeholder="A新創簡報.pdf, 財報摘要.xlsx" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>交接人 *</label>
              <input type="text" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>接手人 *</label>
              <input type="text" value={form.receiver} onChange={(e) => setForm({ ...form, receiver: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* 檢核 banner */}
          <div
            style={{
              padding: 12,
              background: complete ? C.successLight : C.warnLight,
              border: "1px solid " + (complete ? C.success : C.warn) + "30",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {complete ? (
              <CheckCircle2 size={18} color={C.success} />
            ) : (
              <AlertTriangle size={18} color={C.warn} />
            )}
            <div style={{ fontSize: 13, color: complete ? C.success : "#7A4900" }}>
              <strong>{complete ? "完整度檢核通過" : "欄位尚未完整"}</strong>
              {complete ? " · 所有必填欄位已填寫" : " · 必填欄位填完才可送出"}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="secondary" onClick={() => { resetForm(); setMode("list"); }}>取消</Button>
            <Button variant="primary" onClick={submit} disabled={!complete} icon={Send}>
              送出交接單
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (mode === "view" && current) {
    return (
      <div style={{ padding: "24px 28px", maxWidth: 720 }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
              HANDOFF {current.caseId}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 0" }}>{current.title}</h1>
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
              <Pill tone="blue">{current.from}</Pill>
              <span style={{ color: C.textLight }}>→</span>
              <Pill tone="teal">{current.to}</Pill>
              <span style={{ color: C.textLight }}>· 建立於 {current.createdAt}</span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setMode("list")}>← 返回</Button>
        </div>

        <Card style={{ padding: 20 }}>
          {[
            { num: "①", label: "案件背景", value: current.background },
            { num: "②", label: "目前進度", value: current.progress },
            { num: "③", label: "接手方需完成任務", value: current.todo },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 5, fontWeight: 500, display: "flex", justifyContent: "space-between" }}>
                <span>{f.num} {f.label}</span>
                <span style={{ color: C.success, fontSize: 11 }}>✓ 已完成</span>
              </div>
              <div style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, fontSize: 13, lineHeight: 1.7 }}>
                {f.value}
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 5, fontWeight: 500 }}>④ 相關資料</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {current.attachments.map((a) => (
                <span
                  key={a}
                  style={{
                    padding: "4px 10px",
                    background: C.bg,
                    borderRadius: 12,
                    fontSize: 12,
                    border: "1px solid " + C.border,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Paperclip size={11} /> {a}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: 12,
              background: current.status === "已簽收" ? C.successLight : C.dangerLight,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {current.status === "已簽收" ? (
              <CheckCircle2 size={18} color={C.success} />
            ) : (
              <AlertTriangle size={18} color={C.danger} />
            )}
            <div style={{ fontSize: 13, color: current.status === "已簽收" ? C.success : C.danger }}>
              <strong>{current.status}</strong>
              {current.status === "待簽收" && current.hoursOverdue > 0 && ` · 已超過 ${current.hoursOverdue} 小時未簽收`}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid " + C.borderLight }}>
            <div style={{ fontSize: 12, color: C.textMid }}>
              交接人:{current.sender} · 接手人:<strong style={{ color: C.text }}>{current.receiver}</strong>
            </div>
            {current.status === "待簽收" && (
              <Button variant="success" icon={Check} onClick={() => signOff(current.id)}>
                簽收確認
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // 列表
  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>HANDOFF CHECKLIST</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>案件交接</h1>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
            必填欄位完整才能送出,接手方需明確簽收
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setMode("create")}>
          新增交接單
        </Button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { lbl: "待簽收", count: handoffs.filter((h) => h.status === "待簽收").length, tone: "danger" },
          { lbl: "已簽收", count: handoffs.filter((h) => h.status === "已簽收").length, tone: "teal" },
        ].map((s) => (
          <Card key={s.lbl} style={{ padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.textMid }}>{s.lbl}</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: s.tone === "danger" ? C.danger : C.success }}>
              {s.count}
            </span>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {handoffs.map((h) => (
          <Card
            key={h.id}
            style={{ padding: "14px 18px", cursor: "pointer" }}
            onClick={() => { setCurrentId(h.id); setMode("view"); }}
          >
            <div
              onClick={() => { setCurrentId(h.id); setMode("view"); }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Pill tone="blue">{h.from}</Pill>
                  <span style={{ color: C.textLight, fontSize: 11 }}>→</span>
                  <Pill tone="teal">{h.to}</Pill>
                  <span style={{ fontSize: 11, color: C.textLight }}>{h.caseId}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{h.title}</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                  {h.sender} → {h.receiver} · {h.createdAt}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Pill tone={h.status === "已簽收" ? "teal" : "danger"}>{h.status}</Pill>
                <ChevronRight size={16} color={C.textLight} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 歷史案件搜尋
// ============================================================
function History({ history }) {
  const [q, setQ] = useState("FinTech 新創 Pre-A 估值");
  const [viewCase, setViewCase] = useState(null);

  const score = (item) => {
    if (!q.trim()) return 100;
    const terms = q.split(/\s+/).filter(Boolean);
    let s = 0;
    terms.forEach((t) => {
      const re = new RegExp(t, "i");
      if (re.test(item.title)) s += 30;
      if (re.test(item.summary)) s += 15;
      item.tags.forEach((tag) => { if (re.test(tag)) s += 25; });
    });
    return Math.min(100, s);
  };

  const results = history
    .map((h) => ({ ...h, relevance: score(h) }))
    .filter((h) => h.relevance > 0 || !q.trim())
    .sort((a, b) => b.relevance - a.relevance);

  const allTags = Array.from(new Set(history.flatMap((h) => h.tags)));

  return (
    <div style={{ padding: "24px 28px", maxWidth: 820 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>CASE HISTORY</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>歷史案件搜尋</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          共 {history.length} 筆案件 · 基於關鍵字比對排序
        </div>
      </div>

      <Card style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: C.textLight }} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="輸入關鍵字搜尋..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              border: "1px solid " + C.border,
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.textLight, marginRight: 4 }}>常用標籤:</span>
          {allTags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              onClick={() => setQ(tag)}
              style={{ cursor: "pointer" }}
            >
              <Pill tone="purple">{tag}</Pill>
            </span>
          ))}
        </div>
      </Card>

      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10 }}>
        找到 {results.length} 筆相關案件
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {results.length === 0 ? (
          <Card style={{ padding: 40, textAlign: "center", color: C.textLight, fontSize: 13 }}>
            無符合搜尋的案件
          </Card>
        ) : (
          results.map((r) => (
            <Card
              key={r.id}
              style={{
                padding: "14px 18px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onClick={() => setViewCase(r)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Pill tone={r.relevance >= 70 ? "teal" : r.relevance >= 40 ? "warn" : "neutral"}>
                    相關度 {Math.min(99, r.relevance)}%
                  </Pill>
                  <ChevronRight size={14} color={C.textLight} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, marginBottom: 8 }}>
                {r.date} · {r.summary}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {r.tags.map((t) => (
                  <Pill key={t} tone="purple">{t}</Pill>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.textLight, paddingTop: 8, borderTop: "1px solid " + C.borderLight }}>
                <span>👤 負責:{r.owner}</span>
                <span>📁 交接單 × {r.handoffs}</span>
                <span>結論:{r.outcome}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 案件詳情 Modal */}
      <Modal
        open={!!viewCase}
        onClose={() => setViewCase(null)}
        title={viewCase?.title}
        subtitle={viewCase && `${viewCase.date} · 負責人:${viewCase.owner} · ${viewCase.outcome}`}
        maxWidth={640}
      >
        {viewCase && viewCase.detail && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {viewCase.tags.map((t) => (
                <Pill key={t} tone="purple">{t}</Pill>
              ))}
            </div>

            {[
              { label: "案件背景", value: viewCase.detail.background },
              { label: "處理過程", value: viewCase.detail.process },
              { label: "估值與條件", value: viewCase.detail.valuation },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6, fontWeight: 500 }}>
                  {f.label}
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.bg,
                  borderRadius: 6,
                  fontSize: 13,
                  lineHeight: 1.7,
                }}>
                  {f.value}
                </div>
              </div>
            ))}

            {viewCase.detail.keyInsights && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6, fontWeight: 500 }}>
                  關鍵洞察
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.purpleLight,
                  borderRadius: 6,
                  fontSize: 13,
                  lineHeight: 1.9,
                  color: "#3C3489",
                }}>
                  {viewCase.detail.keyInsights.map((k, i) => (
                    <div key={i}>• {k}</div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6, fontWeight: 500 }}>
                結果
              </div>
              <div style={{
                padding: "10px 12px",
                background: viewCase.outcome.includes("投資 ·") ? C.successLight : C.warnLight,
                borderRadius: 6,
                fontSize: 13,
                lineHeight: 1.7,
                color: viewCase.outcome.includes("投資 ·") ? C.success : "#7A4900",
              }}>
                {viewCase.detail.result}
              </div>
            </div>

            {viewCase.detail.lessons && (
              <div style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: "1px solid " + C.borderLight,
              }}>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6, fontWeight: 500 }}>
                  💡 本案經驗
                </div>
                <div style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: C.textMid,
                  fontStyle: "italic",
                }}>
                  {viewCase.detail.lessons}
                </div>
              </div>
            )}

            <div style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid " + C.borderLight,
              display: "flex",
              gap: 14,
              fontSize: 11,
              color: C.textLight,
            }}>
              <span>📁 相關交接單 × {viewCase.handoffs}</span>
              <span>👤 負責人:{viewCase.owner}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================================
// 卡點統計分析頁面
// ============================================================
function BlockerAnalytics({ blockerHistory, reports }) {
  // 每個類別的統計摘要
  const categorySummary = BLOCKER_CATEGORIES.map((cat) => {
    const items = blockerHistory.filter((h) => h.category === cat.key);
    const days = items.map((h) => h.daysToResolve);
    return {
      ...cat,
      count: items.length,
      mean: stats.mean(days),
      std: stats.std(days),
      median: stats.percentile(days, 50),
      p75: stats.percentile(days, 75),
      p90: stats.percentile(days, 90),
      min: days.length ? Math.min(...days) : 0,
      max: days.length ? Math.max(...days) : 0,
      hist: stats.histogram(days, 8),
      days,
    };
  });

  const totalCount = blockerHistory.length;
  const overallMean = stats.mean(blockerHistory.map((h) => h.daysToResolve));

  // 當前週報中的活躍卡點(做對照)
  const deptReports = reports.filter((r) => r.week === "第 42 週");
  const blockerDaysMap = { 投資研究部: 14, 業務開發部: 5, 資產管理部: 9 };
  const activeBlockers = deptReports
    .filter((r) => r.blockers && r.blockers.trim())
    .map((r) => {
      const days = blockerDaysMap[r.dept] || 3;
      return analyzeBlockerText(r.blockers, days, blockerHistory);
    });

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
          BLOCKER ANALYTICS
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>卡點統計分析</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          基於歷史 {totalCount} 筆已解決卡點的描述統計與異常檢測
        </div>
      </div>

      {/* 總覽統計卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "歷史樣本總數", value: totalCount },
          { label: "平均解決天數", value: overallMean.toFixed(1) + " 天" },
          { label: "分類類別數", value: BLOCKER_CATEGORIES.length },
          { label: "當前活躍卡點", value: activeBlockers.length },
        ].map((s) => (
          <Card key={s.label} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* 分類統計表 */}
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <SectionTitle color={C.accent}>各類別描述統計</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid " + C.border, color: C.textMid }}>
                <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 500 }}>類別</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>樣本數</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>平均 μ</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>標準差 σ</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>中位數</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>P75</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>P90</th>
                <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 500 }}>範圍</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((c) => (
                <tr key={c.key} style={{ borderBottom: "1px solid " + C.borderLight }}>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, background: c.color, borderRadius: 2 }} />
                      <span style={{ fontWeight: 600 }}>{c.label}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", padding: "10px", color: C.textMid }}>{c.count}</td>
                  <td style={{ textAlign: "right", padding: "10px", fontWeight: 500 }}>{c.mean.toFixed(1)}</td>
                  <td style={{ textAlign: "right", padding: "10px", color: C.textMid }}>{c.std.toFixed(1)}</td>
                  <td style={{ textAlign: "right", padding: "10px" }}>{c.median.toFixed(1)}</td>
                  <td style={{ textAlign: "right", padding: "10px" }}>{c.p75.toFixed(1)}</td>
                  <td style={{ textAlign: "right", padding: "10px" }}>{c.p90.toFixed(1)}</td>
                  <td style={{ textAlign: "right", padding: "10px", color: C.textLight, fontSize: 11 }}>
                    {c.min}–{c.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 分佈直方圖 */}
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <SectionTitle color={C.purple}>各類別分佈直方圖</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {categorySummary.map((c) => {
            const maxCount = Math.max(...c.hist.map((h) => h.count), 1);
            return (
              <div key={c.key} style={{
                padding: 14,
                background: C.bg,
                borderRadius: 8,
                border: "1px solid " + C.borderLight,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, background: c.color, borderRadius: 2 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: C.textLight }}>
                    n={c.count}
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  height: 80,
                  gap: 2,
                }}>
                  {c.hist.map((h, i) => (
                    <div key={i} style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}>
                      <div style={{
                        width: "100%",
                        height: (h.count / maxCount) * 70,
                        background: c.color,
                        opacity: 0.8,
                        borderRadius: "2px 2px 0 0",
                      }} title={`${h.binStart.toFixed(1)}–${h.binEnd.toFixed(1)} 天: ${h.count} 筆`} />
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: C.textLight,
                  marginTop: 4,
                }}>
                  <span>{c.min} 天</span>
                  <span style={{ color: c.color, fontWeight: 500 }}>μ={c.mean.toFixed(1)}, σ={c.std.toFixed(1)}</span>
                  <span>{c.max} 天</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 當前活躍卡點 vs 歷史分佈 */}
      {activeBlockers.length > 0 && (
        <Card style={{ padding: 18, marginBottom: 16 }}>
          <SectionTitle color={C.danger}>當前活躍卡點 vs 歷史分佈</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeBlockers.map((a, i) => {
              if (!a.hasData) return null;
              const color = riskLevelColor(a.level);
              return (
                <div key={i} style={{
                  padding: "12px 14px",
                  background: color.bg,
                  border: "1px solid " + color.fg + "30",
                  borderRadius: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: color.fg }}>
                      {a.categoryInfo.label}:{a.originalText.slice(0, 30)}{a.originalText.length > 30 ? "..." : ""}
                    </div>
                    <Pill tone={a.level === "critical" ? "danger" : a.level === "high" ? "warn" : "teal"}>
                      {a.levelLabel}
                    </Pill>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                    fontSize: 11,
                    color: color.fg,
                  }}>
                    <div>已卡 <strong>{a.currentDays}</strong> 天</div>
                    <div>歷史均值 {a.mean} 天</div>
                    <div>z-score <strong>{a.z > 0 ? "+" : ""}{a.z}σ</strong></div>
                    <div>超過 <strong>{a.percentile}%</strong> 同類案件</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 方法論說明 */}
      <Card style={{ padding: 18, background: C.bg }}>
        <SectionTitle color={C.textMid}>分析方法論</SectionTitle>
        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ color: C.text }}>① 分類(text mining):</strong>
            卡點文字使用關鍵字比對分類至五大類別 —— 法遵審核、資金調度、資料取得、跨部門協調、決策等待。
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ color: C.text }}>② 統計參照:</strong>
            系統從 database 讀取同類歷史已解決卡點,計算平均 μ、標準差 σ、中位數、P75、P90 等描述統計量。
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ color: C.text }}>③ 異常檢測(z-score):</strong>
            z = (當前天數 − μ) / σ,用以衡量當前卡點偏離歷史平均的程度,並透過常態分佈 CDF 轉換為百分位。
          </div>
          <div>
            <strong style={{ color: C.text }}>④ 風險等級判定:</strong>
            z ≥ 2 為極高風險、z ≥ 1 為高風險、z ≥ 0 為關注中、z &lt; 0 為正常範圍。Dashboard 按 z 分數降序呈現,使管理層可依風險優先處理。
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// 決策追蹤頁面
// ============================================================
function Decisions({ decisions, setDecisions }) {
  const [mode, setMode] = useState("list");
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    decidedBy: "董事會",
    assignedDept: "投資研究部",
    dueDate: "",
    notes: "",
  });

  const stats = {
    total: decisions.length,
    overdue: decisions.filter((d) => d.status === "逾期").length,
    inProgress: decisions.filter((d) => d.status === "執行中").length,
    done: decisions.filter((d) => d.status === "已完成").length,
  };

  const isComplete = (f) => f.title.trim() && f.content.trim() && f.dueDate.trim();

  const submit = () => {
    if (!isComplete(form)) return;
    const today = new Date().toISOString().slice(0, 10);
    const newDecision = {
      id: "d" + Date.now(),
      title: form.title,
      content: form.content,
      decidedBy: form.decidedBy,
      decidedAt: today,
      dueDate: form.dueDate,
      assignedDept: form.assignedDept,
      status: "執行中",
      linkedCases: [],
      notes: form.notes,
    };
    setDecisions([newDecision, ...decisions]);
    setForm({ title: "", content: "", decidedBy: "董事會", assignedDept: "投資研究部", dueDate: "", notes: "" });
    setMode("list");
  };

  const markDone = (id) => {
    setDecisions(decisions.map((d) =>
      d.id === id ? { ...d, status: "已完成", completedAt: new Date().toISOString().slice(0, 10) } : d
    ));
    setViewing(null);
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid " + C.border,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    background: C.surface,
    resize: "vertical",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, color: C.textMid, marginBottom: 5, fontWeight: 500, display: "block" };

  if (mode === "create") {
    const complete = isComplete(form);
    return (
      <div style={{ padding: "24px 28px", maxWidth: 720 }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>NEW DECISION</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>新增管理層決策</h1>
          </div>
          <Button variant="ghost" onClick={() => setMode("list")}>取消</Button>
        </div>

        <Card style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>決策標題 *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例:A 新創 Pre-A 輪投資金額上限" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>決議內容 *</label>
            <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="具體決議內容與條件" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>決議單位</label>
              <select value={form.decidedBy} onChange={(e) => setForm({ ...form, decidedBy: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>董事會</option>
                <option>投資委員會</option>
                <option>營運會議</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>指派執行部門</label>
              <select value={form.assignedDept} onChange={(e) => setForm({ ...form, assignedDept: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>投資研究部</option>
                <option>業務開發部</option>
                <option>資產管理部</option>
                <option>營運與管理層</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>預期完成日 *</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>備註</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="其他須記錄事項(選填)" style={inputStyle} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="secondary" onClick={() => setMode("list")}>取消</Button>
            <Button variant="primary" onClick={submit} disabled={!complete} icon={Send}>記錄決策</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px", maxWidth: 960 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>DECISION LOG</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>管理層決策追蹤</h1>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
            記錄每項管理層決議,追蹤執行進度,避免「說過的事沒人做」
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setMode("create")}>新增決策</Button>
      </div>

      {/* 統計卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "全部決策", value: stats.total, color: C.text },
          { label: "逾期", value: stats.overdue, color: C.danger },
          { label: "執行中", value: stats.inProgress, color: C.accent },
          { label: "已完成", value: stats.done, color: C.success },
        ].map((s) => (
          <Card key={s.label} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* 決策成效分析(管理層反思自己的決策模式) */}
      {decisions.length >= 3 && (() => {
        const completed = decisions.filter((d) => d.status === "已完成");

        // 計算每個部門的達成率
        const deptStats = {};
        decisions.forEach((d) => {
          if (!deptStats[d.assignedDept]) {
            deptStats[d.assignedDept] = { total: 0, done: 0, overdue: 0 };
          }
          deptStats[d.assignedDept].total++;
          if (d.status === "已完成") deptStats[d.assignedDept].done++;
          if (d.status === "逾期") deptStats[d.assignedDept].overdue++;
        });

        // 計算每個決議單位的達成率
        const sourceStats = {};
        decisions.forEach((d) => {
          if (!sourceStats[d.decidedBy]) {
            sourceStats[d.decidedBy] = { total: 0, done: 0, overdue: 0 };
          }
          sourceStats[d.decidedBy].total++;
          if (d.status === "已完成") sourceStats[d.decidedBy].done++;
          if (d.status === "逾期") sourceStats[d.decidedBy].overdue++;
        });

        // 平均執行天數(已完成的決策)
        const avgDays = completed.length > 0
          ? Math.round(completed.reduce((s, d) => {
              if (!d.completedAt || !d.decidedAt) return s;
              const days = (new Date(d.completedAt) - new Date(d.decidedAt)) / (1000 * 60 * 60 * 24);
              return s + days;
            }, 0) / completed.length)
          : 0;

        const overallRate = Math.round((stats.done / stats.total) * 100);

        return (
          <Card style={{ padding: 20, marginBottom: 20, background: "linear-gradient(135deg, #F7FBFF 0%, #EAF3FC 100%)" }}>
            <SectionTitle color={C.accent} hint="幫助管理層反思決策模式">
              📈 決策成效分析
            </SectionTitle>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4 }}>整體達成率</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: overallRate >= 70 ? C.success : overallRate >= 50 ? C.warn : C.danger }}>
                  {overallRate}%
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>
                  {stats.done} / {stats.total} 件按時完成
                </div>
              </div>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4 }}>平均執行時長</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
                  {avgDays} 天
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>
                  從決議到完成的平均時間
                </div>
              </div>
              <div style={{ background: "white", padding: "14px 16px", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4 }}>逾期率</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: stats.overdue > 0 ? C.danger : C.success }}>
                  {Math.round((stats.overdue / stats.total) * 100)}%
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>
                  {stats.overdue} 件決策已逾期
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* 部門達成率 */}
              <div style={{ background: "white", padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: C.textMid, fontWeight: 500, marginBottom: 10 }}>
                  各部門達成率
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(deptStats).map(([dept, s]) => {
                    const rate = Math.round((s.done / s.total) * 100);
                    return (
                      <div key={dept}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span>{dept}</span>
                          <span style={{ fontWeight: 600, color: rate >= 70 ? C.success : rate >= 50 ? C.warn : C.danger }}>
                            {rate}% ({s.done}/{s.total})
                          </span>
                        </div>
                        <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: rate + "%",
                            height: "100%",
                            background: rate >= 70 ? C.success : rate >= 50 ? C.warn : C.danger,
                            transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 決議單位達成率 */}
              <div style={{ background: "white", padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: C.textMid, fontWeight: 500, marginBottom: 10 }}>
                  決議單位達成率
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(sourceStats).map(([source, s]) => {
                    const rate = Math.round((s.done / s.total) * 100);
                    return (
                      <div key={source}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span>{source}</span>
                          <span style={{ fontWeight: 600, color: rate >= 70 ? C.success : rate >= 50 ? C.warn : C.danger }}>
                            {rate}% ({s.done}/{s.total})
                          </span>
                        </div>
                        <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: rate + "%",
                            height: "100%",
                            background: rate >= 70 ? C.success : rate >= 50 ? C.warn : C.danger,
                            transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 14,
              padding: "10px 12px",
              background: "white",
              border: "1px solid " + C.borderLight,
              borderRadius: 6,
              fontSize: 11,
              color: C.textMid,
              lineHeight: 1.7,
            }}>
              💡 <strong style={{ color: C.text }}>反思提示:</strong>
              {overallRate < 60 && "整體達成率偏低,可能反映決策時程過於樂觀或執行資源不足。"}
              {overallRate >= 60 && overallRate < 80 && "達成率中等,部分決策需檢視為何延宕。"}
              {overallRate >= 80 && "達成率良好,維持目前決策節奏即可。"}
            </div>
          </Card>
        );
      })()}

      {/* 決策列表(分組顯示) */}
      {[
        { label: "逾期(需優先追蹤)", items: decisions.filter((d) => d.status === "逾期"), tone: "danger" },
        { label: "執行中", items: decisions.filter((d) => d.status === "執行中"), tone: "blue" },
        { label: "已完成", items: decisions.filter((d) => d.status === "已完成"), tone: "teal" },
      ].map((group) => (
        group.items.length > 0 && (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <SectionTitle color={group.tone === "danger" ? C.danger : group.tone === "blue" ? C.accent : C.success}>
              {group.label} ({group.items.length})
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.items.map((d) => (
                <Card
                  key={d.id}
                  style={{ padding: "14px 18px", cursor: "pointer" }}
                  onClick={() => setViewing(d)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{d.title}</div>
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 6 }}>
                        {d.content}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.textLight, flexWrap: "wrap" }}>
                        <span>📅 決議:{d.decidedAt}</span>
                        <span>🏢 {d.decidedBy}</span>
                        <span>→ 指派 {d.assignedDept}</span>
                        <span>⏰ 期限 {d.dueDate}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Pill tone={group.tone}>{d.status}</Pill>
                      <ChevronRight size={14} color={C.textLight} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}

      {/* 決策詳情 Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        subtitle={viewing && `${viewing.decidedBy} · 決議於 ${viewing.decidedAt}`}
        maxWidth={600}
      >
        {viewing && (
          <div>
            <div style={{
              padding: "12px 14px",
              background: C.bg,
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.7,
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4, fontWeight: 500 }}>
                決議內容
              </div>
              {viewing.content}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { label: "指派部門", value: viewing.assignedDept },
                { label: "預期完成", value: viewing.dueDate },
                { label: "目前狀態", value: viewing.status,
                  tone: viewing.status === "逾期" ? "danger" : viewing.status === "已完成" ? "teal" : "blue" },
                { label: viewing.completedAt ? "完成日" : "關聯案件",
                  value: viewing.completedAt || (viewing.linkedCases.length ? viewing.linkedCases.join(", ") : "—") },
              ].map((f) => (
                <div key={f.label} style={{
                  padding: "10px 12px",
                  background: C.bg,
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {f.tone ? <Pill tone={f.tone}>{f.value}</Pill> : f.value}
                  </div>
                </div>
              ))}
            </div>

            {viewing.notes && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 5, fontWeight: 500 }}>備註</div>
                <div style={{
                  padding: "10px 12px",
                  background: C.accentLight,
                  borderRadius: 6,
                  fontSize: 13,
                  color: C.accent,
                  lineHeight: 1.7,
                }}>
                  {viewing.notes}
                </div>
              </div>
            )}

            {viewing.status !== "已完成" && (
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid " + C.borderLight }}>
                <Button variant="success" icon={Check} onClick={() => markDone(viewing.id)}>
                  標記為已完成
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================================
// 員工負載熱力圖頁面
// ============================================================
function EmployeeLoad({ reports, handoffs }) {
  const [selected, setSelected] = useState(null);
  const loads = useMemo(() => analyzeEmployeeLoad(reports, handoffs), [reports, handoffs]);

  const byDept = loads.reduce((acc, e) => {
    if (!acc[e.dept]) acc[e.dept] = [];
    acc[e.dept].push(e);
    return acc;
  }, {});

  const overloadedCount = loads.filter((l) => l.level === "overload").length;
  const idleCount = loads.filter((l) => l.level === "idle").length;
  const avgScore = stats.mean(loads.map((l) => l.loadScore)).toFixed(1);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
          EMPLOYEE LOAD
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>員工負載分析</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          從週報、交接單、被提及次數綜合計算工作負載,協助管理層掌握資源分配
        </div>
      </div>

      {/* 統計卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "員工總數", value: loads.length, color: C.text },
          { label: "過載", value: overloadedCount, color: C.danger },
          { label: "平均負載分數", value: avgScore, color: C.accent },
          { label: "低負載 / 閒置", value: idleCount + loads.filter((l) => l.level === "low").length, color: C.textMid },
        ].map((s) => (
          <Card key={s.label} style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* 熱力圖 */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionTitle color={C.accent} hint="點擊員工查看詳細負載組成">
          各部門負載熱力圖
        </SectionTitle>

        {Object.entries(byDept).map(([dept, members]) => (
          <div key={dept} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8, fontWeight: 500 }}>
              {dept} ({members.length})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {members.map((e) => {
                const info = loadLevelInfo(e.level);
                return (
                  <div
                    key={e.name}
                    onClick={() => setSelected(e)}
                    style={{
                      padding: "14px 14px",
                      background: info.bg,
                      border: "1px solid " + info.color + "30",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(ev) => {
                      ev.currentTarget.style.borderColor = info.color;
                      ev.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(ev) => {
                      ev.currentTarget.style.borderColor = info.color + "30";
                      ev.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: info.color }}>{e.name}</div>
                      <div style={{ fontSize: 10, color: info.color, opacity: 0.7 }}>{e.role}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 11, color: info.color }}>{info.label}</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: info.color }}>
                        {e.loadScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {/* 方法論 */}
      <Card style={{ padding: 18, background: C.bg }}>
        <SectionTitle color={C.textMid}>負載計算方法</SectionTitle>
        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.8 }}>
          負載分數 = (自己週報案件數 × 3) + (被其他週報提及次數 × 2) + (交接單參與數 × 2) + (待簽收交接 × 4)
          <br />
          <strong style={{ color: C.text }}>過載</strong> ≥ 20 &nbsp;·&nbsp;
          <strong style={{ color: C.text }}>高負載</strong> ≥ 12 &nbsp;·&nbsp;
          <strong style={{ color: C.text }}>正常</strong> ≥ 6 &nbsp;·&nbsp;
          <strong style={{ color: C.text }}>低負載</strong> ≥ 1 &nbsp;·&nbsp;
          <strong style={{ color: C.text }}>閒置</strong> = 0
        </div>
      </Card>

      {/* 員工詳情 Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected && `${selected.dept} · ${selected.role}`}
        maxWidth={520}
      >
        {selected && (() => {
          const info = loadLevelInfo(selected.level);
          return (
            <div>
              {/* 總分 */}
              <div style={{
                padding: 18,
                background: info.bg,
                border: "1px solid " + info.color + "30",
                borderRadius: 8,
                marginBottom: 16,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: info.color, lineHeight: 1 }}>
                  {selected.loadScore}
                </div>
                <div style={{ fontSize: 13, color: info.color, marginTop: 6, fontWeight: 500 }}>
                  {info.label}
                </div>
              </div>

              {/* 組成明細 */}
              <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8, fontWeight: 500 }}>
                負載組成明細
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {[
                  { label: "自己週報中的案件數", value: selected.caseCount, weight: 3 },
                  { label: "被其他週報提及次數", value: selected.mentions, weight: 2 },
                  { label: "交接單參與數", value: selected.totalHandoffs, weight: 2 },
                  { label: "待簽收交接", value: selected.pendingReceive, weight: 4 },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: C.bg,
                    borderRadius: 6,
                  }}>
                    <div>
                      <div style={{ fontSize: 13 }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>權重 × {item.weight}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 600 }}>{item.value}</span>
                      <span style={{ fontSize: 11, color: C.textLight }}>
                        = {item.value * item.weight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 週報繳交狀態 */}
              <div style={{
                padding: "10px 12px",
                background: selected.hasReport ? C.successLight : C.warnLight,
                borderRadius: 6,
                fontSize: 12,
                color: selected.hasReport ? C.success : "#7A4900",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                {selected.hasReport ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                本週週報:{selected.hasReport ? "已繳交" : "尚未繳交"}
              </div>

              {/* 建議 */}
              {selected.level === "overload" && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: C.dangerLight,
                  borderRadius: 6,
                  fontSize: 12,
                  color: C.danger,
                  lineHeight: 1.7,
                }}>
                  <strong>建議:</strong>此員工負載過高,建議管理層評估是否有可分派出去的任務或延後處理的事項。
                </div>
              )}
              {selected.level === "idle" && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: C.accentLight,
                  borderRadius: 6,
                  fontSize: 12,
                  color: C.accent,
                  lineHeight: 1.7,
                }}>
                  <strong>建議:</strong>此員工本週參與度偏低,建議主管了解原因(是否在做長期研究、或可接新任務)。
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ============================================================
// LINE Bot 模擬
// ============================================================
function LineBot({ reports, handoffs }) {
  const unsigned = handoffs.filter((h) => h.status === "待簽收");
  const deptReports = reports.filter((r) => r.week === "第 42 週");
  const missing = ["投資研究部", "業務開發部", "資產管理部"].filter(
    (d) => !deptReports.find((r) => r.dept === d)
  );

  return (
    <div style={{ padding: "24px 28px", maxWidth: 820 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>LINE BOT</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>LINE Bot 推播預覽</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          系統將於以下時機自動推播(預覽根據目前系統狀態動態生成)
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, alignItems: "start" }}>
        {/* 手機畫面 */}
        <div
          style={{
            background: "#8CA8C4",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #B0BEC8",
          }}
        >
          <div style={{ background: "#5A7894", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.success, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 }}>
              串
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>串連 · 跨部門小幫手</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10 }}>官方帳號 · 在線中</div>
            </div>
          </div>
          <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {missing.length > 0 && (
              <>
                <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.9)" }}>週五 15:00</div>
                <BotMsg>
                  📝 提醒:<strong>{missing.join("、")}</strong>尚未繳交本週週報,請於下班前完成。
                  <BotAction>→ 點此快速填寫</BotAction>
                </BotMsg>
              </>
            )}

            <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>週一 09:00</div>
            <BotMsg>
              <strong style={{ display: "block", marginBottom: 4, fontSize: 12 }}>📊 吳董事長 早安</strong>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
                本週三部門摘要:<br />
                • 共同議題:根據週報自動彙整<br />
                • 卡點警示:{deptReports.filter((r) => r.blockers.trim()).length} 項<br />
                • 未閉環交接:{unsigned.length} 筆
              </div>
              <BotAction>→ 打開管理儀表板</BotAction>
            </BotMsg>

            {unsigned.length > 0 && (
              <>
                <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>剛剛</div>
                <BotMsg danger>
                  ⚠️ 提醒:<strong>{unsigned[0].title}</strong>交接單已超過 {unsigned[0].hoursOverdue || 0} 小時未簽收。
                </BotMsg>
              </>
            )}
          </div>
        </div>

        {/* 右邊說明 */}
        <div>
          <Card style={{ padding: 20, marginBottom: 12 }}>
            <SectionTitle color={C.accent}>推播排程</SectionTitle>
            {[
              { time: "每週五 15:00", who: "三部門主管", what: "提醒填寫本週週報" },
              { time: "每週一 09:00", who: "董事、COO", what: "本週跨部門摘要與 Dashboard 連結" },
              { time: "即時觸發", who: "接手方", what: "交接單超過 48 小時未簽收時提醒" },
            ].map((s) => (
              <div key={s.time} style={{ padding: "10px 0", borderBottom: "1px solid " + C.borderLight, fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.time}</div>
                <div style={{ color: C.textMid, fontSize: 12 }}>
                  推播給 {s.who} · {s.what}
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ padding: 20, background: C.warnLight, border: "1px solid " + C.warn + "30" }}>
            <div style={{ fontSize: 13, color: "#7A4900", lineHeight: 1.7 }}>
              <strong>為何此功能至關重要?</strong><br />
              在串連公司以 LINE 為主要溝通管道的現況下,推播讓使用者不用另外登入系統,也能完成 80% 的日常互動。這是專案能否被實際採用的關鍵。
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const BotMsg = ({ children, danger }) => (
  <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
    <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.success, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
      串
    </div>
    <div
      style={{
        background: danger ? C.dangerLight : "white",
        border: danger ? "1px solid #F09595" : "none",
        color: danger ? C.danger : C.text,
        borderRadius: 10,
        padding: "8px 11px",
        maxWidth: 240,
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  </div>
);

const BotAction = ({ children }) => (
  <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #E5E7EB", fontSize: 11, color: "#0C447C", fontWeight: 500 }}>
    {children}
  </div>
);

// ============================================================
// 主容器
// ============================================================
export default function App() {
  // ===== 驗證狀態 =====
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 使用者角色資訊(根據 email 自動推斷)
  const userProfile = useMemo(
    () => authUser ? { ...inferUserProfile(authUser.email), email: authUser.email } : null,
    [authUser]
  );

  // ===== 應用狀態 =====
  const [tab, setTab] = useState("dashboard");
  const [focusHandoffId, setFocusHandoffId] = useState(null);
  const [reports, setReports] = useState(SEED_REPORTS);
  const [handoffs, setHandoffs] = useState(SEED_HANDOFFS);
  const [decisions, setDecisions] = useState(SEED_DECISIONS);
  const [history] = useState(SEED_HISTORY);
  const [blockerHistory] = useState(SEED_BLOCKER_HISTORY);
  const [topicHistory] = useState(SEED_TOPIC_HISTORY);
  const [activityHistory] = useState(SEED_REPORT_ACTIVITY);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | error

  // ===== 監聽登入狀態 =====
  useEffect(() => {
    const unsub = watchAuth((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ===== 登入後從 Firestore 載入資料 =====
  useEffect(() => {
    if (!authUser) {
      setDataLoaded(false);
      return;
    }
    (async () => {
      setSyncStatus("syncing");
      try {
        const [r, h, d] = await Promise.all([
          fetchCollection("reports", SEED_REPORTS),
          fetchCollection("handoffs", SEED_HANDOFFS),
          fetchCollection("decisions", SEED_DECISIONS),
        ]);
        setReports(r);
        setHandoffs(h);
        setDecisions(d);
        setSyncStatus("idle");
      } catch (err) {
        console.error("Firebase load failed:", err);
        setSyncStatus("error");
      } finally {
        setDataLoaded(true);
      }
    })();
  }, [authUser]);

  // ===== 資料變動時自動同步到 Firestore =====
  useEffect(() => {
    if (dataLoaded && authUser) {
      setSyncStatus("syncing");
      saveCollection("reports", reports).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [reports, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      setSyncStatus("syncing");
      saveCollection("handoffs", handoffs).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [handoffs, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      setSyncStatus("syncing");
      saveCollection("decisions", decisions).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [decisions, dataLoaded, authUser]);

  const navigateTo = (t, id) => {
    setTab(t);
    if (id) setFocusHandoffId(id);
    else setFocusHandoffId(null);
  };

  const resetDemo = async () => {
    if (confirm("確定要重置範例資料嗎?(會清空雲端資料,所有人都會看到重置)")) {
      setReports(SEED_REPORTS);
      setHandoffs(SEED_HANDOFFS);
      setDecisions(SEED_DECISIONS);
    }
  };

  const handleLogout = async () => {
    if (confirm("確定要登出嗎?")) {
      await logout();
    }
  };

  const handleRefresh = async () => {
    if (!authUser) return;
    setSyncStatus("syncing");
    const [r, h, d] = await Promise.all([
      fetchCollection("reports", SEED_REPORTS),
      fetchCollection("handoffs", SEED_HANDOFFS),
      fetchCollection("decisions", SEED_DECISIONS),
    ]);
    setReports(r);
    setHandoffs(h);
    setDecisions(d);
    setSyncStatus("idle");
  };

  // ===== 渲染分支 =====
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Noto Sans TC", sans-serif',
          color: C.textMid,
          fontSize: 14,
        }}
      >
        系統載入中...
      </div>
    );
  }

  if (!authUser) {
    return <Login />;
  }

  if (!dataLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Noto Sans TC", sans-serif',
          color: C.textMid,
          fontSize: 14,
          gap: 10,
          flexDirection: "column",
        }}
      >
        <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
        正在從雲端同步資料...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 根據角色決定可見的選單(管理層看全部、主管看大部分、員工只看基本)
  const allTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "member"] },
    { id: "report", label: "週報填寫", icon: FileText, roles: ["admin", "manager", "member"] },
    { id: "handoff", label: "案件交接", icon: ArrowRightLeft, roles: ["admin", "manager", "member"] },
    { id: "decisions", label: "決策追蹤", icon: CheckCircle2, roles: ["admin", "manager"] },
    { id: "employees", label: "員工負載", icon: Users, roles: ["admin"] },
    { id: "history", label: "歷史搜尋", icon: Search, roles: ["admin", "manager"] },
    { id: "analytics", label: "卡點分析", icon: BarChart3, roles: ["admin", "manager"] },
    { id: "linebot", label: "LINE Bot", icon: MessageCircle, roles: ["admin", "manager", "member"] },
  ];
  const tabs = allTabs.filter((t) => t.roles.includes(userProfile?.role || "member"));

  // 如果使用者目前在的 tab 因為權限變動已不可見,自動切回 dashboard
  useEffect(() => {
    if (userProfile && !tabs.find((t) => t.id === tab)) {
      setTab("dashboard");
    }
  }, [userProfile, tab, tabs]);

  return (
    <div
      style={{
        fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", -apple-system, sans-serif',
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* 側邊欄 */}
      <aside
        style={{
          width: 220,
          background: C.surface,
          borderRight: "1px solid " + C.border,
          padding: "24px 12px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 12px 20px", borderBottom: "1px solid " + C.borderLight, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.accent,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              串
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>串連股份有限公司</div>
              <div style={{ fontSize: 10, color: C.textLight }}>管理層決策輔助系統</div>
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigateTo(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  background: active ? C.accentLight : "transparent",
                  color: active ? C.accent : C.textMid,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* 使用者資訊區塊 */}
        <div style={{ padding: "12px", borderTop: "1px solid " + C.borderLight, marginTop: 12 }}>
          {/* 同步狀態指示 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: syncStatus === "error" ? C.danger : syncStatus === "syncing" ? C.warn : C.success,
            marginBottom: 10,
            padding: "6px 8px",
            background: syncStatus === "error" ? C.dangerLight : syncStatus === "syncing" ? C.warnLight : C.successLight,
            borderRadius: 6,
          }}>
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
                  onClick={handleRefresh}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: C.danger,
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

          {/* 使用者卡片 */}
          <div style={{
            padding: "10px 10px",
            background: C.bg,
            borderRadius: 6,
            marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: C.accent,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {(authUser?.email || "?")[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: C.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {userProfile?.displayName || authUser?.email}
                </div>
                <div style={{
                  fontSize: 10,
                  color: C.textLight,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {userProfile?.dept || "—"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <span style={{
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 600,
                background: userProfile?.role === "admin"
                  ? C.accent
                  : userProfile?.role === "manager"
                  ? C.purple
                  : C.textMid,
                color: "white",
              }}>
                {ROLE_LABELS[userProfile?.role] || "—"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "6px 10px",
                background: C.surface,
                border: "1px solid " + C.border,
                borderRadius: 5,
                fontSize: 11,
                color: C.textMid,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.dangerLight;
                e.currentTarget.style.color = C.danger;
                e.currentTarget.style.borderColor = C.danger + "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.surface;
                e.currentTarget.style.color = C.textMid;
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              <LogOut size={11} />
              登出
            </button>
          </div>

          <button
            onClick={resetDemo}
            style={{
              fontSize: 11,
              color: C.textLight,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 0",
            }}
          >
            重置範例資料
          </button>
          <div style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
            資管導論 第 13 組
          </div>
        </div>
      </aside>

      {/* 主內容 */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {tab === "dashboard" && <Dashboard
          reports={reports}
          handoffs={handoffs}
          blockerHistory={blockerHistory}
          decisions={decisions}
          topicHistory={topicHistory}
          activityHistory={activityHistory}
          onNav={navigateTo}
          userProfile={userProfile}
        />}
        {tab === "report" && <WeeklyReport reports={reports} setReports={setReports} />}
        {tab === "handoff" && <Handoff handoffs={handoffs} setHandoffs={setHandoffs} focusId={focusHandoffId} />}
        {tab === "decisions" && <Decisions decisions={decisions} setDecisions={setDecisions} />}
        {tab === "employees" && <EmployeeLoad reports={reports} handoffs={handoffs} />}
        {tab === "history" && <History history={history} />}
        {tab === "analytics" && <BlockerAnalytics blockerHistory={blockerHistory} reports={reports} />}
        {tab === "linebot" && <LineBot reports={reports} handoffs={handoffs} />}
      </main>
    </div>
  );
}
