// 成員選擇大廳：列出所有成員卡片 + 新增成員入口
function ScreenLanding({ players, onSelect, onNewPlayer, onDelete, onOpenReport }) {
  const isEmpty = players.length === 0;
  const [teamView, setTeamView] = useState(null);

  const teamViewData = teamView ? TEAMS.find(t => t.id === teamView) : null;

  return (
    <div style={{ padding: '40px 28px 60px', maxWidth: 1280, margin: '0 auto' }}>
      {teamViewData && (
        <TeamAchievementModal
          team={teamViewData}
          players={players}
          onClose={() => setTeamView(null)}
        />
      )}
      {/* 標題 */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 22, color: PALETTE.gold,
          textShadow: '4px 4px 0 #000, -2px -2px 0 #000',
          letterSpacing: 2,
        }}>★ TTQS Quest：評鑑資料蒐集任務</div>
      </div>

      {/* 使用說明（可折疊） */}
      <GuidanceBlock />

      {isEmpty ? (
        /* ── 空狀態 ── */
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '55vh', gap: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 72, lineHeight: 1 }}>🗺️</div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 14, color: PALETTE.text, lineHeight: 2,
          }}>還沒有成員</div>
          <div style={{
            fontFamily: "'DotGothic16', monospace",
            fontSize: 16, color: PALETTE.textDim,
          }}>建立第一個角色，開始 TTQS 任務！</div>
          <PixelButton size="lg" color={PALETTE.gold} onClick={onNewPlayer}>
            ＋ 建立第一個角色
          </PixelButton>
        </div>
      ) : (
        <>
          {/* ── 有成員 ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20,
          }}>
            <div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 13, color: PALETTE.text, marginBottom: 4,
              }}>▼ 選擇成員</div>
              <div style={{
                fontFamily: "'DotGothic16', monospace",
                fontSize: 14, color: PALETTE.textDim,
              }}>共 {players.length} 位成員</div>
            </div>
            <PixelButton size="sm" color={PALETTE.cyan} textColor="#000" onClick={onOpenReport}>
              📋 佐證資料報表
            </PixelButton>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18,
          }}>
            {players.map(p => (
              <LandingPlayerCard key={p.id} player={p} onSelect={onSelect} onDelete={onDelete} />
            ))}
            <NewMemberCard onClick={onNewPlayer} />
          </div>

          {/* ── 戰隊積分排名 ── */}
          <div style={{ marginTop: 48 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 13, color: PALETTE.text, marginBottom: 4, letterSpacing: 1,
              }}>▼ 戰隊積分排名 TEAM RANKING</div>
              <div style={{
                fontFamily: "'DotGothic16', monospace",
                fontSize: 14, color: PALETTE.textDim,
              }}>各戰隊成員上傳合計 · 19 項指標達成狀況 · 點擊戰隊名稱查看成就地圖</div>
            </div>
            <TeamRanking players={players} onTeamClick={setTeamView} />
          </div>
        </>
      )}
    </div>
  );
}

