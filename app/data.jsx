// TTQS 19 指標 + 五大關卡 + 課程 + 積分規則
// PDDRO: Plan / Design / Do / Review / Outcome

const STAGES = [
  {
    id: 'P',
    name: '課前規劃',
    subtitle: 'PLAN',
    color: '#4ea8de',
    emoji: '🗺️',
    desc: '了解需求、訂目標、做規劃',
    indicators: [1, 2, 3, 4, 5],
  },
  {
    id: 'D1',
    name: '課程設計',
    subtitle: 'DESIGN',
    color: '#b85fff',
    emoji: '🎨',
    desc: '設計課程內容與學習活動',
    indicators: [6, 7, 8, 9],
  },
  {
    id: 'D2',
    name: '課程執行',
    subtitle: 'DO',
    color: '#7fd858',
    emoji: '⚔️',
    desc: '讓學員真的來上課',
    indicators: [10, 11, 12, 13],
  },
  {
    id: 'R',
    name: '課後查核',
    subtitle: 'REVIEW',
    color: '#ffd23f',
    emoji: '🔍',
    desc: '檢核有沒有照計畫走',
    indicators: [14, 15, 16],
  },
  {
    id: 'O',
    name: '成效成果',
    subtitle: 'OUTCOME',
    color: '#ff5e5b',
    emoji: '🏆',
    desc: '看學習有沒有帶來改變',
    indicators: [17, 18, 19],
  },
];

// 19 項 TTQS 指標（PDDRO）
// 每項：id, name（專業名）, plain（白話一句話）, difficulty（整體取得難度 1-5）
const INDICATORS = [
  // P: 課前規劃 (1-5)
  { id: 1,  stage: 'P',  name: '機構概況與訓練資源', plain: '學院整體規模與訓練投入概況',     difficulty: 2 },
  { id: 2,  stage: 'P',  name: '訓練政策',           plain: '對外公開的訓練方向與政策揭露',   difficulty: 2 },
  { id: 3,  stage: 'P',  name: '核心訓練類別',       plain: '學院主力開哪幾類課、有無趨勢',   difficulty: 4 },
  { id: 4,  stage: 'P',  name: '訓練預算規劃',       plain: '訓練費用如何分配與申請',         difficulty: 3 },
  { id: 5,  stage: 'P',  name: '訓練目標連結',       plain: '課程有對齊公司五大策略主軸',     difficulty: 4 },

  // D1: 課程設計 (6-9)
  { id: 6,  stage: 'D1', name: '人員技能',           plain: '說明學院培訓師的專業以及學院學系如何輔以培訓師所需的訓練',       difficulty: 2 },
  { id: 7,  stage: 'D1', name: '需求設計',           plain: '用一個班說明：資料蒐集、職能分析（GAP 在哪）、需求訪談紀錄、需求調查，以及課程規劃會議或課程計畫書',     difficulty: 5 },
  { id: 8,  stage: 'D1', name: '課程設計',           plain: '以 ADDIE 揭示一門課程規劃的流程：學程或專案計畫書 → 開班計畫表 → 學員課前提問（並融入講師教學的例子）→ 學程品質檢核表 → 評量學員成果 → L1～L4 滿意度調查 → 檢討報告 → 下次精進',       difficulty: 5 },
  { id: 9,  stage: 'D1', name: '利益關係人',         plain: '從 PDDRO 全流程檢視：需求窗口、學員、廠商、行政、老師、老闆、政府官員等利益關係人有參與的環節，都可放佐證，有照片更好',     difficulty: 4 },

  // D2: 課程執行 (10-13)
  { id: 10, stage: 'D2', name: '訓練管理',           plain: '師資、教材、採購有完整制度',     difficulty: 4 },
  { id: 11, stage: 'D2', name: '需求與目標結合',     plain: '課程目標確實對應委訓需求',       difficulty: 4 },
  { id: 12, stage: 'D2', name: '訓練執行',           plain: '從招生、教學到教材完整執行',     difficulty: 3 },
  { id: 13, stage: 'D2', name: '學習成果移轉',       plain: '上完課有考照輔導或學以致用機制', difficulty: 4 },

  // R: 課後查核 (14-16)
  { id: 14, stage: 'R',  name: '系統化',             plain: '有系統做行銷、採購與訓練管理',   difficulty: 2 },
  { id: 15, stage: 'R',  name: '訓練紀錄管理',       plain: '訓練資料有統一保存與查詢機制',   difficulty: 2 },
  { id: 16, stage: 'R',  name: '異常風險',           plain: '突發狀況有通知學員並妥善應變',   difficulty: 3 },

  // O: 成效成果 (17-19)
  { id: 17, stage: 'O',  name: '成果評估',           plain: '反應、學習、行為、成果四層評估', difficulty: 4 },
  { id: 18, stage: 'O',  name: '客戶評價',           plain: '學員或委訓單位給予肯定',         difficulty: 3 },
  { id: 19, stage: 'O',  name: '市場評價',           plain: '在業界的口碑與滿意度表現',       difficulty: 4 },
];

