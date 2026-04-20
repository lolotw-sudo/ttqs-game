// 成就/指標詳情：19 項指標完整狀態 + 白話說明 + 對應資料
function ScreenAchievements({ state, uploads, onClose, onOpenUpload, focusStage = null }) {
  const [stageFilter, setStageFilter] = useState(focusStage || 'ALL');
  const [selected, setSelected] = useState(null);

  const visibleIndicators = stageFilter === 'ALL'
    ? INDICATORS
    : INDICATORS.filter(i => i.stage === stageFilter);

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <PixelButton size="sm" color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onClose}>
          ◀ 返回
        </PixelButton>
        <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: PALETTE.text, margin: 0 }}>
          📜 成就地圖
        </h1>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: PALETTE.gold }}>
          {state.doneCount}/19 完成 · {state.partialCount} 部分
        </div>
      </div>

      {/* 階段 filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <FilterPill active={stageFilter === 'ALL'} color={PALETTE.text} onClick={() => setStageFilter('ALL')}>
          全部 19
        </FilterPill>
        {STAGES.map(s => (
          <FilterPill key={s.id} active={stageFilter === s.id} color={s.color}
            onClick={() => setStageFilter(s.id)}>
            {s.emoji} {s.name} ({state.stageProgress[s.id].done}/{state.stageProgress[s.id].total})
          </FilterPill>
        ))}
      </div>

      {/* 指標格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {visibleIndicators.map(ind => {
          const status = state.indicatorStatus[ind.id];
          const count = state.perInd[ind.id].count;
          const stage = STAGES.find(s => s.id === ind.stage);
          const units = [...new Set(
            EVIDENCE_TYPES.filter(t => t.maps.includes(ind.id)).map(t => t.unit).filter(Boolean)
          )];
          return (
            <PixelBox key={ind.id} hover onClick={() => setSelected(ind)}
              color={status === 'done' ? '#244a2e' : status === 'partial' ? '#4a3d1a' : PALETTE.panel}
              padding={14}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <IndicatorChip indicator={ind} status={status} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    background: stage.color, color: '#000',
                    padding: '2px 5px', border: `2px solid ${PALETTE.border}`, display: 'inline-block',
                  }}>
                    {stage.subtitle}
                  </div>
                  <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 15, color: PALETTE.text, fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
                    指標{ind.id}・{ind.name}
                  </div>
                  <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginTop: 4, lineHeight: 1.3 }}>
                    {ind.plain}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {units.map(u => (
                      <span key={u} style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                        background: PALETTE.panelLt, color: PALETTE.cyan,
                        padding: '2px 6px',
                        border: `1px solid ${PALETTE.line}`,
                      }}>{u}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 10, paddingTop: 10, borderTop: `2px dashed ${PALETTE.line}`,
                fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              }}>
                <span style={{ color: PALETTE.textDim }}>{count} 筆資料</span>
                <span style={{
                  color: status === 'done' ? PALETTE.green : status === 'partial' ? PALETTE.gold : PALETTE.textDim,
                }}>
                  {status === 'done' ? '✔ 達成' : status === 'partial' ? '◐ 部分' : '◻ 未達成'}
                </span>
              </div>
            </PixelBox>
          );
        })}
      </div>

      {/* 詳情 modal */}
      {selected && (
        <IndicatorDetail indicator={selected} state={state} uploads={uploads}
          onClose={() => setSelected(null)} onOpenUpload={onOpenUpload} />
      )}
    </div>
  );
}

function FilterPill({ children, active, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: '8px 12px',
      background: active ? color : PALETTE.panel,
      color: active ? '#000' : PALETTE.text,
      border: `2px solid ${PALETTE.border}`,
      boxShadow: pixelShadow(PALETTE.shadow, active ? 4 : 2),
      fontFamily: "'DotGothic16', monospace", fontSize: 13, fontWeight: 700,
      cursor: 'pointer', transform: active ? 'translate(-1px,-1px)' : 'none',
    }}>
      {children}
    </div>
  );
}

