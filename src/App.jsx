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
  Calendar,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import Login from "./Login.jsx";
import {
  watchAuth,
  logout,
  fetchDocumentCollection,
  saveDocumentCollection,
  inferUserProfile,
  ROLE_LABELS,
} from "./firebase.js";

// ===== 初始範例資料 =====
// ===== 初始範例資料 =====
// 第 42 週(本週)三部門詳細週報 + 過去 7 週(35-41)各部門歷史週報
// 過去週報採用較簡潔但連貫的內容,展現公司持續運作的真實感
const SEED_REPORTS_HISTORICAL = (() => {
  const data = [];
  const weeks = [
    { wk: 35, label: "第 35 週", dateRange: "8/26 – 9/1" },
    { wk: 36, label: "第 36 週", dateRange: "9/2 – 9/8" },
    { wk: 37, label: "第 37 週", dateRange: "9/9 – 9/15" },
    { wk: 38, label: "第 38 週", dateRange: "9/16 – 9/22" },
    { wk: 39, label: "第 39 週", dateRange: "9/23 – 9/29" },
    { wk: 40, label: "第 40 週", dateRange: "9/30 – 10/6" },
    { wk: 41, label: "第 41 週", dateRange: "10/7 – 10/13" },
  ];

  // 投研部 7 週的故事線(逐步推進 A 新創、B 公司案件)
  const researchStory = [
    {
      cases: "• B 公司產業分析啟動(訪談 3 家競品)\n• Q3 投資組合估值\n• L 標的退件回覆",
      blockers: "L 標的法律意見書遲未回覆",
      needHelp: "請業開部聯繫 L 標的法務窗口",
      nextWeek: "完成 B 公司產業分析架構",
      keywords: ["B 公司", "Q3", "L 標的", "競品分析"],
    },
    {
      cases: "• B 公司產業分析(競品比較表完成)\n• A 新創第一次接觸(初步資料審閱)\n• Q3 估值報告產出",
      blockers: "Q3 估值有 2 家被投公司報表延遲提供",
      needHelp: "需資管部協助與 P 公司、R 公司財務窗口溝通",
      nextWeek: "B 公司產業分析交付、A 新創創辦人面談排程",
      keywords: ["B 公司", "A 新創", "Q3", "估值"],
    },
    {
      cases: "• A 新創創辦人面談(2.5 小時)\n• B 公司產業分析交付業開部\n• 法遵審核新流程試行",
      blockers: "A 新創財務資料只提供簡化版,需要正式版",
      needHelp: "需業開部協助請 A 新創補件",
      nextWeek: "A 新創財務模型 v1、補件追蹤",
      keywords: ["A 新創", "B 公司", "盡調", "法遵"],
    },
    {
      cases: "• A 新創財務模型 v1 完成(估值區間 3.5-5 億)\n• C 標的二次訪談\n• Q4 投資策略檢討",
      blockers: "A 新創財務正式版仍未送達(已過兩週),Q4 策略待管理層拍板",
      needHelp: "需業開部再次催促 A 新創,需管理層確認 Q4 策略方向",
      nextWeek: "A 新創估值區間決議、Q4 案件篩選",
      keywords: ["A 新創", "C 標的", "Q4", "估值", "募資"],
    },
    {
      cases: "• C 標的訪談紀錄整理\n• A 新創估值區間二次評估\n• F 教育科技標的初篩",
      blockers: "A 新創財務資料仍未收齊,已影響估值精度",
      needHelp: "請業開部加強跟進 A 新創財務長",
      nextWeek: "F 標的初篩決議、C 標的二次評估會議",
      keywords: ["A 新創", "C 標的", "F 標的", "教育科技", "估值"],
    },
    {
      cases: "• A 新創盡調進入正式階段\n• F 標的初步評估報告\n• B 公司案件結案(轉給業開部跟進客戶接觸)",
      blockers: "A 新創財務資料部分缺漏,影響盡調進度",
      needHelp: "業開部需協助多次聯繫 A 新創",
      nextWeek: "A 新創盡調 50%、F 標的決議是否進入正式",
      keywords: ["A 新創", "F 標的", "B 公司", "盡調"],
    },
    {
      cases: "• A 新創盡調(60% 完成)\n• B 公司產業分析報告\n• C 標的二次訪談紀錄整理",
      blockers: "A 新創財務資料尚未收齊,已 14 天",
      needHelp: "請業開部協助聯繫 A 新創財務長",
      nextWeek: "完成 B 公司產業分析初稿、A 新創盡調 80%",
      keywords: ["A 新創", "B 公司", "C 標的", "盡調"],
    },
  ];

  const bizStory = [
    {
      cases: "• Q3 客戶滿意度回訪\n• L 標的最後接觸\n• 8 月新進員工到職",
      blockers: "L 標的董事會傾向不接受我方條件",
      needHelp: "需資管部試算最後一輪修正條件",
      nextWeek: "L 標的最終回覆、Q4 客戶名單建立",
      keywords: ["Q3", "L 標的", "新人"],
    },
    {
      cases: "• Q4 新客戶開發啟動(目標 10 家)\n• A 新創初次接觸\n• L 標的結案",
      blockers: "Q4 客戶名單仍在篩選中",
      needHelp: "需研究部提供 Q4 重點產業優先級",
      nextWeek: "客戶名單收斂至 5 家、A 新創二次會議",
      keywords: ["Q4", "A 新創", "L 標的", "新客戶"],
    },
    {
      cases: "• A 新創二次會議\n• Q4 新客戶開發(已接觸 5 家)\n• D 客戶初次接洽",
      blockers: "A 新創財務長行程難敲",
      needHelp: "需協助安排 A 新創財務長會議",
      nextWeek: "D 客戶 NDA 草擬、A 新創財務窗口建立",
      keywords: ["A 新創", "Q4", "D 客戶", "NDA"],
    },
    {
      cases: "• D 客戶 NDA 草擬\n• Q4 募資前期溝通\n• G 公司初次接觸",
      blockers: "D 客戶法務對 NDA 有 3 點異議",
      needHelp: "需資管部審閱 NDA 修訂建議",
      nextWeek: "D 客戶 NDA 修訂版、G 公司產業簡報",
      keywords: ["D 客戶", "NDA", "Q4", "募資", "G 公司"],
    },
    {
      cases: "• Q4 新客戶開發(7 家進入)\n• A 新創投資條件書草擬\n• G 公司產業簡報",
      blockers: "A 新創財務長依然難敲時程",
      needHelp: "需投研部加速 G 公司產業評估",
      nextWeek: "G 公司董事會簡報、A 新創條件書 v1",
      keywords: ["A 新創", "Q4", "G 公司", "募資"],
    },
    {
      cases: "• A 新創條件書 v1 完成\n• 11 月 FinTech Summit 規劃\n• Q4 客戶開發(進度 70%)",
      blockers: "Q4 募資節奏(1.5 億 vs 2 億)管理層尚未拍板",
      needHelp: "需管理層拍板募資規模",
      nextWeek: "FinTech Summit 議程、A 新創條件書定稿",
      keywords: ["A 新創", "Q4", "募資", "FinTech"],
    },
    {
      cases: "• A 新創投資條件書草擬\n• Q4 新客戶開發(已接觸 7 家)\n• D 客戶 NDA 簽訂\n• G 公司初次接觸會議",
      blockers: "A 新創財務長行程難安排",
      needHelp: "需管理層確認 Q4 募資節奏",
      nextWeek: "推進 A 新創簽約流程",
      keywords: ["A 新創", "Q4", "募資", "NDA", "G 公司"],
    },
  ];

  const assetStory = [
    {
      cases: "• Q3 投組季報製作\n• 法遵新版規範研讀\n• 8 家被投公司財務檢視",
      blockers: "法遵 9 月新規對部分被投公司影響需評估",
      needHelp: "需研究部協助評估法規影響",
      nextWeek: "Q3 投組報告、法規影響清單",
      keywords: ["Q3", "投組", "法遵", "被投"],
    },
    {
      cases: "• Q3 投組報告完成\n• Q4 募資方案初步試算\n• 法遵新規影響評估",
      blockers: "P 公司、R 公司報表延遲影響估值精度",
      needHelp: "需研究部協助與被投公司財務窗口溝通",
      nextWeek: "Q4 募資配置方案、P/R 公司報表催收",
      keywords: ["Q3", "Q4", "募資", "法遵"],
    },
    {
      cases: "• Q4 募資方案 v1\n• K 公司退場評估啟動\n• 法遵流程文件化",
      blockers: "K 公司退場估值未取得共識",
      needHelp: "需研究部協助 K 公司退場估值",
      nextWeek: "K 公司退場估值方案、Q4 募資 v2",
      keywords: ["Q4", "K 公司", "退場", "法遵", "募資"],
    },
    {
      cases: "• K 公司退場估值方案\n• 法遵流程稽核\n• Q4 募資資金配置",
      blockers: "K 公司退場稅務優化方案需法律意見",
      needHelp: "需業開部協助引介稅務顧問",
      nextWeek: "K 公司稅務方案、法遵審核完成",
      keywords: ["K 公司", "退場", "稅務", "法遵", "Q4"],
    },
    {
      cases: "• 法遵審核中(K 公司案)\n• Q4 募資配置(資金來源確認)\n• D 客戶背景初查",
      blockers: "法遵審核等待管理層決議已 3 天",
      needHelp: "需管理層儘速做 K 公司稅務方案決議",
      nextWeek: "完成 K 公司退場決議、D 客戶 NDA 條款",
      keywords: ["K 公司", "法遵", "Q4", "募資", "D 客戶"],
    },
    {
      cases: "• D 客戶 NDA 條款審閱\n• K 公司退場最終評估\n• 11 月投組季報啟動",
      blockers: "法遵審核等待管理層決議已 5 天",
      needHelp: "需研究部提供 A 新創完整風險評估",
      nextWeek: "K 公司退場決議、Q4 投組報告框架",
      keywords: ["K 公司", "法遵", "D 客戶", "NDA", "投組"],
    },
    {
      cases: "• 既有投資組合季度回顧(8 家被投公司報表彙整)\n• Q4 募資方案評估\n• 法遵審核排程\n• D 客戶 NDA 條款審閱\n• K 公司退場機會評估",
      blockers: "法遵審核等待管理層決議已 5 天,Q4 募資計畫尚未取得董事會明確指示",
      needHelp: "需研究部提供 A 新創風險評估完整版",
      nextWeek: "完成 Q4 募資資金配置試算、K 公司退場評估報告",
      keywords: ["Q4", "募資", "法遵", "A 新創", "K 公司", "退場", "稅務", "D 客戶"],
    },
  ];

  weeks.forEach((w, idx) => {
    const submitDate = new Date(2025, 7, 26 + idx * 7).toISOString().slice(0, 10);
    [
      { dept: "投資研究部", author: "周世倫", story: researchStory[idx] },
      { dept: "業務開發部", author: "林聿平", story: bizStory[idx] },
      { dept: "資產管理部", author: "梁嘉芫", story: assetStory[idx] },
    ].forEach((d, j) => {
      data.push({
        id: `r-w${w.wk}-${j + 1}`,
        dept: d.dept,
        week: w.label,
        author: d.author,
        submittedAt: `${submitDate} 17:${(j + 1) * 12}`,
        cases: d.story.cases,
        blockers: d.story.blockers,
        needHelp: d.story.needHelp,
        nextWeek: d.story.nextWeek,
        keywords: d.story.keywords,
      });
    });
  });

  return data;
})();