// ── 使用說明折疊區塊 ──
function GuidanceBlock() {
  const [open, setOpen] = React.useState(true);

  return (
    <div style={{ marginBottom: 32 }}>
      {/* 折疊按鈕 */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', justifyContent: 'flex-end',
          marginBottom: 4, cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9, color: PALETTE.textDim,
          display: 'inline-block',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 0.3s ease',
        }}>▼</span>
      </div>

      {/* 圖片（max-height 動畫） */}
      <div style={{
        maxHeight: open ? '800px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <img
          src="assets/guide-banner3.png"
          alt="使用說明：上傳關鍵資料，解鎖TTQS成就"
          style={{ width: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}

// ── 成員卡片 ──
function LandingPlayerCard({ player, onSelect, onDelete }) {
  const playerState = useMemo(
    () => computeState(player.uploads || INITIAL_UPLOADS),
    [player.uploads]
  );
  const teamData = TEAMS.find(t => t.id === player.team);

  return (
    <div style={{ position: 'relative' }}>
      {/* 刪除鈕 */}
      <div
        onClick={e => { e.stopPropagation(); onDelete(player.id); }}
        style={{
          position: 'absolute', top: -8, right: -8, zIndex: 10,
          width: 24, height: 24,
          background: PALETTE.bgAlt,
          border: `2px solid ${PALETTE.border}`,
          boxShadow: `2px 2px 0 ${PALETTE.shadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          fontFamily: "'Press Start 2P', monospace", fontSize: 9,
          color: PALETTE.textDim,
        }}
        title="刪除成員"
      >✕</div>

      <PixelBox padding={0} color={PALETTE.panel} style={{ overflow: 'hidden' }}>
        {/* 戰隊色帶 */}
        <div style={{
          background: teamData?.color || PALETTE.line,
          padding: '8px 12px',
          borderBottom: `3px solid ${PALETTE.border}`,
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9, color: '#000',
          }}>
            {teamData?.emoji} {teamData?.name || '未選擇'}
          </div>
        </div>

        {/* 玩家資訊 */}
        <div style={{ padding: '14px 14px 10px' }}>
          {/* 頭像 + 名稱 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: PALETTE.panel,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}><PixelAvatar size={38} /></div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                color: PALETTE.text, marginBottom: 6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{player.name}</div>
              <span style={{
                background: PALETTE.gold, color: '#000',
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '2px 6px', border: `2px solid ${PALETTE.border}`,
              }}>LV.{playerState.level}</span>
            </div>
          </div>

          {/* EXP 條 */}
          <StatBar
            value={playerState.levelPoints} max={playerState.levelMax}
            color={PALETTE.gold} label="EXP" height={10} showText={false}
          />

          {/* 指標 + 金幣 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: PALETTE.textDim, marginTop: 10, marginBottom: 12,
          }}>
            <span style={{ color: playerState.doneCount > 0 ? PALETTE.green : PALETTE.textDim }}>
              ✔ {playerState.doneCount}/19
            </span>
            <span style={{ color: PALETTE.gold }}>◎ {playerState.points}</span>
          </div>

          {/* 5 關卡進度迷你條 */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {STAGES.map(s => {
              const prog = playerState.stageProgress[s.id];
              return (
                <div key={s.id} style={{ flex: 1 }} title={`${s.name} ${prog.done}/${prog.total}`}>
                  <div style={{
                    height: 6, background: '#000',
                    border: `2px solid ${PALETTE.border}`, padding: 1,
                  }}>
                    <div style={{
                      width: `${prog.pct}%`, height: '100%',
                      background: prog.pct === 100 ? PALETTE.green : s.color,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 繼續冒險 */}
        <div style={{ padding: '0 14px 14px' }}>
          <PixelButton block size="sm" color={PALETTE.green} textColor="#000"
            onClick={() => onSelect(player.id)}>
            繼續冒險 ▶
          </PixelButton>
        </div>
      </PixelBox>
    </div>
  );
}

// ── 新增成員卡 ──
function NewMemberCard({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? PALETTE.bgAlt : 'transparent',
        border: `3px dashed ${hovered ? PALETTE.gold : PALETTE.line}`,
        boxShadow: hovered ? `4px 4px 0 0 ${PALETTE.shadow}` : 'none',
        padding: '32px 16px',
        textAlign: 'center', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 220,
        transition: 'all 80ms steps(2)',
      }}
    >
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 32, lineHeight: 1,
        color: hovered ? PALETTE.gold : PALETTE.textDim,
        marginBottom: 14,
      }}>＋</div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 11,
        color: hovered ? PALETTE.gold : PALETTE.textDim,
        lineHeight: 1.8,
      }}>新增成員</div>
      <div style={{
        fontFamily: "'DotGothic16', monospace", fontSize: 13,
        color: PALETTE.textDim, marginTop: 8,
      }}>建立新角色開始冒險</div>
    </div>
  );
}

// ── 戰隊積分排名表 ──
function TeamRanking({ players, onTeamClick }) {
  const teamStats = useMemo(() => {
    return TEAMS.map(team => {
      const allUploads = players
        .filter(p => p.team === team.id)
        .flatMap(p => p.uploads || []);
      const state = computeState(allUploads);
      const memberCount = players.filter(p => p.team === team.id).length;
      return { team, state, memberCount };
    });
  }, [players]);

  const ranked = [...teamStats].sort((a, b) => b.state.points - a.state.points);
  const rankMap = {};
  ranked.forEach((ts, i) => { rankMap[ts.team.id] = i + 1; });

  const cellBase = (bg = 'transparent') => ({
    padding: '6px 8px',
    borderRight: `1px solid ${PALETTE.line}`,
    borderBottom: `1px solid ${PALETTE.line}`,
    background: bg,
    verticalAlign: 'middle',
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        border: `2px solid ${PALETTE.line}`,
        fontFamily: "'DotGothic16', monospace",
      }}>
        <thead>
          <tr>
            <th style={{
              ...cellBase(PALETTE.bgAlt), width: '18%', textAlign: 'left',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9, color: PALETTE.textDim, padding: '10px 10px',
            }}>指標</th>
            {teamStats.map(({ team, state, memberCount }) => {
              const rank = rankMap[team.id];
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
              return (
                <th key={team.id}
                  onClick={() => onTeamClick && onTeamClick(team.id)}
                  style={{
                    ...cellBase(team.color + '18'), textAlign: 'center',
                    borderTop: `3px solid ${team.color}`, padding: '10px 6px',
                    cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = team.color + '30'}
                  onMouseLeave={e => e.currentTarget.style.background = team.color + '18'}
                >
                  <div style={{ fontSize: 20, lineHeight: 1 }}>{team.emoji}</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8, color: team.color, marginTop: 4, lineHeight: 1.5,
                  }}>{team.name}</div>
                  <div style={{
                    fontFamily: "'DotGothic16', monospace",
                    fontSize: 11, color: PALETTE.textDim, marginTop: 2,
                  }}>{memberCount} 人</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 13, color: PALETTE.gold, marginTop: 8,
                    textShadow: '1px 1px 0 #000',
                  }}>◎ {state.points}</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 9, color: PALETTE.textDim, marginTop: 3,
                  }}>{medal}</div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 7, color: team.color, marginTop: 6, opacity: 0.8,
                  }}>▶ 查看</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {STAGES.map(stage => (
            <React.Fragment key={stage.id}>
              {/* 關卡分隔列 */}
              <tr>
                <td colSpan={TEAMS.length + 1} style={{
                  background: stage.color + '28',
                  borderBottom: `1px solid ${stage.color}`,
                  borderTop: `2px solid ${stage.color}`,
                  padding: '5px 10px',
                }}>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 9, color: stage.color, letterSpacing: 1,
                  }}>{stage.emoji} {stage.name} · {stage.subtitle}</span>
                </td>
              </tr>
              {/* 指標列 */}
              {INDICATORS.filter(i => i.stage === stage.id).map(ind => (
                <tr key={ind.id}>
                  <td style={{ ...cellBase(PALETTE.bgAlt), padding: '7px 10px' }}>
                    <div style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 8, color: stage.color, marginBottom: 3,
                    }}>#{ind.id}</div>
                    <div style={{ fontSize: 13, color: PALETTE.text, lineHeight: 1.3 }}>
                      {ind.name}
                    </div>
                  </td>
                  {teamStats.map(({ team, state }) => {
                    const status = state.indicatorStatus[ind.id];
                    const count  = state.perInd[ind.id].count;
                    const bg = status === 'done'    ? '#1a3d22'
                             : status === 'partial' ? '#3a2e08'
                             : 'transparent';
                    const glyph = status === 'done'    ? '✔'
                                : status === 'partial' ? '◐' : '◻';
                    const glyphColor = status === 'done'    ? PALETTE.green
                                     : status === 'partial' ? PALETTE.gold
                                     : PALETTE.line;
                    return (
                      <td key={team.id} style={{ ...cellBase(bg), textAlign: 'center' }}>
                        <div style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: 13, color: glyphColor, lineHeight: 1,
                        }}>{glyph}</div>
                        {count > 0 && (
                          <div style={{
                            fontFamily: "'DotGothic16', monospace",
                            fontSize: 11, color: PALETTE.textDim, marginTop: 2,
                          }}>{count} 筆</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 戰隊成就地圖 Modal ──
function TeamAchievementModal({ team, players, onClose }) {
  const [selected, setSelected] = useState(null);

  const teamPlayers = useMemo(
    () => players.filter(p => p.team === team.id),
    [players, team.id]
  );

  // 合併所有成員的 uploads，附加 _playerName 供 IndicatorDetail 顯示
  const allUploads = useMemo(
    () => teamPlayers.flatMap(p => (p.uploads || []).map(u => ({ ...u, _playerName: p.name }))),
    [teamPlayers]
  );

  // uploadId → 成員名稱
  const playerMap = useMemo(() => {
    const map = {};
    allUploads.forEach(u => { map[u.id] = u._playerName; });
    return map;
  }, [allUploads]);

  const state = useMemo(() => computeState(allUploads), [allUploads]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(10,10,26,0.96)',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 28px 60px' }}>
        {/* 標頭 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <PixelButton size="sm" color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onClose}>
            ✕ 關閉
          </PixelButton>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{team.emoji}</span>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 13,
            color: team.color, margin: 0,
          }}>{team.name} · 成就地圖</h1>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: PALETTE.gold }}>
            {state.doneCount}/19 完成 · {state.partialCount} 部分
          </div>
        </div>

        {/* 成員列表 */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20,
        }}>
          {teamPlayers.length === 0 ? (
            <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.textDim }}>
              此戰隊目前沒有成員
            </div>
          ) : teamPlayers.map(p => (
            <div key={p.id} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
              background: PALETTE.panelLt, color: PALETTE.text,
              border: `1px solid ${team.color}40`,
              padding: '4px 10px',
            }}>👤 {p.name}</div>
          ))}
        </div>

        {/* 指標格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {INDICATORS.map(ind => (
            <IndicatorCard key={ind.id} ind={ind} state={state} onClick={() => setSelected(ind)} />
          ))}
        </div>

        {/* 指標詳情 modal（含成員名稱） */}
        {selected && (
          <IndicatorDetail
            indicator={selected}
            state={state}
            uploads={allUploads}
            playerMap={playerMap}
            teamData={team}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenLanding });
