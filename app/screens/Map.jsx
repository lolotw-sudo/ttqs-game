// 主地圖：五大關卡卡牌式儀表板 + 玩家狀態
// 依賴：React, PALETTE, PixelBox, PixelButton, StatBar, IndicatorChip, STAGES, INDICATORS, BADGES

function ScreenMap({ state, uploads, team, playerName, onOpenStage, onOpenUpload, onOpenAchievements, onOpenProfile }) {
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1280, margin: '0 auto' }}>
      {/* ========= 頂部玩家狀態 ========= */}
      <PlayerHUD state={state} team={team} playerName={playerName} onOpenProfile={onOpenProfile} onOpenAchievements={onOpenAchievements} />

      {/* ========= 上傳卡片 ========= */}
      <UploadCard state={state} onOpenUpload={onOpenUpload} />

      {/* ========= 任務路徑（PDDRO）========= */}
      <div style={{ marginBottom: 14 }}>
        <h2 style={titleStyle}>▼ 任務路徑 QUEST MAP</h2>
        <div style={subtitleStyle}>完成五大流程，收集 19 項 TTQS 指標</div>
      </div>

      {/* 路徑連線 + 關卡卡 */}
      <div style={{ position: 'relative' }}>
        {/* 虛線路徑 */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0, height: 6,
          backgroundImage: `repeating-linear-gradient(90deg, ${PALETTE.gold} 0 8px, transparent 8px 16px)`,
          transform: 'translateY(-50%)', zIndex: 0,
          opacity: 0.5,
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 14,
          position: 'relative', zIndex: 1,
        }}>
          {STAGES.map((stage, idx) => (
            <StageCard key={stage.id} stage={stage} idx={idx}
              progress={state.stageProgress[stage.id]}
              onClick={() => onOpenStage(stage.id)} />
          ))}
        </div>
      </div>

      {/* ========= 最近活動 + 徽章 ========= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginTop: 40 }}>
        <RecentActivity uploads={uploads} />
        <BadgeShelf state={state} onSeeAll={onOpenAchievements} />
      </div>
    </div>
  );
}

// ========== 上傳卡片 ==========
function UploadCard({ state, onOpenUpload }) {
  const [btnHovered, setBtnHovered] = useState(false);

  const nearestInd =
    INDICATORS.find(i => state.indicatorStatus[i.id] === 'partial') ||
    INDICATORS.find(i => state.indicatorStatus[i.id] === 'locked');

  let hintText;
  if (!nearestInd) {
    hintText = '所有指標蒐集完成！繼續精進吧 🏆';
  } else {
    const needCount = state.indicatorStatus[nearestInd.id] === 'partial' ? 1 : 2;
    hintText = `再上傳 ${needCount} 筆可解鎖『${nearestInd.name}』✨`;
  }

  return (
    <>
      <style>{`
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(255,215,0,0.25); }
          50%       { box-shadow: 0 0 22px 7px rgba(255,215,0,0.55); }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a3e, #2a1a5e)',
        border: '2px solid #ffd700',
        borderRadius: 8,
        padding: '20px 24px',
        margin: '20px 0 32px',
        animation: 'goldPulse 2.4s ease-in-out infinite',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* 圖示 */}
        <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>📁</div>

        {/* 文字區 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: PALETTE.text }}>
              上傳佐證資料
            </span>
            <span style={{
              background: PALETTE.red, color: '#fff',
              fontFamily: "'Press Start 2P', monospace", fontSize: 8,
              padding: '3px 6px', borderRadius: 2,
              animation: 'wiggle 1.2s steps(4) infinite',
            }}>NEW</span>
          </div>
          <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            {hintText}
          </div>
        </div>

        {/* 主按鈕 */}
        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={onOpenUpload}
          style={{
            background: '#ffd700',
            color: '#0a0a1a',
            border: 'none',
            borderRadius: 4,
            padding: '14px 28px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 14,
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            transform: btnHovered ? 'translateY(-1px)' : 'translateY(0)',
            filter: btnHovered ? 'brightness(1.1)' : 'brightness(1)',
            transition: 'transform 120ms ease, filter 120ms ease',
          }}
        >
          ＋ 立即上傳
        </button>
      </div>
    </>
  );
}

// ========== 玩家 HUD ==========
function PlayerHUD({ state, team, playerName, onOpenProfile, onOpenAchievements }) {
  const teamData = TEAMS.find(t => t.id === team);
  return (
    <PixelBox color={PALETTE.bgAlt} padding={18} style={{ marginBottom: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 20, alignItems: 'center' }}>
        {/* 頭像 */}
        <div onClick={onOpenProfile} style={{
          width: 64, height: 64,
          background: PALETTE.panel,
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
        }}>
          <PixelAvatar size={56} />
        </div>

        {/* 名稱與等級條 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            {teamData && (
              <span style={{
                background: teamData.color,
                color: '#fff',
                fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                padding: '4px 10px', borderRadius: 4,
              }}>
                {teamData.emoji} {teamData.name}
              </span>
            )}
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: PALETTE.text }}>
              {playerName || '???'}
            </span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              lv.{state.level}
            </span>
          </div>
          <StatBar value={state.levelPoints} max={state.levelMax}
            color={PALETTE.gold} label="EXP" />
        </div>

        {/* 關鍵統計 */}
        <StatTile label="金幣" value={state.points} color={PALETTE.gold} icon="◎" />
        <StatTile label="指標" value={`${state.doneCount}/19`} color={PALETTE.green} icon="✔"
          onClick={onOpenAchievements} />
      </div>
    </PixelBox>
  );
}

function StatTile({ label, value, color, icon, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: PALETTE.panel,
      border: `3px solid ${PALETTE.border}`,
      boxShadow: pixelShadow(PALETTE.shadow, 3),
      padding: '10px 14px', minWidth: 110,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim, letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ color, fontFamily: "'Press Start 2P', monospace", fontSize: 16 }}>{icon}</span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: PALETTE.text }}>{value}</span>
      </div>
    </div>
  );
}

// ========== 五大關卡卡 ==========
function StageCard({ stage, idx, progress, onClick }) {
  const complete = progress.done === progress.total;
  return (
    <PixelBox hover onClick={onClick} padding={0}
      color={PALETTE.panel} style={{ overflow: 'hidden' }}>
      {/* 頂部色帶 */}
      <div style={{
        background: stage.color,
        padding: '10px 12px',
        borderBottom: `3px solid ${PALETTE.border}`,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -4, right: 6,
          fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#000',
          background: PALETTE.text, padding: '3px 5px', border: `2px solid ${PALETTE.border}`,
        }}>
          {idx + 1}/5
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: 'rgba(0,0,0,0.6)' }}>
          STAGE {idx + 1}
        </div>
        <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 22, color: '#000', fontWeight: 700, lineHeight: 1.1, marginTop: 2 }}>
          {stage.name}
        </div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
          {stage.subtitle}
        </div>
      </div>

      {/* 中段：emoji + 說明 */}
      <div style={{ padding: '14px 12px', textAlign: 'center' }}>
        <div style={{
          fontSize: 36, lineHeight: 1, marginBottom: 8,
          filter: complete ? 'none' : 'grayscale(0.1)',
        }}>{stage.emoji}</div>
        <div style={{
          fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim,
          minHeight: 40,
        }}>
          {stage.desc}
        </div>
      </div>

      {/* 進度 */}
      <div style={{ padding: '0 12px 12px' }}>
        <StatBar value={progress.done + progress.partial * 0.5} max={progress.total}
          color={complete ? PALETTE.green : stage.color}
          height={12}
          label={null} showText={false} />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: "'Press Start 2P', monospace", fontSize: 9,
          color: PALETTE.text, marginTop: 6,
        }}>
          <span>{progress.done}/{progress.total} ✔</span>
          <span style={{ color: complete ? PALETTE.green : PALETTE.gold }}>
            {complete ? 'CLEAR!' : `${progress.pct}%`}
          </span>
        </div>
      </div>
    </PixelBox>
  );
}

// ========== 最近活動 ==========
function RecentActivity({ uploads }) {
  const items = [...uploads].slice(-6).reverse();
  return (
    <div>
      <h2 style={titleStyle}>▼ 冒險日誌 LOG</h2>
      <PixelBox color={PALETTE.bgAlt} padding={0}>
        {items.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', fontFamily: "'DotGothic16', monospace", color: PALETTE.textDim }}>
            還沒開始冒險…
          </div>
        )}
        {items.map((u, i) => {
          const tids = getUploadTypeIds(u);
          const ts = tids.map(id => EVIDENCE_TYPES.find(x => x.id === id)).filter(Boolean);
          if (!ts.length) return null;
          const hardest = ts.reduce((a, b) => (a.difficulty >= b.difficulty ? a : b), ts[0]);

          // 取指標編號與階段色
          const indIds = hardest.maps || [];
          const firstInd = INDICATORS.find(ind => ind.id === indIds[0]);
          const stage = firstInd ? STAGES.find(s => s.id === firstInd.stage) : null;
          const stageColor = stage?.color || '#46468a';
          const indLabel = indIds.slice(0, 4).map(id => `#${id}`).join(' ');

          return (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              gap: 12, padding: '10px 14px', alignItems: 'center',
              borderBottom: i === items.length - 1 ? 'none' : `2px dashed ${PALETTE.line}`,
            }}>
              <div style={{ fontSize: 22, display: 'flex', gap: 2, flexWrap: 'nowrap' }}>
                {ts.slice(0, 3).map((t, idx) => <span key={idx}>{t.icon}</span>)}
                {ts.length > 3 && <span style={{ fontSize: 12, color: PALETTE.textDim, fontFamily: "'Press Start 2P', monospace", alignSelf: 'center' }}>+{ts.length - 3}</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.fileName}
                </div>
                <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: PALETTE.cyan, fontFamily: "'Press Start 2P', monospace", fontSize: 9, marginRight: 4 }}>{u.courseCode || '—'}</span>
                  {u.courseName || '(未指定課程)'} · {u.ts}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: stageColor, color: '#000',
                  borderRadius: 4, padding: '3px 8px',
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                  whiteSpace: 'nowrap',
                }}>
                  {indLabel} · {hardest.name}
                </span>
                {u.fileUrl ? (
                  <button
                    onClick={() => window.open(u.fileUrl, '_blank')}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${PALETTE.cyan}`,
                      color: PALETTE.cyan,
                      borderRadius: 3, padding: '3px 10px',
                      fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    ▶ 檢視
                  </button>
                ) : (
                  <span
                    title="檔案儲存於上傳當時的瀏覽器本機，此裝置或瀏覽器無法檢視"
                    style={{
                      color: PALETTE.textDim,
                      fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                      padding: '3px 8px', cursor: 'help',
                      border: `1px dashed ${PALETTE.line}`, borderRadius: 3,
                    }}
                  >⚠ 無本機檔</span>
                )}
              </div>
            </div>
          );
        })}
      </PixelBox>
    </div>
  );
}

// ========== 徽章架 ==========
function BadgeShelf({ state, onSeeAll }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <h2 style={titleStyle}>▼ 徽章 BADGES</h2>
        <span onClick={onSeeAll} style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.cyan,
          cursor: 'pointer', marginBottom: 8, textDecoration: 'underline',
        }}>
          SEE ALL »
        </span>
      </div>
      <PixelBox color={PALETTE.bgAlt} padding={14}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {BADGES.slice(0, 4).map(b => {
            const earned = state.earnedBadges.includes(b.id);
            return (
              <div key={b.id} style={{
                textAlign: 'center', padding: 8,
                background: earned ? PALETTE.panel : '#1a1a30',
                border: `2px solid ${PALETTE.border}`,
                boxShadow: pixelShadow(PALETTE.shadow, 2),
                opacity: earned ? 1 : 0.45,
                filter: earned ? 'none' : 'grayscale(0.9)',
              }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{earned ? b.icon : '🔒'}</div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: earned ? PALETTE.gold : PALETTE.textDim, marginTop: 6,
                }}>{b.name}</div>
              </div>
            );
          })}
        </div>
      </PixelBox>
    </div>
  );
}

// ========== 共用標題樣式 ==========
const titleStyle = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 14,
  color: PALETTE.text,
  margin: '0 0 6px',
  letterSpacing: 1,
};
const subtitleStyle = {
  fontFamily: "'DotGothic16', monospace",
  fontSize: 14,
  color: PALETTE.textDim,
  marginBottom: 14,
};

Object.assign(window, { ScreenMap });
