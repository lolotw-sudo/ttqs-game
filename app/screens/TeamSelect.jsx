// 角色建立畫面：輸入名稱 + 選擇戰隊
function ScreenTeamSelect({ currentTeam, currentName, onSelect, onBack }) {
  const [playerName, setPlayerName] = useState(currentName || '');
  const [selected, setSelected] = useState(currentTeam || null);

  const canConfirm = playerName.trim().length > 0 && selected !== null;

  const inputStyle = {
    width: '100%',
    fontFamily: "'DotGothic16', 'Noto Sans TC', monospace",
    fontSize: 20,
    padding: '12px 16px',
    background: PALETTE.bg,
    color: PALETTE.text,
    border: `3px solid ${PALETTE.border}`,
    boxShadow: `inset 2px 2px 0 rgba(0,0,0,0.4)`,
    outline: 'none',
    letterSpacing: 1,
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 28px',
      position: 'relative',
    }}>

      {/* 回上頁 */}
      {onBack && (
        <div style={{ position: 'absolute', top: 24, left: 28 }}>
          <PixelButton size="sm" color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onBack}>
            ◀ 返回
          </PixelButton>
        </div>
      )}

      {/* 標題 */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10, color: PALETTE.textDim,
          letterSpacing: 4, marginBottom: 12,
        }}>
          ─── CREATE YOUR CHARACTER ───
        </div>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 24, color: PALETTE.gold,
          textShadow: '3px 3px 0 #000, -2px -2px 0 #000',
          letterSpacing: 2, lineHeight: 1.4,
        }}>
          建立你的角色
        </div>
      </div>

      {/* ── STEP 1: 名稱 ── */}
      <div style={{ maxWidth: 1100, width: '100%', marginBottom: 36 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10, color: PALETTE.gold,
          letterSpacing: 1, marginBottom: 10,
        }}>
          ▼ STEP 1 — 輸入你的名稱
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
          <div>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="例：小雅_HR、阿明_IT…"
              maxLength={16}
              style={inputStyle}
            />
            <div style={{
              fontFamily: "'DotGothic16', monospace",
              fontSize: 12, color: PALETTE.textDim, marginTop: 6,
            }}>
              最多 16 個字，之後會顯示在玩家卡上
            </div>
          </div>
          {/* 預覽名稱牌 */}
          <div style={{
            background: PALETTE.panel,
            border: `3px solid ${playerName.trim() ? PALETTE.purple : PALETTE.border}`,
            boxShadow: playerName.trim() ? `4px 4px 0 0 ${PALETTE.shadow}` : 'none',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            minWidth: 220,
          }}>
            <div style={{
              width: 42, height: 42,
              background: PALETTE.panel,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}><PixelAvatar size={36} /></div>
            <div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                color: playerName.trim() ? PALETTE.text : PALETTE.textDim,
              }}>
                {playerName.trim() || '???'}
              </div>
              {selected && (
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: TEAMS.find(t => t.id === selected)?.color,
                  marginTop: 4,
                }}>
                  {TEAMS.find(t => t.id === selected)?.emoji}{' '}
                  {TEAMS.find(t => t.id === selected)?.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 2: 戰隊 ── */}
      <div style={{ maxWidth: 1100, width: '100%', marginBottom: 36 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10, color: PALETTE.gold,
          letterSpacing: 1, marginBottom: 14,
        }}>
          ▼ STEP 2 — 選擇你的戰隊
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
        }}>
          {TEAMS.map(t => {
            const active = selected === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelected(t.id)}
                style={{
                  background: active ? PALETTE.panel : PALETTE.bgAlt,
                  border: `3px solid ${active ? t.color : PALETTE.border}`,
                  boxShadow: active
                    ? `4px 4px 0 0 ${t.color}88, 0 0 0 1px ${t.color}`
                    : `4px 4px 0 0 ${PALETTE.shadow}`,
                  padding: '20px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transform: active ? 'translate(-2px,-2px)' : 'translate(0,0)',
                  transition: 'all 80ms steps(2)',
                  position: 'relative',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    background: t.color, color: '#000',
                    padding: '3px 8px',
                    border: `2px solid ${PALETTE.border}`,
                    whiteSpace: 'nowrap',
                  }}>
                    ★ 選擇中
                  </div>
                )}
                <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>{t.emoji}</div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                  color: active ? t.color : PALETTE.text,
                  marginBottom: 8, lineHeight: 1.5,
                }}>
                  {t.name}
                </div>
                <div style={{
                  fontFamily: "'DotGothic16', monospace", fontSize: 12,
                  color: active ? PALETTE.text : PALETTE.textDim,
                }}>
                  {t.desc}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
                  background: active ? t.color : 'transparent',
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 確認按鈕 */}
      <PixelButton
        size="lg"
        color={canConfirm ? PALETTE.gold : '#555'}
        textColor={canConfirm ? '#000' : '#888'}
        disabled={!canConfirm}
        onClick={() => canConfirm && onSelect({ name: playerName.trim(), teamId: selected })}
      >
        ⚔ 開始冒險！
      </PixelButton>

      {!playerName.trim() && (
        <div style={{
          marginTop: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9, color: PALETTE.red,
          animation: 'blink 1.5s steps(2) infinite',
        }}>
          請先輸入你的名稱
        </div>
      )}
      {playerName.trim() && !selected && (
        <div style={{
          marginTop: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9, color: PALETTE.red,
          animation: 'blink 1.5s steps(2) infinite',
        }}>
          請選擇一個戰隊
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ScreenTeamSelect });