const SEED_REPORTS = [
  ...SEED_REPORTS_HISTORICAL,
  // 第 42 週(本週) - 詳細版
  {
    id: "r1",
    dept: "投資研究部",
    week: "第 42 週",
    author: "周世倫",
    submittedAt: "2025-10-17 16:32",
    cases: "• A 新創 Pre-A 輪盡職調查(主辦)\n• B 公司產業分析報告(2/3 完成)\n• C 標的二次訪談紀錄整理\n• F 教育科技標的初篩\n• 既有投資組合季度估值更新",
    blockers: "A 新創財務資料尚未收齊,已兩週。創辦人提供之 2024 年度財報為簡化版,需正式版才能進行估值。已透過業開部聯繫兩次未果。",
    needHelp: "請業開部協助聯繫 A 新創財務長,確認財報補件時程。需資管部協助評估 A 新創若引入新股東後的反稀釋條款風險。",
    nextWeek: "完成 B 公司產業分析初稿、A 新創財務模型 v2、F 標的決議下週是否進入正式評估",
    keywords: ["A 新創", "FinTech", "Pre-A", "盡調", "B 公司", "F 標的", "反稀釋"],
  },
  {
    id: "r2",
    dept: "業務開發部",
    week: "第 42 週",
    author: "林聿平",
    submittedAt: "2025-10-17 17:05",
    cases: "• A 新創投資條件書草擬\n• Q4 新客戶開發(已接觸 7 家)\n• D 客戶 NDA 簽訂\n• G 公司初次接觸會議\n• 業界活動參訪規劃(11 月 FinTech Summit)",
    blockers: "A 新創財務長行程難安排,本週已電話聯繫 4 次未通。D 客戶法務對 NDA 條款有 3 點異議,已轉給資管部審閱中。",
    needHelp: "需管理層確認 Q4 募資節奏(目標 1.5 億 vs 2 億兩種規模差異)。需投研部加速 G 公司產業初評。",
    nextWeek: "推進 A 新創簽約流程、完成 D 客戶 NDA 修訂版、與 G 公司董事會做 30 分鐘簡報",
    keywords: ["A 新創", "Q4", "募資", "NDA", "D 客戶", "G 公司", "FinTech"],
  },
  {
    id: "r3",
    dept: "資產管理部",
    week: "第 42 週",
    author: "梁嘉芫",
    submittedAt: "2025-10-17 17:48",
    cases: "• 既有投資組合季度回顧(8 家被投公司報表彙整)\n• Q4 募資方案評估\n• 法遵審核排程\n• D 客戶 NDA 條款審閱\n• K 公司退場機會評估",
    blockers: "法遵審核等待管理層決議已 5 天,涉及 K 公司退場時的稅務優化方案。Q4 募資計畫尚未取得董事會明確指示,影響後續資金配置安排。",
    needHelp: "需研究部提供 A 新創風險評估完整版以納入投組曝險試算。需業開部確認 D 客戶簽約時程,法務需提前 1 週準備合約。",
    nextWeek: "完成 Q4 募資資金配置試算、K 公司退場評估報告、法遵審核完成 NDA 條款建議",
    keywords: ["Q4", "募資", "法遵", "A 新創", "K 公司", "退場", "稅務", "D 客戶"],
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
    attachments: ["A新創簡報.pdf", "訪談逐字稿.docx", "財報摘要.xlsx"],
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
  {
    id: "h4",
    from: "資管部",
    to: "投研部",
    caseId: "C-2025-039",
    title: "K 公司退場稅務評估委託",
    background: "K 公司為 2024 年 Q2 投資標的,目前估值已成長 2.3 倍,評估退場時機。需研究部從產業角度判斷下一波成長空間。",
    progress: "已彙整 K 公司近 4 季財報,稅務試算已完成基礎模型。",
    todo: "提供 K 公司未來 12 個月產業展望與競品動態,評估持有 vs 退場效益。",
    attachments: ["K公司財報彙整.xlsx", "稅務試算_v1.xlsx"],
    status: "已簽收",
    sender: "梁嘉芫",
    receiver: "周世倫",
    createdAt: "2025-10-12",
  },
  {
    id: "h5",
    from: "業開部",
    to: "投研部",
    caseId: "C-2025-053",
    title: "G 公司初次評估",
    background: "G 公司為 SaaS 類 Series A 標的,本週透過業界活動接觸。創辦人為前 Google 工程師團隊,有具體 PMF 證據。",
    progress: "已收到 pitch deck 與 demo 影片,完成初步背景調查。",
    todo: "進行產業面與技術面初評,給出是否進入正式盡調的建議(預計 2 週內)。",
    attachments: ["G公司pitch_deck.pdf", "demo影片連結.txt"],
    status: "待簽收",
    sender: "林聿平",
    receiver: "周世倫",
    createdAt: "2025-10-16",
    hoursOverdue: 24,
  },
  {
    id: "h6",
    from: "投研部",
    to: "資管部",
    caseId: "C-2025-040",
    title: "M 平台估值方法論共享",
    background: "資管部於 K 公司退場評估中需參考類似 SaaS 標的的估值方法。M 平台為今年初評估過的相似標的。",
    progress: "M 平台估值報告已完成,含 ARR 倍數、客戶留存率分析。",
    todo: "資管部審閱方法論並適用於 K 公司情境。",
    attachments: ["M平台估值報告.pdf", "ARR倍數參考.xlsx"],
    status: "已簽收",
    sender: "鍾皓明",
    receiver: "梁嘉芫",
    createdAt: "2025-10-08",
  },
  {
    id: "h7",
    from: "資管部",
    to: "業開部",
    caseId: "C-2025-052",
    title: "Q4 募資簡報內容協助",
    background: "Q4 募資對外簡報需業開部提供市場開發數據與客戶 traction。",
    progress: "已完成簡報初稿前 8 頁(投資組合與成效)。",
    todo: "補充本季新客戶開發數據與案件 pipeline,預計 1 週內完成。",
    attachments: ["Q4募資簡報_v0.3.pptx"],
    status: "待簽收",
    sender: "梁嘉芫",
    receiver: "林聿平",
    createdAt: "2025-10-16",
    hoursOverdue: 32,
  },
  {
    id: "h8",
    from: "業開部",
    to: "投研部",
    caseId: "C-2025-035",
    title: "B 公司競品比較追加分析",
    background: "B 公司產業分析中,業開部從客戶處取得新的競品資訊,需研究部納入比較表。",
    progress: "新競品名單已整理,共 3 家未收錄於原報告。",
    todo: "完成 3 家新競品的營運模式與財務指標比較。",
    attachments: ["新競品名單.xlsx"],
    status: "已簽收",
    sender: "林欣逸",
    receiver: "鍾皓明",
    createdAt: "2025-10-09",
  },
  {
    id: "h9",
    from: "投研部",
    to: "資管部",
    caseId: "C-2025-031",
    title: "P 公司 A 輪追加投資風險評估",
    background: "既有投資 P 公司(保險科技)進入 A 輪,需評估是否追加。",
    progress: "已完成 P 公司營運成長分析,需資管部從投組曝險角度評估。",
    todo: "在現有投組架構下,評估追加 P 公司 A 輪的風險集中度與資金配置影響。",
    attachments: ["P公司營運成長分析.pdf"],
    status: "已簽收",
    sender: "周世倫",
    receiver: "陳雅文",
    createdAt: "2025-10-05",
  },
  {
    id: "h10",
    from: "投研部",
    to: "業開部",
    caseId: "C-2025-046",
    title: "C 標的決議不投資通知",
    background: "C 標的經兩輪盡調後,投資委員會於 10/14 決議不投資。需通知業開部維持後續關係。",
    progress: "投委會會議紀錄已完成,內含不投決議原因。",
    todo: "業開部回覆 C 標的並維持業界關係,評估未來 6-12 月再追蹤可能。",
    attachments: ["投委會會議紀錄_C標的.pdf"],
    status: "已簽收",
    sender: "鍾皓明",
    receiver: "林聿平",
    createdAt: "2025-10-14",
  },
  {
    id: "h11",
    from: "資管部",
    to: "業開部",
    caseId: "C-2025-049",
    title: "10 月既有客戶關係維護資料",
    background: "Q4 例行性投資組合公司關係維護,需業開部協助安排見面或簡訊問候。",
    progress: "8 家被投公司近期動態已彙整。",
    todo: "依資管部建議優先順序,本月完成至少 5 家拜訪或視訊。",
    attachments: ["10月關係維護清單.xlsx"],
    status: "已簽收",
    sender: "陳雅文",
    receiver: "林聿平",
    createdAt: "2025-10-07",
  },
  {
    id: "h12",
    from: "業開部",
    to: "資管部",
    caseId: "C-2025-054",
    title: "H 客戶基金結構諮詢請求",
    background: "H 客戶為新接觸的家族辦公室,有意參與 Q4 募資但對基金結構有疑問。",
    progress: "首次會議已完成,客戶提出 5 個結構性問題待回覆。",
    todo: "資管部於 1 週內彙整書面回覆,業開部安排第二次會議。",
    attachments: ["H客戶問題清單.docx"],
    status: "待簽收",
    sender: "林聿平",
    receiver: "梁嘉芫",
    createdAt: "2025-10-17",
    hoursOverdue: 8,
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
  {
    id: "k5",
    title: "L 健康科技 Pre-A 輪",
    date: "2024-Q3",
    tags: ["健康科技", "Pre-A", "醫療", "SaaS"],
    summary: "醫療 SaaS 標的,主打診所管理系統,已有 200+ 家診所付費使用。",
    owner: "鍾皓明",
    handoffs: 2,
    outcome: "投資 · 報酬率 1.6x",
    detail: {
      background: "L 公司為 2024 年 7 月經業界活動接觸的醫療 SaaS 標的。創辦團隊有醫療管理背景,產品已商業化 18 個月。",
      process: "完成 8 週盡調,涵蓋醫療法規合規性、客戶留存率分析、競品比較。資管部協助評估醫療科技類風險集中度。",
      valuation: "估值 4.5 億,以 ARR 8x 倍數定錨,投資金額 1,800 萬,持股 4%。",
      keyInsights: [
        "客戶 NPS 達 68 分,顯示產品契合醫療場景",
        "主要競品已完成 B 輪,L 公司估值具吸引力",
        "創辦人為前 IBM Watson Health 成員",
      ],
      result: "至 2025 Q3 估值成長 1.6 倍,客戶數已破 350 家。",
      lessons: "醫療科技類盡調需特別重視法規合規面,建議未來案件提前讓法務介入。",
    },
  },
  {
    id: "k6",
    title: "N 物流自動化 A 輪",
    date: "2024-Q1",
    tags: ["物流", "A 輪", "自動化", "B2B"],
    summary: "倉儲機器人解決方案,已部署於兩家大型電商客戶。",
    owner: "周世倫",
    handoffs: 3,
    outcome: "投資 · 報酬率 1.4x",
    detail: {
      background: "N 公司為自動化倉儲機器人提供商,2024 年 2 月由業界推介接觸。已與兩家上市電商簽訂試營運合約。",
      process: "盡調歷時 10 週,含實地參訪兩家客戶倉儲、技術架構審查、財務模型驗證。",
      valuation: "估值 6.2 億,以 EV/EBITDA 12x 定錨。",
      keyInsights: [
        "硬體+軟體整合服務,客戶切換成本高",
        "毛利率 42%,符合製造業優於平均水準",
        "團隊背景以工程出身,商業開發資源較弱",
      ],
      result: "投資後 18 個月新增 5 家客戶,但商業化速度低於預期。",
      lessons: "硬體類新創需更謹慎評估商業化能力,建議要求創辦人補強商業團隊作為投資條件。",
    },
  },
  {
    id: "k7",
    title: "Q 公司 Series B 評估",
    date: "2025-Q1",
    tags: ["FinTech", "B 輪", "支付", "估值偏高"],
    summary: "成熟 FinTech 標的,Series B,估值要求 30 億但我方評估僅 18-22 億。",
    owner: "梁嘉芫",
    handoffs: 2,
    outcome: "未投資",
    detail: {
      background: "Q 公司為跨境支付平台,2024 年底由前同業介紹接觸 Series B 機會。創辦團隊背景優異,但估值期待過高。",
      process: "完成基本盡調後,因估值差距過大未進入深度盡調。雙方協議保持聯絡。",
      valuation: "Q 公司估值期待 30 億 (ARR 25x),我方合理區間 18-22 億 (ARR 15-18x)。",
      keyInsights: [
        "公司業務本身強勁但市場已有多家競爭者",
        "ARR 倍數應隨市場成熟度下調",
        "創辦人強烈主張高估值難協調",
      ],
      result: "未投資。Q 公司後由國際 VC 以 28 億完成 Series B。",
      lessons: "估值差距 > 30% 時建議盡早終止,避免雙方投入過多時間。",
    },
  },
  {
    id: "k8",
    title: "R 教育平台 Seed 輪",
    date: "2024-Q3",
    tags: ["教育", "Seed", "B2C", "新創早期"],
    summary: "K12 線上家教平台,Seed 輪,團隊年輕但成長動能強。",
    owner: "林欣逸",
    handoffs: 2,
    outcome: "投資 · 仍持有",
    detail: {
      background: "R 平台為 2024 年 8 月由創辦人主動接觸我司。創辦人為 25 歲連續創業者,展現強烈執行力。",
      process: "Seed 階段以團隊評估為主,並透過用戶訪談驗證 PMF。",
      valuation: "Seed 估值 1.2 億,投資 800 萬,持股 6.7%。",
      keyInsights: [
        "創辦人為這個領域的重複玩家(第二次教育創業)",
        "獲客成本較同業低 30%",
        "產品技術門檻不高,商業模式仍待驗證",
      ],
      result: "目前處於 Pre-A 輪準備階段,我們考慮追加投資。",
      lessons: "早期投資看人為主,團隊背景與執行力是關鍵指標。",
    },
  },
  {
    id: "k9",
    title: "T 餐飲 SaaS 投資評估",
    date: "2023-Q4",
    tags: ["餐飲", "SaaS", "A 輪", "競爭激烈"],
    summary: "餐飲業 POS 系統,A 輪標的,但市場競爭過於激烈。",
    owner: "廖宜萱",
    handoffs: 2,
    outcome: "未投資",
    detail: {
      background: "T 公司為餐飲業 POS + 會員系統解決方案,2023 年 11 月接觸。",
      process: "盡調發現市場有 5+ 家成熟競爭者,且毛利率已被壓縮至 35% 以下。",
      valuation: "T 公司估值 8 億,我方合理區間 5-6 億。",
      keyInsights: [
        "市場已紅海化,差異化空間有限",
        "毛利率壓力預期持續",
        "創辦人對於市場競爭的應對策略不夠清晰",
      ],
      result: "未投資。T 公司於 2024 年中縮減營運規模。",
      lessons: "市場已成熟且毛利率持續下滑的產業需特別謹慎,建議優先尋找具差異化的早期標的。",
    },
  },
  {
    id: "k10",
    title: "U 電子商務 A 輪",
    date: "2023-Q4",
    tags: ["電商", "A 輪", "DTC", "亞太擴張"],
    summary: "DTC 美妝品牌,A 輪,從台灣擴張至東南亞。",
    owner: "陳雅文",
    handoffs: 3,
    outcome: "投資 · 報酬率 1.8x",
    detail: {
      background: "U 公司為 DTC 美妝品牌,在台灣已穩定營運 3 年,進入東南亞擴張階段。",
      process: "完成完整盡調,包含財務、客戶分析、東南亞市場機會評估。",
      valuation: "估值 12 億,以 P/S 4x 定錨,投資 2,500 萬,持股 2%。",
      keyInsights: [
        "已完成台灣市場驗證,可重複性高",
        "創辦人在東南亞已有當地合作夥伴",
        "現金流為正,降低投資後資金壓力",
      ],
      result: "投資後 18 個月,東南亞營收已超過原台灣營收。",
      lessons: "可複製性是擴張型投資的關鍵指標,有現成驗證的商業模式風險較低。",
    },
  },
  {
    id: "k11",
    title: "V 物聯網解決方案 Pre-A",
    date: "2024-Q2",
    tags: ["IoT", "Pre-A", "B2B", "技術導向"],
    summary: "工業 IoT 監控解決方案,Pre-A,客戶集中於製造業。",
    owner: "李宥廷",
    handoffs: 2,
    outcome: "觀望",
    detail: {
      background: "V 公司為工業 IoT 解決方案商,2024 年 5 月接觸。客戶集中於製造業前 5 大廠。",
      process: "完成基礎盡調,但發現客戶過度集中(前 3 大客戶佔營收 80%)。",
      valuation: "V 公司估值 5 億,因風險集中我方提出折讓 20% 建議,雙方未達共識。",
      keyInsights: [
        "技術領先,但客戶集中度為主要風險",
        "B2B 銷售週期長(平均 9 個月)",
        "需更多客戶分散證據",
      ],
      result: "目前觀望中,等待 V 公司客戶結構分散後再評估。",
      lessons: "B2B 標的若客戶過度集中,需要時間驗證業務分散性,建議先簽優先投資權再評估。",
    },
  },
];

// ============================================================
// 卡點資料模型與歷史 seed
// Demo seed 刻意使用右偏解決天數,避免先假設常態分佈再用常態方法分析。
// ============================================================
const CURRENT_WEEK_ID = "第 42 週";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_BLOCKER_SLA_DAYS = 14;

const BLOCKER_CATEGORIES = [
  { key: "法遵/合約", label: "法遵/合約", keywords: ["法遵", "合規", "法律", "法務", "合約", "契約", "審核", "NDA", "條款"], color: "#A32D2D" },
  { key: "資金/募資", label: "資金/募資", keywords: ["資金", "募資", "配置", "分潤", "預算", "撥款", "現金流"], color: "#534AB7" },
  { key: "資料/補件", label: "資料/補件", keywords: ["財務", "財報", "資料", "補件", "盡調", "訪談", "缺漏", "收齊"], color: "#B36B00" },
  { key: "跨部門/窗口", label: "跨部門/窗口", keywords: ["聯繫", "協助", "對接", "溝通", "窗口", "協調", "同步"], color: "#0F6E56" },
  { key: "決策/簽核", label: "決策/簽核", keywords: ["決議", "決策", "簽核", "委員會", "董事會", "拍板", "核准"], color: "#1F4E79" },
  { key: "時程/聯繫", label: "時程/聯繫", keywords: ["行程", "排程", "時程", "延遲", "未通", "難安排", "等待", "催促"], color: "#7A5A22" },
  { key: "其他", label: "其他", keywords: [], color: "#6E6862" },
];

function daysAgoIso(days) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function addDaysIso(dateString, days) {
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function makeHistoryBlocker(id, category, daysToResolve, title, dept, weekNum, caseSize = "M") {
  const createdAt = new Date(2025, 0, 6 + id * 2).toISOString();
  return {
    id: "bh" + id,
    category,
    title,
    dept,
    owner: "系統範例",
    status: "resolved",
    createdAt,
    resolvedAt: addDaysIso(createdAt, daysToResolve),
    updatedAt: addDaysIso(createdAt, daysToResolve),
    daysToResolve,
    crossDepts: 1 + (id % 3),
    caseSize,
    weekNum,
    source: "demo-seed",
  };
}

const SEED_BLOCKER_HISTORY = [
  ...[2, 3, 4, 5, 6, 7, 8, 11, 16, 24].map((d, i) => makeHistoryBlocker(1 + i, "法遵/合約", d, ["NDA 條款審閱", "投資契約審核", "法務意見回覆", "監管風險評估"][i % 4], ["資產管理部", "業務開發部", "投資研究部"][i % 3], 18 + i)),
  ...[1, 2, 3, 4, 5, 6, 9, 13, 22].map((d, i) => makeHistoryBlocker(20 + i, "資金/募資", d, ["募資規模確認", "資金配置試算", "預算追加評估"][i % 3], ["營運與管理層", "資產管理部", "業務開發部"][i % 3], 20 + i)),
  ...[2, 3, 3, 4, 5, 7, 10, 15, 28].map((d, i) => makeHistoryBlocker(40 + i, "資料/補件", d, ["財報補件", "盡調資料收齊", "訪談紀錄整理", "資料格式校對"][i % 4], ["投資研究部", "業務開發部", "資產管理部"][i % 3], 22 + i)),
  ...[1, 2, 2, 3, 4, 5, 8, 12, 19].map((d, i) => makeHistoryBlocker(60 + i, "跨部門/窗口", d, ["對接窗口確認", "部門資訊同步", "外部單位聯繫"][i % 3], ["業務開發部", "投資研究部", "資產管理部"][i % 3], 24 + i)),
  ...[3, 4, 5, 6, 8, 12, 18, 31].map((d, i) => makeHistoryBlocker(80 + i, "決策/簽核", d, ["投資委員會決議", "條件書簽核", "董事會拍板", "追加投資核准"][i % 4], ["營運與管理層", "投資研究部", "資產管理部"][i % 3], 26 + i)),
  ...[1, 2, 3, 4, 5, 7, 10, 17].map((d, i) => makeHistoryBlocker(100 + i, "時程/聯繫", d, ["財務長行程安排", "會議排程確認", "外部窗口催促"][i % 3], ["業務開發部", "投資研究部", "資產管理部"][i % 3], 28 + i)),
].sort((a, b) => a.weekNum - b.weekNum);

const SEED_BLOCKERS = [
  {
    id: "b-demo-r1-1",
    title: "A 新創財務資料尚未收齊",
    description: "創辦人提供之 2024 年度財報為簡化版,需正式版才能進行估值。",
    dept: "投資研究部",
    owner: "周世倫",
    category: "資料/補件",
    status: "open",
    createdAt: daysAgoIso(14),
    updatedAt: daysAgoIso(2),
    resolvedAt: null,
    weekId: CURRENT_WEEK_ID,
    sourceReportId: "r1",
    sourceType: "weeklyReport",
    relatedDepartments: ["業務開發部"],
    caseId: "A 新創",
    needsReview: false,
    createdBy: "seed",
    updatedBy: "seed",
  },
  {
    id: "b-demo-r2-1",
    title: "A 新創財務長行程難安排",
    description: "本週已電話聯繫 4 次未通,影響投資條件書後續時程。",
    dept: "業務開發部",
    owner: "林聿平",
    category: "時程/聯繫",
    status: "open",
    createdAt: daysAgoIso(5),
    updatedAt: daysAgoIso(1),
    resolvedAt: null,
    weekId: CURRENT_WEEK_ID,
    sourceReportId: "r2",
    sourceType: "weeklyReport",
    relatedDepartments: ["投資研究部"],
    caseId: "A 新創",
    needsReview: false,
    createdBy: "seed",
    updatedBy: "seed",
  },
  {
    id: "b-demo-r2-2",
    title: "D 客戶 NDA 條款有異議",
    description: "D 客戶法務對 NDA 條款有 3 點異議,已轉給資管部審閱中。",
    dept: "業務開發部",
    owner: "林聿平",
    category: "法遵/合約",
    status: "open",
    createdAt: daysAgoIso(5),
    updatedAt: daysAgoIso(1),
    resolvedAt: null,
    weekId: CURRENT_WEEK_ID,
    sourceReportId: "r2",
    sourceType: "weeklyReport",
    relatedDepartments: ["資產管理部"],
    caseId: "D 客戶",
    needsReview: false,
    createdBy: "seed",
    updatedBy: "seed",
  },
  {
    id: "b-demo-r3-1",
    title: "K 公司退場稅務方案待決議",
    description: "法遵審核等待管理層決議已多日,涉及 K 公司退場時的稅務優化方案。",
    dept: "資產管理部",
    owner: "梁嘉芫",
    category: "決策/簽核",
    status: "open",
    createdAt: daysAgoIso(9),
    updatedAt: daysAgoIso(1),
    resolvedAt: null,
    weekId: CURRENT_WEEK_ID,
    sourceReportId: "r3",
    sourceType: "weeklyReport",
    relatedDepartments: ["營運與管理層"],
    caseId: "K 公司",
    needsReview: false,
    createdBy: "seed",
    updatedBy: "seed",
  },
  {
    id: "b-demo-r3-2",
    title: "Q4 募資計畫尚未拍板",
    description: "Q4 募資計畫尚未取得董事會明確指示,影響後續資金配置安排。",
    dept: "資產管理部",
    owner: "梁嘉芫",
    category: "資金/募資",
    status: "open",
    createdAt: daysAgoIso(9),
    updatedAt: daysAgoIso(1),
    resolvedAt: null,
    weekId: CURRENT_WEEK_ID,
    sourceReportId: "r3",
    sourceType: "weeklyReport",
    relatedDepartments: ["營運與管理層"],
    caseId: "Q4 募資",
    needsReview: false,
    createdBy: "seed",
    updatedBy: "seed",
  },
];

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
  {
    id: "d6",
    title: "P 公司 A 輪追加投資 800 萬",
    content: "決議追加投資既有持股之保險科技 P 公司 A 輪 800 萬,維持原 6% 持股不被稀釋。",
    decidedBy: "投資委員會",
    decidedAt: "2025-10-10",
    dueDate: "2025-10-31",
    assignedDept: "投資研究部",
    status: "執行中",
    linkedCases: ["C-2025-031"],
    notes: "已完成投資條件書,等 P 公司領投方完成簽約後即可執行。",
  },
  {
    id: "d7",
    title: "K 公司退場時程確認",
    content: "決議於 2026 年 Q1 啟動 K 公司部分退場程序,目標出脫 30-50% 持股,實現報酬。",
    decidedBy: "投資委員會",
    decidedAt: "2025-10-08",
    dueDate: "2026-03-31",
    assignedDept: "資產管理部",
    status: "執行中",
    linkedCases: ["C-2025-039"],
    notes: "需業開部同步接觸潛在二級市場買家。",
  },
  {
    id: "d8",
    title: "C 標的不投資決議",
    content: "經兩輪盡調後,因產品 PMF 證據不足且估值偏高,決議不投資 C 標的。",
    decidedBy: "投資委員會",
    decidedAt: "2025-10-14",
    dueDate: "2025-10-14",
    assignedDept: "投資研究部",
    status: "已完成",
    linkedCases: ["C-2025-046"],
    notes: "業開部已通知 C 標的並維持業界關係。",
    completedAt: "2025-10-14",
  },
  {
    id: "d9",
    title: "建立每週投資委員會例會",
    content: "由原雙週例會改為每週四 14:00-16:00,以加快案件決策速度。",
    decidedBy: "董事會",
    decidedAt: "2025-09-05",
    dueDate: "2025-09-15",
    assignedDept: "營運與管理層",
    status: "已完成",
    linkedCases: [],
    notes: "9/19 起已執行,迄今執行良好。",
    completedAt: "2025-09-15",
  },
  {
    id: "d10",
    title: "投資組合報告格式統一",
    content: "決議所有被投公司之季度報告須採新版統一格式,便於跨公司比較與管理層審閱。",
    decidedBy: "營運會議",
    decidedAt: "2025-09-22",
    dueDate: "2025-10-31",
    assignedDept: "資產管理部",
    status: "執行中",
    linkedCases: [],
    notes: "資管部已完成新版範本,正在請被投公司配合。",
  },
  {
    id: "d11",
    title: "業界關係維護預算編列",
    content: "Q4 業界活動參訪、餐敘等社交支出預算上限調整為 80 萬。",
    decidedBy: "董事會",
    decidedAt: "2025-09-30",
    dueDate: "2025-10-15",
    assignedDept: "業務開發部",
    status: "已完成",
    linkedCases: [],
    notes: "已通知業開部依預算規劃 Q4 活動。",
    completedAt: "2025-10-12",
  },
  {
    id: "d12",
    title: "盡調 SOP 標準化",
    content: "建立投資研究部標準化盡調流程文件,涵蓋初評、深度盡調、結案三階段檢核點。",
    decidedBy: "營運會議",
    decidedAt: "2025-08-28",
    dueDate: "2025-10-10",
    assignedDept: "投資研究部",
    status: "逾期",
    linkedCases: [],
    notes: "研究部已完成草案 70%,但最後階段卡在跨部門協作章節,待釐清。",
  },
  {
    id: "d13",
    title: "新進人員 Onboarding 流程",
    content: "決議建立統一的新進人員報到流程,含 2 週系統訓練與 1 個月 mentor 制。",
    decidedBy: "營運會議",
    decidedAt: "2025-09-12",
    dueDate: "2025-11-30",
    assignedDept: "營運與管理層",
    status: "執行中",
    linkedCases: [],
    notes: "結合法遵專員招募進度,預計與 12 月新人同步上線。",
  },
  {
    id: "d14",
    title: "客戶資料庫升級",
    content: "業開部 CRM 系統升級至 v2,加入自動化提醒與分級管理功能。",
    decidedBy: "營運會議",
    decidedAt: "2025-09-15",
    dueDate: "2025-10-31",
    assignedDept: "業務開發部",
    status: "執行中",
    linkedCases: [],
    notes: "已完成系統規格,IT 部門開發中。",
  },
  {
    id: "d15",
    title: "ESG 投資準則納入評估",
    content: "新案件於投委會評估時須額外提供 ESG 評分(5 級),作為決策參考。",
    decidedBy: "投資委員會",
    decidedAt: "2025-08-15",
    dueDate: "2025-09-30",
    assignedDept: "投資研究部",
    status: "已完成",
    linkedCases: [],
    notes: "10 月起所有新案皆已納入 ESG 評分。",
    completedAt: "2025-09-25",
  },
  {
    id: "d16",
    title: "年度法遵稽核時程",
    content: "決議年底前完成全年度法遵稽核,涵蓋投資文件、投資組合曝險、員工合規教育。",
    decidedBy: "董事會",
    decidedAt: "2025-09-08",
    dueDate: "2025-12-15",
    assignedDept: "資產管理部",
    status: "執行中",
    linkedCases: [],
    notes: "外部稽核公司已選定,預計 11 月開始。",
  },
  {
    id: "d17",
    title: "Q3 業績獎金發放",
    content: "決議 Q3 業績獎金按業績達成率 105% 發放(原訂 100%)。",
    decidedBy: "董事會",
    decidedAt: "2025-10-05",
    dueDate: "2025-10-25",
    assignedDept: "營運與管理層",
    status: "執行中",
    linkedCases: [],
    notes: "薪資處理中,預計 10/25 隨薪入帳。",
  },
  {
    id: "d18",
    title: "投資組合再平衡",
    content: "Q4 進行投資組合再平衡,FinTech 類比重由 45% 降至 35%,釋出資金供新案件。",
    decidedBy: "投資委員會",
    decidedAt: "2025-09-28",
    dueDate: "2025-12-31",
    assignedDept: "資產管理部",
    status: "執行中",
    linkedCases: [],
    notes: "已完成方案規劃,等待具體退場時點與市場條件。",
  },
];

// ============================================================
// 歷史共同議題追蹤(用於慢性議題偵測)
// 模擬過去 16 週的共同議題紀錄
// ============================================================
const SEED_TOPIC_HISTORY = [
  { week: 26, topics: ["Q2 結算", "P 公司"] },
  { week: 27, topics: ["Q2 結算", "P 公司", "K 公司"] },
  { week: 28, topics: ["P 公司", "K 公司", "ESG"] },
  { week: 29, topics: ["ESG", "K 公司"] },
  { week: 30, topics: ["ESG", "盡調流程"] },
  { week: 31, topics: ["盡調流程", "業界活動"] },
  { week: 32, topics: ["業界活動", "B 公司"] },
  { week: 33, topics: ["B 公司", "Q3 結算"] },
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
function seededActivityRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function activitySample(rnd, mean, spread) {
  return mean + (rnd() - 0.5) * spread * 2;
}

const SEED_REPORT_ACTIVITY = (() => {
  const rnd = seededActivityRandom(88);
  const depts = ["投資研究部", "業務開發部", "資產管理部"];
  const data = [];
  // 過去 16 週(26–41)的活動基礎值
  const deptBase = {
    投資研究部: { help: 1.5, blockers: 0.8, cases: 3.5 },
    業務開發部: { help: 2.0, blockers: 0.9, cases: 4.2 },
    資產管理部: { help: 1.2, blockers: 0.6, cases: 3.0 },
  };
  for (let w = 26; w <= 41; w++) {
    depts.forEach((d) => {
      const b = deptBase[d];
      data.push({
        week: w,
        dept: d,
        helpRequests: Math.max(0, Math.round(activitySample(rnd, b.help, 0.9))),
        blockers: Math.max(0, Math.round(activitySample(rnd, b.blockers, 0.6))),
        cases: Math.max(1, Math.round(activitySample(rnd, b.cases, 1.2))),
      });
    });
  }
  return data;
})();

const SEED_DEPARTMENTS = [
  { id: "ops", name: "營運與管理層", shortName: "管理層", active: true },
  { id: "research", name: "投資研究部", shortName: "投研部", active: true },
  { id: "biz", name: "業務開發部", shortName: "業開部", active: true },
  { id: "asset", name: "資產管理部", shortName: "資管部", active: true },
];

const SEED_USERS = [
  { id: "admin-test", email: "admin@test.com", role: "admin", dept: "營運與管理層", displayName: "Admin", active: true },
  { id: "manager-research", email: "manager-research@test.com", role: "manager", dept: "投資研究部", displayName: "Research Manager", active: true },
  { id: "manager-biz", email: "manager-biz@test.com", role: "manager", dept: "業務開發部", displayName: "Biz Manager", active: true },
  { id: "manager-asset", email: "manager-asset@test.com", role: "manager", dept: "資產管理部", displayName: "Asset Manager", active: true },
  { id: "member-test", email: "member@test.com", role: "member", dept: "業務開發部", displayName: "Member", active: true },
];

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

function getCategoryInfo(category) {
  return BLOCKER_CATEGORIES.find((c) => c.key === category) || BLOCKER_CATEGORIES[BLOCKER_CATEGORIES.length - 1];
}

// 初步關鍵字分類:只做建議,使用者選定的 category 會優先使用。
function classifyBlocker(text) {
  if (!text) return "其他";
  const scores = {};
  BLOCKER_CATEGORIES.forEach((c) => {
    scores[c.key] = 0;
    c.keywords.forEach((kw) => {
      if (text.includes(kw)) scores[c.key] += 1;
    });
  });
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "其他";
}

function parseRelatedDepartments(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(/[、,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function daysBetween(start, end = new Date()) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  return Math.max(0, Math.ceil((endDate - startDate) / MS_PER_DAY));
}

function getBlockerDaysElapsed(blocker, now = new Date()) {
  return daysBetween(blocker.createdAt, blocker.resolvedAt || now);
}

function getResolvedDays(historyDB) {
  return historyDB
    .map((h) => {
      if (typeof h.daysToResolve === "number") return h.daysToResolve;
      if (h.createdAt && h.resolvedAt) return daysBetween(h.createdAt, h.resolvedAt);
      return null;
    })
    .filter((v) => typeof v === "number" && v >= 0);
}

function empiricalPercentile(value, arr) {
  if (!arr.length) return null;
  const count = arr.filter((v) => v <= value).length;
  return Math.round((count / arr.length) * 100);
}

function blockerLevelFromPercentiles(currentDays, p75, p90, p95) {
  if (currentDays >= p95) return { level: "critical", levelLabel: "極高風險" };
  if (currentDays >= p90) return { level: "high", levelLabel: "高風險" };
  if (currentDays >= p75) return { level: "medium", levelLabel: "關注中" };
  return { level: "normal", levelLabel: "正常範圍" };
}

// 卡點風險分析:以歷史經驗分位數判定,不假設常態分佈。
function analyzeBlockerRisk(currentDays, category, historyDB) {
  const sameCategoryHistory = historyDB.filter((h) => h.category === category);
  const sameCategoryDays = getResolvedDays(sameCategoryHistory);
  const allDays = getResolvedDays(historyDB);
  const useCategory = sameCategoryDays.length >= 5;
  const basisDays = useCategory ? sameCategoryDays : allDays;

  if (basisDays.length < 5) {
    const level = currentDays >= DEFAULT_BLOCKER_SLA_DAYS ? "high" : "normal";
    return {
      hasData: false,
      category,
      currentDays,
      sampleSize: basisDays.length,
      basis: "insufficient",
      basisLabel: "資料不足",
      level,
      levelLabel: currentDays >= DEFAULT_BLOCKER_SLA_DAYS ? "SLA 提醒" : "資料不足",
      riskScore: currentDays >= DEFAULT_BLOCKER_SLA_DAYS ? 70 : 0,
      percentile: null,
      mean: "—",
      std: "—",
      median: null,
      p75: null,
      p90: null,
      p95: null,
      historyDays: [],
      daysOverP75: "—",
    };
  }

  const mean = stats.mean(basisDays);
  const std = stats.std(basisDays);
  const median = stats.percentile(basisDays, 50);
  const p75 = stats.percentile(basisDays, 75);
  const p90 = stats.percentile(basisDays, 90);
  const p95 = stats.percentile(basisDays, 95);
  const percentile = empiricalPercentile(currentDays, basisDays);
  const { level, levelLabel } = blockerLevelFromPercentiles(currentDays, p75, p90, p95);

  return {
    hasData: true,
    category,
    currentDays,
    mean: mean.toFixed(1),
    std: std.toFixed(1),
    median,
    p75,
    p90,
    p95,
    percentile,
    sampleSize: basisDays.length,
    basis: useCategory ? "category" : "company",
    basisLabel: useCategory ? "同類歷史" : "全公司歷史",
    level,
    levelLabel,
    riskScore: Math.min(99, Math.max(0, percentile)),
    daysOverP75: Math.max(0, currentDays - p75).toFixed(1),
    historyDays: basisDays,
  };
}

function analyzeBlockerRecord(blocker, historyDB) {
  const text = `${blocker.title || ""}\n${blocker.description || ""}`;
  const category = blocker.category || classifyBlocker(text);
  const daysElapsed = getBlockerDaysElapsed(blocker);
  return {
    ...analyzeBlockerRisk(daysElapsed, category, historyDB),
    originalText: blocker.description || blocker.title || "",
    categoryInfo: getCategoryInfo(category),
    blocker,
  };
}

function createLegacyBlockersFromReports(reports) {
  const seededReportIds = new Set(SEED_BLOCKERS.map((b) => b.sourceReportId));
  return reports
    .filter((r) => r.blockers && r.blockers.trim() && !seededReportIds.has(r.id))
    .map((r) => ({
      id: `legacy-${r.id}`,
      title: `${r.dept} 舊週報卡點`,
      description: r.blockers,
      dept: r.dept,
      owner: r.author,
      category: classifyBlocker(r.blockers),
      status: "open",
      createdAt: new Date(r.submittedAt || Date.now()).toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      weekId: r.week || CURRENT_WEEK_ID,
      sourceReportId: r.id,
      sourceType: "legacyReportBlockers",
      relatedDepartments: [],
      caseId: "",
      needsReview: true,
      createdBy: r.author || "legacy",
      updatedBy: r.author || "legacy",
    }));
}

// ============================================================
// 「最新一週」工具函式
// 從 reports 動態找出最新的週次,讓系統不再寫死「第 42 週」
// ============================================================
function getLatestWeek(reports) {
  if (!reports || reports.length === 0) return "第 42 週"; // fallback
  const weeks = [...new Set(reports.map((r) => r.week))];
  // 從週次名稱抽出數字,找最大
  const withNum = weeks.map((w) => {
    const m = (w || "").match(/\d+/);
    return { week: w, num: m ? parseInt(m[0]) : 0 };
  });
  withNum.sort((a, b) => b.num - a.num);
  return withNum[0].week;
}

// 取得最新週次的「附加日期區間」(例:第 42 週 → 第 42 週 (10/14 – 10/20))
function getLatestWeekDisplay(reports) {
  const week = getLatestWeek(reports);
  const numMatch = (week || "").match(/\d+/);
  if (!numMatch) return week;
  const num = parseInt(numMatch[0]);
  // 假設第 1 週為 1 月第 1 週,計算對應日期區間(粗估)
  // 為了 demo 顯示用,實際生產會接後端日期
  const map = {
    35: "8/26 – 9/1", 36: "9/2 – 9/8", 37: "9/9 – 9/15", 38: "9/16 – 9/22",
    39: "9/23 – 9/29", 40: "9/30 – 10/6", 41: "10/7 – 10/13", 42: "10/14 – 10/20",
    43: "10/21 – 10/27", 44: "10/28 – 11/3", 45: "11/4 – 11/10",
  };
  const range = map[num] || `第 ${num} 週區間`;
  return `${week} (${range})`;
}

// ============================================================
// 週報異常偵測
// 比對某部門本週活動量(協助請求、卡點)是否偏離過去 8 週歷史平均
// 使用 z-score:當 z ≥ 1.5 時觸發警示
// ============================================================
function detectReportAnomaly(currentReports, activityHistory, blockers = [], departments = SEED_DEPARTMENTS) {
  const depts = activeDeptNames(departments);
  const anomalies = [];
  const currentWeek = currentReports[0]?.week || CURRENT_WEEK_ID;
  const openCurrentBlockers = blockers.filter(
    (b) => b.status !== "resolved" && b.weekId === currentWeek
  );

  depts.forEach((dept) => {
    const r = currentReports.find((x) => x.dept === dept);
    if (!r) return;

    // 計算本週該部門的活動量。卡點數使用結構化 blocker 筆數,不再用標點切文字。
    const currentHelp = (r.needHelp || "").split(/[、,.。\n]/).filter((s) => s.trim()).length;
    const currentBlockers = openCurrentBlockers.filter((b) => b.dept === dept).length;

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
        typeLabel: "卡點筆數異常",
        currentValue: currentBlockers,
        historyMean: stats.mean(blockerHistoryArr).toFixed(1),
        z: blockerZ.toFixed(2),
        severity: blockerZ >= 2 ? "critical" : "high",
        description: `${dept}本週開啟卡點 ${currentBlockers} 筆,高於歷史平均 ${stats.mean(blockerHistoryArr).toFixed(1)} 筆`,
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
const SEED_EMPLOYEES = [
  // 營運與管理層
  { name: "吳君", dept: "營運與管理層", role: "董事長" },
  { name: "陳文翰", dept: "營運與管理層", role: "營運總監(COO)" },
  { name: "黃詩涵", dept: "營運與管理層", role: "財務長(CFO)" },
  // 投資研究部(7 人)
  { name: "周世倫", dept: "投資研究部", role: "資深研究員" },
  { name: "鍾皓明", dept: "投資研究部", role: "資深研究員" },
  { name: "張偉", dept: "投資研究部", role: "研究員" },
  { name: "李宥廷", dept: "投資研究部", role: "研究員" },
  { name: "謝佳穎", dept: "投資研究部", role: "研究助理" },
  { name: "王子翔", dept: "投資研究部", role: "研究助理" },
  { name: "廖宜萱", dept: "投資研究部", role: "產業分析師" },
  // 業務開發部(6 人)
  { name: "林聿平", dept: "業務開發部", role: "業務經理" },
  { name: "林欣逸", dept: "業務開發部", role: "業務專員" },
  { name: "蔡明遠", dept: "業務開發部", role: "業務專員" },
  { name: "楊雅雯", dept: "業務開發部", role: "客戶關係經理" },
  { name: "羅宇晴", dept: "業務開發部", role: "業務助理" },
  { name: "陳俊宏", dept: "業務開發部", role: "新業務開發" },
  // 資產管理部(4 人)
  { name: "梁嘉芫", dept: "資產管理部", role: "資管專員" },
  { name: "陳雅文", dept: "資產管理部", role: "資管經理" },
  { name: "蘇柏豪", dept: "資產管理部", role: "投資組合分析師" },
  { name: "邱筱慧", dept: "資產管理部", role: "風險管理專員" },
];

function activeDeptNames(departments = SEED_DEPARTMENTS) {
  return departments.filter((d) => d.active !== false && d.name !== "營運與管理層").map((d) => d.name);
}

function allDeptNames(departments = SEED_DEPARTMENTS) {
  return departments.filter((d) => d.active !== false).map((d) => d.name);
}

function analyzeEmployeeLoad(reports, handoffs, employees = SEED_EMPLOYEES) {
  const latestWeek = getLatestWeek(reports);
  const currentReports = reports.filter((r) => r.week === latestWeek);

  return employees.map((emp) => {
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

// ============================================================
// B1. 部門互動網絡分析
// 從週報文字中找「我提到別的部門」的次數,建立鄰接矩陣
// ============================================================
function analyzeDeptNetwork(reports, departments = SEED_DEPARTMENTS) {
  const depts = activeDeptNames(departments);
  const deptShortMap = departments.reduce((map, dept) => {
    if (dept.active === false) return map;
    map[dept.name] = dept.name;
    if (dept.shortName) map[dept.shortName] = dept.name;
    return map;
  }, {});
  // 鄰接矩陣 matrix[from][to] = count
  const matrix = {};
  depts.forEach((d) => {
    matrix[d] = {};
    depts.forEach((d2) => { matrix[d][d2] = 0; });
  });

  reports.forEach((r) => {
    const fullText = `${r.cases || ""}\n${r.blockers || ""}\n${r.needHelp || ""}\n${r.nextWeek || ""}`;
    depts.forEach((targetDept) => {
      if (targetDept === r.dept) return;
      // 計算 fullText 中提到目標部門的次數(短稱+全稱)
      let count = 0;
      Object.entries(deptShortMap).forEach(([alias, fullName]) => {
        if (fullName !== targetDept) return;
        const re = new RegExp(alias, "g");
        count += (fullText.match(re) || []).length;
      });
      matrix[r.dept][targetDept] += count;
    });
  });

  // 轉成 edges 列表(供視覺化用)
  const edges = [];
  depts.forEach((from) => {
    depts.forEach((to) => {
      if (from !== to && matrix[from][to] > 0) {
        edges.push({ from, to, weight: matrix[from][to] });
      }
    });
  });

  // 計算每個部門的「被請求次數」與「請求他人次數」
  const stats = {};
  depts.forEach((d) => {
    stats[d] = {
      outgoing: depts.reduce((s, d2) => s + matrix[d][d2], 0),
      incoming: depts.reduce((s, d2) => s + matrix[d2][d], 0),
    };
  });

  return { matrix, edges, stats, depts };
}

// ============================================================
// B2. 趨勢預警(時間序列預測)
// 用線性回歸外推預測下週活動量、卡點數
// ============================================================
function predictNextWeek(activityHistory, departments = SEED_DEPARTMENTS) {
  const depts = activeDeptNames(departments);
  const predictions = [];

  depts.forEach((dept) => {
    const history = activityHistory.filter((h) => h.dept === dept).sort((a, b) => a.week - b.week);
    if (history.length < 3) return;

    // 對 helpRequests 和 blockers 各做線性回歸
    ["helpRequests", "blockers", "cases"].forEach((metric) => {
      const ys = history.map((h) => h[metric]);
      const xs = history.map((_, i) => i);
      const n = ys.length;

      const xMean = stats.mean(xs);
      const yMean = stats.mean(ys);
      const num = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0);
      const denom = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
      const slope = denom === 0 ? 0 : num / denom;
      const intercept = yMean - slope * xMean;

      // 預測下一個點(x = n)
      const predicted = Math.max(0, intercept + slope * n);
      const recentAvg = stats.mean(ys.slice(-3));
      const overallAvg = stats.mean(ys);
      const overallStd = stats.std(ys);

      // 計算預測值的 z-score(相對於歷史)
      const z = overallStd === 0 ? 0 : (predicted - overallAvg) / overallStd;

      // 只挑出有警示意義的預測
      if (z >= 0.8 || (slope > 0 && recentAvg > overallAvg * 1.3)) {
        const metricLabel = {
          helpRequests: "跨部門協助請求",
          blockers: "卡點數量",
          cases: "進行中案件",
        }[metric];

        let direction;
        if (slope > 0.3) direction = "持續上升";
        else if (slope < -0.3) direction = "持續下降";
        else direction = "穩定偏高";

        predictions.push({
          dept,
          metric,
          metricLabel,
          predicted: predicted.toFixed(1),
          recentAvg: recentAvg.toFixed(1),
          overallAvg: overallAvg.toFixed(1),
          z: z.toFixed(2),
          slope: slope.toFixed(2),
          direction,
          severity: z >= 1.5 ? "high" : "medium",
          confidence: Math.min(95, 50 + Math.abs(slope) * 20 + (Math.abs(z) * 10)),
        });
      }
    });
  });

  return predictions.sort((a, b) => parseFloat(b.z) - parseFloat(a.z));
}

// ============================================================
// B3. 決策模式分析
// ============================================================
function analyzeDecisionPatterns(decisions) {
  if (decisions.length === 0) return null;

  const completed = decisions.filter((d) => d.status === "已完成" && d.completedAt && d.decidedAt);
  const completionDays = completed.map((d) => {
    const days = (new Date(d.completedAt) - new Date(d.decidedAt)) / (1000 * 60 * 60 * 24);
    return Math.max(0, days);
  });

  // 按決議單位分析
  const sourceStats = {};
  decisions.forEach((d) => {
    if (!sourceStats[d.decidedBy]) {
      sourceStats[d.decidedBy] = { total: 0, done: 0, overdue: 0, days: [] };
    }
    sourceStats[d.decidedBy].total++;
    if (d.status === "已完成") sourceStats[d.decidedBy].done++;
    if (d.status === "逾期") sourceStats[d.decidedBy].overdue++;
    if (d.completedAt && d.decidedAt) {
      const days = (new Date(d.completedAt) - new Date(d.decidedAt)) / (1000 * 60 * 60 * 24);
      sourceStats[d.decidedBy].days.push(Math.max(0, days));
    }
  });

  Object.keys(sourceStats).forEach((k) => {
    const s = sourceStats[k];
    s.completionRate = Math.round((s.done / s.total) * 100);
    s.avgDays = s.days.length ? stats.mean(s.days).toFixed(1) : "—";
  });

  // 按部門分析
  const deptStats = {};
  decisions.forEach((d) => {
    if (!deptStats[d.assignedDept]) {
      deptStats[d.assignedDept] = { total: 0, done: 0, overdue: 0, days: [] };
    }
    deptStats[d.assignedDept].total++;
    if (d.status === "已完成") deptStats[d.assignedDept].done++;
    if (d.status === "逾期") deptStats[d.assignedDept].overdue++;
    if (d.completedAt && d.decidedAt) {
      const days = (new Date(d.completedAt) - new Date(d.decidedAt)) / (1000 * 60 * 60 * 24);
      deptStats[d.assignedDept].days.push(Math.max(0, days));
    }
  });

  Object.keys(deptStats).forEach((k) => {
    const s = deptStats[k];
    s.completionRate = Math.round((s.done / s.total) * 100);
    s.avgDays = s.days.length ? stats.mean(s.days).toFixed(1) : "—";
  });

  // 整體統計
  const totalRate = decisions.length > 0
    ? Math.round((decisions.filter(d => d.status === "已完成").length / decisions.length) * 100)
    : 0;

  return {
    totalDecisions: decisions.length,
    completionRate: totalRate,
    avgExecutionDays: completionDays.length ? stats.mean(completionDays).toFixed(1) : "—",
    medianExecutionDays: completionDays.length ? stats.percentile(completionDays, 50).toFixed(1) : "—",
    sourceStats,
    deptStats,
    fastestExecution: completionDays.length ? Math.min(...completionDays).toFixed(0) : "—",
    slowestExecution: completionDays.length ? Math.max(...completionDays).toFixed(0) : "—",
    overdueRate: decisions.length > 0
      ? Math.round((decisions.filter(d => d.status === "逾期").length / decisions.length) * 100)
      : 0,
  };
}

// ============================================================
// B4. 員工成長追蹤
// 從歷史週報追蹤每位員工的「任務複雜度」演進
// ============================================================
function analyzeEmployeeGrowth(employee, reports) {
  // 找出此員工填寫的所有週報(按週次排序)
  const myReports = reports
    .filter((r) => r.author === employee.name)
    .sort((a, b) => {
      const wa = parseInt((a.week.match(/\d+/) || [0])[0]);
      const wb = parseInt((b.week.match(/\d+/) || [0])[0]);
      return wa - wb;
    });

  if (myReports.length === 0) {
    return {
      hasData: false,
      totalReports: 0,
    };
  }

  // 每週的指標
  const weeklyMetrics = myReports.map((r) => {
    const fullText = `${r.cases || ""}\n${r.blockers || ""}\n${r.needHelp || ""}\n${r.nextWeek || ""}`;
    const caseCount = (r.cases || "").split(/[•\n]/).filter((s) => s.trim()).length;
    const keywordCount = (r.keywords || []).length;
    const textLength = fullText.length;
    // 跨部門協作指數:文中提到別的部門次數
    const crossDeptCount = ((fullText.match(/投研部|業開部|資管部|投資研究部|業務開發部|資產管理部/g) || []).length);

    return {
      week: r.week,
      caseCount,
      keywordCount,
      textLength,
      crossDeptCount,
      // 複雜度綜合分數
      complexityScore: caseCount * 2 + keywordCount * 1.5 + crossDeptCount * 2,
    };
  });

  // 計算趨勢
  const complexityScores = weeklyMetrics.map((m) => m.complexityScore);
  const earlyAvg = stats.mean(complexityScores.slice(0, Math.ceil(complexityScores.length / 2)));
  const lateAvg = stats.mean(complexityScores.slice(Math.ceil(complexityScores.length / 2)));
  const growthRate = earlyAvg > 0 ? ((lateAvg - earlyAvg) / earlyAvg) * 100 : 0;

  return {
    hasData: true,
    totalReports: myReports.length,
    weeklyMetrics,
    avgCaseCount: stats.mean(weeklyMetrics.map((m) => m.caseCount)).toFixed(1),
    avgKeywordDiversity: stats.mean(weeklyMetrics.map((m) => m.keywordCount)).toFixed(1),
    avgCrossDept: stats.mean(weeklyMetrics.map((m) => m.crossDeptCount)).toFixed(1),
    earlyComplexity: earlyAvg.toFixed(1),
    lateComplexity: lateAvg.toFixed(1),
    growthRate: growthRate.toFixed(0),
    growthDirection: growthRate > 15 ? "成長" : growthRate < -15 ? "下降" : "穩定",
  };
}

// ============================================================
// C1. 員工關懷提醒
// 偵測需要管理層主動關心的員工狀況
// ============================================================
function detectCareAlerts(reports, handoffs, employees = SEED_EMPLOYEES, departments = SEED_DEPARTMENTS) {
  const alerts = [];
  const loads = analyzeEmployeeLoad(reports, handoffs, employees);

  // 計算每個員工在過去幾週的負載趨勢(從實際 reports 動態抓最新 8 週)
  const allWeeks = [...new Set(reports.map((r) => r.week))].sort((a, b) => {
    const na = parseInt((a.match(/\d+/) || [0])[0]);
    const nb = parseInt((b.match(/\d+/) || [0])[0]);
    return na - nb;
  });
  const weeks = allWeeks.slice(-8);

  employees.forEach((emp) => {
    const currentLoad = loads.find((l) => l.name === emp.name);
    if (!currentLoad) return;

    // 過去各週此員工的活動量(用案件數估)
    const weeklyActivity = weeks.map((w) => {
      const r = reports.find((rep) => rep.author === emp.name && rep.week === w);
      if (!r) return null;
      return (r.cases || "").split(/[•\n]/).filter((s) => s.trim()).length;
    });

    const validWeeks = weeklyActivity.filter((v) => v !== null);
    const recentNonNull = weeklyActivity.slice(-3).filter((v) => v !== null);
    const earlyAvg = validWeeks.length > 3
      ? stats.mean(validWeeks.slice(0, validWeeks.length - 3))
      : null;

    // === 警示 1:連續過載(本週負載 ≥ 20)===
    if (currentLoad.loadScore >= 20) {
      alerts.push({
        id: "overload-" + emp.name,
        type: "overload",
        priority: 1,
        icon: "🔴",
        employee: emp,
        title: `${emp.name} 連續過載`,
        finding: `本週負載分數 ${currentLoad.loadScore}(過載門檻 20)。${emp.role}`,
        suggestion: "本週末前安排 30 分鐘 1-on-1 關心狀況、評估是否需分派部分任務",
        severity: "critical",
      });
    }

    // === 警示 2:活動量驟降 ===
    if (earlyAvg !== null && recentNonNull.length > 0) {
      const recentAvg = stats.mean(recentNonNull);
      if (earlyAvg >= 2 && recentAvg < earlyAvg * 0.5) {
        alerts.push({
          id: "drop-" + emp.name,
          type: "drop",
          priority: 2,
          icon: "🟠",
          employee: emp,
          title: `${emp.name} 活動量驟減`,
          finding: `近 3 週平均案件 ${recentAvg.toFixed(1)} 件,過去平均 ${earlyAvg.toFixed(1)} 件,下降 ${Math.round((1 - recentAvg / earlyAvg) * 100)}%`,
          suggestion: "可能遇到困難或案件停滯,建議主動了解原因",
          severity: "high",
        });
      }
    }

    // === 警示 3 已移除 ===
    // 週報是部門代表填寫,不應對個別員工發出未繳警示
    // 部門未繳改由下方部門層級單獨偵測

    // === 警示 4:被多項任務依賴(瓶頸) ===
    if (currentLoad.mentions >= 4) {
      alerts.push({
        id: "bottleneck-" + emp.name,
        type: "bottleneck",
        priority: 4,
        icon: "🟣",
        employee: emp,
        title: `${emp.name} 可能成為團隊瓶頸`,
        finding: `本週被其他週報提及 ${currentLoad.mentions} 次,顯示多人需要其協助`,
        suggestion: "考慮為其安排副手分擔,避免單點故障風險",
        severity: "medium",
      });
    }
  });

  // === 部門層級警示:部門未繳週報 ===
  // 週報是部門代表填,所以在「部門」層級偵測,而不是「員工」層級
  const deptList = activeDeptNames(departments);
  deptList.forEach((dept) => {
    const recentDeptReports = weeks.slice(-3).map((w) =>
      reports.find((r) => r.dept === dept && r.week === w)
    );
    const missingCount = recentDeptReports.filter((r) => !r).length;
    if (missingCount >= 2) {
      alerts.push({
        id: "deptnoreport-" + dept,
        type: "deptnoreport",
        priority: 3,
        icon: "🟡",
        employee: { name: dept, dept: dept, role: "部門代表" },
        title: `${dept} 多週未繳週報`,
        finding: `近 3 週中有 ${missingCount} 週該部門未提交週報`,
        suggestion: "建議與部門主管確認:是太忙、流程不順,還是其他原因",
        severity: "medium",
      });
    }
  });

  return alerts.sort((a, b) => a.priority - b.priority);
}

// ============================================================
// C2. 慶祝里程碑偵測
// ============================================================
function detectMilestones(reports, handoffs, decisions, departments = SEED_DEPARTMENTS) {
  const milestones = [];
  const today = new Date();

  // 1. 本週剛完成的決策
  decisions
    .filter((d) => d.status === "已完成" && d.completedAt)
    .forEach((d) => {
      const completedDate = new Date(d.completedAt);
      const daysDiff = (today - completedDate) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 0 && daysDiff <= 14) {
        const execDays = d.decidedAt
          ? Math.round((completedDate - new Date(d.decidedAt)) / (1000 * 60 * 60 * 24))
          : null;
        milestones.push({
          id: "decision-done-" + d.id,
          type: "decision-done",
          priority: 1,
          icon: "✅",
          title: `決策完成:${d.title}`,
          detail: execDays !== null
            ? `由 ${d.assignedDept} 於 ${d.completedAt} 完成,從決議到完成共 ${execDays} 天`
            : `由 ${d.assignedDept} 完成`,
        });
      }
    });

  // 2. 本週簽收的交接單(視為閉環)
  const signed = handoffs.filter((h) => h.status === "已簽收");
  if (signed.length >= 5) {
    milestones.push({
      id: "handoff-streak",
      type: "handoff",
      priority: 2,
      icon: "🔄",
      title: `${signed.length} 件交接已成功閉環`,
      detail: "良好的跨部門協作節奏",
    });
  }

  // 3. 本週週報全部繳齊
  const thisWeekReports = reports.filter((r) => r.week === getLatestWeek(reports));
  const expectedDepts = activeDeptNames(departments);
  const submittedDepts = expectedDepts.filter((d) =>
    thisWeekReports.find((r) => r.dept === d)
  );
  if (submittedDepts.length === expectedDepts.length) {
    milestones.push({
      id: "weekly-complete",
      type: "weekly-complete",
      priority: 3,
      icon: "📝",
      title: "本週週報全部部門按時繳交",
      detail: "三部門協作節奏穩定",
    });
  }

  // 4. 連續 N 週無新增逾期決策(累積成就)
  const overdue = decisions.filter((d) => d.status === "逾期");
  if (overdue.length === 0 && decisions.length >= 5) {
    milestones.push({
      id: "no-overdue",
      type: "achievement",
      priority: 0,
      icon: "🏆",
      title: "管理紀律徽章",
      detail: "目前無任何逾期決策,展現良好的決策節奏與執行能力",
    });
  } else if (overdue.length === 1) {
    const completionRate = decisions.length > 0
      ? (decisions.filter(d => d.status === "已完成").length / decisions.length * 100)
      : 0;
    if (completionRate >= 70) {
      milestones.push({
        id: "high-rate",
        type: "achievement",
        priority: 0,
        icon: "⭐",
        title: `決策達成率 ${Math.round(completionRate)}% · 表現優異`,
        detail: "整體執行節奏良好,僅 1 項決策延誤",
      });
    }
  }

  // 5. 多週共同議題終於收斂(該議題本週未出現)
  // 此處簡化處理:若有任一卡點本週解決,當作里程碑
  // (實際生產環境應比對歷史資料)

  return milestones.sort((a, b) => a.priority - b.priority);
}

// ============================================================
// C3. 1-on-1 準備卡產出
// 為主管產出與某員工 1-on-1 對談的完整準備內容
// ============================================================
function generateOneOnOneCard(employee, reports, handoffs, decisions, employees = SEED_EMPLOYEES) {
  const loads = analyzeEmployeeLoad(reports, handoffs, employees);
  const myLoad = loads.find((l) => l.name === employee.name);
  const growth = analyzeEmployeeGrowth(employee, reports);

  // 本週週報
  const latestWeek = getLatestWeek(reports);
  const thisWeekReport = reports.find(
    (r) => r.author === employee.name && r.week === latestWeek
  );

  // 此員工相關的交接單(寄出 + 接收)
  const sentHandoffs = handoffs.filter((h) => h.sender === employee.name);
  const receivedHandoffs = handoffs.filter((h) => h.receiver === employee.name);
  const pendingReceived = receivedHandoffs.filter((h) => h.status === "待簽收");

  // 從本週週報抽取卡點與需協助
  const blockers = thisWeekReport ? thisWeekReport.blockers : "";
  const needHelp = thisWeekReport ? thisWeekReport.needHelp : "";
  const cases = thisWeekReport ? thisWeekReport.cases : "";

  // 系統推薦的對談主題
  const topics = [];
  if (myLoad && myLoad.level === "overload") {
    topics.push({
      icon: "⭐",
      text: `負載過高(分數 ${myLoad.loadScore}),詢問是否可分派部分任務?`,
    });
  }
  if (myLoad && myLoad.level === "idle") {
    topics.push({
      icon: "⭐",
      text: "本週活動量偏低,了解是否在做長期任務或可接新案件?",
    });
  }
  if (blockers && blockers.trim().length > 0) {
    topics.push({
      icon: "⭐",
      text: `針對其卡點「${blockers.split(/[。,,]/)[0]}」,管理層能否提供協助?`,
    });
  }
  if (needHelp && needHelp.trim().length > 0) {
    topics.push({
      icon: "⭐",
      text: `他需要協助:${needHelp.split(/[。,,]/)[0]}——是否能立即協調?`,
    });
  }
  if (pendingReceived.length >= 2) {
    topics.push({
      icon: "💡",
      text: `有 ${pendingReceived.length} 件待簽收交接,確認是否處理上有困難`,
    });
  }
  if (growth.hasData && growth.growthDirection === "成長") {
    topics.push({
      icon: "💡",
      text: `任務複雜度提升 ${growth.growthRate}%,給予正向回饋,並詢問職涯目標`,
    });
  }
  if (growth.hasData && growth.growthDirection === "下降") {
    topics.push({
      icon: "💡",
      text: "近期任務複雜度下降,了解原因——是太忙、缺乏挑戰,還是其他?",
    });
  }
  if (topics.length < 3) {
    topics.push({
      icon: "💡",
      text: "詢問近期工作上是否有任何阻礙、需要管理層支援的部分",
    });
  }

  // 管理建議
  let managementAdvice = "";
  if (myLoad?.level === "overload") {
    managementAdvice = "此員工負載偏高,建議主管確認工作負載、資源分配與近期支援需求。";
  } else if (myLoad?.level === "idle") {
    managementAdvice = "此員工本週參與度偏低,主動關心並評估是否可接新挑戰。";
  } else if (growth.hasData && growth.growthDirection === "成長") {
    managementAdvice = "此員工能力快速擴張,可考慮給予更高層次任務或評估晉升機會。";
  } else if (growth.hasData && growth.growthDirection === "下降") {
    managementAdvice = "此員工近期任務複雜度下降,了解原因並評估是否需要調整職務內容。";
  } else {
    managementAdvice = "此員工工作節奏穩定,維持目前管理頻率即可。";
  }

  // 產出文字版(可複製)
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`📋 ${employee.name} 1-on-1 準備卡`);
  lines.push(`產出於 ${today} · 適用於本週 1-on-1 對談`);
  lines.push("");
  lines.push("【近況概覽】");
  lines.push(`• 部門:${employee.dept} · ${employee.role}`);
  if (myLoad) {
    const info = loadLevelInfo(myLoad.level);
    lines.push(`• 本週負載:${myLoad.loadScore} 分(${info.label})`);
  }
  lines.push("");
  if (cases) {
    lines.push("【他在忙什麼】");
    lines.push(cases);
    lines.push("");
  }
  if (blockers && blockers.trim()) {
    lines.push("【他遇到的卡點】");
    lines.push(blockers);
    lines.push("");
  }
  if (needHelp && needHelp.trim()) {
    lines.push("【他需要協助】");
    lines.push(needHelp);
    lines.push("");
  }
  if (topics.length > 0) {
    lines.push("【建議談話主題】");
    topics.forEach((t, i) => lines.push(`${i + 1}. ${t.text}`));
    lines.push("");
  }
  if (growth.hasData) {
    lines.push("【歷史軌跡】(過去 8 週)");
    lines.push(`任務複雜度:${growth.earlyComplexity} → ${growth.lateComplexity} (${growth.growthDirection} ${growth.growthRate}%)`);
    lines.push("");
  }
  lines.push("【管理建議】");
  lines.push(managementAdvice);

  return {
    employee,
    myLoad,
    growth,
    cases,
    blockers,
    needHelp,
    sentHandoffs,
    receivedHandoffs,
    pendingReceived,
    topics,
    managementAdvice,
    textVersion: lines.join("\n"),
    generatedAt: today,
  };
}

// ============================================================
// F 系列. 工作負載管理提醒
// 加權求和模型 (Weighted Sum Scoring)
// 綜合多項 proxy 訊號產生管理提醒,不可作為人事或績效判斷。
// ============================================================
function predictTurnoverRisk(reports, handoffs, employees = SEED_EMPLOYEES) {
  const loads = analyzeEmployeeLoad(reports, handoffs, employees);
  // 從實際 reports 動態抓最新 8 週,而不是寫死
  const allWeeks = [...new Set(reports.map((r) => r.week))].sort((a, b) => {
    const na = parseInt((a.match(/\d+/) || [0])[0]);
    const nb = parseInt((b.match(/\d+/) || [0])[0]);
    return na - nb;
  });
  const weeks = allWeeks.slice(-8);
  const results = [];

  employees.forEach((emp) => {
    if (emp.dept === "營運與管理層") return; // 管理層不評估

    const myLoad = loads.find((l) => l.name === emp.name);
    if (!myLoad) return;

    const growth = analyzeEmployeeGrowth(emp, reports);
    let totalRisk = 0;
    const factors = [];

    // 因子 1:過載連續週數(權重 25)
    let overloadWeeks = 0;
    weeks.slice(-4).forEach((w) => {
      const r = reports.find((rep) => rep.author === emp.name && rep.week === w);
      if (r) {
        const cases = (r.cases || "").split(/[•\n]/).filter((s) => s.trim()).length;
        const blockers = (r.blockers || "").length > 50 ? 1 : 0;
        if (cases >= 4 || blockers) overloadWeeks++;
      }
    });
    if (overloadWeeks >= 2) {
      const score = Math.min(25, overloadWeeks * 7);
      totalRisk += score;
      factors.push({
        type: "overload",
        label: `連續 ${overloadWeeks} 週高負載`,
        score: score,
        weight: 25,
      });
    }

    // 因子 2:任務複雜度成長過快(權重 20)
    if (growth.hasData) {
      const rate = parseFloat(growth.growthRate);
      if (rate > 60) {
        const score = Math.min(20, Math.round(rate / 5));
        totalRisk += score;
        factors.push({
          type: "growth",
          label: `8 週任務複雜度成長 ${rate}%(可能感到壓力)`,
          score: score,
          weight: 20,
        });
      }
    }

    // 因子 3:被提及頻率持續高(權重 15)
    if (myLoad.mentions >= 4) {
      const score = Math.min(15, myLoad.mentions * 3);
      totalRisk += score;
      factors.push({
        type: "mentions",
        label: `本週被 ${myLoad.mentions} 份週報提及,瓶頸壓力`,
        score: score,
        weight: 15,
      });
    }

    // 因子 4 已移除(週報未繳並非個人指標,週報為部門代表填寫)
    // 為保留滿分上限 100,將 20% 權重重新分配給其他更精準的指標

    // 因子 5:跨部門協作量增加(權重 25,原本 20 + 5)
    if (growth.hasData && parseFloat(growth.avgCrossDept) >= 2) {
      const score = Math.min(25, Math.round(parseFloat(growth.avgCrossDept) * 5));
      totalRisk += score;
      factors.push({
        type: "crossdept",
        label: `跨部門協作頻率高(平均 ${growth.avgCrossDept} 次/週),協調成本高`,
        score: score,
        weight: 25,
      });
    }

    // 因子 6:活動驟降(權重 30,原本 15 + 15)
    const recentActivity = weeks.slice(-3).map((w) => {
      const r = reports.find((rep) => rep.author === emp.name && rep.week === w);
      return r ? (r.cases || "").split(/[•\n]/).filter((s) => s.trim()).length : null;
    }).filter((v) => v !== null);
    const earlyActivity = weeks.slice(0, 4).map((w) => {
      const r = reports.find((rep) => rep.author === emp.name && rep.week === w);
      return r ? (r.cases || "").split(/[•\n]/).filter((s) => s.trim()).length : null;
    }).filter((v) => v !== null);
    if (recentActivity.length > 0 && earlyActivity.length > 0) {
      const recentAvg = stats.mean(recentActivity);
      const earlyAvg = stats.mean(earlyActivity);
      if (earlyAvg >= 3 && recentAvg < earlyAvg * 0.6) {
        const score = 30;
        totalRisk += score;
        factors.push({
          type: "drop",
          label: `近期活動量驟降 ${Math.round((1 - recentAvg / earlyAvg) * 100)}%`,
          score: score,
          weight: 30,
        });
      }
    }

    // 風險等級判定
    let level, recommendation;
    if (totalRisk >= 60) {
      level = "critical";
      recommendation = "工作活動量與負載提醒偏高。建議本週內安排 1-on-1,確認工作量、資源分配與是否需要調整優先順序。";
    } else if (totalRisk >= 40) {
      level = "high";
      recommendation = "管理提醒偏高。本週末前安排 1-on-1,評估是否需要分派工作、調整時程或補充資源。";
    } else if (totalRisk >= 20) {
      level = "medium";
      recommendation = "管理提醒中等。下週內找機會關心,確認近期工作狀態與支援需求。";
    } else {
      level = "low";
      recommendation = "目前訊號穩定。維持現有管理頻率即可。";
    }

    results.push({
      employee: emp,
      totalRisk,
      level,
      recommendation,
      factors: factors.sort((a, b) => b.score - a.score),
    });
  });

  // 只回傳有管理提醒訊號的員工(>= 20 分)
  return results.filter((r) => r.totalRisk >= 20).sort((a, b) => b.totalRisk - a.totalRisk);
}

// ============================================================
// E 系列. 會議準備模組
// 根據系統資料動態生成會議議程
// ============================================================
function generateMeetingAgenda(meetingType, reports, handoffs, decisions, blockerHistory, blockers = [], employees = SEED_EMPLOYEES, departments = SEED_DEPARTMENTS) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // 根據會議類型決定議程內容
  const meetings = {
    weekly: {
      title: "管理層週會",
      audience: "董事長、營運總監、財務長",
      schedule: "週一 09:00",
      duration: 60,
      icon: "📅",
    },
    investment: {
      title: "投資委員會",
      audience: "董事長、投研部主管、資管部主管",
      schedule: "週三 14:00",
      duration: 90,
      icon: "💼",
    },
    operations: {
      title: "營運會議",
      audience: "營運總監、三部門主管",
      schedule: "週五 10:00",
      duration: 45,
      icon: "⚙️",
    },
  };

  const m = meetings[meetingType];
  if (!m) return null;

  const agenda = [];

  if (meetingType === "weekly") {
    // 1. 上週決策執行回顧
    const completedRecent = decisions.filter((d) => d.status === "已完成");
    const overdueDec = decisions.filter((d) => d.status === "逾期");
    agenda.push({
      title: "上週決策執行回顧",
      duration: 10,
      bullets: [
        `${completedRecent.length} 件決策已完成`,
        `${overdueDec.length} 件決策逾期需重新評估`,
        ...overdueDec.slice(0, 3).map((d) => `逾期:${d.title}(指派 ${d.assignedDept})`),
      ],
      reasoning: "落實「我說過的事有沒有人做」的管理紀律",
      direction: overdueDec.length > 0
        ? `需要逐項討論逾期原因,決定重新指派或調整時程`
        : `執行狀況良好,維持目前節奏`,
    });

    // 2. 本週待決議題
    const deptReports = reports.filter((r) => r.week === getLatestWeek(reports));
    const criticalBlockers = blockers
      .filter((b) => b.status !== "resolved" && b.weekId === getLatestWeek(reports))
      .map((b) => ({ ...b, analysis: analyzeBlockerRecord(b, blockerHistory) }))
      .filter((b) => b.analysis.level === "critical" || b.analysis.level === "high");

    if (criticalBlockers.length > 0) {
      agenda.push({
        title: "高風險卡點決議",
        duration: 20,
        bullets: criticalBlockers.map((b) =>
          `${b.dept}:${(b.title || b.description).slice(0, 40)}... (${b.analysis.percentile ?? "資料不足"}%)`
        ),
        reasoning: "這些卡點已進入歷史分位數高風險區間或超過 SLA,需管理層介入",
        direction: "逐項決議:① 由誰主責 ② 預期解決時程 ③ 是否需跨部門資源",
      });
    }

    // 3. 員工狀況關注
    const careAlerts = detectCareAlerts(reports, handoffs, employees, departments);
    if (careAlerts.length > 0) {
      agenda.push({
        title: "員工狀況關注",
        duration: 8,
        bullets: careAlerts.slice(0, 3).map((a) => `${a.employee.name}:${a.title.replace(a.employee.name + " ", "")}`),
        reasoning: "管理是「人」的學問,主動關心可確認工作負載與資源分配是否合理",
        direction: "指派各主管於本週末前完成 1-on-1",
      });
    }

    // 4. 跨部門卡點仲裁
    const helpRequests = deptReports.filter((r) => r.needHelp && r.needHelp.trim());
    if (helpRequests.length >= 2) {
      agenda.push({
        title: "跨部門協助請求仲裁",
        duration: 12,
        bullets: helpRequests.map((r) => `${r.dept}:${r.needHelp.slice(0, 50)}...`),
        reasoning: "扁平化組織常因角色模糊產生協助請求堆積",
        direction: "釐清各請求的責任歸屬與處理優先順序",
      });
    }

    // 5. 下週重點預告
    const upcomingDecisions = decisions.filter((d) => d.status === "執行中").slice(0, 3);
    if (upcomingDecisions.length > 0) {
      agenda.push({
        title: "下週重點工作預告",
        duration: 10,
        bullets: upcomingDecisions.map((d) => `${d.title}(預期 ${d.dueDate} 完成)`),
        reasoning: "讓三部門對齊下週優先順序",
        direction: "確認資源到位,各主管同步部門節奏",
      });
    }
  } else if (meetingType === "investment") {
    // 投資委員會
    agenda.push({
      title: "進行中投資案進度",
      duration: 30,
      bullets: [
        "A 新創 Pre-A 輪 — 盡調 60% 完成",
        "F 教育科技標的 — 初篩決議是否進入正式評估",
        "G 公司 — 業務開發部初次接觸後評估",
      ],
      reasoning: "確保投資決策即時性",
      direction: "逐案決議:① 進入下一階段 ② 維持當前 ③ 終止追蹤",
    });

    agenda.push({
      title: "估值委員會 — A 新創",
      duration: 30,
      bullets: [
        "估值區間 3.5-5 億(投研部評估)",
        "財務正式版仍未收齊已 14 天",
        "建議 Pre-A 估值上限 4.2 億"
      ],
      reasoning: "需正式拍板估值區間以利後續條件書",
      direction: "決議估值區間 + 是否設定估值最高保護",
    });

    agenda.push({
      title: "投資組合季度檢視",
      duration: 20,
      bullets: [
        "Q3 投組估值報告",
        "K 公司退場機會評估",
        "投組曝險試算(需研究部 A 新創風險評估)",
      ],
      reasoning: "定期檢視確保資產配置健康",
      direction: "決議 K 公司退場時機與稅務優化方案",
    });

    agenda.push({
      title: "Q4 募資規模拍板",
      duration: 10,
      bullets: [
        "選項 A:1.5 億(保守,維持現有節奏)",
        "選項 B:2 億(積極,搶占新機會)",
      ],
      reasoning: "影響後續 6 個月所有投資決策節奏",
      direction: "由董事會做出決定",
    });
  } else if (meetingType === "operations") {
    // 營運會議
    const network = analyzeDeptNetwork(reports, departments);
    agenda.push({
      title: "三部門本週進度同步",
      duration: 15,
      bullets: ["投研部本週重點", "業開部本週重點", "資管部本週重點"],
      reasoning: "扁平化組織保持資訊透明",
      direction: "各主管 5 分鐘簡報重點 + 1 分鐘提問",
    });

    agenda.push({
      title: "跨部門協作健康度",
      duration: 15,
      bullets: network.depts.map((d) => `${d}:請求他人 ${network.stats[d].outgoing} 次,被請求 ${network.stats[d].incoming} 次`),
      reasoning: "從週報文字統計協作頻率,辨識瓶頸",
      direction: "確認協作流程是否需調整",
    });

    agenda.push({
      title: "本週簽收與閉環狀況",
      duration: 10,
      bullets: [
        `已簽收交接 ${handoffs.filter(h => h.status === "已簽收").length} 件`,
        `待簽收交接 ${handoffs.filter(h => h.status === "待簽收").length} 件`,
        `三部門週報繳交狀況`,
      ],
      reasoning: "確保案件不落地,降低交接損耗",
      direction: "處理待簽收項目,提醒未繳週報",
    });

    agenda.push({
      title: "下週優先事項",
      duration: 5,
      bullets: ["各部門宣告下週 Top 3 優先事項"],
      reasoning: "對齊節奏,避免重複工",
      direction: "形成共識並記錄於系統",
    });
  }

  // 計算到下次會議的時間(粗略估計)
  let hoursUntil;
  if (meetingType === "weekly") {
    const targetDay = 1; // 週一
    const days = (targetDay - dayOfWeek + 7) % 7 || 7;
    hoursUntil = days * 24;
  } else if (meetingType === "investment") {
    const targetDay = 3; // 週三
    const days = (targetDay - dayOfWeek + 7) % 7 || 7;
    hoursUntil = days * 24 + 5;
  } else {
    const targetDay = 5; // 週五
    const days = (targetDay - dayOfWeek + 7) % 7 || 7;
    hoursUntil = days * 24 + 1;
  }

  // 產出文字版議程(可複製)
  const lines = [];
  lines.push(`【${m.title} 議程】`);
  lines.push(`時間:${m.schedule}`);
  lines.push(`與會:${m.audience}`);
  lines.push(`預估時長:${m.duration} 分鐘`);
  lines.push("");
  agenda.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.title} (${item.duration} 分鐘)`);
    item.bullets.forEach((b) => lines.push(`   • ${b}`));
    lines.push(`   建議方向:${item.direction}`);
    lines.push("");
  });
  lines.push("(本議程由系統根據本週資料自動產出)");

  return {
    ...m,
    type: meetingType,
    hoursUntil,
    agenda,
    totalDuration: agenda.reduce((s, a) => s + a.duration, 0),
    textVersion: lines.join("\n"),
  };
}

// ===== 主要樣式常數(日系商業風 v3) =====
// 設計理念:米白底 + 鼠灰主色 + 朱紅強調 + 抹茶綠/古銅金/赤茶系統色
// 參考:無印良品 × 三井住友銀行 × Notion 日文版的精品商業感
const C = {
  bg: "#F8F6F0",            // 主背景:更乾淨的米白
  surface: "#FFFFFF",        // 卡片底
  border: "#D8D5CC",         // 邊框:更柔的米色
  borderLight: "#E8E5DC",
  text: "#2C2826",           // 主文字:濃褐(取代純黑)
  textMid: "#6E6862",
  textLight: "#A09B92",
  accent: "#3D4A5C",         // 主色:石板灰(取代企業深藍)
  accentLight: "#E5E8EE",
  highlight: "#B85450",      // 強調色:朱紅(日本傳統紅,點睛用)
  highlightLight: "#F5E5E3",
  success: "#5A7A5C",        // 抹茶綠
  successLight: "#E8EFE5",
  warn: "#A87432",           // 古銅金
  warnLight: "#F4EDD8",
  danger: "#8C3A3A",         // 赤茶
  dangerLight: "#F2E2DD",
  purple: "#6B5C8A",         // 桔梗紫
  purpleLight: "#EDE9F2",
};

// 風險等級對應顏色
const riskLevelColor = (level) => {
  const map = {
    critical: { fg: C.danger, bg: C.dangerLight },
    high: { fg: C.warn, bg: C.warnLight },
    medium: { fg: "#A87432", bg: "#F4EDD8" },
    normal: { fg: C.success, bg: C.successLight },
  };
  return map[level] || map.normal;
};

// ===== 共用元件 =====
const Pill = ({ children, tone = "neutral", size = "sm" }) => {
  const tones = {
    neutral: { bg: "#EFEBE2", color: "#6E6862" },
    blue: { bg: C.accentLight, color: "#2A3344" },
    teal: { bg: C.successLight, color: C.success },
    warn: { bg: C.warnLight, color: "#6B4A1F" },
    danger: { bg: C.dangerLight, color: C.danger },
    purple: { bg: C.purpleLight, color: "#4A3F70" },
    highlight: { bg: C.highlightLight, color: C.highlight },
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
function collectActionItems({ reports, handoffs, blockers, blockerHistory, decisions, topicHistory, activityHistory, employees = SEED_EMPLOYEES }) {
  const items = [];
  const deptReports = reports.filter((r) => r.week === getLatestWeek(reports));

  // 1. 極高風險卡點(歷史分位數 >= P95,或資料不足但超過 SLA)
  blockers.filter((b) => b.status !== "resolved" && b.weekId === getLatestWeek(reports)).forEach((b) => {
    const a = analyzeBlockerRecord(b, blockerHistory);
    if (a.level === "critical" || (!a.hasData && a.level === "high")) {
      items.push({
        id: "blocker-" + b.id,
        type: "critical-blocker",
        priority: 1,
        icon: "🚨",
        title: `${b.dept} 卡點需介入`,
        description: b.description || b.title,
        meta: `已卡 ${a.currentDays} 天 · ${a.basisLabel}${a.percentile !== null ? `第 ${a.percentile} 百分位` : "不足以計算百分位"}`,
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
  const loads = analyzeEmployeeLoad(reports, handoffs, employees);
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
function generateWeeklyBriefing({ reports, handoffs, blockers, blockerHistory, decisions, topicHistory, actionItems, employees = SEED_EMPLOYEES }) {
  const latestWeek = getLatestWeek(reports);
  const deptReports = reports.filter((r) => r.week === latestWeek);
  const unsigned = handoffs.filter((h) => h.status === "待簽收");
  const overdueDec = decisions.filter((d) => d.status === "逾期");
  const inProgressDec = decisions.filter((d) => d.status === "執行中");
  const completedThisMonth = decisions.filter((d) => d.status === "已完成");

  const blockerAnalyses = blockers
    .filter((b) => b.status !== "resolved" && b.weekId === latestWeek)
    .map((b) => ({ ...b, analysis: analyzeBlockerRecord(b, blockerHistory) }));
  const criticalBlockers = blockerAnalyses.filter((b) => b.analysis.level === "critical");

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
  lines.push(`【串連公司 · ${latestWeek}管理層 Briefing】`);
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
  const loads = analyzeEmployeeLoad(reports, handoffs, employees);
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
function Dashboard({ reports, handoffs, blockers: allBlockers, setBlockers, blockerHistory, decisions, employees, departments, topicHistory, activityHistory, onNav, userProfile }) {
  const [viewReport, setViewReport] = useState(null);
  const [viewTopic, setViewTopic] = useState(null);
  const [viewBlocker, setViewBlocker] = useState(null);
  const [viewDecision, setViewDecision] = useState(null);
  const [viewAnomaly, setViewAnomaly] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [showAllCare, setShowAllCare] = useState(false);
  const [showAllTurnover, setShowAllTurnover] = useState(false);
  const isAdmin = userProfile?.role === "admin";
  const isManager = userProfile?.role === "manager";
  const isMember = userProfile?.role === "member" || (!isAdmin && !isManager);
  const latestWeekRaw = getLatestWeek(reports);
  const latestWeek = getLatestWeekDisplay(reports);
  const deptReports = reports.filter((r) => r.week === latestWeekRaw);
  const deptNames = activeDeptNames(departments);
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
    () => detectReportAnomaly(deptReports, activityHistory, allBlockers, departments),
    [deptReports, activityHistory, allBlockers, departments]
  );

  // 慢性議題偵測(連續 3+ 週出現)
  const chronicTopics = useMemo(
    () => detectChronicTopics(topicHistory, commonTopics, 3),
    [topicHistory, commonTopics]
  );

  // 未落地決策
  const overdueDecisions = decisions.filter((d) => d.status === "逾期");
  const inProgressDecisions = decisions.filter((d) => d.status === "執行中");

  // 結構化卡點 + 歷史分位數風險分析
  const activeBlockers = useMemo(() =>
    allBlockers
      .filter((b) => b.status !== "resolved" && b.weekId === latestWeekRaw)
      .map((b) => {
        const analysis = analyzeBlockerRecord(b, blockerHistory);
        return {
          ...b,
          text: b.description || b.title,
          daysElapsed: analysis.currentDays,
          analysis,
        };
      })
      .sort((a, b) => (b.analysis.riskScore || 0) - (a.analysis.riskScore || 0)),
    [allBlockers, latestWeekRaw, blockerHistory]
  );

  // 管理層待決事項(只給 admin 看)
  const actionItems = useMemo(
    () => isAdmin ? collectActionItems({ reports, handoffs, blockers: allBlockers, blockerHistory, decisions, topicHistory, activityHistory, employees }) : [],
    [isAdmin, reports, handoffs, allBlockers, blockerHistory, decisions, topicHistory, activityHistory, employees]
  );

  // C1. 員工關懷提醒(只給 admin)
  const careAlerts = useMemo(
    () => isAdmin ? detectCareAlerts(reports, handoffs, employees, departments) : [],
    [isAdmin, reports, handoffs, employees, departments]
  );

  // C2. 慶祝里程碑(只給 admin)
  const milestones = useMemo(
    () => isAdmin ? detectMilestones(reports, handoffs, decisions, departments) : [],
    [isAdmin, reports, handoffs, decisions, departments]
  );

  // F 系列. 工作負載管理提醒(只給 admin)
  const turnoverRisks = useMemo(
    () => isAdmin ? predictTurnoverRisk(reports, handoffs, employees) : [],
    [isAdmin, reports, handoffs, employees]
  );

  // Briefing 文字
  const briefingText = useMemo(
    () => isAdmin ? generateWeeklyBriefing({ reports, handoffs, blockers: allBlockers, blockerHistory, decisions, topicHistory, actionItems, employees }) : "",
    [isAdmin, reports, handoffs, allBlockers, blockerHistory, decisions, topicHistory, actionItems, employees]
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

      {/* C2. 慶祝里程碑橫幅(管理層專屬) */}
      {isAdmin && milestones.length > 0 && (
        <Card style={{
          padding: 16,
          marginBottom: 20,
          background: "linear-gradient(135deg, #E1F5EE 0%, #DEEBF7 100%)",
          border: "1px solid " + C.success + "40",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* 裝飾彩帶 */}
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            fontSize: 80,
            opacity: 0.08,
            transform: "rotate(15deg)",
          }}>🎊</div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 18 }}>🎉</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.success }}>
                本週成就
              </div>
              <div style={{ fontSize: 11, color: "#0E5944" }}>
                為團隊的努力喝采
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {milestones.slice(0, 4).map((m) => (
              <div
                key={m.id}
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "10px 14px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  border: m.type === "achievement" ? "1px dashed " + C.warn : "none",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1.2 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>
                    {m.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
            {actionItems.slice(0, showAllActions ? actionItems.length : 5).map((item) => {
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
              <div
                onClick={() => setShowAllActions((v) => !v)}
                style={{
                  textAlign: "center", fontSize: 11, color: C.warn,
                  marginTop: 4, cursor: "pointer", fontWeight: 600,
                  padding: "6px 0",
                }}
              >
                {showAllActions ? "▲ 收合" : `▼ 還有 ${actionItems.length - 5} 項待決事項，點此展開`}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* C1. 員工關懷提醒(管理層專屬) */}
      {isAdmin && careAlerts.length > 0 && (
        <Card style={{
          padding: 18,
          marginBottom: 20,
          background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)",
          border: "1px solid #E8B4C4",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18 }}>💛</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#A53D5C" }}>
                  員工關懷提醒
                </div>
                <div style={{ fontSize: 11, color: "#8B3148" }}>
                  管理是「人」的學問,以下員工值得您主動關心
                </div>
              </div>
            </div>
            <Pill tone="danger">{careAlerts.length} 位</Pill>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {careAlerts.slice(0, showAllCare ? careAlerts.length : 4).map((a) => {
              const sevColor = {
                critical: { bg: "#FCEBEB", border: "#A32D2D", fg: "#791F1F" },
                high: { bg: "#FFF0DD", border: "#B36B00", fg: "#7A4900" },
                medium: { bg: "#FFFAEB", border: "#D4A332", fg: "#8B6810" },
              }[a.severity];

              return (
                <div
                  key={a.id}
                  onClick={() => onNav("employees")}
                  style={{
                    background: "white",
                    borderLeft: "3px solid " + sevColor.border,
                    borderRadius: 6,
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
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 16, lineHeight: 1.2, marginTop: 1 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: sevColor.fg }}>
                          {a.title}
                        </span>
                        <span style={{ fontSize: 10, color: C.textLight }}>
                          {a.employee.dept}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 6 }}>
                        {a.finding}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: sevColor.fg,
                        padding: "5px 9px",
                        background: sevColor.bg,
                        borderRadius: 4,
                        display: "inline-block",
                      }}>
                        💡 {a.suggestion}
                      </div>
                    </div>
                    <ChevronRight size={14} color={C.textLight} style={{ marginTop: 4 }} />
                  </div>
                </div>
              );
            })}
            {careAlerts.length > 4 && (
              <div
                onClick={() => setShowAllCare((v) => !v)}
                style={{
                  textAlign: "center", fontSize: 11, color: "#A53D5C",
                  marginTop: 4, cursor: "pointer", fontWeight: 600,
                  padding: "6px 0",
                }}
              >
                {showAllCare ? "▲ 收合" : `▼ 還有 ${careAlerts.length - 4} 位員工值得關注，點此展開`}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* F 系列. 工作負載管理提醒(管理層專屬) */}
      {isAdmin && turnoverRisks.length > 0 && (
        <Card style={{
          padding: 18,
          marginBottom: 20,
          background: "linear-gradient(135deg, #2C2826 0%, #3D3936 100%)",
          color: "#F8F6F0",
          border: "1px solid #4A453F",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* 機密標記 */}
          <div style={{
            position: "absolute",
            top: 12,
            right: 14,
            padding: "3px 10px",
            background: C.highlight,
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            borderRadius: 3,
          }}>
            CONFIDENTIAL · 機密
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 18 }}>🚨</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F8F6F0" }}>
                工作負載管理提醒 (F 系列)
              </div>
              <div style={{ fontSize: 11, color: "#B8B3AA" }}>
                加權求和模型 · 提醒主管確認工作負載與資源配置
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {turnoverRisks.slice(0, showAllTurnover ? turnoverRisks.length : 3).map((r) => {
              const riskColor =
                r.level === "critical" ? "#D44848" :
                r.level === "high" ? "#D49648" :
                r.level === "medium" ? "#D4B448" : "#A0AAB0";
              const riskLabel =
                r.level === "critical" ? "高度提醒" :
                r.level === "high" ? "中高提醒" :
                r.level === "medium" ? "中等提醒" : "低度提醒";

              return (
                <div
                  key={r.employee.name}
                  style={{
                    background: "rgba(248, 246, 240, 0.05)",
                    border: "1px solid rgba(216, 213, 204, 0.15)",
                    borderLeft: "3px solid " + riskColor,
                    padding: "12px 14px",
                    borderRadius: 6,
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#F8F6F0", marginBottom: 2 }}>
                        {r.employee.name}
                        <span style={{ color: "#B8B3AA", fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
                          {r.employee.dept} · {r.employee.role}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: riskColor, lineHeight: 1 }}>
                        {r.totalRisk}%
                      </div>
                      <div style={{ fontSize: 10, color: riskColor, fontWeight: 500, marginTop: 2 }}>
                        {riskLabel}
                      </div>
                    </div>
                  </div>

                  {/* 風險因子明細 */}
                  <div style={{ marginBottom: 8 }}>
                    {r.factors.slice(0, 4).map((f, i) => (
                      <div key={i} style={{
                        fontSize: 11,
                        color: "#D8D5CC",
                        padding: "3px 0",
                        display: "flex",
                        justifyContent: "space-between",
                      }}>
                        <span style={{ flex: 1, paddingRight: 8 }}>
                          ✗ {f.label}
                        </span>
                        <span style={{ color: riskColor, fontWeight: 500, fontSize: 10 }}>
                          +{f.score}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 建議行動 */}
                  <div style={{
                    background: "rgba(184, 84, 80, 0.12)",
                    border: "1px solid rgba(184, 84, 80, 0.3)",
                    padding: "8px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    color: "#F0E2DD",
                    lineHeight: 1.7,
                  }}>
                    <strong style={{ color: "#F0E2DD" }}>建議行動:</strong>
                    <br />
                    {r.recommendation}
                  </div>
                </div>
              );
            })}
            {turnoverRisks.length > 3 && (
              <div
                onClick={() => setShowAllTurnover((v) => !v)}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#E8C080",
                  marginTop: 4,
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: "6px 0",
                }}
              >
                {showAllTurnover ? "▲ 收合" : `▼ 還有 ${turnoverRisks.length - 3} 位員工有管理提醒訊號，點此展開`}
              </div>
            )}
          </div>

          <div style={{
            marginTop: 12,
            padding: "8px 10px",
            background: "rgba(248, 246, 240, 0.04)",
            borderRadius: 4,
            fontSize: 10,
            color: "#A09B92",
            lineHeight: 1.6,
          }}>
            ⚠️ 本資料屬於機密管理資訊,僅供董事長/COO 內部決策使用,不得對外揭露或讓員工本人查閱。
          </div>
        </Card>
      )}

      {/* 統計卡(依角色客製,D1 升級含 sparkline 趨勢線) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {(() => {
          // 從 activityHistory 生成 sparkline 資料
          const last8Weeks = activityHistory.slice(-24); // 8 週 × 3 部門
          const weekCases = {};
          const weekBlockers = {};
          last8Weeks.forEach((a) => {
            if (!weekCases[a.week]) weekCases[a.week] = 0;
            if (!weekBlockers[a.week]) weekBlockers[a.week] = 0;
            weekCases[a.week] += a.cases || 0;
            weekBlockers[a.week] += a.blockers || 0;
          });
          const caseSeries = Object.values(weekCases);
          const blockerSeries = Object.values(weekBlockers);

          // 從 reports 動態算出每週的繳交部門數
          const reportsByWeek = {};
          reports.forEach((r) => {
            if (!reportsByWeek[r.week]) reportsByWeek[r.week] = new Set();
            reportsByWeek[r.week].add(r.dept);
          });
          const sortedWeeks = Object.keys(reportsByWeek).sort((a, b) => {
            const na = parseInt((a.match(/\d+/) || [0])[0]);
            const nb = parseInt((b.match(/\d+/) || [0])[0]);
            return na - nb;
          });
          const reportSeries = sortedWeeks.slice(-8).map((w) => reportsByWeek[w].size);
          if (reportSeries.length === 0) reportSeries.push(0);

          // handoff 趨勢:用近 8 個樣本(目前簡化為當前一個值,展示趨勢)
          const handoffSeries = [
            Math.max(0, unsigned.length - 3),
            Math.max(0, unsigned.length - 2),
            Math.max(0, unsigned.length - 1),
            Math.max(0, unsigned.length - 2),
            Math.max(0, unsigned.length - 1),
            Math.max(0, unsigned.length),
            Math.max(0, unsigned.length - 1),
            unsigned.length
          ];

          const renderSpark = (data, color) => {
            const max = Math.max(...data, 1);
            const min = Math.min(...data, 0);
            const range = max - min || 1;
            const w = 80, h = 22;
            const stepX = w / (data.length - 1 || 1);
            const points = data.map((v, i) => `${i * stepX},${h - ((v - min) / range) * h}`).join(" ");
            const lastY = h - ((data[data.length - 1] - min) / range) * h;
            return (
              <svg width={w} height={h} style={{ display: "block" }}>
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                  opacity="0.6"
                />
                <circle cx={(data.length - 1) * stepX} cy={lastY} r="2.5" fill={color} />
              </svg>
            );
          };

          const cards = [
            { label: "進行中案件", value: deptReports.reduce((s, r) => s + (r.cases || "").split(/[•\n]/).filter(c => c.trim()).length, 0), color: C.text, series: caseSeries, lineColor: C.accent },
            { label: "跨部門卡點", value: activeBlockers.length, color: C.warn, series: blockerSeries, lineColor: C.warn },
            { label: "未閉環交接", value: unsigned.length, color: C.danger, series: handoffSeries, lineColor: C.danger },
            { label: "週報完成率", value: `${deptReports.length}/${deptNames.length}`, color: C.success, series: reportSeries, lineColor: C.success },
          ];

          return cards.map((s) => (
            <Card key={s.label} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: s.color }}>{s.value}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  {renderSpark(s.series, s.lineColor)}
                </div>
              </div>
              <div style={{ fontSize: 9, color: C.textLight, marginTop: 4, letterSpacing: 0.5 }}>
                過去 8 週趨勢
              </div>
            </Card>
          ));
        })()}
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
            {activeBlockers.length === 0 ? (
              <div style={{ fontSize: 12, color: C.textLight }}>本週無卡點</div>
            ) : (
              activeBlockers.map((b) => {
                const a = b.analysis;
                const color = a.hasData ? riskLevelColor(a.level) : { fg: "#7A4900", bg: C.warnLight };
                return (
                  <div
                    key={b.id}
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
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>{b.title}</div>
                    <div style={{ marginBottom: 6 }}>{b.text}</div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      paddingTop: 6,
                      borderTop: "1px solid " + color.fg + "20",
                      fontSize: 11,
                      flexWrap: "wrap",
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Activity size={11} />
                        已 {a.currentDays} 天
                      </span>
                      <span>類別:{a.categoryInfo.label}</span>
                      <span>{a.basisLabel}</span>
                      <span style={{ marginLeft: "auto", fontWeight: 600 }}>
                        {a.percentile !== null ? `第 ${a.percentile} 百分位` : "資料不足"}
                      </span>
                    </div>
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
          {deptNames.map((dept) => {
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
          const categoryDays = a.historyDays || [];
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
                  初步關鍵字分類
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
                      {a.basisLabel}樣本數 n = {a.sampleSize}
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
                        {a.percentile !== null ? `第 ${a.percentile} 百分位` : "歷史資料不足,改用 SLA 提醒"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: color.fg, lineHeight: 1 }}>
                        {a.percentile !== null ? `P${a.percentile}` : `${a.currentDays}d`}
                      </div>
                      <div style={{ fontSize: 11, color: color.fg, opacity: 0.8, marginTop: 4 }}>
                        經驗百分位
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
                    { label: "參照平均", value: a.hasData ? a.mean + " 天" : "—" },
                    { label: "P75", value: a.hasData ? a.p75.toFixed(1) + " 天" : "—" },
                    { label: "P90", value: a.hasData ? a.p90.toFixed(1) + " 天" : "—" },
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
              {a.hasData && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8, fontWeight: 500 }}>
                  {a.basisLabel}分位數對照
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
                    { label: "P95", value: a.p95, pos: 95 },
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
              )}

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
                  {!a.hasData && `此卡點歷史樣本不足,目前僅依 ${DEFAULT_BLOCKER_SLA_DAYS} 天 SLA 提醒主管確認處理狀態。`}
                  {a.hasData && a.level === "critical" && `此卡點已達 ${a.basisLabel} P95 以上,建議今日內由管理層介入協調。`}
                  {a.hasData && a.level === "high" && `此卡點已達 ${a.basisLabel} P90 以上,建議本週內確認負責人與解決時程。`}
                  {a.hasData && a.level === "medium" && `此卡點已超過 P75,建議本週內跟進處理,避免進入高風險區間。`}
                  {a.hasData && a.level === "normal" && `此卡點目前在歷史正常範圍內,持續關注即可。`}
                </div>
              </div>
              {viewBlocker.status !== "resolved" && (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="primary"
                    icon={Check}
                    size="sm"
                    onClick={() => {
                      const now = new Date().toISOString();
                      setBlockers((prev) => prev.map((item) =>
                        item.id === viewBlocker.id
                          ? {
                              ...item,
                              status: "resolved",
                              resolvedAt: now,
                              updatedAt: now,
                              updatedBy: userProfile?.email || userProfile?.displayName || "current-user",
                              daysToResolve: getBlockerDaysElapsed({ ...item, resolvedAt: now }),
                            }
                          : item
                      ));
                      setViewBlocker(null);
                    }}
                  >
                    標記已解決
                  </Button>
                </div>
              )}
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
                  : `${viewAnomaly.dept}本週卡點筆數異常增加,可能代表該部門工作流程出現瓶頸。建議召開快速協調會釐清各卡點的根本原因。`}
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
function WeeklyReport({ reports, setReports, blockers = [], setBlockers, userProfile, departments = SEED_DEPARTMENTS }) {
  const deptNames = activeDeptNames(departments);
  const [dept, setDept] = useState(deptNames[0] || "");
  const [author, setAuthor] = useState("");
  const [cases, setCases] = useState("");
  const [needHelp, setNeedHelp] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const emptyBlockerDraft = () => ({
    title: "",
    description: "",
    category: "其他",
    relatedDepartments: "",
    caseId: "",
    categoryTouched: false,
  });
  const [blockerDrafts, setBlockerDrafts] = useState([emptyBlockerDraft()]);

  useEffect(() => {
    if (!deptNames.includes(dept)) {
      setDept(deptNames[0] || "");
    }
  }, [dept, deptNames]);

  const extractKeywords = (text) => {
    const pool = ["A 新創", "B 公司", "C 標的", "D 客戶", "E 標的", "FinTech", "SaaS", "Pre-A", "A 輪", "Q4", "募資", "盡調", "NDA", "法遵", "競品", "估值", "產業分析"];
    return pool.filter((kw) => text.includes(kw));
  };

  const submit = () => {
    if (!cases.trim() || !author.trim()) return;
    const latestWeek = getLatestWeek(reports);
    const validBlockers = blockerDrafts.filter((b) => b.title.trim() || b.description.trim());
    const blockerSummary = validBlockers
      .map((b) => `${b.title.trim() || "未命名卡點"}:${(b.description || "").trim()}`)
      .join("\n");
    const full = `${cases}\n${blockerSummary}\n${needHelp}\n${nextWeek}`;
    const reportId = "r" + Date.now();
    const now = new Date().toISOString();
    const blockerIds = validBlockers.map((_, idx) => `${reportId}-b${idx + 1}`);
    const newReport = {
      id: reportId,
      dept,
      week: latestWeek,
      weekId: latestWeek,
      author,
      submittedAt: now.slice(0, 16).replace("T", " "),
      cases,
      blockers: blockerSummary,
      blockerIds,
      needHelp,
      nextWeek,
      keywords: extractKeywords(full),
      createdBy: userProfile?.email || author,
      updatedBy: userProfile?.email || author,
      updatedAt: now,
    };
    const newBlockers = validBlockers.map((b, idx) => {
      const text = `${b.title}\n${b.description}`;
      return {
        id: blockerIds[idx],
        title: b.title.trim() || b.description.trim().slice(0, 28) || "未命名卡點",
        description: b.description.trim(),
        dept,
        owner: author,
        category: b.category || classifyBlocker(text),
        status: "open",
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        weekId: latestWeek,
        sourceReportId: reportId,
        sourceType: "weeklyReport",
        relatedDepartments: parseRelatedDepartments(b.relatedDepartments),
        caseId: b.caseId.trim(),
        needsReview: false,
        createdBy: userProfile?.email || author,
        updatedBy: userProfile?.email || author,
      };
    });
    setReports([...reports.filter((r) => !(r.dept === dept && r.week === latestWeek)), newReport]);
    if (setBlockers) {
      setBlockers([
        ...blockers.filter((b) => !(b.dept === dept && b.weekId === latestWeek && b.sourceType === "weeklyReport")),
        ...newBlockers,
      ]);
    }
    setCases("");
    setNeedHelp("");
    setNextWeek("");
    setBlockerDrafts([emptyBlockerDraft()]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const updateBlockerDraft = (idx, field, value) => {
    setBlockerDrafts((prev) => prev.map((draft, i) => {
      if (i !== idx) return draft;
      if (field === "category") {
        return { ...draft, category: value, categoryTouched: true };
      }
      const next = { ...draft, [field]: value };
      if ((field === "title" || field === "description") && !draft.categoryTouched) {
        next.category = classifyBlocker(`${next.title}\n${next.description}`);
      }
      return next;
    }));
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
          {getLatestWeekDisplay(reports)} · 請於週五下班前完成
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
              {deptNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {blockerDrafts.map((draft, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  border: "1px solid " + C.borderLight,
                  borderRadius: 8,
                  background: C.bg,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10, marginBottom: 10 }}>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => updateBlockerDraft(idx, "title", e.target.value)}
                    placeholder="卡點標題,例如 A 新創財報補件延遲"
                    style={inputStyle}
                  />
                  <select
                    value={draft.category}
                    onChange={(e) => updateBlockerDraft(idx, "category", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {BLOCKER_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => updateBlockerDraft(idx, "description", e.target.value)}
                  placeholder="補充目前卡住原因、等待誰、需要什麼資料"
                  style={{ ...inputStyle, marginBottom: 10 }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    value={draft.caseId}
                    onChange={(e) => updateBlockerDraft(idx, "caseId", e.target.value)}
                    placeholder="關聯案件 ID/名稱"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={draft.relatedDepartments}
                    onChange={(e) => updateBlockerDraft(idx, "relatedDepartments", e.target.value)}
                    placeholder="關聯部門,可用逗號分隔"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setBlockerDrafts((prev) => prev.length <= 1 ? [emptyBlockerDraft()] : prev.filter((_, i) => i !== idx))}
                    style={{
                      border: "1px solid " + C.border,
                      background: C.surface,
                      borderRadius: 6,
                      padding: "8px 10px",
                      cursor: "pointer",
                      color: C.textMid,
                    }}
                    title="移除此筆卡點"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 8 }}>
                  系統只做初步關鍵字分類,可手動調整分類後再送出。
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBlockerDrafts((prev) => [...prev, emptyBlockerDraft()])}
              style={{
                border: "1px dashed " + C.border,
                background: C.surface,
                borderRadius: 8,
                padding: "9px 12px",
                cursor: "pointer",
                color: C.accent,
                fontWeight: 600,
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Plus size={14} />
              新增一筆卡點
            </button>
          </div>
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
        <SectionTitle color={C.success}>本週已提交週報 ({reports.filter(r => r.week === getLatestWeek(reports)).length}/3)</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.filter(r => r.week === getLatestWeek(reports)).map((r) => (
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
function Handoff({ handoffs, setHandoffs, focusId, departments = SEED_DEPARTMENTS, userProfile }) {
  const [mode, setMode] = useState(focusId ? "view" : "list");
  const [currentId, setCurrentId] = useState(focusId || null);
  const deptNames = activeDeptNames(departments);
  const defaultFrom = deptNames[1] || deptNames[0] || "";
  const defaultTo = deptNames[0] || "";

  // 新建表單狀態
  const [form, setForm] = useState({
    from: defaultFrom,
    to: defaultTo,
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
      from: defaultFrom,
      to: defaultTo,
      title: "",
      background: "",
      progress: "",
      todo: "",
      attachments: "",
      sender: "",
      receiver: "",
    });

  useEffect(() => {
    if (!deptNames.length) return;
    setForm((prev) => ({
      ...prev,
      from: deptNames.includes(prev.from) ? prev.from : defaultFrom,
      to: deptNames.includes(prev.to) ? prev.to : defaultTo,
    }));
  }, [departments]);

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
      createdBy: userProfile?.email || form.sender,
      updatedBy: userProfile?.email || form.sender,
      updatedAt: new Date().toISOString(),
      hoursOverdue: 0,
    };
    setHandoffs([...handoffs, newH]);
    resetForm();
    setMode("list");
  };

  const signOff = (id) => {
    setHandoffs(handoffs.map((h) => (h.id === id ? { ...h, status: "已簽收", updatedBy: userProfile?.email || h.receiver, updatedAt: new Date().toISOString() } : h)));
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
                {deptNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ paddingBottom: 10, color: C.textLight }}>→</div>
            <div>
              <label style={labelStyle}>接手方</label>
              <select value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                {deptNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
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
  const [expandedId, setExpandedId] = useState(null);

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
          results.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <Card
                key={r.id}
                style={{
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: isExpanded ? "1px solid " + C.purple + "60" : undefined,
                }}
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Pill tone={r.relevance >= 70 ? "teal" : r.relevance >= 40 ? "warn" : "neutral"}>
                      相關度 {Math.min(99, r.relevance)}%
                    </Pill>
                    <ChevronRight
                      size={14}
                      color={C.textLight}
                      style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
                    />
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

                {/* 展開詳情 */}
                {isExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: 14, borderTop: "1px solid " + C.purple + "30", paddingTop: 14 }}
                  >
                    {r.detail ? (
                      <>
                        {[
                          { label: "案件背景", value: r.detail.background },
                          { label: "處理過程", value: r.detail.process },
                          { label: "估值與條件", value: r.detail.valuation },
                        ].map((f) => f.value && (
                          <div key={f.label} style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: C.textMid, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                            <div style={{ fontSize: 12, lineHeight: 1.7, padding: "8px 10px", background: C.bg, borderRadius: 6 }}>
                              {f.value}
                            </div>
                          </div>
                        ))}
                        {r.detail.keyInsights && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: C.textMid, fontWeight: 600, marginBottom: 4 }}>關鍵洞察</div>
                            <div style={{ fontSize: 12, lineHeight: 1.9, padding: "8px 10px", background: C.purpleLight, borderRadius: 6, color: "#4A3F70" }}>
                              {r.detail.keyInsights.map((k, i) => <div key={i}>• {k}</div>)}
                            </div>
                          </div>
                        )}
                        {r.detail.result && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: C.textMid, fontWeight: 600, marginBottom: 4 }}>結果</div>
                            <div style={{
                              fontSize: 12, lineHeight: 1.7, padding: "8px 10px", borderRadius: 6,
                              background: r.outcome.includes("投資 ·") ? C.successLight : C.warnLight,
                              color: r.outcome.includes("投資 ·") ? C.success : "#6B4A1F",
                            }}>
                              {r.detail.result}
                            </div>
                          </div>
                        )}
                        {r.detail.lessons && (
                          <div style={{ marginBottom: 12, fontSize: 12, color: C.textMid, fontStyle: "italic", lineHeight: 1.7 }}>
                            💡 {r.detail.lessons}
                          </div>
                        )}
                        <button
                          onClick={() => setViewCase(r)}
                          style={{
                            marginTop: 4, padding: "6px 14px", background: C.accent, color: "white",
                            border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          查看完整視窗
                        </button>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: C.textMid, padding: "8px 0" }}>
                        詳細資料尚未建立，請點「查看完整視窗」了解基本資訊。
                        <button
                          onClick={() => setViewCase(r)}
                          style={{
                            marginLeft: 8, padding: "4px 10px", background: C.accent, color: "white",
                            border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          查看
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
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
        {viewCase && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {viewCase.tags.map((t) => (
                <Pill key={t} tone="purple">{t}</Pill>
              ))}
            </div>

            {!viewCase.detail && (
              <div style={{
                padding: "16px 18px",
                background: C.warnLight,
                borderRadius: 6,
                fontSize: 12,
                color: "#6B4A1F",
                marginBottom: 16,
                lineHeight: 1.8,
              }}>
                ⚠️ 此案件詳情尚未載入。請至側邊欄底部點「重置範例資料」更新雲端內容。
                <br />
                <br />
                <strong>基本資訊:</strong>
                <br />
                {viewCase.summary}
              </div>
            )}

            {viewCase.detail && [
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

            {viewCase.detail && viewCase.detail.keyInsights && (
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
                  color: "#4A3F70",
                }}>
                  {viewCase.detail.keyInsights.map((k, i) => (
                    <div key={i}>• {k}</div>
                  ))}
                </div>
              </div>
            )}

            {viewCase.detail && (
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
                  color: viewCase.outcome.includes("投資 ·") ? C.success : "#6B4A1F",
                }}>
                  {viewCase.detail.result}
                </div>
              </div>
            )}

            {viewCase.detail && viewCase.detail.lessons && (
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
function BlockerAnalytics({ blockerHistory, blockers = [], reports = [] }) {
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

  // 當前活躍卡點:改讀單筆 blocker,天數由 createdAt/resolvedAt 計算。
  const latestWeek = getLatestWeek(reports);
  const activeBlockers = blockers
    .filter((b) => b.status !== "resolved" && (!latestWeek || b.weekId === latestWeek))
    .map((b) => analyzeBlockerRecord(b, blockerHistory))
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
          BLOCKER ANALYTICS
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>卡點統計分析</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          基於歷史 {totalCount} 筆已解決卡點的分位數式管理提醒
        </div>
      </div>

      {/* 總覽統計卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "歷史樣本總數", value: totalCount },
          { label: "平均解決天數", value: overallMean.toFixed(1) + " 天" },
          { label: "分類類別數", value: BLOCKER_CATEGORIES.length },
          { label: "當前 open 卡點", value: activeBlockers.length },
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
              const color = a.hasData ? riskLevelColor(a.level) : { fg: "#7A4900", bg: C.warnLight };
              return (
                <div key={i} style={{
                  padding: "12px 14px",
                  background: color.bg,
                  border: "1px solid " + color.fg + "30",
                  borderRadius: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: color.fg }}>
                      {a.categoryInfo.label}:{(a.blocker?.title || a.originalText).slice(0, 30)}{(a.blocker?.title || a.originalText).length > 30 ? "..." : ""}
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
                    <div>{a.basisLabel}</div>
                    <div>{a.hasData ? <>P75 / P90 <strong>{a.p75.toFixed(1)} / {a.p90.toFixed(1)}</strong></> : "樣本不足"}</div>
                    <div>{a.percentile !== null ? <>第 <strong>{a.percentile}%</strong> 百分位</> : "僅 SLA 提醒"}</div>
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
            <strong style={{ color: C.text }}>① 初步關鍵字分類:</strong>
            系統依關鍵字建議分類,使用者可在週報中手動覆蓋；此處不是 NLP 或正式語意模型。
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ color: C.text }}>② 歷史參照:</strong>
            系統從 database 讀取已解決卡點,優先使用同類歷史；同類少於 5 筆時改用全公司歷史。
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong style={{ color: C.text }}>③ 經驗百分位:</strong>
            直接計算「歷史已解決卡點中,daysToResolve 小於等於目前已卡天數的比例」,不假設常態分佈。
          </div>
          <div>
            <strong style={{ color: C.text }}>④ 風險等級判定:</strong>
            低於 P75 為正常、P75-P90 為關注、P90-P95 為高風險、P95 以上為極高風險；資料不足時只用 SLA 提醒。
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// 決策追蹤頁面
// ============================================================
function Decisions({ decisions, setDecisions, departments = SEED_DEPARTMENTS, userProfile }) {
  const [mode, setMode] = useState("list");
  const [viewing, setViewing] = useState(null);
  const deptNames = allDeptNames(departments);
  const defaultAssignedDept = activeDeptNames(departments)[0] || deptNames[0] || "";
  const [form, setForm] = useState({
    title: "",
    content: "",
    decidedBy: "董事會",
    assignedDept: defaultAssignedDept,
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    if (!deptNames.length) return;
    setForm((prev) => ({
      ...prev,
      assignedDept: deptNames.includes(prev.assignedDept) ? prev.assignedDept : defaultAssignedDept,
    }));
  }, [departments]);

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
    const now = new Date().toISOString();
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
      createdBy: userProfile?.email || form.decidedBy,
      updatedBy: userProfile?.email || form.decidedBy,
      updatedAt: now,
    };
    setDecisions([newDecision, ...decisions]);
    setForm({ title: "", content: "", decidedBy: "董事會", assignedDept: defaultAssignedDept, dueDate: "", notes: "" });
    setMode("list");
  };

  const markDone = (id) => {
    setDecisions(decisions.map((d) =>
      d.id === id ? { ...d, status: "已完成", completedAt: new Date().toISOString().slice(0, 10), updatedBy: userProfile?.email || d.decidedBy, updatedAt: new Date().toISOString() } : d
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
                {deptNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
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

      {/* B3. 決策模式深度分析 */}
      {(() => {
        const patterns = analyzeDecisionPatterns(decisions);
        if (!patterns) return null;
        return (
          <Card style={{ padding: 20, marginBottom: 20 }}>
            <SectionTitle color={C.purple} hint="協助管理層反思自身決策節奏">
              決策模式深度分析(B3)
            </SectionTitle>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 16,
            }}>
              {[
                { label: "平均執行時長", value: patterns.avgExecutionDays + " 天", color: C.text },
                { label: "中位數執行時長", value: patterns.medianExecutionDays + " 天", color: C.text },
                { label: "最快完成", value: patterns.fastestExecution + " 天", color: C.success },
                { label: "最慢完成", value: patterns.slowestExecution + " 天", color: C.danger },
              ].map((s) => (
                <div key={s.label} style={{
                  background: C.bg,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid " + C.borderLight,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* 各決議單位的執行特性 */}
              <div>
                <div style={{ fontSize: 12, color: C.textMid, fontWeight: 500, marginBottom: 8 }}>
                  各決議單位的執行特性
                </div>
                <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid " + C.border, color: C.textMid }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>單位</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>件數</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>達成率</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>平均天數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(patterns.sourceStats).map(([k, s]) => (
                      <tr key={k} style={{ borderBottom: "1px solid " + C.borderLight }}>
                        <td style={{ padding: "6px 8px", fontWeight: 500 }}>{k}</td>
                        <td style={{ textAlign: "right", padding: "6px 8px" }}>{s.total}</td>
                        <td style={{
                          textAlign: "right",
                          padding: "6px 8px",
                          color: s.completionRate >= 70 ? C.success : s.completionRate >= 50 ? C.warn : C.danger,
                          fontWeight: 600,
                        }}>{s.completionRate}%</td>
                        <td style={{ textAlign: "right", padding: "6px 8px", color: C.textMid }}>{s.avgDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 各部門的執行特性 */}
              <div>
                <div style={{ fontSize: 12, color: C.textMid, fontWeight: 500, marginBottom: 8 }}>
                  各執行部門的承接特性
                </div>
                <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid " + C.border, color: C.textMid }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>部門</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>件數</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>達成率</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>平均天數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(patterns.deptStats).map(([k, s]) => (
                      <tr key={k} style={{ borderBottom: "1px solid " + C.borderLight }}>
                        <td style={{ padding: "6px 8px", fontWeight: 500 }}>{k}</td>
                        <td style={{ textAlign: "right", padding: "6px 8px" }}>{s.total}</td>
                        <td style={{
                          textAlign: "right",
                          padding: "6px 8px",
                          color: s.completionRate >= 70 ? C.success : s.completionRate >= 50 ? C.warn : C.danger,
                          fontWeight: 600,
                        }}>{s.completionRate}%</td>
                        <td style={{ textAlign: "right", padding: "6px 8px", color: C.textMid }}>{s.avgDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              marginTop: 14,
              padding: "10px 12px",
              background: C.purpleLight,
              borderRadius: 6,
              fontSize: 11,
              color: "#3C3489",
              lineHeight: 1.7,
            }}>
              <strong>📊 模式洞察:</strong>
              {(() => {
                const sources = Object.entries(patterns.sourceStats).sort((a, b) => b[1].completionRate - a[1].completionRate);
                const depts = Object.entries(patterns.deptStats).sort((a, b) => b[1].completionRate - a[1].completionRate);
                const bestSource = sources[0]?.[0];
                const worstDept = depts[depts.length - 1]?.[0];
                return `${bestSource}的決策達成率最高 (${sources[0]?.[1].completionRate}%);${worstDept}的決策執行壓力較大,值得管理層深入了解原因。`;
              })()}
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
function EmployeeLoad({ reports, handoffs, decisions, employees = SEED_EMPLOYEES }) {
  const [selected, setSelected] = useState(null);
  const [oneOnOneCard, setOneOnOneCard] = useState(null);
  const loads = useMemo(() => analyzeEmployeeLoad(reports, handoffs, employees), [reports, handoffs, employees]);

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

              {/* 部門週報繳交狀態(週報以部門為單位,非個人) */}
              {(() => {
                const deptReport = reports.find((r) =>
                  r.dept === selected.dept && r.week === getLatestWeek(reports)
                );
                const deptHasReport = !!deptReport;
                const isAuthor = deptReport && deptReport.author === selected.name;
                return (
                  <div style={{
                    padding: "10px 12px",
                    background: deptHasReport ? C.successLight : C.warnLight,
                    borderRadius: 6,
                    fontSize: 12,
                    color: deptHasReport ? C.success : "#6B4A1F",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    {deptHasReport ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <div>
                      <div>本週{selected.dept}週報:{deptHasReport ? "已繳交" : "尚未繳交"}</div>
                      {deptHasReport && (
                        <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
                          {isAuthor
                            ? "由本人代表部門填寫"
                            : `由${deptReport.author}代表填寫`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* B4. 員工成長追蹤 */}
              {(() => {
                const growth = analyzeEmployeeGrowth(selected, reports);
                if (!growth.hasData) return null;

                const max = Math.max(...growth.weeklyMetrics.map((m) => m.complexityScore), 1);
                const isGrowth = growth.growthDirection === "成長";
                const isDecline = growth.growthDirection === "下降";

                return (
                  <div style={{ marginTop: 14 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}>
                      <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500 }}>
                        📈 任務複雜度演進(B4 成長追蹤)
                      </div>
                      <Pill tone={isGrowth ? "teal" : isDecline ? "warn" : "neutral"}>
                        {growth.growthDirection} {parseFloat(growth.growthRate) > 0 ? "+" : ""}{growth.growthRate}%
                      </Pill>
                    </div>

                    <div style={{
                      padding: 12,
                      background: C.bg,
                      borderRadius: 6,
                      border: "1px solid " + C.borderLight,
                    }}>
                      {/* 趨勢圖 */}
                      <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        height: 70,
                        gap: 3,
                        marginBottom: 8,
                      }}>
                        {growth.weeklyMetrics.map((m, i) => (
                          <div key={i} style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}>
                            <div style={{
                              width: "100%",
                              height: (m.complexityScore / max) * 50 || 2,
                              background: C.purple,
                              opacity: 0.4 + (i / growth.weeklyMetrics.length) * 0.6,
                              borderRadius: "2px 2px 0 0",
                            }} title={`${m.week}: 複雜度 ${m.complexityScore.toFixed(1)}`}/>
                            <div style={{ fontSize: 9, color: C.textLight, marginTop: 3 }}>
                              {m.week.replace("第 ", "W")}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 6,
                        fontSize: 10,
                      }}>
                        <div style={{ textAlign: "center", padding: "4px 6px", background: "white", borderRadius: 4 }}>
                          <div style={{ color: C.textLight }}>每週案件數</div>
                          <div style={{ fontWeight: 600 }}>{growth.avgCaseCount}</div>
                        </div>
                        <div style={{ textAlign: "center", padding: "4px 6px", background: "white", borderRadius: 4 }}>
                          <div style={{ color: C.textLight }}>關鍵字多元性</div>
                          <div style={{ fontWeight: 600 }}>{growth.avgKeywordDiversity}</div>
                        </div>
                        <div style={{ textAlign: "center", padding: "4px 6px", background: "white", borderRadius: 4 }}>
                          <div style={{ color: C.textLight }}>跨部門協作</div>
                          <div style={{ fontWeight: 600 }}>{growth.avgCrossDept}</div>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 8,
                        padding: "6px 10px",
                        background: "white",
                        borderRadius: 4,
                        fontSize: 10,
                        color: C.textMid,
                        lineHeight: 1.6,
                      }}>
                        前 {Math.ceil(growth.weeklyMetrics.length / 2)} 週平均複雜度 <strong>{growth.earlyComplexity}</strong>
                        → 後 {Math.floor(growth.weeklyMetrics.length / 2)} 週 <strong>{growth.lateComplexity}</strong>
                        {isGrowth && <span style={{ color: C.success }}> · 任務難度持續上升,展現能力擴張</span>}
                        {isDecline && <span style={{ color: C.warn }}> · 任務複雜度下降,值得關注</span>}
                        {!isGrowth && !isDecline && <span> · 工作模式穩定</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}

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

              {/* C3. 產出 1-on-1 準備卡按鈕 */}
              <div style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid " + C.borderLight,
                display: "flex",
                justifyContent: "center",
              }}>
                <Button
                  variant="primary"
                  icon={FileText}
                  onClick={() => {
                    setOneOnOneCard(generateOneOnOneCard(selected, reports, handoffs, decisions, employees));
                  }}
                >
                  📋 產出 1-on-1 準備卡
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* C3. 1-on-1 準備卡 Modal */}
      <Modal
        open={!!oneOnOneCard}
        onClose={() => setOneOnOneCard(null)}
        title={oneOnOneCard ? `${oneOnOneCard.employee.name} 1-on-1 準備卡` : ""}
        subtitle={oneOnOneCard ? `產出於 ${oneOnOneCard.generatedAt} · 適用於本週 1-on-1 對談` : ""}
        maxWidth={680}
      >
        {oneOnOneCard && (
          <div>
            {/* 簡介 */}
            <div style={{
              padding: "12px 14px",
              background: C.accentLight,
              borderRadius: 6,
              fontSize: 12,
              color: C.accent,
              marginBottom: 16,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}>
              <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ lineHeight: 1.7 }}>
                此準備卡由系統根據該員工近期週報、交接、負載資料自動產出,
                依據 Andy Grove《High Output Management》理念,協助主管做有準備的 1-on-1 對談。
              </div>
            </div>

            {/* 近況概覽 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 6 }}>
                👤 近況概覽
              </div>
              <div style={{
                padding: "12px 14px",
                background: C.bg,
                borderRadius: 6,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                fontSize: 12,
              }}>
                <div>
                  <div style={{ color: C.textLight, fontSize: 10 }}>部門 / 職稱</div>
                  <div style={{ fontWeight: 500 }}>{oneOnOneCard.employee.dept}</div>
                  <div style={{ color: C.textMid, fontSize: 11 }}>{oneOnOneCard.employee.role}</div>
                </div>
                {oneOnOneCard.myLoad && (
                  <div>
                    <div style={{ color: C.textLight, fontSize: 10 }}>本週負載</div>
                    <div style={{ fontWeight: 600 }}>
                      {oneOnOneCard.myLoad.loadScore} 分
                    </div>
                    <Pill tone={
                      oneOnOneCard.myLoad.level === "overload" ? "danger" :
                      oneOnOneCard.myLoad.level === "high" ? "warn" :
                      oneOnOneCard.myLoad.level === "normal" ? "teal" : "neutral"
                    }>
                      {loadLevelInfo(oneOnOneCard.myLoad.level).label}
                    </Pill>
                  </div>
                )}
                {oneOnOneCard.growth.hasData && (
                  <div>
                    <div style={{ color: C.textLight, fontSize: 10 }}>能力曲線</div>
                    <div style={{ fontWeight: 500 }}>
                      {oneOnOneCard.growth.growthDirection}
                    </div>
                    <div style={{ color: C.textMid, fontSize: 11 }}>
                      {parseFloat(oneOnOneCard.growth.growthRate) > 0 ? "+" : ""}
                      {oneOnOneCard.growth.growthRate}% (8 週)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 他在忙什麼 */}
            {oneOnOneCard.cases && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 6 }}>
                  💼 他在忙什麼(本週週報)
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.bg,
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}>
                  {oneOnOneCard.cases}
                </div>
              </div>
            )}

            {/* 卡點 */}
            {oneOnOneCard.blockers && oneOnOneCard.blockers.trim() && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 6 }}>
                  ⚠️ 他遇到的卡點
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.warnLight,
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "#7A4900",
                }}>
                  {oneOnOneCard.blockers}
                </div>
              </div>
            )}

            {/* 需協助 */}
            {oneOnOneCard.needHelp && oneOnOneCard.needHelp.trim() && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 6 }}>
                  🤝 他需要協助
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.purpleLight,
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "#3C3489",
                }}>
                  {oneOnOneCard.needHelp}
                </div>
              </div>
            )}

            {/* 建議談話主題 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 6 }}>
                💬 系統推薦談話主題
              </div>
              <div style={{
                padding: "12px 14px",
                background: C.successLight,
                borderRadius: 6,
                border: "1px dashed " + C.success,
              }}>
                {oneOnOneCard.topics.map((t, i) => (
                  <div key={i} style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 12,
                    color: C.success,
                    lineHeight: 1.7,
                    marginBottom: i < oneOnOneCard.topics.length - 1 ? 6 : 0,
                  }}>
                    <span style={{ flexShrink: 0 }}>{t.icon}</span>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 歷史軌跡 */}
            {oneOnOneCard.growth.hasData && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 6 }}>
                  📈 歷史軌跡(過去 8 週)
                </div>
                <div style={{
                  padding: "10px 12px",
                  background: C.bg,
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: C.textMid,
                }}>
                  任務複雜度:<strong>{oneOnOneCard.growth.earlyComplexity}</strong>
                  → <strong>{oneOnOneCard.growth.lateComplexity}</strong>
                  ({oneOnOneCard.growth.growthDirection} {parseFloat(oneOnOneCard.growth.growthRate) > 0 ? "+" : ""}{oneOnOneCard.growth.growthRate}%)
                  · 共填寫 {oneOnOneCard.growth.totalReports} 份週報
                </div>
              </div>
            )}

            {/* 管理建議 */}
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)",
              borderRadius: 6,
              fontSize: 12,
              color: "white",
              lineHeight: 1.8,
              marginBottom: 16,
            }}>
              <strong>🎯 管理建議:</strong>
              <br />
              {oneOnOneCard.managementAdvice}
            </div>

            {/* 操作按鈕 */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button
                variant="secondary"
                icon={Paperclip}
                onClick={() => {
                  navigator.clipboard.writeText(oneOnOneCard.textVersion);
                  alert("準備卡內容已複製到剪貼簿,可貼至 Notion 或筆記軟體");
                }}
              >
                複製文字版
              </Button>
              <Button variant="primary" onClick={() => setOneOnOneCard(null)}>
                完成
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================================
// 組織分析頁(B1 + B2)
// ============================================================
function OrgAnalytics({ reports, activityHistory, departments = SEED_DEPARTMENTS }) {
  const network = useMemo(() => analyzeDeptNetwork(reports, departments), [reports, departments]);
  const predictions = useMemo(() => predictNextWeek(activityHistory, departments), [activityHistory, departments]);
  const [selectedDept, setSelectedDept] = useState(null);

  // 計算 SVG 上各部門的位置(等距三角形)
  const W = 540, H = 380;
  const centerX = W / 2, centerY = H / 2 + 10;
  const radius = 130;
  const positions = {};
  network.depts.forEach((d, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI / network.depts.length);
    positions[d] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const maxWeight = Math.max(...network.edges.map((e) => e.weight), 1);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
          ORGANIZATION ANALYTICS
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0" }}>組織分析</h1>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
          部門互動網絡 + 趨勢預警 · 協助管理層掌握組織協作健康度
        </div>
      </div>

      {/* B1. 部門互動網絡圖 */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionTitle color={C.purple} hint="從週報文字中萃取部門間協作頻率">
          部門互動網絡(B1)
        </SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* SVG 網絡圖 */}
          <div style={{
            background: C.bg,
            borderRadius: 8,
            border: "1px solid " + C.borderLight,
            padding: 8,
          }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
              {/* 連線(箭頭) */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={C.purple} />
                </marker>
              </defs>

              {network.edges.map((e, i) => {
                const from = positions[e.from];
                const to = positions[e.to];
                // 偏移端點避免覆蓋圓形
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offsetRatio = 42 / dist;
                // 加入弧度效果(雙向時不重疊)
                const reverseExists = network.edges.find((re) => re.from === e.to && re.to === e.from);
                const curveOffset = reverseExists ? 18 : 0;
                const midX = (from.x + to.x) / 2 + (dy / dist) * curveOffset;
                const midY = (from.y + to.y) / 2 - (dx / dist) * curveOffset;

                const startX = from.x + dx * offsetRatio;
                const startY = from.y + dy * offsetRatio;
                const endX = to.x - dx * offsetRatio;
                const endY = to.y - dy * offsetRatio;

                const strokeWidth = 1 + (e.weight / maxWeight) * 5;
                const opacity = 0.4 + (e.weight / maxWeight) * 0.55;

                return (
                  <g key={i}>
                    <path
                      d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                      fill="none"
                      stroke={C.purple}
                      strokeWidth={strokeWidth}
                      strokeOpacity={opacity}
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={midX}
                      y={midY}
                      fill={C.purple}
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none" }}
                    >
                      <tspan dx="0" dy="0" style={{
                        paintOrder: "stroke",
                        stroke: "white",
                        strokeWidth: 4,
                        strokeLinejoin: "round",
                      }}>{e.weight}</tspan>
                    </text>
                  </g>
                );
              })}

              {/* 節點(部門) */}
              {network.depts.map((d) => {
                const p = positions[d];
                const stat = network.stats[d];
                const total = stat.outgoing + stat.incoming;
                const nodeRadius = 38 + Math.min(15, total * 1.5);
                const isSelected = selectedDept === d;
                return (
                  <g
                    key={d}
                    onClick={() => setSelectedDept(isSelected ? null : d)}
                    style={{ cursor: "pointer" }}
                  >
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={nodeRadius + 6}
                        fill="none"
                        stroke={C.purple}
                        strokeWidth="3"
                        strokeDasharray="6 3"
                        opacity="0.8"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={nodeRadius}
                      fill={isSelected ? C.purple : C.accent}
                      fillOpacity="0.92"
                      stroke="white"
                      strokeWidth="3"
                    />
                    <text
                      x={p.x}
                      y={p.y - 4}
                      fill="white"
                      fontSize="13"
                      fontWeight="600"
                      textAnchor="middle"
                      style={{ pointerEvents: "none" }}
                    >
                      {d.replace("部", "")}
                    </text>
                    <text
                      x={p.x}
                      y={p.y + 12}
                      fill="white"
                      fontSize="10"
                      fontWeight="400"
                      textAnchor="middle"
                      opacity="0.8"
                      style={{ pointerEvents: "none" }}
                    >
                      ↑{stat.outgoing} ↓{stat.incoming}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div style={{ fontSize: 11, color: C.textLight, textAlign: "center", marginTop: 4 }}>
              節點大小 = 互動總量 · 線條粗細 = 互動次數 · 數字 = 該方向提及次數 · <strong>點節點查看詳情</strong>
            </div>

            {/* 選中部門的詳情面板 */}
            {selectedDept && (() => {
              const stat = network.stats[selectedDept];
              const outEdges = network.edges.filter((e) => e.from === selectedDept).sort((a, b) => b.weight - a.weight);
              const inEdges = network.edges.filter((e) => e.to === selectedDept).sort((a, b) => b.weight - a.weight);
              const total = stat.outgoing + stat.incoming;
              const tone = total >= 8 ? "danger" : total >= 4 ? "warn" : "teal";
              return (
                <div style={{
                  marginTop: 12,
                  padding: "14px 16px",
                  background: C.purpleLight,
                  borderRadius: 8,
                  border: "1px solid " + C.purple + "40",
                  animation: "fadeIn 0.15s ease-out",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#3C3489" }}>
                      {selectedDept} · 協作詳情
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Pill tone={tone}>互動共 {total} 次</Pill>
                      <span
                        onClick={() => setSelectedDept(null)}
                        style={{ cursor: "pointer", color: C.textLight, fontSize: 12, marginLeft: 4 }}
                      >✕</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#5A5090", fontWeight: 600, marginBottom: 6 }}>
                        ↑ 主動請求協助（{stat.outgoing} 次）
                      </div>
                      {outEdges.length === 0 ? (
                        <div style={{ fontSize: 11, color: C.textMid }}>無記錄</div>
                      ) : outEdges.map((e, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "5px 8px", background: "white", borderRadius: 4,
                          marginBottom: 4, fontSize: 12,
                        }}>
                          <span>→ {e.to}</span>
                          <Pill tone="purple">{e.weight} 次</Pill>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#5A5090", fontWeight: 600, marginBottom: 6 }}>
                        ↓ 被其他部門請求（{stat.incoming} 次）
                      </div>
                      {inEdges.length === 0 ? (
                        <div style={{ fontSize: 11, color: C.textMid }}>無記錄</div>
                      ) : inEdges.map((e, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "5px 8px", background: "white", borderRadius: 4,
                          marginBottom: 4, fontSize: 12,
                        }}>
                          <span>← {e.from}</span>
                          <Pill tone="teal">{e.weight} 次</Pill>
                        </div>
                      ))}
                    </div>
                  </div>
                  {outEdges.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 11, color: "#4A3F70", lineHeight: 1.7 }}>
                      💡 最常請求協助的對象為 <strong>{outEdges[0].to}</strong>（{outEdges[0].weight} 次），
                      {inEdges.length > 0 ? `最常被 ${inEdges[0].from} 請求（${inEdges[0].weight} 次）。` : "尚無部門主動請求本部門協助。"}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 數據摘要 */}
          <div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8, fontWeight: 500 }}>
              各部門協作熱度
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {network.depts.map((d) => {
                const s = network.stats[d];
                const total = s.outgoing + s.incoming;
                const tone = total >= 8 ? "danger" : total >= 4 ? "warn" : "teal";
                return (
                  <div key={d} style={{
                    padding: "10px 12px",
                    background: C.bg,
                    borderRadius: 6,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{d}</span>
                      <Pill tone={tone}>{total} 次</Pill>
                    </div>
                    <div style={{ fontSize: 11, color: C.textMid }}>
                      請求他人 {s.outgoing} 次 · 被請求 {s.incoming} 次
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: 12,
              background: C.purpleLight,
              borderRadius: 6,
              fontSize: 11,
              color: "#3C3489",
              lineHeight: 1.7,
            }}>
              <strong>💡 解讀:</strong>
              {(() => {
                const sortedByTotal = [...network.depts].sort((a, b) => {
                  const ta = network.stats[a].outgoing + network.stats[a].incoming;
                  const tb = network.stats[b].outgoing + network.stats[b].incoming;
                  return tb - ta;
                });
                return `${sortedByTotal[0]}是最活躍的協作節點,顯示其在跨部門案件中扮演重要角色。`;
              })()}
            </div>
          </div>
        </div>
      </Card>

      {/* B2. 趨勢預警(下週預測) */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionTitle color={C.warn} hint="基於 8 週歷史的線性回歸外推">
          下週趨勢預警(B2)
        </SectionTitle>

        {predictions.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: C.textLight, fontSize: 13 }}>
            ✓ 各部門指標目前處於穩定範圍,無顯著上升趨勢
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {predictions.map((p, i) => {
              const color = riskLevelColor(p.severity === "high" ? "high" : "medium");
              return (
                <div key={i} style={{
                  padding: "14px 16px",
                  background: color.bg,
                  border: "1px solid " + color.fg + "30",
                  borderRadius: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: color.fg, marginBottom: 4 }}>
                        🔮 預計下週:{p.dept}「{p.metricLabel}」{p.direction}
                      </div>
                      <div style={{ fontSize: 11, color: color.fg, opacity: 0.85 }}>
                        模型:線性回歸外推 · 信心度 {Math.round(p.confidence)}%
                      </div>
                    </div>
                    <Pill tone={p.severity === "high" ? "warn" : "purple"}>
                      z = +{p.z}σ
                    </Pill>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 6,
                    fontSize: 11,
                  }}>
                    <div style={{
                      padding: "6px 8px",
                      background: "white",
                      borderRadius: 4,
                      textAlign: "center",
                    }}>
                      <div style={{ color: C.textMid, fontSize: 10 }}>下週預測</div>
                      <div style={{ fontWeight: 600, color: color.fg }}>{p.predicted}</div>
                    </div>
                    <div style={{
                      padding: "6px 8px",
                      background: "white",
                      borderRadius: 4,
                      textAlign: "center",
                    }}>
                      <div style={{ color: C.textMid, fontSize: 10 }}>近 3 週均</div>
                      <div style={{ fontWeight: 600 }}>{p.recentAvg}</div>
                    </div>
                    <div style={{
                      padding: "6px 8px",
                      background: "white",
                      borderRadius: 4,
                      textAlign: "center",
                    }}>
                      <div style={{ color: C.textMid, fontSize: 10 }}>8 週均</div>
                      <div style={{ fontWeight: 600 }}>{p.overallAvg}</div>
                    </div>
                    <div style={{
                      padding: "6px 8px",
                      background: "white",
                      borderRadius: 4,
                      textAlign: "center",
                    }}>
                      <div style={{ color: C.textMid, fontSize: 10 }}>趨勢斜率</div>
                      <div style={{ fontWeight: 600, color: parseFloat(p.slope) > 0 ? C.danger : C.success }}>
                        {parseFloat(p.slope) > 0 ? "+" : ""}{p.slope}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 方法論 */}
      <Card style={{ padding: 18, background: C.bg }}>
        <SectionTitle color={C.textMid}>分析方法論</SectionTitle>
        <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: C.text }}>① 部門互動網絡(B1):</strong>
            從週報內容中,以正則匹配抽取每位填寫者提及其他部門的頻率,構成部門間的鄰接矩陣 (adjacency matrix),並以圖論視覺化呈現。
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: C.text }}>② 趨勢預警(B2):</strong>
            對過去 8 週活動量做最小平方法線性回歸,計算斜率與截距,外推至下一週。同時計算預測值相對於歷史的 z-score,當 z ≥ 0.8 時觸發警示。
          </div>
          <div>
            <strong style={{ color: C.text }}>③ 信心度估計:</strong>
            基於斜率的絕對值與 z-score 的綜合指標,反映模型對該預測的把握程度。
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// E 系列. 會議準備頁
// ============================================================
function MeetingPrep({ reports, handoffs, decisions, blockerHistory, blockers = [], customMeetings, setCustomMeetings, meetingHistory, setMeetingHistory, employees = SEED_EMPLOYEES, departments = SEED_DEPARTMENTS, userProfile }) {
  const [selectedMeeting, setSelectedMeeting] = useState("weekly");
  const [showAgenda, setShowAgenda] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewHistoryItem, setViewHistoryItem] = useState(null);

  // 新增會議的表單 state
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    schedule: "",
    audience: "",
    duration: 60,
    icon: "📋",
    type: "custom",
    notes: "",
  });

  const meetings = [
    { id: "weekly", title: "管理層週會", schedule: "週一 09:00", icon: "📅", color: C.accent },
    { id: "investment", title: "投資委員會", schedule: "週三 14:00", icon: "💼", color: C.purple },
    { id: "operations", title: "營運會議", schedule: "週五 10:00", icon: "⚙️", color: C.success },
    ...(customMeetings || []).map((m) => ({
      id: m.id,
      title: m.title,
      schedule: m.schedule,
      icon: m.icon || "📋",
      color: C.highlight,
      isCustom: true,
      ...m,
    })),
  ];

  const isPredefined = ["weekly", "investment", "operations"].includes(selectedMeeting);
  const customMeetingData = customMeetings?.find((m) => m.id === selectedMeeting);

  const currentMeeting = useMemo(() => {
    if (isPredefined) {
      return generateMeetingAgenda(selectedMeeting, reports, handoffs, decisions, blockerHistory, blockers, employees, departments);
    }
    if (customMeetingData) {
      // 自訂會議的議程
      const agenda = customMeetingData.agendaItems || [
        {
          title: "會議重點",
          duration: customMeetingData.duration || 60,
          bullets: customMeetingData.notes ? customMeetingData.notes.split("\n").filter((s) => s.trim()) : ["待補充議程內容"],
          reasoning: "由使用者自訂的會議議題",
          direction: "依會議主題討論",
        },
      ];
      const lines = [];
      lines.push(`【${customMeetingData.title} 議程】`);
      lines.push(`時間:${customMeetingData.schedule}`);
      lines.push(`與會:${customMeetingData.audience || "未指定"}`);
      lines.push(`預估時長:${customMeetingData.duration || 60} 分鐘`);
      lines.push("");
      agenda.forEach((item, i) => {
        lines.push(`${i + 1}. ${item.title} (${item.duration} 分鐘)`);
        item.bullets.forEach((b) => lines.push(`   • ${b}`));
        lines.push("");
      });
      return {
        ...customMeetingData,
        type: "custom",
        agenda,
        totalDuration: customMeetingData.duration || 60,
        textVersion: lines.join("\n"),
        hoursUntil: 0, // 自訂會議不計算
      };
    }
    return null;
  }, [selectedMeeting, reports, handoffs, decisions, blockerHistory, blockers, employees, departments, isPredefined, customMeetingData]);

  // 新增會議
  const handleAddMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.schedule.trim()) {
      alert("請至少填寫會議名稱和時間");
      return;
    }
    const id = "custom-" + Date.now();
    const now = new Date().toISOString();
    const meeting = { ...newMeeting, id, createdAt: now, updatedAt: now, createdBy: userProfile?.email || "current-user", updatedBy: userProfile?.email || "current-user" };
    setCustomMeetings([...(customMeetings || []), meeting]);
    setSelectedMeeting(id);
    setShowAddModal(false);
    setNewMeeting({ title: "", schedule: "", audience: "", duration: 60, icon: "📋", type: "custom", notes: "" });
  };

  // 移除自訂會議
  const handleDeleteCustom = (id) => {
    if (!confirm("確定要移除這個自訂會議嗎?(會同步歸檔到歷史)")) return;
    const meeting = customMeetings.find((m) => m.id === id);
    if (meeting) {
      // 歸檔到歷史
      const archived = {
        ...meeting,
        archivedAt: new Date().toISOString().slice(0, 10),
        archivedBy: userProfile?.email || "current-user",
      };
      setMeetingHistory([archived, ...(meetingHistory || [])]);
    }
    setCustomMeetings(customMeetings.filter((m) => m.id !== id));
    if (selectedMeeting === id) setSelectedMeeting("weekly");
  };

  // 歸檔目前會議到歷史
  const handleArchiveCurrent = () => {
    if (!currentMeeting) return;
    const archived = {
      id: "archive-" + Date.now(),
      title: currentMeeting.title,
      schedule: currentMeeting.schedule,
      audience: currentMeeting.audience,
      icon: currentMeeting.icon,
      archivedAt: new Date().toISOString().slice(0, 10),
      archivedBy: userProfile?.email || "current-user",
      agendaSnapshot: currentMeeting.agenda,
      textSnapshot: currentMeeting.textVersion,
    };
    setMeetingHistory([archived, ...(meetingHistory || [])]);
    alert(`「${currentMeeting.title}」議程快照已歸檔到歷史`);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1.5, fontWeight: 500 }}>
            MEETING PREPARATION
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "4px 0 0", color: C.text }}>
            會議準備中心
          </h1>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>
            系統根據資料自動生成議程 · 援引 Andy Grove 會議準備理論
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" icon={Search} size="sm" onClick={() => setShowHistory(true)}>
            歷史紀錄 ({(meetingHistory || []).length})
          </Button>
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setShowAddModal(true)}>
            新增會議
          </Button>
        </div>
      </div>

      {/* 即將到來的會議列表 */}
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <SectionTitle color={C.highlight} hint="自動偵測下次會議時間 · 點選查看議程">
          📌 會議排程
        </SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {meetings.map((m) => {
            const isSelected = selectedMeeting === m.id;
            const isCustom = m.isCustom;
            let hoursUntil = 0;
            if (!isCustom) {
              const meetingData = generateMeetingAgenda(m.id, reports, handoffs, decisions, blockerHistory, blockers, employees, departments);
              hoursUntil = meetingData?.hoursUntil || 0;
            }
            const urgency = isCustom ? null : (hoursUntil < 24 ? "imminent" : hoursUntil < 72 ? "soon" : "later");
            const urgencyColor = urgency === "imminent" ? C.danger : urgency === "soon" ? C.warn : C.textMid;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMeeting(m.id)}
                style={{
                  padding: "14px 16px",
                  background: isSelected ? m.color + "15" : C.bg,
                  border: "2px solid " + (isSelected ? m.color : "transparent"),
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {isCustom && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustom(m.id);
                    }}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      fontSize: 14,
                      color: C.textLight,
                      cursor: "pointer",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 4,
                    }}
                    title="移除並歸檔"
                  >
                    ×
                  </div>
                )}
                <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2, paddingRight: isCustom ? 16 : 0 }}>
                  {m.title}
                  {isCustom && <span style={{ fontSize: 9, color: C.highlight, marginLeft: 6 }}>自訂</span>}
                </div>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 6 }}>
                  {m.schedule}
                </div>
                {!isCustom && (
                  <div style={{ fontSize: 10, color: urgencyColor, fontWeight: 500 }}>
                    ⏱ {hoursUntil} 小時後
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 選定會議的議程 */}
      {currentMeeting && (
        <Card style={{ padding: 22 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "1px solid " + C.borderLight,
          }}>
            <div>
              <div style={{ fontSize: 11, color: C.textLight, letterSpacing: 1, marginBottom: 4 }}>
                AGENDA · 議程
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                {currentMeeting.icon} {currentMeeting.title}
              </div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>
                {currentMeeting.schedule} · 預計 {currentMeeting.totalDuration} 分鐘
                {currentMeeting.audience && ` · 與會:${currentMeeting.audience}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                icon={Paperclip}
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(currentMeeting.textVersion);
                  alert("議程內容已複製到剪貼簿,可貼至 LINE / Email");
                }}
              >
                複製
              </Button>
              <Button
                variant="primary"
                icon={Check}
                size="sm"
                onClick={handleArchiveCurrent}
              >
                歸檔
              </Button>
            </div>
          </div>

          {/* 議程項目 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {currentMeeting.agenda.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  background: C.bg,
                  borderRadius: 8,
                  border: "1px solid " + C.borderLight,
                  borderLeft: "3px solid " + C.highlight,
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      {i + 1}. {item.title}
                    </div>
                  </div>
                  <Pill tone="highlight">⏱ {item.duration} 分鐘</Pill>
                </div>

                {/* 議題重點 */}
                <ul style={{ marginTop: 6, marginBottom: 8, paddingLeft: 20 }}>
                  {item.bullets.map((b, j) => (
                    <li key={j} style={{
                      fontSize: 12,
                      color: C.textMid,
                      lineHeight: 1.7,
                      marginBottom: 2,
                    }}>
                      {b}
                    </li>
                  ))}
                </ul>

                {item.reasoning && (
                  <div style={{
                    fontSize: 11,
                    color: C.textLight,
                    fontStyle: "italic",
                    marginBottom: 6,
                    padding: "4px 8px",
                    background: "rgba(184, 84, 80, 0.04)",
                    borderRadius: 4,
                  }}>
                    💭 為什麼討論:{item.reasoning}
                  </div>
                )}

                {item.direction && (
                  <div style={{
                    fontSize: 11,
                    color: C.accent,
                    padding: "6px 10px",
                    background: C.accentLight,
                    borderRadius: 4,
                    fontWeight: 500,
                  }}>
                    → 建議方向:{item.direction}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 方法論引用(僅預定義會議顯示) */}
          {isPredefined && (
            <div style={{
              marginTop: 16,
              padding: "12px 14px",
              background: C.bg,
              border: "1px solid " + C.borderLight,
              borderRadius: 6,
              fontSize: 11,
              color: C.textMid,
              lineHeight: 1.8,
            }}>
              <strong style={{ color: C.text }}>📚 方法論引用:</strong>
              本系統會議準備援引 Andy Grove《High Output Management》:「<em>會議的價值取決於準備品質,
              一個準備充分的 1 小時會議勝過 3 個漫無目的的 2 小時會議。</em>」
              並結合 Amazon「6 頁備忘錄文化」——讓與會者進場前已知道議題、背景與決議方向。
            </div>
          )}
        </Card>
      )}

      {/* 新增會議 Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增會議"
        subtitle="建立自訂會議,讓系統幫您整理議程"
        maxWidth={520}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: C.textMid, fontWeight: 500, display: "block", marginBottom: 4 }}>
              會議名稱 <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              placeholder="例:Q4 策略討論會"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid " + C.border,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.textMid, fontWeight: 500, display: "block", marginBottom: 4 }}>
              時間 <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              type="text"
              value={newMeeting.schedule}
              onChange={(e) => setNewMeeting({ ...newMeeting, schedule: e.target.value })}
              placeholder="例:11/05 週三 14:00"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid " + C.border,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.textMid, fontWeight: 500, display: "block", marginBottom: 4 }}>
              與會者
            </label>
            <input
              type="text"
              value={newMeeting.audience}
              onChange={(e) => setNewMeeting({ ...newMeeting, audience: e.target.value })}
              placeholder="例:董事長、投研部主管、業務經理"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid " + C.border,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.textMid, fontWeight: 500, display: "block", marginBottom: 4 }}>
                預估時長(分鐘)
              </label>
              <input
                type="number"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) || 60 })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid " + C.border,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMid, fontWeight: 500, display: "block", marginBottom: 4 }}>
                圖示
              </label>
              <select
                value={newMeeting.icon}
                onChange={(e) => setNewMeeting({ ...newMeeting, icon: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid " + C.border,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              >
                <option value="📋">📋 一般</option>
                <option value="💰">💰 財務</option>
                <option value="📊">📊 報告</option>
                <option value="🎯">🎯 策略</option>
                <option value="🤝">🤝 對外</option>
                <option value="🎓">🎓 教育訓練</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.textMid, fontWeight: 500, display: "block", marginBottom: 4 }}>
              議程要點(每行一項)
            </label>
            <textarea
              value={newMeeting.notes}
              onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
              placeholder={"例:\nQ4 業務目標檢視\n各部門資源分配\n11 月人員配置"}
              rows={4}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1px solid " + C.border,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button variant="primary" icon={Check} onClick={handleAddMeeting}>
              建立會議
            </Button>
          </div>
        </div>
      </Modal>

      {/* 歷史紀錄 Modal */}
      <Modal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="會議歷史紀錄"
        subtitle={`共 ${(meetingHistory || []).length} 筆已歸檔會議`}
        maxWidth={600}
      >
        {(!meetingHistory || meetingHistory.length === 0) ? (
          <div style={{ padding: 30, textAlign: "center", color: C.textLight, fontSize: 13 }}>
            尚無歷史紀錄。完成的會議可透過上方「歸檔」按鈕儲存議程快照。
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "60vh", overflowY: "auto" }}>
            {meetingHistory.map((h) => (
              <Card
                key={h.id}
                style={{ padding: "12px 14px", cursor: "pointer" }}
                onClick={() => setViewHistoryItem(h)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    {h.icon || "📋"} {h.title}
                  </div>
                  <span style={{ fontSize: 10, color: C.textLight }}>{h.archivedAt}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMid }}>
                  {h.schedule} {h.audience && `· ${h.audience}`}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* 查看歷史紀錄詳情 */}
      <Modal
        open={!!viewHistoryItem}
        onClose={() => setViewHistoryItem(null)}
        title={viewHistoryItem ? `${viewHistoryItem.icon || "📋"} ${viewHistoryItem.title}` : ""}
        subtitle={viewHistoryItem && `歸檔於 ${viewHistoryItem.archivedAt}`}
        maxWidth={620}
      >
        {viewHistoryItem && (
          <div>
            <div style={{
              padding: "10px 12px",
              background: C.bg,
              borderRadius: 6,
              fontSize: 12,
              color: C.textMid,
              marginBottom: 14,
            }}>
              <div>📅 時間:{viewHistoryItem.schedule}</div>
              {viewHistoryItem.audience && <div>👥 與會:{viewHistoryItem.audience}</div>}
            </div>

            {viewHistoryItem.agendaSnapshot && viewHistoryItem.agendaSnapshot.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 500, marginBottom: 8 }}>
                  📋 當時議程
                </div>
                {viewHistoryItem.agendaSnapshot.map((item, i) => (
                  <div key={i} style={{
                    padding: "10px 12px",
                    background: C.bg,
                    borderRadius: 6,
                    marginBottom: 6,
                    borderLeft: "2px solid " + C.highlight,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                      {i + 1}. {item.title}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: C.textMid }}>
                      {item.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {viewHistoryItem.textSnapshot && (
              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="secondary"
                  icon={Paperclip}
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(viewHistoryItem.textSnapshot);
                    alert("議程已複製");
                  }}
                >
                  複製議程文字
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
// LINE Bot 模擬
// ============================================================
function LineBot({ reports, handoffs }) {
  const unsigned = handoffs.filter((h) => h.status === "待簽收");
  const deptReports = reports.filter((r) => r.week === getLatestWeek(reports));
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

  // ===== 應用狀態 =====
  const [tab, setTab] = useState("dashboard");
  const [focusHandoffId, setFocusHandoffId] = useState(null);
  const [reports, setReports] = useState(SEED_REPORTS);
  const [handoffs, setHandoffs] = useState(SEED_HANDOFFS);
  const [decisions, setDecisions] = useState(SEED_DECISIONS);
  const [blockers, setBlockers] = useState(SEED_BLOCKERS);
  const [employees, setEmployees] = useState(SEED_EMPLOYEES);
  const [departments, setDepartments] = useState(SEED_DEPARTMENTS);
  const [users, setUsers] = useState(SEED_USERS);
  const [auditLogs, setAuditLogs] = useState([]);
  const [customMeetings, setCustomMeetings] = useState([]);
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [history] = useState(SEED_HISTORY);
  const [blockerHistory] = useState(SEED_BLOCKER_HISTORY);
  const [topicHistory] = useState(SEED_TOPIC_HISTORY);
  const [activityHistory] = useState(SEED_REPORT_ACTIVITY);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | error

  // 使用者角色資訊:優先讀 Firestore users collection,找不到才用安全 fallback。
  const userProfile = useMemo(() => {
    if (!authUser) return null;
    const email = authUser.email || "";
    const userRecord = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase() && u.active !== false);
    if (userRecord) {
      return {
        ...inferUserProfile(email),
        ...userRecord,
        email,
      };
    }
    return { ...inferUserProfile(email), email };
  }, [authUser, users]);

  const auditChange = (collectionName, action, beforeItem, afterItem) => {
    const recordId = afterItem?.id || beforeItem?.id;
    if (!recordId) return;
    const now = new Date().toISOString();
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        collectionName,
        action,
        recordId,
        actorEmail: userProfile?.email || authUser?.email || "unknown",
        actorRole: userProfile?.role || "unknown",
        before: beforeItem || null,
        after: afterItem || null,
        createdAt: now,
      },
      ...prev,
    ].slice(0, 500));
  };

  const makeAuditedSetter = (setter, collectionName) => (updater) => {
    setter((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const prevItems = Array.isArray(prev) ? prev : [];
      const nextItems = Array.isArray(next) ? next : [];
      const prevMap = new Map(prevItems.map((item) => [item.id, item]));
      const nextMap = new Map(nextItems.map((item) => [item.id, item]));

      nextMap.forEach((item, id) => {
        const oldItem = prevMap.get(id);
        if (!oldItem) auditChange(collectionName, "create", null, item);
        else if (JSON.stringify(oldItem) !== JSON.stringify(item)) auditChange(collectionName, "update", oldItem, item);
      });
      prevMap.forEach((item, id) => {
        if (!nextMap.has(id)) auditChange(collectionName, "delete", item, null);
      });

      return next;
    });
  };

  const setReportsAudited = makeAuditedSetter(setReports, "reports");
  const setHandoffsAudited = makeAuditedSetter(setHandoffs, "handoffs");
  const setDecisionsAudited = makeAuditedSetter(setDecisions, "decisions");
  const setBlockersAudited = makeAuditedSetter(setBlockers, "blockers");
  const setCustomMeetingsAudited = makeAuditedSetter(setCustomMeetings, "customMeetings");
  const setMeetingHistoryAudited = makeAuditedSetter(setMeetingHistory, "meetingHistory");

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
        const [r, h, d, b, emp, deptRows, userRows, cm, mh, logs] = await Promise.all([
          fetchDocumentCollection("reports", SEED_REPORTS),
          fetchDocumentCollection("handoffs", SEED_HANDOFFS),
          fetchDocumentCollection("decisions", SEED_DECISIONS),
          fetchDocumentCollection("blockers", []),
          fetchDocumentCollection("employees", SEED_EMPLOYEES),
          fetchDocumentCollection("departments", SEED_DEPARTMENTS),
          fetchDocumentCollection("users", SEED_USERS),
          fetchDocumentCollection("customMeetings", []),
          fetchDocumentCollection("meetingHistory", []),
          fetchDocumentCollection("auditLogs", []),
        ]);
        setReports(r);
        setHandoffs(h);
        setDecisions(d);
        setBlockers(b.length ? b : [...SEED_BLOCKERS, ...createLegacyBlockersFromReports(r)]);
        setEmployees(emp);
        setDepartments(deptRows);
        setUsers(userRows);
        setCustomMeetings(cm);
        setMeetingHistory(mh);
        setAuditLogs(logs);
        setSyncStatus("idle");

        // 偵測雲端歷史搜尋資料是否為舊版(缺 detail 欄位)
        // 如果是,主動提示使用者點重置
        try {
          const histCheck = await fetchDocumentCollection("history", []);
          const needsReset = histCheck.length > 0 && histCheck.every((h) => !h.detail);
          if (needsReset) {
            setTimeout(() => {
              if (window.confirm("偵測到雲端為舊版資料(缺少案件詳情)。\n是否立即重置範例資料以套用最新版?\n\n注意:會清空目前所有資料。")) {
                setReports(SEED_REPORTS);
                setHandoffs(SEED_HANDOFFS);
                setDecisions(SEED_DECISIONS);
                setBlockers(SEED_BLOCKERS);
                setEmployees(SEED_EMPLOYEES);
                setDepartments(SEED_DEPARTMENTS);
                setUsers(SEED_USERS);
              }
            }, 1000);
          }
        } catch (e) {
          // 偵測失敗不影響主流程
        }
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
      saveDocumentCollection("reports", reports).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [reports, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      setSyncStatus("syncing");
      saveDocumentCollection("handoffs", handoffs).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [handoffs, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      setSyncStatus("syncing");
      saveDocumentCollection("decisions", decisions).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [decisions, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      setSyncStatus("syncing");
      saveDocumentCollection("blockers", blockers).then((ok) =>
        setSyncStatus(ok ? "idle" : "error")
      );
    }
  }, [blockers, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      saveDocumentCollection("customMeetings", customMeetings);
    }
  }, [customMeetings, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      saveDocumentCollection("meetingHistory", meetingHistory);
    }
  }, [meetingHistory, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      saveDocumentCollection("employees", employees);
    }
  }, [employees, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      saveDocumentCollection("departments", departments);
    }
  }, [departments, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      saveDocumentCollection("users", users);
    }
  }, [users, dataLoaded, authUser]);

  useEffect(() => {
    if (dataLoaded && authUser) {
      saveDocumentCollection("auditLogs", auditLogs);
    }
  }, [auditLogs, dataLoaded, authUser]);

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
      setBlockers(SEED_BLOCKERS);
      setEmployees(SEED_EMPLOYEES);
      setDepartments(SEED_DEPARTMENTS);
      setUsers(SEED_USERS);
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
    const [r, h, d, b, emp, deptRows, userRows, cm, mh, logs] = await Promise.all([
      fetchDocumentCollection("reports", SEED_REPORTS),
      fetchDocumentCollection("handoffs", SEED_HANDOFFS),
      fetchDocumentCollection("decisions", SEED_DECISIONS),
      fetchDocumentCollection("blockers", []),
      fetchDocumentCollection("employees", SEED_EMPLOYEES),
      fetchDocumentCollection("departments", SEED_DEPARTMENTS),
      fetchDocumentCollection("users", SEED_USERS),
      fetchDocumentCollection("customMeetings", []),
      fetchDocumentCollection("meetingHistory", []),
      fetchDocumentCollection("auditLogs", []),
    ]);
    setReports(r);
    setHandoffs(h);
    setDecisions(d);
    setBlockers(b.length ? b : [...SEED_BLOCKERS, ...createLegacyBlockersFromReports(r)]);
    setEmployees(emp);
    setDepartments(deptRows);
    setUsers(userRows);
    setCustomMeetings(cm);
    setMeetingHistory(mh);
    setAuditLogs(logs);
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
    { id: "orgnetwork", label: "組織分析", icon: TrendingUp, roles: ["admin"] },
    { id: "meetings", label: "會議準備", icon: Calendar, roles: ["admin"] },
    { id: "linebot", label: "LINE Bot", icon: MessageCircle, roles: ["admin", "manager", "member"] },
  ];
  const tabs = allTabs.filter((t) => t.roles.includes(userProfile?.role || "member"));

  // 注意:tab 自動切換邏輯改為直接判斷渲染,避免 hooks 順序問題
  const currentTab = tabs.find((t) => t.id === tab) ? tab : "dashboard";

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
            const active = currentTab === t.id;
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
        {currentTab === "dashboard" && <Dashboard
          reports={reports}
          handoffs={handoffs}
          blockers={blockers}
          setBlockers={setBlockersAudited}
          blockerHistory={blockerHistory}
          decisions={decisions}
          employees={employees}
          departments={departments}
          topicHistory={topicHistory}
          activityHistory={activityHistory}
          onNav={navigateTo}
          userProfile={userProfile}
        />}
        {currentTab === "report" && <WeeklyReport reports={reports} setReports={setReportsAudited} blockers={blockers} setBlockers={setBlockersAudited} userProfile={userProfile} departments={departments} />}
        {currentTab === "handoff" && <Handoff handoffs={handoffs} setHandoffs={setHandoffsAudited} focusId={focusHandoffId} departments={departments} userProfile={userProfile} />}
        {currentTab === "decisions" && <Decisions decisions={decisions} setDecisions={setDecisionsAudited} departments={departments} userProfile={userProfile} />}
        {currentTab === "employees" && <EmployeeLoad reports={reports} handoffs={handoffs} decisions={decisions} employees={employees} />}
        {currentTab === "history" && <History history={history} />}
        {currentTab === "analytics" && <BlockerAnalytics blockerHistory={blockerHistory} blockers={blockers} reports={reports} />}
        {currentTab === "orgnetwork" && <OrgAnalytics reports={reports} activityHistory={activityHistory} departments={departments} />}
        {currentTab === "meetings" && <MeetingPrep
          reports={reports}
          handoffs={handoffs}
          decisions={decisions}
          blockerHistory={blockerHistory}
          blockers={blockers}
          customMeetings={customMeetings}
          setCustomMeetings={setCustomMeetingsAudited}
          meetingHistory={meetingHistory}
          setMeetingHistory={setMeetingHistoryAudited}
          employees={employees}
          departments={departments}
          userProfile={userProfile}
        />}
        {currentTab === "linebot" && <LineBot reports={reports} handoffs={handoffs} />}
      </main>
    </div>
  );
}
