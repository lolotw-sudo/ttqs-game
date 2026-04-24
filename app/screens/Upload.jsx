// 上傳流程：多步驟 Wizard
// Step 1: 選課程
// Step 2: 拖拉 or 點選 檔案 + 選擇資料類型
// Step 3: 系統自動 mapping 預覽 + 積分預告
// Step 4: 確認送出 → Celebration

function ScreenUpload({ state, uploads, onCancel, onConfirm }) {
  const [step, setStep] = useState(1);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [typeIds, setTypeIds] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const courseReady = courseCode.trim() && courseName.trim();

  const today = new Date();
  const ts = `${String(today.getMonth()+1).padStart(2,'0')}/${String(today.getDate()).padStart(2,'0')}`;

  const draftUpload = typeIds.length && courseReady ? {
    id: 'new_' + Date.now(),
    courseCode: courseCode.trim(),
    courseName: courseName.trim(),
    typeIds,
    fileName: fileName || '(未命名)',
    fileData: fileData || null,
    ts,
  } : null;

  const delta = draftUpload ? computeUploadDelta(uploads, draftUpload) : null;

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 頂部步驟 + 返回 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <PixelButton size="sm" color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onCancel}>
          ◀ 返回
        </PixelButton>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: PALETTE.text,
          margin: 0, letterSpacing: 1,
        }}>
          ⚔ 上傳佐證資料
        </h1>
        <div style={{ flex: 1 }} />
        <StepIndicator step={step} total={3} />
      </div>

      {/* 內容區 */}
      <PixelBox color={PALETTE.bgAlt} padding={28}>
        {step === 1 && (
          <StepEnterCourse
            courseCode={courseCode} setCourseCode={setCourseCode}
            courseName={courseName} setCourseName={setCourseName}
            ready={courseReady}
            pastUploads={uploads}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepPickFile
            fileName={fileName} setFileName={setFileName}
            onFileData={setFileData}
            typeIds={typeIds} setTypeIds={setTypeIds}
            dragOver={dragOver} setDragOver={setDragOver}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && delta && (
          <StepPreview
            courseCode={courseCode} courseName={courseName}
            types={delta.types}
            fileName={fileName || delta.types.map(t => t.name).join(' + ')}
            delta={delta}
            state={state}
            onBack={() => setStep(2)}
            onConfirm={() => onConfirm(draftUpload, delta)}
          />
        )}
      </PixelBox>

      {/* 側邊：系統如何運作 */}
      {step < 3 && (
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <span style={{ fontSize: 14 }}>🤖</span>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim }}>
            你只要上傳檔案，<span style={{ color: PALETTE.gold }}>系統會自動幫你對應到 TTQS 指標</span> — 不用背指標編號！
          </div>
        </div>
      )}
    </div>
  );
}

// ========== 步驟指示器 ==========
function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === step, done = n < step;
        return (
          <React.Fragment key={n}>
            <div style={{
              width: 28, height: 28,
              background: done ? PALETTE.green : active ? PALETTE.gold : PALETTE.panel,
              color: done || active ? '#000' : PALETTE.textDim,
              border: `2px solid ${PALETTE.border}`,
              boxShadow: pixelShadow(PALETTE.shadow, 2),
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{done ? '✔' : n}</div>
            {n < total && <div style={{
              width: 16, height: 3, background: done ? PALETTE.green : PALETTE.line,
            }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ========== Step 1: 輸入課程代號 + 名稱 ==========
function StepEnterCourse({ courseCode, setCourseCode, courseName, setCourseName, ready, pastUploads, onNext }) {
  // 從歷史 uploads 收集已用過的課程（以 code 去重）
  const recent = [];
  const seen = new Set();
  [...pastUploads].reverse().forEach(u => {
    if (u.courseCode && !seen.has(u.courseCode)) {
      seen.add(u.courseCode);
      recent.push({ code: u.courseCode, name: u.courseName });
    }
  });

  const inputStyle = {
    width: '100%',
    fontFamily: "'DotGothic16', 'Noto Sans TC', monospace",
    fontSize: 17,
    padding: '12px 14px',
    background: PALETTE.bg,
    color: PALETTE.text,
    border: `3px solid ${PALETTE.border}`,
    boxShadow: `inset 2px 2px 0 rgba(0,0,0,0.4)`,
    outline: 'none',
  };
  const labelStyle = {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 10,
    color: PALETTE.gold,
    letterSpacing: 1,
    marginBottom: 8,
    display: 'block',
  };

  return (
    <div>
      <StepHeader num={1} title="這筆資料是哪一堂課的？" subtitle="請輸入課程代號與課程名稱（例：LT153P033　客網新進人員訓練班）" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>▼ 課程代號</label>
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
            placeholder="LT153P033"
            style={{ ...inputStyle, fontFamily: "'Press Start 2P', monospace", fontSize: 13, letterSpacing: 1 }}
          />
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginTop: 6 }}>
            組織內部的課程編號
          </div>
        </div>
        <div>
          <label style={labelStyle}>▼ 課程名稱</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="客網新進人員訓練班"
            style={inputStyle}
          />
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginTop: 6 }}>
            完整中文課程名稱
          </div>
        </div>
      </div>

      {/* 最近使用過的課程（快速填入） */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.textDim, marginBottom: 8 }}>
            ▼ 最近上傳過的課程（點擊快速填入）
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recent.slice(0, 6).map(r => {
              const active = r.code === courseCode && r.name === courseName;
              return (
                <div
                  key={r.code}
                  onClick={() => { setCourseCode(r.code); setCourseName(r.name); }}
                  style={{
                    background: active ? PALETTE.purple : PALETTE.panel,
                    color: active ? '#fff' : PALETTE.text,
                    border: `2px solid ${PALETTE.border}`,
                    boxShadow: pixelShadow(PALETTE.shadow, 2),
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: active ? PALETTE.gold : PALETTE.cyan }}>
                    {r.code}
                  </span>
                  <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13 }}>
                    {r.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 預覽卡片 */}
      {ready && (
        <div style={{
          background: PALETTE.panel, border: `3px solid ${PALETTE.purple}`,
          boxShadow: pixelShadow(PALETTE.shadow, 3),
          padding: 14, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 36 }}>📚</div>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.cyan }}>
              {courseCode.trim()}
            </div>
            <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 18, color: PALETTE.text, fontWeight: 700, marginTop: 4 }}>
              {courseName.trim()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PixelButton color={ready ? PALETTE.gold : '#555'} disabled={!ready} onClick={onNext}>
          下一步 ▶
        </PixelButton>
      </div>
    </div>
  );
}

// ========== (legacy) 課程卡片樣版，保留以防未來用 ==========
function _Legacy_StepPickCourse({ courseId, onPick }) {
  return (
    <div>
      <StepHeader num={1} title="這筆資料是哪一堂課的？" subtitle="先告訴系統對應的課程，之後會自動分類" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {COURSES.map(c => (
          <PixelBox key={c.id} hover onClick={() => onPick(c.id)}
            color={courseId === c.id ? PALETTE.purple : PALETTE.panel}
            padding={18}>
            <div style={{ fontSize: 40, textAlign: 'center' }}>{c.icon}</div>
            <div style={{
              fontFamily: "'DotGothic16', monospace", fontSize: 17, color: PALETTE.text,
              textAlign: 'center', marginTop: 8, fontWeight: 700,
            }}>
              {c.name}
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.textDim,
              textAlign: 'center', marginTop: 6,
            }}>
              開課：{c.scheduled}
            </div>
          </PixelBox>
        ))}
      </div>
    </div>
  );
}

// ========== Step 2: 拖拉檔案 + 多選類型 ==========
const MAX_FILE_MB = 5;

