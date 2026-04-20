// 個人成績單 / 徽章牆
function ScreenProfile({ state, uploads, team, playerName, onClose, onChangeTeam }) {
  const teamData = TEAMS.find(t => t.id === team);
  const totalByStage = {};
  STAGES.forEach(s => {
    totalByStage[s.id] = uploads.filter(u => {
      const tids = getUploadTypeIds(u);
      return tids.some(tid => {
        const t = EVIDENCE_TYPES.find(x => x.id === tid);
        return t && t.maps.some(id => INDICATORS.find(i => i.id === id)?.stage === s.id);
      });
    }).length;
  });

  const byDifficulty = [1, 2, 3, 4, 5].map(lv => ({
    lv, count: uploads.filter(u => {
      const tids = getUploadTypeIds(u);
      const ts = tids.map(tid => EVIDENCE_TYPES.find(x => x.id === tid)).filter(Boolean);
      if (!ts.length) return false;
      const hardest = ts.reduce((a, b) => (a.difficulty >= b.difficulty ? a : b), ts[0]);
      return hardest.difficulty === lv;
    }).length,
  }));

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <PixelButton size="sm" color={PALETTE.panelLt} textColor={PALETTE.text} onClick={onClose}>◀ 返回</PixelButton>
        <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: PALETTE.text, margin: 0 }}>
          🎖 冒險者檔案
        </h1>
      </div>

      {/* 玩家卡 */}
      <PixelBox color={PALETTE.bgAlt} padding={24} style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 22, alignItems: 'center' }}>
          <div style={{
            width: 120, height: 120,
            background: PALETTE.panel,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}><PixelAvatar size={104} /></div>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: PALETTE.text, marginBottom: 8 }}>
              {playerName || '???'}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: PALETTE.gold, color: '#000',
                padding: '4px 8px', border: `2px solid ${PALETTE.border}`,
                fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              }}>LV.{state.level}</span>
              <span style={{
                background: PALETTE.purple, color: '#fff',
                padding: '4px 8px', border: `2px solid ${PALETTE.border}`,
                fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              }}>
                {state.doneCount >= 15 ? 'TTQS 大師' : state.doneCount >= 10 ? 'TTQS 老手' : state.doneCount >= 5 ? '訓練專員' : '新手訓練師'}
              </span>
              {teamData && (
                <span style={{
                  background: teamData.color + '22',
                  color: teamData.color,
                  border: `2px solid ${teamData.color}`,
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  padding: '4px 8px',
                }}>
                  {teamData.emoji} {teamData.name}
                </span>
              )}
              <span
                onClick={onChangeTeam}
                style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: PALETTE.textDim, cursor: 'pointer',
                  borderBottom: `1px solid ${PALETTE.textDim}`,
                  alignSelf: 'center',
                }}
              >
                換隊 »
              </span>
            </div>
            <StatBar value={state.levelPoints} max={state.levelMax} color={PALETTE.gold} label="EXP" />
          </div>
        </div>
      </PixelBox>

      {/* 三欄統計 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <BigStat label="累計金幣" value={state.points} color={PALETTE.gold} icon="◎" />
        <BigStat label="資料上傳" value={uploads.length} color={PALETTE.cyan} icon="▣" />
        <BigStat label="指標完成" value={`${state.doneCount}/19`} color={PALETTE.green} icon="✔" />
        <BigStat label="已獲徽章" value={`${state.earnedBadges.length}/${BADGES.length}`} color={PALETTE.pink} icon="★" />
      </div>

      {/* 徽章牆 */}
      <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: PALETTE.text, marginBottom: 10 }}>
        ▼ 徽章牆 TROPHY CASE
      </h2>
      <PixelBox color={PALETTE.bgAlt} padding={18} style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {BADGES.map(b => {
            const earned = state.earnedBadges.includes(b.id);
            return (
              <div key={b.id} style={{
                textAlign: 'center', padding: 12,
                background: earned ? PALETTE.panel : '#1a1a30',
                border: `2px solid ${PALETTE.border}`,
                boxShadow: pixelShadow(PALETTE.shadow, earned ? 3 : 1),
                opacity: earned ? 1 : 0.5,
              }}>
                <div style={{ fontSize: 42, lineHeight: 1, filter: earned ? 'none' : 'grayscale(1)' }}>
                  {earned ? b.icon : '🔒'}
                </div>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  color: earned ? PALETTE.gold : PALETTE.textDim, marginTop: 8,
                }}>{b.name}</div>
                <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginTop: 6, lineHeight: 1.3 }}>
                  {b.desc}
                </div>
              </div>
            );
          })}
        </div>
      </PixelBox>

      {/* 五大關卡戰績 */}
      <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: PALETTE.text, marginBottom: 10 }}>
        ▼ 關卡戰績 STAGE STATS
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        {STAGES.map(s => {
          const p = state.stageProgress[s.id];
          const complete = p.done === p.total;
          return (
            <div key={s.id} style={{
              background: PALETTE.panel, border: `3px solid ${s.color}`,
              boxShadow: pixelShadow(PALETTE.shadow, 3), padding: 12, textAlign: 'center',
            }}>
              <div style={{ fontSize: 26 }}>{s.emoji}</div>
              <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.text, fontWeight: 700, marginTop: 4 }}>
                {s.name}
              </div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: complete ? PALETTE.green : PALETTE.gold, marginTop: 6 }}>
                {p.done}/{p.total}
              </div>
              <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 12, color: PALETTE.textDim, marginTop: 2 }}>
                上傳 {totalByStage[s.id]} 筆
              </div>
            </div>
          );
        })}
      </div>

      {/* 資料難度分佈 */}
      <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: PALETTE.text, marginBottom: 10 }}>
        ▼ 難度戰績 DIFFICULTY
      </h2>
      <PixelBox color={PALETTE.bgAlt} padding={14}>
        {byDifficulty.map(({ lv, count }) => {
          const d = DIFFICULTY_POINTS[lv];
          const max = Math.max(1, ...byDifficulty.map(b => b.count));
          return (
            <div key={lv} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <DifficultyBadge level={lv} compact />
              <div style={{
                height: 16, background: '#000', border: `2px solid ${PALETTE.border}`, padding: 2,
              }}>
                <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: d.color }} />
              </div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: PALETTE.text }}>× {count}</div>
            </div>
          );
        })}
      </PixelBox>
    </div>
  );
}

function BigStat({ label, value, color, icon }) {
  return (
    <div style={{
      background: PALETTE.panel, border: `3px solid ${PALETTE.border}`,
      boxShadow: pixelShadow(PALETTE.shadow, 3), padding: 14,
    }}>
      <div style={{ fontFamily: "'DotGothic16', monospace", fontSize: 13, color: PALETTE.textDim }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <span style={{ color, fontFamily: "'Press Start 2P', monospace", fontSize: 20 }}>{icon}</span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: PALETTE.text }}>{value}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenProfile });
