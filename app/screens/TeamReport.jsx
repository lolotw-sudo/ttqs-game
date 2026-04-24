// 團隊佐證資料報表：依指標分類，支援 CSV 命名清單 + 批次 ZIP 下載
const DL_SESSION_KEY = 'ttqs_dl_auth';
const DL_PASSWORD    = '9336';

function ScreenTeamReport({ players, onClose }) {
  const { useState, useMemo, useRef } = React;
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [downloading, setDownloading] = useState(false);
  const [pwVerified, setPwVerified]   = useState(() => sessionStorage.getItem(DL_SESSION_KEY) === '1');
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwError, setPwError]         = useState(false);
  const pendingAction = useRef(null);

  function cleanName(s) {
    return (s || '').replace(/[\/\\:*?"<>|\s]/g, '_').replace(/_+/g, '_');
  }

  function getExt(fileName) {
    const parts = (fileName || '').split('.');
    return parts.length > 1 ? parts.pop() : 'pdf';
  }

  function suggestName(upload, type, indicator, teamData, seq = null) {
    const seqStr = seq !== null ? `_${String(seq).padStart(3, '0')}` : '';
    const teamName = cleanName(teamData?.name || '');
    const courseName = cleanName(upload.courseName || '');
    return `指標${indicator.id}_${cleanName(type.name)}_${teamName}_${courseName}${seqStr}.${getExt(upload.fileName)}`;
  }

  // Flatten: one entry per (upload × type × indicator)
  const allEntries = useMemo(() => {
    const result = [];
    players.forEach(player => {
      const teamData = TEAMS.find(t => t.id === player.team);
      (player.uploads || []).forEach(upload => {
        const typeIds = getUploadTypeIds(upload);
        typeIds.forEach(tid => {
          const type = EVIDENCE_TYPES.find(t => t.id === tid);
          if (!type) return;
          type.maps.forEach(indId => {
            const indicator = INDICATORS.find(i => i.id === indId);
            if (!indicator) return;
            result.push({ player, teamData, upload, type, indicator });
          });
        });
      });
    });
    return result;
  }, [players]);

  const filtered = useMemo(() =>
    selectedTeam === 'all' ? allEntries : allEntries.filter(e => e.player.team === selectedTeam),
    [allEntries, selectedTeam]
  );

  // Group by indicator id
  const byIndicator = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const key = e.indicator.id;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [filtered]);

  // Count real files available for zip（一份上傳 × 一個指標 = 一個檔）
  const zipCount = useMemo(() => {
    const seen = new Set();
    filtered.forEach(e => {
      if (e.upload.fileUrl) seen.add(`${e.upload.id}__${e.indicator.id}`);
    });
    return seen.size;
  }, [filtered]);

  // Team entry count
  const teamCounts = useMemo(() => {
    const map = {};
    allEntries.forEach(e => {
      map[e.player.team] = (map[e.player.team] || 0) + 1;
    });
    return map;
  }, [allEntries]);

  function requirePassword(action) {
    if (pwVerified) { action(); return; }
    pendingAction.current = action;
    setPwError(false);
    setShowPwModal(true);
  }

  function handlePasswordSubmit(pw) {
    if (pw === DL_PASSWORD) {
      sessionStorage.setItem(DL_SESSION_KEY, '1');
      setPwVerified(true);
      setShowPwModal(false);
      const fn = pendingAction.current;
      pendingAction.current = null;
      if (fn) fn();
    } else {
      setPwError(true);
    }
  }

  function downloadCSV() {
    const header = ['成員', '戰隊', '類別', '指標#', '指標名稱', '課程代碼', '課程名稱', '原始檔名', '建議檔名'];
    const rows = filtered.map(e => [
      e.player.name,
      e.teamData?.name || '',
      e.type.name,
      e.indicator.id,
      e.indicator.name,
      e.upload.courseCode || '',
      e.upload.courseName || '',
      e.upload.fileName,
      suggestName(e.upload, e.type, e.indicator, e.teamData),
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TTQS_佐證命名清單${selectedTeam !== 'all' ? '_' + (TEAMS.find(t => t.id === selectedTeam)?.name || '') : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function batchDownloadZip() {
    if (zipCount === 0) { downloadCSV(); return; }
    setDownloading(true);
    try {
      const zip = new JSZip();
      // 每個 (upload × indicator) 獨立產出一個檔案
      const seenPairs = new Set();
      const nameCount = {};
      const fetchTasks = [];
      filtered.forEach(e => {
        if (!e.upload.fileUrl) return;
        const pairKey = `${e.upload.id}__${e.indicator.id}`;
        if (seenPairs.has(pairKey)) return;
        seenPairs.add(pairKey);
        const base = `指標${e.indicator.id}_${cleanName(e.type.name)}_${cleanName(e.teamData?.name || '')}_${cleanName(e.upload.courseName || '')}`;
        const ext = getExt(e.upload.fileName);
        nameCount[base] = (nameCount[base] || 0) + 1;
        const seq = String(nameCount[base]).padStart(3, '0');
        const name = `${base}_${seq}.${ext}`;
        fetchTasks.push(
          fetch(e.upload.fileUrl)
            .then(r => r.blob())
            .then(blob => zip.file(name, blob))
        );
      });
      await Promise.all(fetchTasks);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TTQS_佐證資料${selectedTeam !== 'all' ? '_' + (TEAMS.find(t => t.id === selectedTeam)?.name || '') : ''}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1280, margin: '0 auto' }}>
      {/* 頂部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <PixelButton size="sm" color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onClose}>
          ◀ 返回
        </PixelButton>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 15,
          color: PALETTE.text, margin: 0,
        }}>
          📋 佐證資料報表
        </h1>
        <div style={{ flex: 1 }} />
        <PixelButton size="sm" color={PALETTE.cyan} textColor="#000" onClick={() => requirePassword(downloadCSV)}>
          ↓ 命名清單 CSV
        </PixelButton>
        <PixelButton
          size="sm"
          color={zipCount > 0 ? PALETTE.gold : PALETTE.panelLt}
          textColor={zipCount > 0 ? '#000' : PALETTE.textDim}
          onClick={() => requirePassword(batchDownloadZip)}
          disabled={downloading}
        >
          {downloading ? '壓縮中…' : `↓ 批次下載 ZIP (${zipCount})`}
        </PixelButton>
      </div>

      {/* 說明 */}
      {zipCount === 0 && (
        <div style={{
          background: PALETTE.panel, border: `2px solid ${PALETTE.line}`,
          padding: '10px 16px', marginBottom: 20,
          fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim,
        }}>
          💡 「批次下載 ZIP」需要上傳時選取實際檔案才能使用；「命名清單 CSV」隨時可下載，列出建議檔名供手動重新命名。
        </div>
      )}

      {/* 戰隊分頁 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[{ id: 'all', name: '全部', emoji: '📁' }, ...TEAMS].map(t => {
          const active = selectedTeam === t.id;
          const count = t.id === 'all' ? allEntries.length : (teamCounts[t.id] || 0);
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTeam(t.id)}
              style={{
                background: active ? PALETTE.gold : PALETTE.panel,
                color: active ? '#000' : PALETTE.text,
                border: `2px solid ${active ? PALETTE.gold : PALETTE.border}`,
                boxShadow: pixelShadow(PALETTE.shadow, active ? 3 : 1),
                padding: '8px 14px',
                cursor: 'pointer',
                fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                display: 'flex', alignItems: 'center', gap: 8,
                transform: active ? 'translate(-1px,-1px)' : 'none',
                transition: 'all 80ms steps(2)',
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.name}</span>
              <span style={{
                background: active ? 'rgba(0,0,0,0.15)' : PALETTE.bgAlt,
                padding: '1px 5px', fontSize: 8,
              }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* 內容 */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          fontFamily: "'DotGothic16', monospace", fontSize: 16, color: PALETTE.textDim,
        }}>
          目前沒有佐證資料
        </div>
      ) : (
        INDICATORS.map(indicator => {
          const items = byIndicator[indicator.id];
          if (!items || items.length === 0) return null;
          const stage = STAGES.find(s => s.id === indicator.stage);
          return (
            <div key={indicator.id} style={{ marginBottom: 22 }}>
              {/* 指標標頭 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                background: PALETTE.panel,
                border: `3px solid ${stage.color}`,
                borderBottom: 'none',
                padding: '8px 14px',
              }}>
                <span style={{
                  background: stage.color, color: '#000',
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  padding: '3px 8px',
                }}>#{indicator.id}</span>
                <span style={{
                  background: stage.color + '33', color: stage.color,
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  padding: '2px 7px',
                }}>{stage.subtitle}</span>
                <span style={{
                  fontFamily: "'DotGothic16', monospace", fontSize: 16,
                  color: PALETTE.text, fontWeight: 700,
                }}>{indicator.name}</span>
                <span style={{
                  fontFamily: "'DotGothic16', monospace", fontSize: 13,
                  color: PALETTE.textDim,
                }}>— {indicator.plain}</span>
                <div style={{ flex: 1 }} />
                <span style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  color: PALETTE.textDim,
                }}>{items.length} 筆</span>
              </div>

              {/* 檔案列 */}
              <div style={{ border: `3px solid ${stage.color}` }}>
                {/* 欄位標題 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 150px 180px 1fr 160px 60px',
                  gap: 10, padding: '6px 14px',
                  background: PALETTE.bgAlt,
                  borderBottom: `1px solid ${PALETTE.line}`,
                }}>
                  {['成員', '類別', '原始檔名', '建議檔名', '課程', ''].map((h, i) => (
                    <div key={i} style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                      color: PALETTE.textDim,
                    }}>{h}</div>
                  ))}
                </div>

                {items.map((e, i) => {
                  const name = suggestName(e.upload, e.type, e.indicator, e.teamData);
                  const hasFile = !!e.upload.fileUrl;
                  return (
                    <div key={`${e.upload.id}-${e.type.id}-${e.indicator.id}`} style={{
                      display: 'grid',
                      gridTemplateColumns: '150px 150px 180px 1fr 160px 60px',
                      gap: 10, padding: '10px 14px', alignItems: 'center',
                      background: i % 2 === 0 ? PALETTE.panel : PALETTE.bgAlt,
                      borderTop: `1px solid ${PALETTE.line}`,
                    }}>
                      {/* 成員 */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                          color: e.teamData?.color || PALETTE.textDim,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          marginBottom: 2,
                        }}>
                          {e.teamData?.emoji} {e.teamData?.name}
                        </div>
                        <div style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 13,
                          color: PALETTE.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{e.player.name}</div>
                      </div>

                      {/* 類別 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{e.type.icon}</span>
                        <span style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{e.type.name}</span>
                      </div>

                      {/* 原始檔名 */}
                      <div style={{
                        fontFamily: "'DotGothic16', monospace", fontSize: 12,
                        color: PALETTE.textDim,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{e.upload.fileName}</div>

                      {/* 建議檔名 */}
                      <div style={{
                        fontFamily: "'DotGothic16', monospace", fontSize: 12,
                        color: PALETTE.cyan,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{name}</div>

                      {/* 課程 */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                          color: PALETTE.gold,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{e.upload.courseCode || '—'}</div>
                        <div style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 11,
                          color: PALETTE.textDim,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{e.upload.courseName}</div>
                      </div>

                      {/* 下載 */}
                      <div>
                        {hasFile ? (
                          <div
                            onClick={() => requirePassword(() => {
                              fetch(e.upload.fileUrl)
                                .then(r => r.blob())
                                .then(blob => {
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url; a.download = name; a.click();
                                  URL.revokeObjectURL(url);
                                });
                            })}
                            style={{
                              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                              color: PALETTE.green, cursor: 'pointer',
                              border: `2px solid ${PALETTE.green}`,
                              padding: '4px 8px', display: 'inline-block',
                              whiteSpace: 'nowrap',
                            }}
                          >↓ 下載</div>
                        ) : (
                          <div style={{
                            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                            color: PALETTE.textDim,
                          }}>無原檔</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {showPwModal && (
        <PasswordModal
          onConfirm={handlePasswordSubmit}
          onCancel={() => { setShowPwModal(false); pendingAction.current = null; }}
          error={pwError}
        />
      )}
    </div>
  );
}

// ── 密碼輸入 Modal ──
function PasswordModal({ onConfirm, onCancel, error }) {
  const [pw, setPw] = React.useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10,10,26,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: PALETTE.bgAlt,
        border: `3px solid ${PALETTE.gold}`,
        boxShadow: pixelShadow(PALETTE.shadow, 6),
        padding: 32, width: 'min(400px, 92vw)',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 13, color: PALETTE.gold,
          textShadow: '2px 2px 0 #000',
          marginBottom: 16, lineHeight: 1.6,
        }}>
          🔒 下載鎖定
        </div>

        <div style={{
          fontFamily: "'DotGothic16', monospace",
          fontSize: 14, color: PALETTE.textDim,
          marginBottom: 20, lineHeight: 1.6,
        }}>
          密碼提示：LOLO 老師的辦公室<br />桌機分機號碼
        </div>

        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); }}
          onKeyDown={e => { if (e.key === 'Enter') onConfirm(pw); }}
          autoFocus
          placeholder="輸入密碼"
          style={{
            width: '100%',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 16, letterSpacing: 6,
            padding: '12px 14px',
            background: PALETTE.bg,
            color: PALETTE.text,
            border: `3px solid ${error ? PALETTE.red : PALETTE.border}`,
            boxShadow: `inset 2px 2px 0 rgba(0,0,0,0.4)`,
            outline: 'none',
            textAlign: 'center',
            marginBottom: 8,
          }}
        />

        {error && (
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9, color: PALETTE.red,
            marginBottom: 12,
            animation: 'wiggle 0.4s steps(4)',
          }}>
            ✕ 密碼錯誤，請再試一次
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <PixelButton color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onCancel}>
            取消
          </PixelButton>
          <PixelButton color={PALETTE.gold} textColor="#000" onClick={() => onConfirm(pw)}>
            確認 ▶
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTeamReport });
