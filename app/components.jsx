// 共用像素 UI 元件與工具
// 依賴：window 上的 React

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ========== 色票（8-bit 調色盤）==========
const PALETTE = {
  bg:       '#14142b',
  bgAlt:    '#1f1f3d',
  panel:    '#2a2a52',
  panelLt:  '#3b3b72',
  border:   'rgba(255,255,255,0.10)',  // 柔和邊框，不再用純黑
  line:     '#46468a',
  text:     '#f4f4ff',
  textDim:  '#a5a5cc',
  gold:     '#ffd23f',
  green:    '#7fd858',
  red:      '#ff5e5b',
  blue:     '#4ea8de',
  purple:   '#b85fff',
  pink:     '#ff7ac6',
  cyan:     '#5eead4',
  shadow:   '#0a0a1a',
};

// ========== 柔和陰影（取代像素硬偏移）==========
const pixelShadow = (color = PALETTE.shadow, offset = 4) =>
  `0 ${Math.ceil(offset / 2)}px ${offset * 3}px rgba(0,0,0,0.45)`;

// ========== PixelBox: 所有容器的基底 ==========
function PixelBox({ children, color = PALETTE.panel, borderColor = PALETTE.border, shadowColor = PALETTE.shadow, padding = 16, onClick, style = {}, hover = false, className = '' }) {
  const [hovered, setHovered] = useState(false);
  const lift = hover && hovered;
  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: color,
        border: `1px solid ${borderColor}`,
        boxShadow: lift ? '0 1px 6px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.4)',
        padding,
        borderRadius: 4,
        transform: lift ? 'translateY(1px)' : 'translateY(0)',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ========== PixelButton ==========
function PixelButton({ children, onClick, color = PALETTE.gold, textColor = '#000', size = 'md', disabled = false, style = {}, block = false }) {
  const [pressed, setPressed] = useState(false);
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 10 },
    md: { padding: '10px 18px', fontSize: 12 },
    lg: { padding: '14px 24px', fontSize: 14 },
  };
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={disabled ? null : onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        background: disabled ? '#3a3a5a' : color,
        color: disabled ? '#6a6a8a' : textColor,
        border: 'none',
        borderRadius: 4,
        boxShadow: pressed
          ? 'inset 0 2px 6px rgba(0,0,0,0.35)'
          : `0 3px 0 rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25)`,
        transform: pressed ? 'translateY(2px)' : 'translateY(0)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 100ms ease',
        letterSpacing: '0.5px',
        textShadow: !disabled ? `0 1px 2px rgba(0,0,0,0.3)` : 'none',
        width: block ? '100%' : 'auto',
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ========== StatBar: HP/EXP 條 ==========
function StatBar({ value, max, color = PALETTE.green, label, height = 18, showText = true }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DotGothic16', monospace", fontSize: 14, color: PALETTE.text, marginBottom: 4 }}>
          <span>{label}</span>
          {showText && <span style={{ color: PALETTE.gold }}>{value}/{max}</span>}
        </div>
      )}
      <div style={{
        height,
        background: 'rgba(0,0,0,0.35)',
        borderRadius: height,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: height,
          transition: 'width 400ms ease',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25)`,
        }} />
      </div>
    </div>
  );
}

// ========== IndicatorChip: 指標徽章 ==========
function IndicatorChip({ indicator, status = 'locked', size = 'md', onClick }) {
  // status: 'locked' | 'partial' | 'done'
  const stage = STAGES.find(s => s.id === indicator.stage);
  const bg = status === 'done' ? PALETTE.green
           : status === 'partial' ? PALETTE.gold
           : '#3a3a62';
  const glyph = status === 'done' ? '✔' : status === 'partial' ? '◐' : '◻';
  const sizes = {
    sm: { w: 44, h: 44, fs: 9, num: 9 },
    md: { w: 64, h: 64, fs: 10, num: 11 },
    lg: { w: 88, h: 88, fs: 12, num: 14 },
  };
  const s = sizes[size];
  return (
    <div
      onClick={onClick}
      style={{
        width: s.w, height: s.h,
        background: bg,
        border: `1px solid rgba(255,255,255,0.12)`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        borderRadius: 6,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Press Start 2P', monospace",
        color: status === 'locked' ? '#888' : '#000',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
      }}
    >
      <div style={{ fontSize: s.num, lineHeight: 1 }}>#{indicator.id}</div>
      <div style={{ fontSize: s.fs + 2, marginTop: 4 }}>{glyph}</div>
      {/* 階段色小旗 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 8, height: 8,
        background: stage?.color, borderRadius: '6px 0 4px 0',
      }} />
    </div>
  );
}

// ========== DifficultyBadge ==========
function DifficultyBadge({ level, compact = false }) {
  const d = DIFFICULTY_POINTS[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: d.color, color: '#000',
      borderRadius: 4,
      padding: compact ? '2px 8px' : '4px 10px',
      fontFamily: "'Press Start 2P', monospace",
      fontSize: compact ? 8 : 9,
      boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    }}>
      {d.label} · +{d.points}
    </span>
  );
}

// ========== 打字機效果 ==========
function Typewriter({ text, speed = 30, onDone }) {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onDone && onDone();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return <span>{out}<span style={{ opacity: out.length < text.length ? 1 : 0 }}>▊</span></span>;
}

// ========== 跳動分數 ==========
function PopNumber({ value, color = PALETTE.gold, size = 48 }) {
  return (
    <div style={{
      fontFamily: "'Press Start 2P', monospace",
      fontSize: size, color,
      textShadow: `3px 3px 0 #000, -1px -1px 0 #000`,
      animation: 'popbounce 500ms steps(6)',
      lineHeight: 1,
    }}>
      +{value}
    </div>
  );
}

