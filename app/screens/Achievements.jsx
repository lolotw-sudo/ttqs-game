// ── 共用：下載單一指標的檔案為 ZIP（filterTypeId = null 代表全部）──
async function downloadIndicatorZip(ind, uploads, teamLabel, onStart, onEnd, filterTypeId = null) {
  const cleanStr = s => (s || '').replace(/[\/\\:*?"<>|\s]/g, '_').replace(/_+/g, '_');
  const getExt   = f => { const p = (f || '').split('.'); return p.length > 1 ? p.pop() : 'pdf'; };

  const filterType = filterTypeId ? resolveType(filterTypeId) : null;

  const relevant = uploads.filter(u => {
    if (!u.fileUrl) return false;
    const tids = getUploadTypeIds(u);
    const matchesInd = tids.some(tid => { const t = resolveType(tid); return t && t.maps.includes(ind.id); });
    if (!matchesInd) return false;
    if (filterTypeId) return tids.some(tid => resolveType(tid)?.id === filterTypeId);
    return true;
  });
  if (relevant.length === 0) {
    alert(filterType
      ? `❌ 「${filterType.name}」沒有可下載的檔案\n\n上傳時請選取實際檔案才能使用下載功能。`
      : '❌ 此指標沒有可下載的檔案\n\n上傳時請選取實際檔案才能使用下載功能。');
    return;
  }

  onStart?.();
  let failCount = 0;
  const nameCount = {};
  try {
    const zip = new JSZip();
    // 每個 upload × 對應的 type 數量，各產生一個 ZIP 檔案
    const tasks = relevant.map(u => {
      const tids = getUploadTypeIds(u);
      const ts   = tids.map(tid => resolveType(tid)).filter(t => t && t.maps.includes(ind.id));
      const typesToUse = filterType ? [filterType] : (ts.length > 0 ? ts : [{ name: '佐證' }]);
      const ext  = getExt(u.fileName);
      const names = typesToUse.map(type => {
        const base = `指標${ind.id}_${cleanStr(type.name)}_${cleanStr(teamLabel || '')}_${cleanStr(u.courseName || '')}`;
        nameCount[base] = (nameCount[base] || 0) + 1;
        return `${base}_${String(nameCount[base]).padStart(3, '0')}.${ext}`;
      });
      return fetch(u.fileUrl)
        .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
        .then(blob => { names.forEach(name => zip.file(name, blob)); })
        .catch(() => { failCount++; });
    });
    await Promise.all(tasks);
    if (failCount === tasks.length) { alert('❌ 所有檔案下載失敗，請確認網路連線。'); return; }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const zipName = filterType
      ? `TTQS_指標${ind.id}_${cleanStr(filterType.name)}.zip`
      : `TTQS_指標${ind.id}_${cleanStr(ind.name)}.zip`;
    a.href = url; a.download = zipName; a.click();
    URL.revokeObjectURL(url);
    if (failCount > 0) alert(`⚠️ 已下載 ZIP，但有 ${failCount} 個檔案無法取得，已略過。`);
  } catch { alert('❌ 壓縮失敗，請稍後再試。'); }
  finally { onEnd?.(); }
}

// ── 指標卡片（可重複使用）──
function IndicatorCard({ ind, state, uploads = [], onClick }) {
  const status = state.indicatorStatus[ind.id];
  const count  = state.perInd[ind.id].count;
  const stage  = STAGES.find(s => s.id === ind.stage);
  // 下載 loading 狀態：key = typeId 或 'all'
  const [dlMap, setDlMap] = React.useState({});
  const isDl = key => !!dlMap[key];
  const startDl = key => setDlMap(p => ({...p, [key]: true}));
  const endDl   = key => setDlMap(p => ({...p, [key]: false}));

  const suggestedTypes = EVIDENCE_TYPES.filter(t => t.maps.includes(ind.id));

  // 計算每種佐證類型的上傳筆數
  const typeCountMap = {};
  uploads.forEach(u => {
    const tids = getUploadTypeIds(u);
    tids.forEach(tid => {
      const t = resolveType(tid);
      if (t && t.maps.includes(ind.id)) typeCountMap[t.id] = (typeCountMap[t.id] || 0) + 1;
    });
  });

  // 每種類型可下載的檔案數（有 fileUrl）
  const typeDlCount = {};
  suggestedTypes.forEach(t => {
    typeDlCount[t.id] = uploads.filter(u => {
      if (!u.fileUrl) return false;
      return getUploadTypeIds(u).some(tid => resolveType(tid)?.id === t.id);
    }).length;
  });

  // 全指標可下載數
  const dlCount = uploads.filter(u => {
    if (!u.fileUrl) return false;
    return getUploadTypeIds(u).some(tid => { const t = resolveType(tid); return t && t.maps.includes(ind.id); });
  }).length;

  return (
    <PixelBox hover onClick={onClick}
      color={status === 'done' ? '#244a2e' : status === 'partial' ? '#4a3d1a' : PALETTE.panel}
      padding={14}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <IndicatorChip indicator={ind} status={status} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            background: stage.color, color: '#000',
            padding: '2px 5px', border: `2px solid ${PALETTE.border}`, display: 'inline-block',
          }}>{stage.subtitle}</div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 15, color: PALETTE.text, fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
            指標{ind.id}・{ind.name}
          </div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginTop: 4, lineHeight: 1.3 }}>
            {ind.plain}
          </div>
        </div>
      </div>

      {/* 佐證類型清單：點擊數字 → 直接下載該類型 ZIP */}
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${PALETTE.line}`,
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        {suggestedTypes.map(t => {
          const cnt   = typeCountMap[t.id] || 0;
          const dlCnt = typeDlCount[t.id] || 0;
          const canDl = dlCnt > 0;
          const loading = isDl(t.id);
          return (
            <div key={t.id}
              onClick={canDl && !loading ? (e) => {
                e.stopPropagation();
                downloadIndicatorZip(ind, uploads, '', () => startDl(t.id), () => endDl(t.id), t.id);
              } : undefined}
              title={canDl ? `↓ 下載「${t.name}」的 ${dlCnt} 個檔案` : undefined}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                padding: '4px 8px',
                background: cnt > 0 ? PALETTE.green + '18' : PALETTE.panelLt,
                border: `1px solid ${cnt > 0 ? PALETTE.green + '55' : PALETTE.line}`,
                cursor: canDl && !loading ? 'pointer' : 'default',
                transition: 'background 80ms',
              }}
              onMouseEnter={e => { if (canDl && !loading) e.currentTarget.style.background = PALETTE.green + '35'; }}
              onMouseLeave={e => { e.currentTarget.style.background = cnt > 0 ? PALETTE.green + '18' : PALETTE.panelLt; }}
            >
              <span style={{
                fontFamily: "'DotGothic16', monospace", fontSize: 11,
                color: cnt > 0 ? PALETTE.green : PALETTE.textDim,
                flex: 1, minWidth: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{t.name}</span>
              <span style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                color: loading ? PALETTE.gold : cnt > 0 ? PALETTE.green : PALETTE.textDim,
                whiteSpace: 'nowrap', flexShrink: 0,
                textDecoration: canDl && !loading ? 'underline' : 'none',
              }}>{loading ? '↓…' : `${cnt} 筆`}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 10, paddingTop: 10, borderTop: `2px dashed ${PALETTE.line}`,
        fontFamily: "'Press Start 2P', monospace", fontSize: 9,
      }}>
        <span style={{ color: PALETTE.textDim }}>{count} 筆資料</span>
        <span style={{ color: status === 'done' ? PALETTE.green : status === 'partial' ? PALETTE.gold : PALETTE.textDim }}>
          {status === 'done' ? '✔ 達成' : status === 'partial' ? '◐ 部分' : '◻ 未達成'}
        </span>
      </div>
    </PixelBox>
  );
}

// 成就/指標詳情：19 項指標完整狀態 + 白話說明 + 對應資料
function ScreenAchievements({ state, uploads, onClose, onOpenUpload, onDeleteUpload, onEditUpload, focusStage = null, player = null }) {
  const teamData = player ? (TEAMS.find(t => t.id === player.team) || null) : null;
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
        {visibleIndicators.map(ind => (
          <IndicatorCard key={ind.id} ind={ind} state={state} uploads={uploads}
            onClick={() => setSelected(ind)} />
        ))}
      </div>

      {/* 詳情 modal */}
      {selected && (
        <IndicatorDetail indicator={selected} state={state} uploads={uploads}
          onClose={() => setSelected(null)} onOpenUpload={onOpenUpload}
          onDeleteUpload={onDeleteUpload} onEditUpload={onEditUpload} teamData={teamData} />
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

function IndicatorDetail({ indicator, state, uploads, onClose, onOpenUpload, onDeleteUpload, onEditUpload, playerMap = null, teamData = null }) {
  const stage = STAGES.find(s => s.id === indicator.stage);
  const status = state.indicatorStatus[indicator.id];

  const relevantUploads = uploads.filter(u => {
    const tids = getUploadTypeIds(u);
    return tids.some(tid => { const t = resolveType(tid); return t && t.maps.includes(indicator.id); });
  });
  const suggestedTypes = EVIDENCE_TYPES.filter(t => t.maps.includes(indicator.id));
  // ZIP 實際檔案數 = 每個 upload × 它匹配的 type 數量
  const dlCount = relevantUploads.filter(u => u.fileUrl).reduce((sum, u) => {
    const tids = getUploadTypeIds(u);
    const matchCount = tids.filter(tid => { const t = resolveType(tid); return t && t.maps.includes(indicator.id); }).length;
    return sum + (matchCount || 1);
  }, 0);
  const [dlLoading, setDlLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTypeIds, setEditTypeIds] = useState([]);

  function startEdit(u) {
    setEditingId(u.id);
    setEditTypeIds(getUploadTypeIds(u));
  }
  function toggleEditType(id) {
    setEditTypeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function saveEdit() {
    if (onEditUpload && editTypeIds.length > 0) onEditUpload(editingId, editTypeIds);
    setEditingId(null);
  }

  function downloadFile(url, filename) {
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => alert('❌ 檔案下載失敗，請稍後再試'));
  }

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
          padding: 14, marginBottom: 12,
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.gold, marginBottom: 6 }}>
            ▼ 一句話說明
          </div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 17, color: PALETTE.text, lineHeight: 1.4 }}>
            {indicator.plain}
          </div>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {onOpenUpload && (
            <PixelButton
              size="md" color={PALETTE.gold} textColor="#000"
              onClick={() => { onClose(); onOpenUpload(); }}
            >
              ⚔ 上傳這個指標的佐證資料
            </PixelButton>
          )}
          {dlCount > 0 && (
            <PixelButton
              size="md" color={dlLoading ? PALETTE.panelLt : PALETTE.cyan} textColor={dlLoading ? PALETTE.textDim : '#000'}
              onClick={() => !dlLoading && downloadIndicatorZip(indicator, uploads, teamData?.name || '', () => setDlLoading(true), () => setDlLoading(false))}
            >
              {dlLoading ? '壓縮中…' : `↓ 下載此指標 ZIP (${dlCount})`}
            </PixelButton>
          )}
        </div>

        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.text, marginBottom: 8 }}>
          ▼ 已蒐集的資料（{relevantUploads.length}）
        </div>
        {relevantUploads.length > 0 ? (
          <div style={{ marginBottom: 18 }}>
            {relevantUploads.map(u => {
              const tids = getUploadTypeIds(u);
              const ts = tids.map(tid => resolveType(tid)).filter(Boolean);
              const matching = ts.filter(t => t.maps.includes(indicator.id));

              // 每個 matching type 各產生一個建議檔名
              const cleanStr = s => (s || '').replace(/[\/\\:*?"<>|\s]/g, '_').replace(/_+/g, '_');
              const getExt  = f => { const p = (f || '').split('.'); return p.length > 1 ? p.pop() : 'pdf'; };
              const tName   = cleanStr(teamData?.name || '');
              const ext     = getExt(u.fileName);
              const suggestedNames = matching.map(m => ({
                type: m,
                name: `指標${indicator.id}_${cleanStr(m.name)}_${tName}_${cleanStr(u.courseName)}.${ext}`,
              }));

              const isEditing = editingId === u.id;
              return (
                <div key={u.id} style={{ marginBottom: 6 }}>
                  {/* 主行 */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 12,
                    padding: '10px 14px', background: isEditing ? PALETTE.bg : PALETTE.panel,
                    border: `2px solid ${isEditing ? PALETTE.purple : PALETTE.border}`,
                    borderBottom: isEditing ? 'none' : undefined,
                    alignItems: 'center',
                  }}>
                    {/* 第一欄：佐證類型標籤 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {matching.map(m => (
                        <span key={m.id} style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 12,
                          background: PALETTE.green + '22', color: PALETTE.green,
                          padding: '2px 8px', border: `1px solid ${PALETTE.green}`,
                          display: 'block',
                        }}>{m.name}</span>
                      ))}
                      {playerMap?.[u.id] && (
                        <span style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                          color: PALETTE.gold, marginTop: 2, display: 'block',
                        }}>👤 {playerMap[u.id]}</span>
                      )}
                    </div>

                    {/* 第二欄：原始檔名（可點擊下載）/ 更新檔名 */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ marginBottom: 6 }}>
                        <div style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                          color: PALETTE.textDim, marginBottom: 2,
                        }}>原始檔名</div>
                        {u.fileUrl ? (
                          <div
                            onClick={() => downloadFile(u.fileUrl, u.fileName)}
                            title="點擊下載原始檔案"
                            style={{
                              fontFamily: "'DotGothic16', monospace", fontSize: 13,
                              color: PALETTE.cyan, cursor: 'pointer',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              textDecoration: 'underline',
                            }}>{u.fileName}</div>
                        ) : (
                          <div style={{
                            fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{u.fileName}</div>
                        )}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                          color: PALETTE.textDim, marginBottom: 4,
                        }}>更新檔名</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {suggestedNames.map(({ type: m, name: sName }) => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span style={{
                                fontFamily: "'Press Start 2P', monospace", fontSize: 6,
                                color: PALETTE.textDim, whiteSpace: 'nowrap', flexShrink: 0,
                              }}>({matching.indexOf(m) + 1})</span>
                              {u.fileUrl ? (
                                <div
                                  onClick={() => downloadFile(u.fileUrl, sName)}
                                  title={`點擊以「${m.name}」檔名下載`}
                                  style={{
                                    fontFamily: "'DotGothic16', monospace", fontSize: 13,
                                    color: PALETTE.green, cursor: 'pointer',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    textDecoration: 'underline',
                                  }}>{sName}</div>
                              ) : (
                                <div style={{
                                  fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.cyan,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>{sName}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 第三欄：修改 + 刪除按鈕 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
                      {onEditUpload && (
                        <div
                          onClick={() => isEditing ? setEditingId(null) : startEdit(u)}
                          style={{
                            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                            color: PALETTE.purple, cursor: 'pointer',
                            border: `2px solid ${PALETTE.purple}`,
                            background: isEditing ? PALETTE.purple + '33' : 'transparent',
                            padding: '6px 10px', whiteSpace: 'nowrap', textAlign: 'center',
                          }}
                        >✏ 修改</div>
                      )}
                      {onDeleteUpload && (
                        <div
                          onClick={() => {
                            if (!confirm('確定要刪除這筆資料嗎？')) return;
                            onDeleteUpload(u.id);
                          }}
                          style={{
                            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                            color: PALETTE.red, cursor: 'pointer',
                            border: `2px solid ${PALETTE.red}`,
                            padding: '6px 10px', whiteSpace: 'nowrap', textAlign: 'center',
                          }}
                        >✕ 刪除</div>
                      )}
                    </div>
                  </div>

                  {/* 修改佐證類型 inline panel */}
                  {isEditing && (
                    <div style={{
                      background: PALETTE.bg, padding: '12px 14px',
                      border: `2px solid ${PALETTE.purple}`, borderTop: 'none',
                    }}>
                      <div style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                        color: PALETTE.purple, marginBottom: 10,
                      }}>✏ 修改佐證類型（可複選）</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {EVIDENCE_TYPES.map(t => {
                          const active = editTypeIds.includes(t.id);
                          return (
                            <div key={t.id} onClick={() => toggleEditType(t.id)} style={{
                              padding: '5px 10px', cursor: 'pointer', borderRadius: 3,
                              background: active ? PALETTE.gold : PALETTE.panel,
                              color: active ? '#000' : PALETTE.text,
                              border: `2px solid ${active ? PALETTE.gold : PALETTE.border}`,
                              fontFamily: "'DotGothic16', monospace", fontSize: 12,
                              display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                              {active && <span style={{ fontSize: 10 }}>✓</span>}
                              {t.icon} {t.name}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingId(null)} style={{
                          background: 'transparent', border: `1px solid ${PALETTE.line}`,
                          color: PALETTE.textDim, borderRadius: 3, padding: '5px 12px',
                          fontFamily: "'Press Start 2P', monospace", fontSize: 8, cursor: 'pointer',
                        }}>✕ 取消</button>
                        <button onClick={saveEdit} disabled={editTypeIds.length === 0} style={{
                          background: editTypeIds.length > 0 ? PALETTE.purple : '#555',
                          border: 'none', color: '#fff', borderRadius: 3, padding: '5px 12px',
                          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                          cursor: editTypeIds.length > 0 ? 'pointer' : 'default',
                        }}>✓ 儲存</button>
                      </div>
                    </div>
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
            <div key={t.id}
              onClick={onOpenUpload ? () => { onClose(); onOpenUpload([t.id]); } : undefined}
              style={{
                background: PALETTE.panel, border: `2px solid ${PALETTE.border}`,
                padding: '10px 12px',
                cursor: onOpenUpload ? 'pointer' : 'default',
                transition: 'border-color 80ms, background 80ms',
              }}
              onMouseEnter={e => { if (onOpenUpload) { e.currentTarget.style.borderColor = PALETTE.gold; e.currentTarget.style.background = PALETTE.panelLt; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = PALETTE.border; e.currentTarget.style.background = PALETTE.panel; }}
            >
              {/* 第一行：名稱 + 單位 + 難度 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: t.desc ? 6 : 0 }}>
                <span style={{
                  fontFamily: "'DotGothic16', monospace", fontSize: 13,
                  background: PALETTE.green + '22', color: PALETTE.green,
                  padding: '1px 7px', border: `1px solid ${PALETTE.green}`,
                  whiteSpace: 'nowrap',
                }}>{t.name}</span>
                {t.unit && (
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    background: PALETTE.panelLt, color: PALETTE.cyan,
                    padding: '2px 6px', border: `1px solid ${PALETTE.line}`,
                    whiteSpace: 'nowrap',
                  }}>{t.unit}</span>
                )}
                <span style={{
                  marginLeft: 'auto',
                  display: 'inline-flex', alignItems: 'center',
                  background: DIFFICULTY_POINTS[t.difficulty].color, color: '#000',
                  borderRadius: 4, padding: '1px 6px',
                  fontFamily: "'Press Start 2P', monospace", fontSize: 6,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                  whiteSpace: 'nowrap',
                }}>
                  {DIFFICULTY_POINTS[t.difficulty].label} · +{DIFFICULTY_POINTS[t.difficulty].points}
                </span>
              </div>
              {/* 第二行：佐證說明 */}
              {t.desc && (
                <div style={{
                  fontFamily: "'DotGothic16', monospace", fontSize: 12,
                  color: PALETTE.textDim, lineHeight: 1.4,
                }}>{t.desc}</div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { ScreenAchievements, IndicatorCard, IndicatorDetail, FilterPill });