function IndicatorDetail({ indicator, state, uploads, onClose, onOpenUpload }) {
  const stage = STAGES.find(s => s.id === indicator.stage);
  const status = state.indicatorStatus[indicator.id];
  const relevantUploads = uploads.filter(u => {
    const tids = getUploadTypeIds(u);
    return tids.some(tid => {
      const t = EVIDENCE_TYPES.find(x => x.id === tid);
      return t && t.maps.includes(indicator.id);
    });
  });
  const suggestedTypes = EVIDENCE_TYPES.filter(t => t.maps.includes(indicator.id));

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(10,10,26,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 'min(680px, 100%)', maxHeight: '90vh', overflowY: 'auto',
        background: PALETTE.bgAlt, border: `3px solid ${PALETTE.border}`,
        boxShadow: pixelShadow(PALETTE.shadow, 6), padding: 24,
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
          <IndicatorChip indicator={indicator} status={status} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              background: stage.color, color: '#000', padding: '3px 7px',
              border: `2px solid ${PALETTE.border}`, display: 'inline-block',
            }}>
              {stage.emoji} {stage.name}
            </div>
            <h2 style={{ fontFamily: "'DotGothic16', monospace", fontSize: 22, color: PALETTE.text, margin: '8px 0 4px', fontWeight: 700 }}>
              指標 {indicator.id}：{indicator.name}
            </h2>
          </div>
          <div onClick={onClose} style={{
            cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: PALETTE.text,
          }}>✕</div>
        </div>

        <div style={{
          background: PALETTE.panel, border: `2px solid ${PALETTE.border}`,
          padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.gold, marginBottom: 6 }}>
            ▼ 一句話說明
          </div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 17, color: PALETTE.text, lineHeight: 1.4 }}>
            {indicator.plain}
          </div>
        </div>

        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.text, marginBottom: 8 }}>
          ▼ 已蒐集的資料（{relevantUploads.length}）
        </div>
        {relevantUploads.length > 0 ? (
          <div style={{ marginBottom: 18 }}>
            {relevantUploads.map(u => {
              const tids = getUploadTypeIds(u);
              const ts = tids.map(tid => EVIDENCE_TYPES.find(x => x.id === tid)).filter(Boolean);
              // 只標示跟這個指標有關的那個 type；若多個都相關，取難度最高
              const matching = ts.filter(t => t.maps.includes(indicator.id));
              const t = matching.reduce((a, b) => (a.difficulty >= b.difficulty ? a : b), matching[0]);
              // 所有跟此指標相關的類型名稱
              const typeLabels = matching.map(m => m.name);
              return (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10,
                  padding: '8px 12px', background: PALETTE.panel,
                  border: `2px solid ${PALETTE.border}`, marginBottom: 6, alignItems: 'center',
                }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.fileName}</div>
                    <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: PALETTE.cyan, fontFamily: "'Press Start 2P', monospace", fontSize: 9, marginRight: 4 }}>{u.courseCode || '—'}</span>
                      {u.courseName || '(未指定課程)'} · {u.ts}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {typeLabels.map(label => (
                        <span key={label} style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 11,
                          background: PALETTE.panelLt, color: PALETTE.gold,
                          padding: '1px 7px', border: `1px solid ${PALETTE.line}`,
                        }}>{label}</span>
                      ))}
                    </div>
                  </div>
                  {u.fileData ? (
                    <div
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = u.fileData;
                        a.download = u.fileName;
                        a.click();
                      }}
                      style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                        color: PALETTE.green, cursor: 'pointer',
                        border: `2px solid ${PALETTE.green}`,
                        padding: '4px 8px', whiteSpace: 'nowrap',
                      }}
                    >↓ 檢視</div>
                  ) : (
                    <div style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                      color: PALETTE.textDim, whiteSpace: 'nowrap',
                    }}>無原檔</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: 14, background: PALETTE.panel, border: `2px dashed ${PALETTE.line}`,
            fontFamily: "'DotGothic16', monospace", color: PALETTE.textDim, fontSize: 14, marginBottom: 18,
          }}>
            還沒有資料，任何下方類型都可以解鎖這個指標！
          </div>
        )}

        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.text, marginBottom: 8 }}>
          ▼ 建議上傳的資料類型
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {suggestedTypes.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: PALETTE.panel, border: `2px solid ${PALETTE.border}`,
              padding: '8px 10px',
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.text, fontWeight: 700 }}>
                  {t.name}
                </div>
                {t.unit && (
                  <div style={{
                    display: 'inline-block', marginTop: 4,
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    background: PALETTE.panelLt, color: PALETTE.cyan,
                    padding: '2px 6px',
                    border: `1px solid ${PALETTE.line}`,
                  }}>
                    {t.unit}
                  </div>
                )}
              </div>
              <DifficultyBadge level={t.difficulty} compact />
            </div>
          ))}
        </div>

        {onOpenUpload && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <PixelButton
              size="md" color={PALETTE.gold} textColor="#000"
              onClick={() => { onClose(); onOpenUpload(); }}
            >
              ⚔ 上傳這個指標的佐證資料
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAchievements });
