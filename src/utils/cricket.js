// ── Strike rotation ──────────────────────────────────────────────────────────
export const shouldRotateStrike = (runs, type) => {
  if (type === 'wide' || type === 'penalty') return false;
  return runs % 2 === 1;
};

// ── Over string (e.g. 3.4) ──────────────────────────────────────────────────
export const oversStr = (balls) => {
  const full = Math.floor(balls / 6);
  const rem  = balls % 6;
  return rem === 0 ? `${full}.0` : `${full}.${rem}`;
};

// ── CRR ─────────────────────────────────────────────────────────────────────
export const calcCRR = (runs, overs) => {
  const o = parseFloat(overs);
  if (!o) return '0.00';
  return (runs / o).toFixed(2);
};

// ── RRR ─────────────────────────────────────────────────────────────────────
export const calcRRR = (target, runs, ballsLeft) => {
  if (!target || !ballsLeft) return null;
  const needed = target - runs;
  const oversLeft = ballsLeft / 6;
  if (oversLeft <= 0 || needed <= 0) return '0.00';
  return (needed / oversLeft).toFixed(2);
};

// ── Bowling figures ──────────────────────────────────────────────────────────
export const bowlerFigs = (overs, runs, wkts) => `${overs}-0-${runs}-${wkts}`;

// ── NRR ─────────────────────────────────────────────────────────────────────
export const calcNRR = (runsFor, ballsFaced, allottedBallsFaced, runsAgainst, ballsBowled, allottedBallsBowled) => {
  const for_ = runsFor / (Math.min(ballsFaced, allottedBallsFaced) / 6);
  const against = runsAgainst / (allottedBallsBowled / 6);
  return (for_ - against).toFixed(3);
};

// ── Ball display string ──────────────────────────────────────────────────────
export const ballClass = (b) => {
  if (b === '4')  return 'over-ball over-ball-four';
  if (b === '6')  return 'over-ball over-ball-six';
  if (b === 'W')  return 'over-ball over-ball-w';
  if (b === '•' || b === '0')  return 'over-ball over-ball-dot';
  if (b?.startsWith('Wd')) return 'over-ball over-ball-wd';
  if (b?.startsWith('Nb')) return 'over-ball over-ball-nb';
  return 'over-ball over-ball-run';
};

// ── SR / Avg ────────────────────────────────────────────────────────────────
export const sr  = (runs, balls) => balls ? ((runs/balls)*100).toFixed(1) : '0.0';
export const avg = (runs, outs)  => outs  ? (runs/outs).toFixed(1)        : '—';
export const eco = (runs, overs) => overs ? (runs/parseFloat(overs)).toFixed(1) : '0.0';

// ── Pitch condition color ────────────────────────────────────────────────────
export const pitchCondBg = c => ({
  Fresh:'#dcfce7', Worn:'#fef3c7', Damp:'#dbeafe', Unknown:'#f1f5f9'
})[c] || '#f1f5f9';

export const pitchCondColor = c => ({
  Fresh:'#15803d', Worn:'#92400e', Damp:'#1d4ed8', Unknown:'#475569'
})[c] || '#475569';