// ========== 像素小人頭像 ==========
function PixelAvatar({ size = 64 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 12 16"
      style={{ display: 'block', imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {/* 頭髮 */}
      <rect x="3" y="0" width="6" height="1" fill="#5c3d0e"/>
      <rect x="2" y="1" width="8" height="2" fill="#5c3d0e"/>
      {/* 臉 */}
      <rect x="2" y="3" width="8" height="4" fill="#f5c5a3"/>
      {/* 眼睛 */}
      <rect x="3" y="4" width="2" height="1" fill="#1a1a2e"/>
      <rect x="7" y="4" width="2" height="1" fill="#1a1a2e"/>
      {/* 嘴巴 */}
      <rect x="4" y="6" width="4" height="1" fill="#d94040"/>
      {/* 上衣 */}
      <rect x="2" y="7" width="8" height="3" fill="#cc2200"/>
      {/* 手臂 */}
      <rect x="0" y="7" width="2" height="3" fill="#cc2200"/>
      <rect x="10" y="7" width="2" height="3" fill="#cc2200"/>
      {/* 手 */}
      <rect x="0" y="10" width="2" height="1" fill="#f5c5a3"/>
      <rect x="10" y="10" width="2" height="1" fill="#f5c5a3"/>
      {/* 褲子 */}
      <rect x="2" y="10" width="8" height="3" fill="#2244cc"/>
      {/* 腿 */}
      <rect x="2" y="13" width="3" height="2" fill="#2244cc"/>
      <rect x="7" y="13" width="3" height="2" fill="#2244cc"/>
      {/* 鞋子 */}
      <rect x="1" y="15" width="4" height="1" fill="#3d2200"/>
      <rect x="7" y="15" width="4" height="1" fill="#3d2200"/>
    </svg>
  );
}

// ========== 像素掃描線疊層（可選）==========
function ScanlineOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px)',
      zIndex: 9998,
      mixBlendMode: 'multiply',
    }} />
  );
}

// ========== 計算引擎 ==========
// upload 可有 typeIds（多個）或舊的 typeId（單一）
function getUploadTypeIds(u) {
  if (Array.isArray(u.typeIds)) return u.typeIds;
  if (u.typeId) return [u.typeId];
  return [];
}

// 解析類型 ID → 類型物件（預設 28 種 + 自訂 ct_* 類型）
function resolveType(tid) {
  const predefined = EVIDENCE_TYPES.find(t => t.id === tid);
  if (predefined) return predefined;
  const ct = window.__customTypes?.[tid];
  if (ct) return { id: ct.id, name: ct.name, icon: '✏', difficulty: 1, maps: ct.maps || [] };
  return null;
}

// 給定 uploads 陣列 → 計算每個指標狀態、總分、徽章
function computeState(uploads) {
  // indicator id → { count, items, difficultyMax }
  const perInd = {};
  INDICATORS.forEach(i => { perInd[i.id] = { count: 0, items: [], best: 0 }; });

  let points = 0;
  const unlockedIndicatorIds = new Set();

  uploads.forEach(u => {
    const typeIds = getUploadTypeIds(u);
    const types = typeIds.map(tid => resolveType(tid)).filter(Boolean);
    if (!types.length) return;

    // 單筆上傳可能勾選多個類型：分數用「最高難度」避免灌水
    const bestType = types.reduce((a, b) => (a.difficulty >= b.difficulty ? a : b));
    const bestD = DIFFICULTY_POINTS[bestType.difficulty];
    points += bestD.points;

    // 所有被觸及的指標（聯集，同筆上傳內去重）
    const touched = new Set();
    types.forEach(t => t.maps.forEach(indId => touched.add(indId)));

    touched.forEach(indId => {
      if (!unlockedIndicatorIds.has(indId)) {
        points += UNLOCK_BONUS;
        unlockedIndicatorIds.add(indId);
      }
      perInd[indId].count += 1;
      perInd[indId].items.push(u.id);
      perInd[indId].best = Math.max(perInd[indId].best, bestType.difficulty);
    });
  });

  // 指標狀態：
  // count >= 2  或 best >= 3 → done
  // count >= 1              → partial
  // 否則                    → locked
  const indicatorStatus = {};
  INDICATORS.forEach(i => {
    const p = perInd[i.id];
    if (p.count === 0) indicatorStatus[i.id] = 'locked';
    else if (p.count >= 2 || p.best >= 3) indicatorStatus[i.id] = 'done';
    else indicatorStatus[i.id] = 'partial';
  });

  // 階段進度
  const stageProgress = {};
  STAGES.forEach(s => {
    const total = s.indicators.length;
    const done = s.indicators.filter(id => indicatorStatus[id] === 'done').length;
    const partial = s.indicators.filter(id => indicatorStatus[id] === 'partial').length;
    stageProgress[s.id] = { total, done, partial, pct: Math.round(((done + partial * 0.5) / total) * 100) };
  });

  const doneCount = Object.values(indicatorStatus).filter(s => s === 'done').length;
  const partialCount = Object.values(indicatorStatus).filter(s => s === 'partial').length;

  // 等級（每 150 分升一級，封頂 10）
  const level = Math.min(10, Math.floor(points / 150) + 1);
  const levelPoints = points - (level - 1) * 150;
  const levelMax = 150;

  // 徽章
  const earnedBadges = BADGES.filter(b => {
    const t = b.threshold;
    if (t.type === 'uploads')      return uploads.length >= t.n;
    if (t.type === 'indicators')   return doneCount >= t.n;
    if (t.type === 'stageDone')    return stageProgress[t.stage]?.done === stageProgress[t.stage]?.total;
    if (t.type === 'difficulty')   return uploads.some(u => {
      const tids = getUploadTypeIds(u);
      return tids.some(tid => {
        const ty = resolveType(tid);
        return ty && ty.difficulty >= t.lv;
      });
    });
    return false;
  }).map(b => b.id);

  return {
    points, level, levelPoints, levelMax,
    perInd, indicatorStatus, stageProgress,
    doneCount, partialCount,
    earnedBadges,
    unlockedCount: unlockedIndicatorIds.size,
  };
}

// 計算一筆擬上傳會帶來的效果（用於預覽）
// newUpload 可含 typeIds（陣列）或 typeId（單一）
function computeUploadDelta(prevUploads, newUpload) {
  const before = computeState(prevUploads);
  const after = computeState([...prevUploads, newUpload]);
  const typeIds = getUploadTypeIds(newUpload);
  const types = typeIds.map(tid => resolveType(tid)).filter(Boolean);
  const bestType = types.reduce((a, b) => (a.difficulty >= b.difficulty ? a : b), types[0]);
  const bestD = DIFFICULTY_POINTS[bestType.difficulty];

  // 聯集
  const touchedSet = new Set();
  types.forEach(t => t.maps.forEach(id => touchedSet.add(id)));
  const indicatorsTouched = [...touchedSet];

  const newlyUnlocked = indicatorsTouched.filter(id => before.indicatorStatus[id] === 'locked');
  const newlyCompleted = indicatorsTouched.filter(id =>
    before.indicatorStatus[id] !== 'done' && after.indicatorStatus[id] === 'done'
  );

  const basePoints = bestD.points;
  const unlockBonus = newlyUnlocked.length * UNLOCK_BONUS;
  const totalPoints = basePoints + unlockBonus;

  return {
    basePoints, unlockBonus, totalPoints,
    newlyUnlocked, newlyCompleted,
    difficulty: bestD,
    types, bestType,
    indicatorsTouched,
    before, after,
  };
}

Object.assign(window, {
  PALETTE, pixelShadow,
  PixelBox, PixelButton, StatBar, IndicatorChip, DifficultyBadge,
  Typewriter, PopNumber, ScanlineOverlay, PixelAvatar,
  computeState, computeUploadDelta, getUploadTypeIds, resolveType,
});