function StepPickFile({ fileName, setFileName, onFileData, typeIds, setTypeIds, dragOver, setDragOver, onNext, onBack }) {
  const fileInputRef = React.useRef(null);
  const [hoveredTypeId, setHoveredTypeId] = React.useState(null);
  const [fileSizeError, setFileSizeError] = React.useState(null);
  const canNext = fileName && typeIds.length > 0 && !fileSizeError;

  function handleFile(file) {
    if (!file) return;
    setFileSizeError(null);
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setFileSizeError(`檔案 ${mb} MB 超過 ${MAX_FILE_MB} MB 上限，請壓縮後再上傳。`);
      setFileName('');
      onFileData(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => onFileData(e.target.result);
    reader.onerror = () => {
      setFileSizeError('檔案讀取失敗，請重新選取或換一個檔案。');
      setFileName('');
      onFileData(null);
    };
    reader.readAsDataURL(file);
  }

  function toggleType(id) {
    setTypeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const touchedIndicators = new Set();
  typeIds.forEach(id => {
    const t = EVIDENCE_TYPES.find(x => x.id === id);
    if (t) t.maps.forEach(m => touchedIndicators.add(m));
  });

  const hoveredType = hoveredTypeId ? EVIDENCE_TYPES.find(t => t.id === hoveredTypeId) : null;

  return (
    <div>
      <StepHeader num={2} title="拖拉檔案＋勾選資料用途" subtitle="一個檔案可能同時有多個用途、對應多個指標 — 全部勾起來！（可複選）" />

      {/* Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        style={{
          background: dragOver ? PALETTE.purple : PALETTE.panel,
          border: `3px dashed ${dragOver ? PALETTE.gold : PALETTE.line}`,
          padding: 36, textAlign: 'center',
          cursor: 'pointer', marginBottom: 22,
          transition: 'background 100ms steps(2)',
          position: 'relative',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>{dragOver ? '📥' : '📂'}</div>
        {fileName ? (
          <>
            <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 18, color: PALETTE.text, fontWeight: 700 }}>
              ✓ {fileName}
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.cyan, marginTop: 10 }}>
              CLICK TO CHANGE
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 18, color: PALETTE.text }}>
              拖拉檔案到這裡
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.textDim, marginTop: 8 }}>
              OR CLICK TO BROWSE
            </div>
          </>
        )}
      </div>

      {/* 檔案大小錯誤 */}
      {fileSizeError && (
        <div style={{
          background: '#3d0000', border: '2px solid #ff5e5b',
          borderRadius: 4, padding: '10px 16px', marginBottom: 16,
          fontFamily: "'DotGothic16', monospace", fontSize: 14,
          color: '#ff5e5b',
        }}>
          ⚠ {fileSizeError}
        </div>
      )}

      {/* 類型選擇（多選） */}
      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 15, color: PALETTE.text, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ color: PALETTE.gold, fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>▼ </span>
          請選擇上傳檔案的類型（可複選）
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: PALETTE.textDim }}>
          已選 {typeIds.length} 項
        </div>
      </div>
      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginBottom: 10 }}>
        例：一場滿意度調查，可能同時是「L1反應」也是「改善依據」 — 勾越多，對應到的指標越多。
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        maxHeight: 220, overflowY: 'auto', paddingRight: 6,
      }}>
        {EVIDENCE_TYPES.map(t => {
          const active = typeIds.includes(t.id);
          const hovered = hoveredTypeId === t.id;
          const allP = t.maps.every(indId => {
            const ind = INDICATORS.find(i => i.id === indId);
            return ind && ind.stage === 'P';
          });
          const role = allP ? '學系代表' : '培訓師';
          const roleColor = allP ? PALETTE.cyan : PALETTE.purple;
          return (
            <div key={t.id}
              onClick={() => toggleType(t.id)}
              onMouseEnter={() => setHoveredTypeId(t.id)}
              onMouseLeave={() => setHoveredTypeId(null)}
              style={{
                background: active ? PALETTE.gold : hovered ? PALETTE.panelLt : PALETTE.panel,
                color: active ? '#000' : PALETTE.text,
                border: `2px solid ${active ? PALETTE.gold : hovered ? PALETTE.cyan : PALETTE.border}`,
                boxShadow: pixelShadow(PALETTE.shadow, active ? 4 : hovered ? 3 : 2),
                padding: '8px 10px', paddingTop: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transform: active ? 'translate(-1px,-1px)' : 'none',
                position: 'relative',
                transition: 'background 80ms, border-color 80ms',
              }}>
              {/* 角色標籤（右上角） */}
              <div style={{
                position: 'absolute', top: 4, right: 6,
                fontFamily: "'DotGothic16', monospace", fontSize: 10,
                color: active ? '#555' : roleColor,
              }}>{role}</div>
              {active && (
                <div style={{
                  position: 'absolute', top: -6, right: -6,
                  background: PALETTE.green, color: '#000',
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${PALETTE.border}`,
                }}>✓</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginTop: 3 }}>
                  <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 11, color: active ? '#555' : PALETTE.textDim }}>
                    對應指標：
                  </span>
                  {t.maps.map((indId, idx) => {
                    const ind = INDICATORS.find(i => i.id === indId);
                    const stage = ind ? STAGES.find(s => s.id === ind.stage) : null;
                    if (!ind || !stage) return null;
                    return (
                      <React.Fragment key={indId}>
                        {idx > 0 && <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 11, color: active ? '#555' : PALETTE.textDim }}>,</span>}
                        <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 11, color: active ? '#333' : stage.color, fontWeight: 700 }}>#{indId}</span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 任務說明面板（hover 顯示） */}
      <div style={{
        marginTop: 10, minHeight: 90,
        background: hoveredType ? PALETTE.bgAlt : 'transparent',
        border: `2px solid ${hoveredType ? PALETTE.cyan : 'transparent'}`,
        boxShadow: hoveredType ? pixelShadow(PALETTE.shadow, 3) : 'none',
        padding: hoveredType ? '12px 14px' : '8px 0',
        transition: 'background 80ms, border-color 80ms',
      }}>
        {hoveredType ? (
          <>
            {/* 標題列 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{hoveredType.icon}</span>
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 17, fontWeight: 700, color: PALETTE.text }}>
                {hoveredType.name}
              </span>
              <span style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                background: PALETTE.purple, color: PALETTE.gold,
                padding: '2px 6px', marginLeft: 4,
              }}>
                LV{hoveredType.difficulty} · +{DIFFICULTY_POINTS[hoveredType.difficulty].points}pt
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim }}>
                負責：<span style={{ color: PALETTE.gold }}>{hoveredType.unit}</span>
              </span>
            </div>

            {/* 佐證說明 */}
            <div style={{
              fontFamily: "'DotGothic16', monospace", fontSize: 13,
              color: PALETTE.textDim, lineHeight: 1.6, marginBottom: 10,
            }}>
              {hoveredType.desc}
            </div>

            {/* 對應指標 chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {hoveredType.maps.map(indId => {
                const ind = INDICATORS.find(i => i.id === indId);
                const stage = ind ? STAGES.find(s => s.id === ind.stage) : null;
                if (!ind || !stage) return null;
                return (
                  <span key={indId} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    border: `2px solid ${stage.color}`,
                    padding: '3px 8px',
                    fontFamily: "'DotGothic16', monospace", fontSize: 13,
                    background: stage.color + '22',
                  }}>
                    <span style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                      background: stage.color, color: '#000',
                      padding: '1px 4px',
                    }}>{stage.subtitle}</span>
                    <span style={{ color: PALETTE.textDim }}>#{ind.id}</span>
                    <span style={{ color: PALETTE.text, fontWeight: 700 }}>{ind.name}</span>
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: PALETTE.textDim, textAlign: 'center', paddingTop: 28,
          }}>
            ✦ 滑鼠移到任務卡上，查看佐證說明與對應指標
          </div>
        )}
      </div>

      {/* 即時顯示：會碰到哪些指標 */}
      {typeIds.length > 0 && (
        <div style={{
          marginTop: 10, padding: 12,
          background: PALETTE.panel,
          border: `2px solid ${PALETTE.cyan}`,
          boxShadow: pixelShadow(PALETTE.shadow, 3),
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.cyan, marginBottom: 8 }}>
            ▼ 這些用途會碰到 {touchedIndicators.size} 個指標
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...touchedIndicators].map(code => (
              <span key={code} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                background: PALETTE.purple, color: PALETTE.gold,
                padding: '4px 8px', border: `2px solid ${PALETTE.border}`,
              }}>{code}</span>
            ))}
          </div>
        </div>
      )}

      {/* 按鈕列 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26 }}>
        <PixelButton color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onBack}>◀ 上一步</PixelButton>
        <PixelButton color={canNext ? PALETTE.gold : '#555'} onClick={canNext ? onNext : null} disabled={!canNext}>
          下一步 ▶
        </PixelButton>
      </div>
    </div>
  );
}

// ========== Step 3: 預覽 mapping + 積分 ==========
function StepPreview({ courseCode, courseName, types, fileName, delta, state, onBack, onConfirm }) {
  const hardestType = types.reduce((a, b) => (a.difficulty >= b.difficulty ? a : b), types[0]);
  return (
    <div>
      <StepHeader num={3} title="系統自動幫你對應到這些指標" subtitle="確認後送出，立刻獲得分數！" />

      {/* 檔案摘要 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14,
        background: PALETTE.panel, padding: 14, alignItems: 'center',
        border: `2px solid ${PALETTE.border}`, boxShadow: pixelShadow(PALETTE.shadow, 3),
        marginBottom: 22,
      }}>
        <div style={{ fontSize: 36 }}>{hardestType.icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 16, color: PALETTE.text, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim, marginTop: 4 }}>
            <span style={{ color: PALETTE.cyan, fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>{courseCode}</span> {courseName}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {types.map(t => (
              <span key={t.id} style={{
                fontFamily: "'DotGothic16', monospace", fontSize: 12,
                background: PALETTE.panelLt, color: PALETTE.text,
                padding: '2px 8px', border: `1px solid ${PALETTE.border}`,
              }}>
                {t.icon} {t.name}
              </span>
            ))}
          </div>
        </div>
        <DifficultyBadge level={hardestType.difficulty} />
      </div>

      {/* 對應指標 */}
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: PALETTE.text, marginBottom: 10 }}>
        ▼ 對應到 {delta.indicatorsTouched.length} 個指標
      </div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
        {delta.indicatorsTouched.map(indId => {
          const ind = INDICATORS.find(i => i.id === indId);
          const stage = STAGES.find(s => s.id === ind.stage);
          const isUnlock = delta.newlyUnlocked.includes(indId);
          const isComplete = delta.newlyCompleted.includes(indId);
          return (
            <div key={indId} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
              background: isUnlock ? '#3a2d5a' : PALETTE.panel,
              border: `2px solid ${isUnlock ? PALETTE.gold : PALETTE.border}`,
              boxShadow: pixelShadow(PALETTE.shadow, 3),
              padding: '12px 14px',
            }}>
              <IndicatorChip indicator={ind} size="sm"
                status={isComplete ? 'done' : isUnlock ? 'partial' : state.indicatorStatus[indId]} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                    background: stage.color, color: '#000',
                    padding: '2px 5px', border: `2px solid ${PALETTE.border}`,
                  }}>
                    {stage.subtitle}
                  </span>
                  <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 16, color: PALETTE.text, fontWeight: 700 }}>
                    指標 {ind.id}：{ind.name}
                  </span>
                </div>
                <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim }}>
                  {ind.plain}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {isUnlock && (
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                    color: PALETTE.gold, animation: 'wiggle 0.8s steps(4) infinite',
                  }}>
                    ★ 首次解鎖<br /><span style={{ color: PALETTE.text }}>+{UNLOCK_BONUS}</span>
                  </div>
                )}
                {!isUnlock && isComplete && (
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.green }}>
                    ✔ 指標達成
                  </div>
                )}
                {!isUnlock && !isComplete && (
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.textDim }}>
                    +補強
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 分數預告 */}
      <div style={{
        background: `linear-gradient(135deg, ${PALETTE.panel} 0%, ${PALETTE.panelLt} 100%)`,
        border: `3px solid ${PALETTE.gold}`,
        boxShadow: pixelShadow(PALETTE.shadow, 4),
        padding: 16,
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.textDim, marginBottom: 6 }}>
            YOU WILL GET
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.text }}>
              基礎 <span style={{ color: PALETTE.gold }}>+{delta.basePoints}</span>
            </span>
            {delta.unlockBonus > 0 && (
              <span style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.text }}>
                首解加成 <span style={{ color: PALETTE.gold }}>+{delta.unlockBonus}</span>
              </span>
            )}
          </div>
        </div>
        <div style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 32, color: PALETTE.gold,
          textShadow: '3px 3px 0 #000',
        }}>
          +{delta.totalPoints}
        </div>
      </div>

      {/* 按鈕 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26 }}>
        <PixelButton color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onBack}>◀ 上一步</PixelButton>
        <PixelButton color={PALETTE.red} textColor="#fff" size="lg" onClick={onConfirm}>
          ⚔ 確認送出！
        </PixelButton>
      </div>
    </div>
  );
}

// ========== 小元件 ==========
function StepHeader({ num, title, subtitle }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.gold,
        letterSpacing: 1, marginBottom: 6,
      }}>
        STEP {num}
      </div>
      <div style={{
        fontFamily: "'DotGothic16', monospace", fontSize: 24, color: PALETTE.text,
        fontWeight: 700, marginBottom: 4, lineHeight: 1.2,
      }}>
        {title}
      </div>
      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.textDim }}>
        {subtitle}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenUpload });
