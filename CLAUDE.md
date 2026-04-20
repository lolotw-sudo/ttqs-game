# TTQS 任務闖關遊戲

## 專案概要
以 8-bit 像素遊戲風格呈現的 HR 訓練佐證資料追蹤工具。使用者（HR 訓練人員）上傳訓練佐證檔案，系統自動對應到 TTQS 的 19 項指標，並以遊戲化積分、等級、徽章激勵完整收集。

## 技術架構
- **無建構系統**：HTML 直接引用 React 18 CDN + @babel/standalone（in-browser JSX）+ JSZip CDN
- **無後端**：多人資料存 `localStorage`（key: `ttqs_players_v1`）；舊單人 key `ttqs_quest_state_v2` 會自動遷移
- **入口**：`TTQS 任務闖關.html` — 載入所有 JSX 並掛載 React App
- **本機伺服器**：`python3 -m http.server 8765`（需 server，不能直接 file://）

## 檔案結構
```
TTQS 任務闖關.html      # 入口 + App 主元件（多人路由）
app/
  data.jsx              # 遊戲資料（STAGES/INDICATORS/EVIDENCE_TYPES/BADGES/TEAMS 等）
  components.jsx        # 共用 UI 元件 + computeState / computeUploadDelta
  screens/
    Landing.jsx         # 成員選擇大廳（多人入口）
    Map.jsx             # 主地圖畫面
    Upload.jsx          # 三步驟上傳精靈（含真實檔案讀取）
    Celebration.jsx     # 上傳完成慶祝動畫
    Achievements.jsx    # 19 項指標成就牆
    Profile.jsx         # 冒險者檔案
    TeamSelect.jsx      # 建立角色（名稱 + 戰隊）
    TeamReport.jsx      # 佐證資料報表（CSV 命名清單 + ZIP 批次下載）
```

## TTQS 框架（PDDRO 五大關卡）
| 關卡 | 名稱 | 指標 |
|------|------|------|
| P    | 課前規劃 PLAN | 1-5 |
| D1   | 課程設計 DESIGN | 6-9 |
| D2   | 課程執行 DO | 10-13 |
| R    | 課後查核 REVIEW | 14-16 |
| O    | 成效成果 OUTCOME | 17-19 |

## 積分規則
- 難度 Lv1~5 → 5/10/20/35/50 分
- 首次解鎖指標 +30（UNLOCK_BONUS）
- 指標 done 條件：上傳 ≥ 2 筆，或最高難度 ≥ 3
- 升級：每 150 分升一級，最高 10 級

## 多人架構（已完成）
- `players[]` 陣列存於 localStorage（`ttqs_players_v1`）
- 每個 player: `{ id, name, team, uploads[], lastScreen }`
- App 路由：`landing` → `teamSelect` → `map` / `upload` / `achievements` / `profile` / `teamReport`
- 上傳時讀取真實檔案內容（FileReader → base64 dataURL），存在 `upload.fileData`

## 戰隊（TEAMS）
```js
{ id: 'web',  name: '網路學系', emoji: '🌐', color: '#4ea8de' }
{ id: 'biz',  name: '企管學系', emoji: '📊', color: '#b85fff' }
{ id: 'info', name: '資訊學系', emoji: '💻', color: '#7fd858' }
{ id: 'div',  name: '多元處',   emoji: '🌈', color: '#ffd23f' }
{ id: 'dev',  name: '培發處',   emoji: '🌱', color: '#ff5e5b' }
```

## 佐證資料報表（TeamReport）
- 入口：Landing 頁右上角「📋 佐證資料報表」
- 依指標分組，顯示所有成員上傳紀錄
- 建議檔名格式：`類別_指標#_用途_課名.副檔名`
- 「命名清單 CSV」：隨時可下載，含建議檔名欄位
- 「批次下載 ZIP」：需上傳時有拖入真實檔案才有 fileData 可打包

## 全域 window 物件
所有模組透過 `Object.assign(window, {...})` 共享：
- 資料：`STAGES`、`INDICATORS`、`EVIDENCE_TYPES`、`COURSES`、`BADGES`、`INITIAL_UPLOADS`、`DIFFICULTY_POINTS`、`UNLOCK_BONUS`、`TEAMS`
- 元件：`PixelBox`、`PixelButton`、`StatBar`、`IndicatorChip`、`DifficultyBadge`、`Typewriter`、`PopNumber`、`ScanlineOverlay`
- 計算：`computeState`、`computeUploadDelta`、`getUploadTypeIds`
- 畫面：`ScreenLanding`、`ScreenMap`、`ScreenUpload`、`ScreenCelebration`、`ScreenAchievements`、`ScreenProfile`、`ScreenTeamSelect`、`ScreenTeamReport`
- 樣式：`PALETTE`、`pixelShadow`

## UI 設計原則（已調整）
- `PALETTE.border` = `rgba(255,255,255,0.10)`（柔和，非純黑）
- `pixelShadow` = 柔和 blur 陰影（非硬偏移）
- `PixelBox`、`PixelButton`：無粗黑邊框、圓角 4px、smooth transition
- `StatBar`：圓角實心條，無外框
- CRT 掃描線（`scanlines`）預設關閉；body 移除橫線 gradient

## 開發注意事項
- 新增元件／畫面須用 `Object.assign(window, {...})` 匯出
- JSX 載入順序：data → components → screens（Landing 在 TeamSelect 後）→ TeamReport → App
- 開發者模式：`window.postMessage({ type: '__activate_edit_mode' }, '*')` 啟動右下 Tweaks 面板
- 重啟伺服器：`pkill -f "http.server 8765" && cd ~/Desktop/TTQS-game && python3 -m http.server 8765`

## 目前狀態（2026-04-20）
✅ 多人 Landing 大廳（選擇 / 新增 / 刪除成員）
✅ 建立角色（名稱 + 五戰隊）+ 「◀ 返回」按鈕回到大廳
✅ 遊戲主地圖、上傳、成就、個人檔案
✅ 佐證資料報表（TeamReport）+ CSV 命名清單 / ZIP 批次下載
✅ 上傳時讀取真實檔案（FileReader → base64 dataURL）
✅ 視覺優化：移除像素硬邊框、掃描線、body 橫線，實心填滿色塊
✅ 像素人物頭像（PixelAvatar — 12×16 SVG Mario 風格）取代舊棋盤圖示
✅ 課程代碼 placeholder 改為 `LT153P033 / 客網新進人員訓練班` 格式
✅ 個人檔案移除「人資處 · 訓練發展組」標籤
✅ 頂部返回按鈕文字改為「◀ 回到任務入口」
✅ **INDICATORS 全面更新**：19 項指標改用正式 TTQS 名稱（依 chatgpt 工作表），補齊 1（機構概況與訓練資源）、4（訓練預算規劃）、15（訓練紀錄管理）
✅ **EVIDENCE_TYPES 重構**：從 16 種拆細為 28 種，依 PDDRO 分組，每種新增 `desc`（佐證說明）、`unit`（負責單位）
✅ **上傳 Step 2 hover 詳情面板**：滑鼠移到任務卡顯示佐證說明、PDDRO 關卡、指標編號與名稱、負責單位

## EVIDENCE_TYPES 結構說明
每筆包含：`id`、`name`、`icon`、`difficulty`、`maps`（對應指標 id 陣列）、`desc`（佐證資料說明）、`unit`（負責單位）

## 其他待辦
- [ ] 上傳畫面：顯示已拖入檔案的預覽（圖片 / PDF icon）
- [ ] TeamReport：加入「成員」維度篩選（目前只有戰隊篩選）
- [ ] 成就牆：點開指標可看該指標底下所有上傳檔案
- [ ] 匯出功能：整份 TTQS 自評報告（PDF 或 Word）
- [ ] 管理者視角：跨成員統計儀表板