// 積分等級（依取得難度）
const DIFFICULTY_POINTS = {
  1: { points: 5,  label: 'Lv1', name: '撿到的',   color: '#8a8aa3', desc: '系統已有資料' },
  2: { points: 10, label: 'Lv2', name: '整理即可', color: '#7fd858', desc: '簡單整理即可' },
  3: { points: 20, label: 'Lv3', name: '需彙整',   color: '#4ea8de', desc: '需整理/彙整' },
  4: { points: 35, label: 'Lv4', name: '需產出',   color: '#b85fff', desc: '需產出或分析' },
  5: { points: 50, label: 'Lv5', name: '神級材料', color: '#ffd23f', desc: '需設計或訪談' },
};

const UNLOCK_BONUS = 30; // 第一次達成某指標的額外加分

// 範例課程
const COURSES = [
  { id: 'c1', name: '新進人員職前訓練',   icon: '🌱', scheduled: '2026/04/22' },
  { id: 'c2', name: '資安意識提升訓練',   icon: '🛡️', scheduled: '2026/05/03' },
  { id: 'c3', name: '主管領導力工作坊',   icon: '👑', scheduled: '2026/05/18' },
];

// 佐證資料類型 → 自動對應到指標（可一對多）
// 依 PDDRO 五大關卡分組；desc = 佐證說明、unit = 負責單位
const EVIDENCE_TYPES = [
  // ── P 課前規劃 ──────────────────────────────────────────
  {
    id: 'website',      name: '學院官網公告',       icon: '🌐', difficulty: 2, maps: [1, 2],
    unit: '培發',
    desc: '課程揭露（EDM、官網、公佈欄、教學網、開課說明）；AI 課程推薦模組亮點',
  },
  {
    id: 'learning_map', name: '學系學習地圖',       icon: '🗺️', difficulty: 4, maps: [3],
    unit: '學系',
    desc: '三學系學習地圖，呈現各學系課程體系架構',
  },
  {
    id: 'trend_chart',  name: '核心訓練趨勢圖',     icon: '📈', difficulty: 4, maps: [3],
    unit: '學系',
    desc: '近三年核心訓練變化趨勢圖',
  },
  {
    id: 'core_training',name: '核心訓練分析圖',     icon: '📊', difficulty: 5, maps: [3, 5],
    unit: '學系',
    desc: '可說明訓練是否對齊機構屬性／事業發展；可說明培訓規劃與組織策略及重點業務相結合',
  },
  {
    id: 'budget_plan',  name: '訓練預算計畫',       icon: '💰', difficulty: 3, maps: [4],
    unit: '培發',
    desc: '訓練費用預算分配計畫與經費申請記錄',
  },
  {
    id: 'interview',    name: '需求訪談紀錄',       icon: '🎤', difficulty: 3, maps: [5, 7, 11],
    unit: '學系',
    desc: '目標客戶培訓需求調查（中華電信、子公司）；需求訪談記錄及課程規劃會議',
  },
  {
    id: 'cert_program', name: '學程認證計劃書',     icon: '📋', difficulty: 5, maps: [5, 8, 9],
    unit: '學系',
    desc: '學程認證班與公司策略／重點業務結合；學程認證計劃書及培訓品質檢核表',
  },

  // ── D1 課程設計 ─────────────────────────────────────────
  {
    id: 'staff_cert',   name: '學院人員執掌說明', icon: '🏅', difficulty: 2, maps: [6],
    unit: '學系 / 培發',
    desc: '培訓師證照及結訓證書；學院人員執掌說明',
  },
  {
    id: 'trainer_cert',       name: '培訓師專業證照',       icon: '📜', difficulty: 2, maps: [6],
    unit: '學系',
    desc: '培訓師持有之專業證照影本或電子檔',
  },
  {
    id: 'trainer_course_plan',name: '培訓相關課程規劃',     icon: '📋', difficulty: 2, maps: [6],
    unit: '學系',
    desc: '培訓師規劃或參與之相關課程計畫文件',
  },
  {
    id: 'supervisor_assign',  name: '主管指派訓練課程',     icon: '📌', difficulty: 2, maps: [6],
    unit: '學系',
    desc: '主管指派培訓師參加訓練課程之簽核或通知紀錄',
  },
  {
    id: 'trainer_reflection', name: '培訓師受訓心得',       icon: '✍️', difficulty: 2, maps: [6],
    unit: '學系',
    desc: '培訓師參加課程或研習後撰寫之受訓心得報告',
  },
  {
    id: 'competency',   name: '職能分析圖',         icon: '🧬', difficulty: 5, maps: [7],
    unit: '學系',
    desc: '職能分析流程及職能資源搜集分析',
  },
  {
    id: 'needs_source',   name: '需求來源',           icon: '🔎', difficulty: 2, maps: [7],
    unit: '學系',
    desc: '訓練需求來源說明文件，如調查表、訪談摘要或業務單位提案',
  },
  {
    id: 'competency_swp', name: '職能分析 SWP',       icon: '🧭', difficulty: 2, maps: [7],
    unit: '學系',
    desc: '策略性人力規劃（Strategic Workforce Planning）之職能分析文件',
  },
  {
    id: 'pre_question',  name: '課前提問',           icon: '❓', difficulty: 1, maps: [8, 9],
    unit: '學系',
    desc: '可反應學員或需求單位對於課程的期待，培訓師將其列入課程設計',
  },
  {
    id: 'course_plan',  name: '開班計畫書',         icon: '📝', difficulty: 3, maps: [8, 12],
    unit: '學系',
    desc: '說明課程規劃設計流程、開班計劃表；ADDIE 流程案例（若由學系提供課程案例）',
  },
  {
    id: 'review_mtg',   name: '課程檢討會議紀錄',   icon: '💬', difficulty: 3, maps: [8],
    unit: '學系',
    desc: '定期報告會議，檢討精進作為（處務會議）',
  },
  {
    id: 'completion_report', name: '結案報告',         icon: '📑', difficulty: 3, maps: [8, 9],
    unit: '學系',
    desc: '說明完訓人數或證照數，用以呈報成果的佐證資料',
  },
  {
    id: 'regular_review',    name: '定期檢討會議',     icon: '🗂️', difficulty: 3, maps: [8],
    unit: '學系',
    desc: '說明遭遇問題、改善方式與應變作為，類似月報、週報',
  },
  {
    id: 'improvement',       name: '精進作為',         icon: '🔧', difficulty: 3, maps: [8],
    unit: '學系',
    desc: '彙整學員回饋，並在下期課程中針對問題提出具體改善',
  },
  {
    id: 'stakeholder',  name: '利益關係人參與圖',   icon: '🤝', difficulty: 4, maps: [9],
    unit: '培發',
    desc: '利益關係人參與圖、參與過程紀錄',
  },
  {
    id: 'pre_notice',           name: '課前通知',             icon: '📨', difficulty: 1, maps: [9],
    unit: '學系',
    desc: '透過 eDM、eLearning、email 或任意形式通知學員的課前通知',
  },
  {
    id: 'classroom_log',        name: '教室日誌（異常）',     icon: '🚨', difficulty: 3, maps: [9],
    unit: '學系',
    desc: 'TIS 系統截圖，須選取有異常的紀錄（如學員請假、未報到），最好附有通知主管的紀錄',
  },
  {
    id: 'design_meeting',       name: '課程規劃設計佐證資料', icon: '🗓️', difficulty: 2, maps: [7, 9],
    unit: '學系',
    desc: '有利益關係人參與之課程規劃設計會議紀錄',
  },
  {
    id: 'external_material_req',name: '外購教材申請單',       icon: '📦', difficulty: 2, maps: [9],
    unit: '學系',
    desc: '向外採購教材之申請簽核單據',
  },
  {
    id: 'teacher_hire',         name: '師資遴選聘任簽報單',   icon: '📄', difficulty: 2, maps: [9],
    unit: '學系',
    desc: '師資遴選評估與聘任之簽報文件',
  },
  {
    id: 'cert_photo',           name: '訓練成果證書或合照',   icon: '🎓', difficulty: 2, maps: [9],
    unit: '學系',
    desc: '學員結訓證書或訓練結束時師生合照',
  },
  {
    id: 'class_photo',          name: '課堂照片',             icon: '📷', difficulty: 2, maps: [9],
    unit: '學系',
    desc: '課程進行中之課堂教學或活動照片',
  },

  // ── D2 課程執行 ─────────────────────────────────────────
  {
    id: 'mgmt_system',  name: '訓練管理制度文件',   icon: '⚙️', difficulty: 4, maps: [10],
    unit: '培發',
    desc: '師資管理、教材管理、採購制度及個資保護說明',
  },
  {
    id: 'teacher_change',     name: '更換教師記錄',       icon: '🔄', difficulty: 2, maps: [10],
    unit: '學系',
    desc: '課程進行中更換授課教師之申請或通知紀錄',
  },
  {
    id: 'new_teacher_sign',   name: '新聘講師簽核記錄',   icon: '✅', difficulty: 2, maps: [10],
    unit: '學系',
    desc: '新聘外部講師之資格審查與簽核流程文件',
  },
  {
    id: 'digital_material_mgmt', name: '數位教材管理佐證', icon: '💾', difficulty: 2, maps: [10],
    unit: '多元處',
    desc: '數位教材建置、維護與管理之相關佐證文件',
  },
  {
    id: 'material_purchase',  name: '教材採購流程簽呈', icon: '🖊️', difficulty: 1, maps: [10],
    unit: '學系',
    desc: '採購簽呈會有相對應利益關係人的簽核',
  },
  {
    id: 'needs_case',   name: '課程需求設計案例',   icon: '🔍', difficulty: 4, maps: [11],
    unit: '學系',
    desc: '訓練計畫與委託單位訓練需求結合（以一班為例）；與目標客戶進行需求訪談了解績效目標；以訓練計畫書確認課程訓練目標',
  },
  {
    id: 'annual_plan',  name: '年度訓練計畫',       icon: '📅', difficulty: 2, maps: [12],
    unit: '學系',
    desc: '開班計畫表、年度訓練計畫：預備知識、課程大綱、培訓目標對象，有助主管或學員受訓',
  },
  {
    id: 'edm',          name: 'EDM / 招生公告',    icon: '📧', difficulty: 2, maps: [12, 14],
    unit: '學系',
    desc: '招生 DM 明確註明招生對象；用以說明學院有系統做課程 EDM 精準行銷',
  },
  {
    id: 'selection',    name: '學員遴選說明',       icon: '👥', difficulty: 3, maps: [12],
    unit: '培發',
    desc: '依照訓練屬性與目標遴選學員：通識／自我學習、年度計畫訓練、委辦訓練／專案訓練／學程認證訓練',
  },
  {
    id: 'material_doc', name: '教材管理文件',       icon: '📚', difficulty: 1, maps: [12],
    unit: '學系',
    desc: '紙本／數位教材審核及採購流程；依訓練目標選擇紙本、數位或混成學習教材；學員可於教學網／email／Teams 取得講義',
  },
  {
    id: 'teacher_eval', name: '教師評鑑紀錄',       icon: '⭐', difficulty: 1, maps: [12],
    unit: '學系',
    desc: '依據各課程參考教師學經歷、職務、專長與教學滿意度遴選',
  },
  {
    id: 'cert_course',  name: '認證加強班計畫書',   icon: '🏫', difficulty: 4, maps: [13],
    unit: '學系＋培發',
    desc: '用以說明學習成果移轉，上完課還可輔導考到證照',
  },
  {
    id: 'applied_case', name: '學以致用案例',       icon: '💡', difficulty: 4, maps: [13, 17],
    unit: '學系',
    desc: '考照輔導機制、多元學習交流平台（e-learning／教學網／LINE／Teams）；課後行動計畫（學員實作報告）；學以致用獎具體成效',
  },

  // ── R 課後查核 ──────────────────────────────────────────
  {
    id: 'procurement',  name: '課程採購記錄',       icon: '🛒', difficulty: 2, maps: [14],
    unit: '學系',
    desc: '用以說明學院有系統做 ePIS 培訓相關設備採購',
  },
  {
    id: 'training_rec', name: '訓練完訓紀錄',       icon: '🗂️', difficulty: 1, maps: [15],
    unit: '培發',
    desc: '訓練完訓名單、出勤紀錄與系統查詢機制',
  },
  {
    id: 'incident',     name: '異常紀錄 / 緊急通知',icon: '⚠️', difficulty: 3, maps: [16],
    unit: '學系＋培發',
    desc: '用以說明學院對於臨時的變動，可以有告知學員並應變的能力（如發送 EDM）；執行階段品質檢核與異常紀錄、緊急因應措施',
  },

  // ── O 成效成果 ──────────────────────────────────────────
  {
    id: 'feedback',     name: '學員課後反映',       icon: '🗣️', difficulty: 4, maps: [9, 17],
    unit: '學系',
    desc: '反應評估：學員意見反應事項，最後說明我們有改善',
  },
  {
    id: 'assessment',   name: '學員評量成果',       icon: '📝', difficulty: 2, maps: [8, 17],
    unit: '學系',
    desc: '學習評估：學員受訓成績評量、數位及實體課前／課後評量（考試／實作報告）、學員證照通過率；評量結果呈現：成績單／結業證書',
  },
  {
    id: 'survey',       name: '滿意度調查',         icon: '📊', difficulty: 3, maps: [9, 17, 19],
    unit: '學系',
    desc: '學習滿意度持續提升；幫助學員有良好職涯發展',
  },
  {
    id: 'thank_letter', name: '感謝函',             icon: '💌', difficulty: 3, maps: [18],
    unit: '學系',
    desc: '學員表達肯定；技能檢定通過率高於業界',
  },
];

// 初始已上傳的幾筆（模擬已有進度，讓地圖不是全空）
const INITIAL_UPLOADS = [
  { id: 'u0', courseCode: 'HR-2026-001', courseName: '新進人員職前訓練', typeId: 'annual_plan',  fileName: '2026年度訓練計畫.pdf',      ts: '04/10' },
  { id: 'u1', courseCode: 'HR-2026-001', courseName: '新進人員職前訓練', typeId: 'course_plan',  fileName: '新進訓練_開班計畫書v2.pdf', ts: '04/12' },
  { id: 'u2', courseCode: 'HR-2026-001', courseName: '新進人員職前訓練', typeId: 'edm',          fileName: '職前訓練EDM.png',           ts: '04/15' },
  { id: 'u3', courseCode: 'IT-2026-012', courseName: '資安意識提升訓練', typeId: 'needs_case',   fileName: '資安訓練需求設計案例.docx', ts: '04/16' },
];

// 徽章/里程碑
const BADGES = [
  { id: 'first',     name: '初來乍到',   icon: '🥚', desc: '上傳第一筆資料',        threshold: { type: 'uploads',      n: 1 } },
  { id: 'streak5',   name: '手感正熱',   icon: '🔥', desc: '累積上傳 5 筆',          threshold: { type: 'uploads',      n: 5 } },
  { id: 'plan_done', name: '規劃大師',   icon: '🗺️', desc: '完成所有 Plan 指標',     threshold: { type: 'stageDone',    stage: 'P' } },
  { id: 'do_done',   name: '執行長才',   icon: '⚔️', desc: '完成所有 Do 指標',       threshold: { type: 'stageDone',    stage: 'D2' } },
  { id: 'rare',      name: '神級獵人',   icon: '💎', desc: '上傳一筆 Lv5 資料',      threshold: { type: 'difficulty',   lv: 5 } },
  { id: 'half',      name: '半途之光',   icon: '🌗', desc: '解鎖 10 個指標',         threshold: { type: 'indicators',   n: 10 } },
  { id: 'master',    name: 'TTQS 達人',  icon: '👑', desc: '解鎖全部 19 個指標',     threshold: { type: 'indicators',   n: 19 } },
];

const TEAMS = [
  { id: 'web',  name: '網路學系', emoji: '🌐', color: '#4ea8de', desc: '數位學習先鋒隊' },
  { id: 'biz',  name: '企管學系', emoji: '📊', color: '#b85fff', desc: '策略訓練執行者' },
  { id: 'info', name: '資訊學系', emoji: '💻', color: '#7fd858', desc: '系統整合專家隊' },
  { id: 'div',  name: '多元處',   emoji: '🌈', color: '#ffd23f', desc: '多元培育推手隊' },
  { id: 'dev',  name: '培發處',   emoji: '🌱', color: '#ff5e5b', desc: '人才發展核心隊' },
];

const TEAM_DEFAULT_COURSES = {
  web:  { code: 'NETWORK',   name: '網路學系' },
  biz:  { code: 'BUSINESS',  name: '企管學系' },
  info: { code: 'IT',        name: '資訊學系' },
  div:  { code: 'DIVERSITY', name: '多元處' },
  dev:  { code: 'PLAN',      name: '培發處' },
};

Object.assign(window, {
  STAGES,
  INDICATORS,
  DIFFICULTY_POINTS,
  UNLOCK_BONUS,
  COURSES,
  EVIDENCE_TYPES,
  INITIAL_UPLOADS,
  BADGES,
  TEAMS,
  TEAM_DEFAULT_COURSES,
});
