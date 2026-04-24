// 上傳完成慶祝動畫
// 階段：1 閃光 → 2 加分飛進 → 3 指標卡片翻轉 → 4 等級提升（如果）→ 5 回主地圖
function ScreenCelebration({ delta, state, prevState, fileCacheWarn, onDone }) {
  const [phase, setPhase] = useState(0);
  // phase: 0 flash, 1 score, 2 indicators, 3 levelup(optional), 4 hold/summary

  const leveledUp = state.level > prevState.level;
  const phases = [500, 900, 1600, leveledUp ? 1800 : 0, 0];

  useEffect(() => {
    const durations = [
      phases[0], phases[1], phases[2],
      ...(leveledUp ? [phases[3]] : []),
    ];
    let i = 0;
    const advance = () => {
      if (i >= durations.length) return;
      const d = durations[i];
      setTimeout(() => {
        i++;
        setPhase(p => p + 1);
        advance();
      }, d);
    };
    advance();
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,10,26,0.94)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* 粒子 */}
      <Particles show={phase >= 1} />

      {/* 放射光 */}
      {phase >= 0 && (
        <div style={{
          position: 'absolute', inset: '-20%',
          background: `repeating-conic-gradient(from 0deg, rgba(255,210,63,0.08) 0deg 8deg, transparent 8deg 16deg)`,
          animation: 'spin 8s linear infinite',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        position: 'relative', width: 'min(760px, 92vw)',
        padding: 28,
        textAlign: 'center',
      }}>
        {/* Phase 0: Flash title */}
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 36, color: PALETTE.gold,
          textShadow: '4px 4px 0 #000, -2px -2px 0 #000',
          animation: 'popbounce 500ms steps(6)',
          marginBottom: 20, lineHeight: 1.3,
          letterSpacing: 2,
        }}>
          QUEST<br />CLEAR!
        </div>

        {/* Phase 1+: 分數 */}
        {phase >= 1 && (
          <div style={{ marginBottom: 24, animation: 'popbounce 500ms steps(6)' }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 11,
              color: PALETTE.textDim, marginBottom: 10, letterSpacing: 2,
            }}>
              YOU GOT
            </div>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 72,
              color: PALETTE.gold,
              textShadow: '5px 5px 0 #000, -2px 0 0 #ff5e5b, 2px 0 0 #4ea8de',
              lineHeight: 1,
            }}>
              +{delta.totalPoints}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 14,
              marginTop: 14,
              fontFamily: "'DotGothic16', monospace", fontSize: 15, color: PALETTE.text,
            }}>
              <span>基礎 <span style={{ color: PALETTE.gold }}>+{delta.basePoints}</span></span>
              {delta.unlockBonus > 0 && (
                <>
                  <span style={{ color: PALETTE.line }}>│</span>
                  <span>首解 <span style={{ color: PALETTE.pink }}>+{delta.unlockBonus}</span></span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Phase 2+: 解鎖/達成指標 */}
        {phase >= 2 && (delta.newlyUnlocked.length > 0 || delta.newlyCompleted.length > 0) && (
          <div style={{
            background: PALETTE.bgAlt,
            border: `3px solid ${PALETTE.gold}`,
            boxShadow: pixelShadow(PALETTE.shadow, 4),
            padding: 18, marginBottom: 18,
            animation: 'slideUp 400ms steps(6)',
          }}>
            {delta.newlyUnlocked.length > 0 && (
              <>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                  color: PALETTE.pink, marginBottom: 10,
                }}>
                  ★ 新指標解鎖 × {delta.newlyUnlocked.length}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: delta.newlyCompleted.length ? 14 : 0 }}>
                  {delta.newlyUnlocked.map((id, i) => {
                    const ind = INDICATORS.find(x => x.id === id);
                    return (
                      <div key={id} style={{
                        animation: `popbounce 500ms steps(6) ${i * 120}ms both`,
                      }}>
                        <IndicatorChip indicator={ind} status="partial" size="md" />
                        <div style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 11, color: PALETTE.text,
                          marginTop: 6, maxWidth: 90, lineHeight: 1.2,
                        }}>
                          {ind.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {delta.newlyCompleted.length > 0 && (
              <>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                  color: PALETTE.green, marginBottom: 10,
                }}>
                  ✔ 指標完成 × {delta.newlyCompleted.length}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {delta.newlyCompleted.map((id, i) => {
                    const ind = INDICATORS.find(x => x.id === id);
                    return (
                      <div key={id} style={{ animation: `popbounce 500ms steps(6) ${i * 120}ms both` }}>
                        <IndicatorChip indicator={ind} status="done" size="md" />
                        <div style={{
                          fontFamily: "'DotGothic16', monospace", fontSize: 11, color: PALETTE.text,
                          marginTop: 6, maxWidth: 90, lineHeight: 1.2,
                        }}>
                          {ind.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Phase 3: Level up */}
        {phase >= 3 && leveledUp && (
          <div style={{
            background: PALETTE.gold,
            border: `3px solid ${PALETTE.border}`,
            boxShadow: pixelShadow(PALETTE.shadow, 4),
            padding: 16, marginBottom: 18,
            animation: 'popbounce 500ms steps(6)',
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#000',
              textShadow: '2px 2px 0 rgba(255,255,255,0.4)',
            }}>
              ⬆ LEVEL UP! LV.{state.level}
            </div>
          </div>
        )}

        {/* Phase 4: Continue button + 檔案快取警告 */}
        {phase >= (leveledUp ? 4 : 3) && (
          <div style={{ animation: 'slideUp 400ms steps(6)' }}>
            {fileCacheWarn && (
              <div style={{
                background: '#2a1a00', border: `2px solid ${PALETTE.gold}`,
                borderRadius: 4, padding: '10px 14px', marginBottom: 14,
                fontFamily: "'DotGothic16', monospace", fontSize: 13,
                color: PALETTE.gold, textAlign: 'left', lineHeight: 1.6,
              }}>
                ⚠ 檔案{fileCacheWarn === 'quota' ? '儲存空間已滿' : '儲存失敗'}，無法在瀏覽器本機保留。
                {fileCacheWarn === 'quota' && (
                  <span style={{ color: PALETTE.textDim, fontSize: 12, display: 'block', marginTop: 4 }}>
                    請至瀏覽器設定清除本站快取，或改用較小的檔案上傳。
                  </span>
                )}
                <span style={{ color: PALETTE.textDim, fontSize: 12, display: 'block', marginTop: 2 }}>
                  上傳紀錄已儲存，但「檢視」功能在此裝置上無法使用。
                </span>
              </div>
            )}
            <PixelButton size="lg" color={PALETTE.green} textColor="#000" onClick={onDone}>
              繼續冒險 ▶
            </PixelButton>
          </div>
        )}

        {/* 提前跳過 */}
        {phase < (leveledUp ? 4 : 3) && (
          <div onClick={onDone} style={{
            position: 'absolute', bottom: -20, right: 0,
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            color: PALETTE.textDim, cursor: 'pointer',
          }}>
            SKIP »
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 粒子效果 ==========
function Particles({ show }) {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: [PALETTE.gold, PALETTE.pink, PALETTE.green, PALETTE.cyan, PALETTE.purple][i % 5],
      delay: Math.random() * 800,
      size: 8 + Math.random() * 12,
      drift: -20 + Math.random() * 40,
    }));
  }, []);
  if (!show) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`, top: `${p.top}%`,
          width: p.size, height: p.size,
          background: p.color,
          border: `2px solid #000`,
          animation: `float 1800ms steps(12) ${p.delay}ms both`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
    </div>
  );
}

Object.assign(window, { ScreenCelebration });
