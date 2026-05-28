/**
 * UmpireMatchSession — Full match flow for the Umpire role
 * Steps: squad setup → select openers → select bowler → scoring → result
 */
import { useState } from 'react'
import { teamById, playerById } from '../data/mock'
import {
  X, Check, ChevronRight, Trophy, Shield,
  Circle, ArrowRight, RotateCcw, Lock
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtOvers(legalBalls) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`
}
function runRate(runs, legalBalls) {
  if (!legalBalls) return '0.00'
  return ((runs / legalBalls) * 6).toFixed(2)
}
function createInning(battingTeamId, bowlingTeamId, xi) {
  return {
    battingTeamId, bowlingTeamId,
    runs: 0, wkts: 0, legalBalls: 0,
    extras: { wd: 0, nb: 0, b: 0, lb: 0 },
    batters: {}, bowlers: {},
    striker: null, nonStriker: null,
    currentBowler: null, lastBowler: null,
    thisOverBalls: [], allOvers: [],
    fallOfWickets: [], dismissed: [],
    battingXi: xi, completed: false,
  }
}
function applyBall(inn, type, runs, configOvers) {
  const u = JSON.parse(JSON.stringify(inn))
  const s = u.striker
  const b = u.currentBowler
  if (s && !u.batters[s]) u.batters[s] = { runs:0, balls:0, fours:0, sixes:0, out:false, how:null }
  if (b && !u.bowlers[b]) u.bowlers[b] = { balls:0, runs:0, wkts:0, wd:0, nb:0 }

  const isLegal = !['wd','nb'].includes(type)
  let sym = ''

  if (type === 'run') {
    u.runs += runs
    if (s) { const bt = u.batters[s]; bt.runs += runs; bt.balls++; if (runs===4) bt.fours++; if (runs===6) bt.sixes++ }
    if (b) { const bw = u.bowlers[b]; bw.balls++; bw.runs += runs }
    u.legalBalls++
    sym = runs === 0 ? '.' : String(runs)
    if (runs % 2 === 1 && u.striker && u.nonStriker) [u.striker, u.nonStriker] = [u.nonStriker, u.striker]
  } else if (type === 'wd') {
    u.runs++; u.extras.wd++
    if (b) { u.bowlers[b].runs++; u.bowlers[b].wd++ }
    sym = 'Wd'
  } else if (type === 'nb') {
    u.runs += 1 + runs; u.extras.nb++
    if (s && runs > 0) u.batters[s].runs += runs
    if (b) { u.bowlers[b].runs += 1 + runs; u.bowlers[b].nb++ }
    sym = runs > 0 ? `Nb+${runs}` : 'Nb'
  } else if (type === 'b') {
    const r = runs || 1
    u.runs += r; u.extras.b += r
    if (b) { u.bowlers[b].balls++; u.bowlers[b].runs += r }
    u.legalBalls++; sym = `B${r}`
  } else if (type === 'lb') {
    const r = runs || 1
    u.runs += r; u.extras.lb += r
    if (b) { u.bowlers[b].balls++; u.bowlers[b].runs += r }
    u.legalBalls++; sym = `Lb${r}`
  } else if (type === 'wkt') {
    u.runs += runs || 0
    if (s) { const bt = u.batters[s]; bt.balls++; bt.runs += runs||0; bt.out = true }
    if (b) { u.bowlers[b].balls++; u.bowlers[b].runs += runs||0; u.bowlers[b].wkts++ }
    u.legalBalls++; u.wkts++
    u.dismissed = [...u.dismissed, s]
    u.fallOfWickets = [...u.fallOfWickets, { wkt:u.wkts, score:u.runs, player:s, overs:fmtOvers(u.legalBalls) }]
    u.striker = null
    sym = 'W'
  }

  u.thisOverBalls = [...u.thisOverBalls, sym]

  if (isLegal && u.legalBalls > 0 && u.legalBalls % 6 === 0) {
    u.allOvers = [...u.allOvers, [...u.thisOverBalls]]
    u.thisOverBalls = []
    u.lastBowler = u.currentBowler
    u.currentBowler = null
    if (u.striker && u.nonStriker) [u.striker, u.nonStriker] = [u.nonStriker, u.striker]
  }
  if (u.wkts >= 10 || u.legalBalls >= configOvers * 6) {
    u.completed = true
    if (u.thisOverBalls.length > 0) { u.allOvers = [...u.allOvers, [...u.thisOverBalls]]; u.thisOverBalls = [] }
  }
  return u
}
function computeResult(inn1, inn2) {
  if (!inn1 || !inn2 || !inn2.completed) return null
  if (inn2.runs >= inn1.runs + 1) {
    const margin = 10 - inn2.wkts
    return { winner: inn2.battingTeamId, margin: `${margin} wicket${margin !== 1 ? 's' : ''}` }
  }
  if (inn2.runs === inn1.runs) return { winner: null, margin: 'Tie' }
  const margin = inn1.runs - inn2.runs
  return { winner: inn1.battingTeamId, margin: `${margin} run${margin !== 1 ? 's' : ''}` }
}

// ─── BallPill ─────────────────────────────────────────────────────────────────
function BallPill({ sym }) {
  const isW   = sym === 'W'
  const isWd  = sym?.startsWith('Wd')
  const isNb  = sym?.startsWith('Nb')
  const isExt = sym?.startsWith('B') || sym?.startsWith('Lb')
  const is4   = sym === '4'
  const is6   = sym === '6'
  const base  = 'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0'
  const cls   = isW ? `${base} bg-red-500 text-white`
    : isWd || isNb ? `${base} bg-amber-400 text-white`
    : isExt ? `${base} bg-blue-100 text-blue-700`
    : is4 ? `${base} bg-brand-100 text-brand-700`
    : is6 ? `${base} bg-purple-100 text-purple-700`
    : sym === '.' ? `${base} bg-slate-100 text-slate-500`
    : `${base} bg-navy-100 text-navy-700`
  return <div className={cls}>{sym}</div>
}

// ─── SelectPlayerModal ────────────────────────────────────────────────────────
function SelectPlayerModal({ title, players, disabledIds = [], onSelect, allowNull = false }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[70dvh] flex flex-col">
        <div className="flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <p className="font-bold text-navy-900 text-base">{title}</p>
        </div>
        <div className="overflow-y-auto flex-1 px-3 py-2">
          {allowNull && (
            <button onClick={() => onSelect(null)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-navy-400 text-sm font-medium mb-1">
              — Skip / Retired Hurt
            </button>
          )}
          {players.map(p => {
            const disabled = disabledIds.includes(p.id)
            return (
              <button
                key={p.id}
                disabled={disabled}
                onClick={() => !disabled && onSelect(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1 ${
                  disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-50 active:scale-[0.98]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-xs font-extrabold text-brand-700 flex-shrink-0">
                  {p.name?.[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate">{p.name}</p>
                  <p className="text-navy-400 text-xs">
                    {p.batting?.avg ? `Avg ${p.batting.avg} · SR ${p.batting.sr}` : p.bowling?.wkts ? `${p.bowling.wkts} wkts · Eco ${p.bowling.eco}` : ''}
                  </p>
                </div>
                {disabled && <Lock size={12} className="text-slate-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── WicketModal ──────────────────────────────────────────────────────────────
function WicketModal({ onSelect }) {
  const types = ['Caught','Bowled','LBW','Run Out','Stumped','Hit Wicket','Retired Hurt']
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="font-bold text-navy-900">How was the batsman out?</p>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-2 pb-8">
          {types.map(t => (
            <button key={t} onClick={() => onSelect(t)}
              className="py-3 px-4 rounded-xl border-2 border-slate-200 font-semibold text-sm text-navy-700 hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SquadSetup ───────────────────────────────────────────────────────────────
function SquadSetup({ assignment, tossResult, onStart, onClose }) {
  const t1 = teamById(assignment.team1Id)
  const t2 = teamById(assignment.team2Id)
  const [overs, setOvers]       = useState(String(assignment.defaultOvers || 20))
  const [powerplay, setPowerplay] = useState('6')
  const [xi, setXi]             = useState({ [t1.id]: [], [t2.id]: [] })
  const [activeTeam, setActiveTeam] = useState(t1.id)

  const winnerBats    = tossResult.choice === 'bat'
  const winnerTeamId  = tossResult.winnerIdx === 0 ? t1.id : t2.id
  const battingFirst  = winnerBats ? winnerTeamId : (winnerTeamId === t1.id ? t2.id : t1.id)

  const togglePlayer = (pid) => {
    setXi(prev => {
      const cur = prev[activeTeam]
      return { ...prev, [activeTeam]: cur.includes(pid) ? cur.filter(id => id !== pid) : [...cur, pid] }
    })
  }

  const teams = [t1, t2]
  const activeT = teams.find(t => t.id === activeTeam)
  const activePlayers = (activeT?.squad || []).map(id => playerById(id)).filter(Boolean)
  const selected = xi[activeTeam] || []
  const need = 11

  const canStart = xi[t1.id].length >= need && xi[t2.id].length >= need && parseInt(overs) >= 1

  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-navy-900 px-4 pt-safe-top pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-white text-base">{assignment.teams}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X size={16} className="text-white" />
          </button>
        </div>
        {/* Toss result summary */}
        <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-lg">🪙</span>
          <p className="text-amber-100 text-xs">
            <strong className="text-white">{tossResult.winnerName}</strong> won toss ·{' '}
            elected to <strong className="text-white">{tossResult.choice === 'bat' ? '🏏 bat' : '🧤 field'} first</strong>
          </p>
        </div>
      </div>

      {/* Batting order badge */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-semibold text-amber-700">Batting first:</span>
        <span className="text-xs font-bold text-amber-900">{teamById(battingFirst)?.name}</span>
      </div>

      {/* Overs + Powerplay */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex gap-4 flex-shrink-0">
        <div className="flex-1">
          <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Overs</p>
          <input type="number" min="1" max="50" value={overs}
            onChange={e => setOvers(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 outline-none focus:border-brand-400" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Powerplay Overs</p>
          <input type="number" min="0" max="20" value={powerplay}
            onChange={e => setPowerplay(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 outline-none focus:border-brand-400" />
        </div>
      </div>

      {/* Team tabs */}
      <div className="flex gap-1 bg-slate-200 p-1 mx-4 mt-3 rounded-2xl flex-shrink-0">
        {teams.map(t => {
          const cnt = xi[t.id]?.length || 0
          return (
            <button key={t.id} onClick={() => setActiveTeam(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTeam === t.id ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
              {t.name.split(' ')[0]}
              <span className={`text-[10px] px-1 rounded-full font-bold ${cnt >= need ? 'bg-green-100 text-green-700' : 'bg-slate-300 text-slate-600'}`}>
                {cnt}/{need}
              </span>
            </button>
          )
        })}
      </div>

      {/* Player list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        <p className="text-xs text-navy-400 font-medium mb-2">
          Select {need} players from {activeT?.name}'s squad ({activePlayers.length} available)
        </p>
        {activePlayers.map(p => {
          const isSelected = selected.includes(p.id)
          return (
            <button key={p.id} onClick={() => togglePlayer(p.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-brand-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
              }`}>
                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-navy-900 text-sm">{p.name}</p>
                <p className="text-navy-400 text-[11px]">
                  {p.batting?.sr > 0 ? `Bat SR ${p.batting.sr}` : ''}
                  {p.batting?.sr > 0 && p.bowling?.wkts > 0 ? ' · ' : ''}
                  {p.bowling?.wkts > 0 ? `${p.bowling.wkts} wkts` : ''}
                </p>
              </div>
              {isSelected && <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {selected.indexOf(p.id) + 1}
              </div>}
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div className="px-4 pb-6 pt-3 border-t border-slate-100 bg-white flex-shrink-0">
        {!canStart && (
          <p className="text-xs text-navy-400 text-center mb-2">
            {xi[t1.id].length < need && `${t1.name}: need ${need - xi[t1.id].length} more · `}
            {xi[t2.id].length < need && `${t2.name}: need ${need - xi[t2.id].length} more`}
          </p>
        )}
        <button
          disabled={!canStart}
          onClick={() => onStart({ xi1: xi[t1.id], xi2: xi[t2.id], overs: parseInt(overs), powerplay: parseInt(powerplay), battingFirst })}
          className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Match →
        </button>
      </div>
    </div>
  )
}

// ─── InningsBreak ─────────────────────────────────────────────────────────────
function InningsBreak({ inn1, config, onContinue }) {
  const bat = teamById(inn1.battingTeamId)
  const bowl = teamById(inn1.bowlingTeamId)
  const target = inn1.runs + 1
  return (
    <div className="fixed inset-0 z-[85] bg-navy-900 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
        <span className="text-3xl">🏏</span>
      </div>
      <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-2">Innings Break</p>
      <h2 className="text-white font-extrabold text-2xl mb-1 text-center">{bat?.name}</h2>
      <p className="text-white text-3xl font-extrabold mb-1">{inn1.runs}/{inn1.wkts}</p>
      <p className="text-amber-200 text-sm mb-6">({fmtOvers(inn1.legalBalls)} overs)</p>

      <div className="bg-white/10 rounded-2xl px-6 py-4 mb-8 w-full max-w-sm text-center">
        <p className="text-amber-100 text-sm font-semibold mb-1">{bowl?.name} need</p>
        <p className="text-white font-extrabold text-4xl">{target}</p>
        <p className="text-amber-200 text-sm">to win in {config.overs} overs</p>
      </div>

      <button onClick={onContinue}
        className="w-full max-w-sm py-4 rounded-2xl font-bold text-lg text-navy-900"
        style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}
      >
        Start 2nd Innings →
      </button>
    </div>
  )
}

// ─── MatchResult ──────────────────────────────────────────────────────────────
function MatchResult({ inn1, inn2, result, config, onClose }) {
  const [showFull, setShowFull] = useState(false)
  const winTeam = result.winner ? teamById(result.winner) : null
  const t1 = teamById(inn1.battingTeamId)
  const t2 = teamById(inn2.battingTeamId)

  const InningsTable = ({ inn, label }) => {
    const team = teamById(inn.battingTeamId)
    const batters = inn.battingXi
      .map(id => ({ id, p: playerById(id), b: inn.batters[id] || { runs:0, balls:0, fours:0, sixes:0, out:false } }))
      .filter(x => x.p)
    const bowlers = Object.entries(inn.bowlers).map(([id, b]) => ({ id, p: playerById(id), b })).filter(x => x.p)
    const extras  = inn.extras.wd + inn.extras.nb + inn.extras.b + inn.extras.lb

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between bg-navy-900 rounded-t-xl px-3 py-2">
          <p className="text-white font-bold text-sm">{label} — {team?.name}</p>
          <p className="text-amber-300 font-extrabold text-sm">{inn.runs}/{inn.wkts} ({fmtOvers(inn.legalBalls)} ov)</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden">
          {/* Batting */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-navy-500 font-semibold">Batter</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">R</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">B</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">4s</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">6s</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">SR</th>
              </tr></thead>
              <tbody>
                {batters.map(({ id, p, b }) => (
                  <tr key={id} className="border-b border-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-navy-900">{p.name}</p>
                      <p className="text-navy-400">{b.out ? b.how || 'Out' : inn.striker === id ? 'batting *' : inn.nonStriker === id ? 'batting' : 'not out'}</p>
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-navy-900">{b.runs}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.balls}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.fours}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.sixes}</td>
                    <td className="px-2 py-2 text-center text-navy-500">
                      {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td colSpan={6} className="px-3 py-1.5 text-xs text-navy-500">
                    Extras: {extras} (wd {inn.extras.wd}, nb {inn.extras.nb}, b {inn.extras.b}, lb {inn.extras.lb})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Bowling */}
          {bowlers.length > 0 && (
            <div className="border-t border-slate-200 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-navy-500 font-semibold">Bowler</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">O</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">R</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">W</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">Eco</th>
                </tr></thead>
                <tbody>
                  {bowlers.map(({ id, p, b }) => (
                    <tr key={id} className="border-b border-slate-50">
                      <td className="px-3 py-2 font-semibold text-navy-900">{p.name}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{fmtOvers(b.balls)}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{b.runs}</td>
                      <td className="px-2 py-2 text-center font-bold text-navy-900">{b.wkts}</td>
                      <td className="px-2 py-2 text-center text-navy-500">
                        {b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[85] bg-slate-50 flex flex-col">
      {/* Result banner */}
      <div className="bg-navy-900 px-4 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-amber-200 text-xs font-bold uppercase tracking-wide">Match Complete</p>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X size={15} className="text-white" />
          </button>
        </div>
        {result.winner ? (
          <div className="text-center">
            <p className="text-white font-extrabold text-xl mb-1">{winTeam?.name}</p>
            <p className="text-amber-300 font-bold text-base">won by {result.margin} 🏆</p>
          </div>
        ) : (
          <p className="text-white font-extrabold text-xl text-center">Match Tied!</p>
        )}
        <div className="flex items-center justify-between mt-4 bg-white/10 rounded-xl px-4 py-2 text-xs text-amber-100">
          <span>{t1?.name}: {inn1.runs}/{inn1.wkts} ({fmtOvers(inn1.legalBalls)})</span>
          <span className="text-amber-300 font-bold">vs</span>
          <span>{t2?.name}: {inn2.runs}/{inn2.wkts} ({fmtOvers(inn2.legalBalls)})</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-amber-200 text-[11px]">
          <Lock size={10} />
          <span>Scorecard is now locked — read only</span>
        </div>
      </div>

      {/* Full scorecard */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <InningsTable inn={inn1} label="1st Innings" />
        <InningsTable inn={inn2} label="2nd Innings" />
      </div>

      <div className="px-4 pb-6 pt-2 border-t border-slate-100 bg-white flex-shrink-0">
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl bg-navy-900 text-white font-bold text-sm">
          Back to Assignments
        </button>
      </div>
    </div>
  )
}

// ─── ScoringScreen ────────────────────────────────────────────────────────────
function ScoringScreen({ assignment, config, xi1, xi2, battingFirst, tossResult, onComplete, onClose }) {
  const t1 = teamById(assignment.team1Id)
  const t2 = teamById(assignment.team2Id)

  // batting/bowling teams per innings
  const team1Id = assignment.team1Id
  const team2Id = assignment.team2Id
  const inn1BatTeam = battingFirst
  const inn1BowTeam = battingFirst === team1Id ? team2Id : team1Id
  const inn1Xi = battingFirst === team1Id ? xi1 : xi2
  const inn2Xi = battingFirst === team1Id ? xi2 : xi1

  const [innings, setInnings] = useState([
    createInning(inn1BatTeam, inn1BowTeam, inn1Xi),
    null,
  ])
  const [innIdx, setInnIdx] = useState(0)
  const [step, setStep] = useState('select_openers')  // select_openers | select_bowler | scoring | wicket | new_batsman | inning_break
  const [wicketHow, setWicketHow] = useState(null)
  const [pendingBallAfterBatsman, setPendingBallAfterBatsman] = useState(false)

  const inn = innings[innIdx]
  const batTeam = inn ? teamById(inn.battingTeamId) : null
  const bowTeam = inn ? teamById(inn.bowlingTeamId) : null
  const batXi   = inn ? inn.battingXi.map(id => playerById(id)).filter(Boolean) : []
  const bowXi   = innIdx === 0
    ? (battingFirst === team1Id ? xi2 : xi1).map(id => playerById(id)).filter(Boolean)
    : (battingFirst === team1Id ? xi1 : xi2).map(id => playerById(id)).filter(Boolean)

  // players available to bat (not out, not dismissed, not already at crease)
  const availableBatsmen = batXi.filter(p =>
    !inn?.dismissed?.includes(p.id) &&
    p.id !== inn?.striker &&
    p.id !== inn?.nonStriker
  )

  // players available to bowl (not last bowler)
  const availableBowlers = bowXi.filter(p => p.id !== inn?.lastBowler)

  const updateInn = (updated) => {
    setInnings(prev => { const arr = [...prev]; arr[innIdx] = updated; return arr })
  }

  const handleBall = (type, runs = 0) => {
    if (!inn) return
    if (!inn.striker || !inn.currentBowler) return

    // For wickets: show wicket modal first
    if (type === 'wkt') {
      setStep('wicket')
      return
    }

    const updated = applyBall(inn, type, runs, config.overs)
    updateInn(updated)

    if (updated.completed) {
      if (innIdx === 0) {
        setStep('inning_break')
      } else {
        const result = computeResult(innings[0], updated)
        onComplete(innings[0], updated, result)
      }
      return
    }

    // Need new bowler after over?
    if (updated.currentBowler === null && !updated.completed) {
      setStep('select_bowler')
    }
  }

  const handleWicketHow = (how) => {
    setWicketHow(how)
    setStep('new_batsman')
  }

  const handleNewBatsman = (pid) => {
    if (!inn) return
    const updated = applyBall(inn, 'wkt', 0, config.overs)
    updated.batters[inn.striker] = { ...updated.batters[inn.striker], how: wicketHow }
    if (pid) updated.striker = pid
    updateInn(updated)
    setWicketHow(null)

    if (updated.completed) {
      if (innIdx === 0) { setStep('inning_break'); return }
      const result = computeResult(innings[0], updated)
      onComplete(innings[0], updated, result)
      return
    }
    // Check if over also ended
    if (updated.currentBowler === null) { setStep('select_bowler'); return }
    setStep('scoring')
  }

  const handleSelectBowler = (pid) => {
    if (!inn) return
    updateInn({ ...inn, currentBowler: pid })
    setStep('scoring')
  }

  const handleSelectOpeners = (strikerId, nonStrikerId) => {
    if (!inn) return
    const updated = { ...inn, striker: strikerId, nonStriker: nonStrikerId }
    if (!updated.batters[strikerId]) updated.batters[strikerId] = { runs:0, balls:0, fours:0, sixes:0, out:false, how:null }
    if (!updated.batters[nonStrikerId]) updated.batters[nonStrikerId] = { runs:0, balls:0, fours:0, sixes:0, out:false, how:null }
    updateInn(updated)
    setStep('select_bowler')
  }

  const handleStartSecondInnings = () => {
    const inn2BatTeam = inn1BowTeam
    const inn2BowTeam = inn1BatTeam
    const inn2XiArr   = battingFirst === team1Id ? xi2 : xi1
    const newInn = createInning(inn2BatTeam, inn2BowTeam, inn2XiArr)
    setInnings(prev => [prev[0], newInn])
    setInnIdx(1)
    setStep('select_openers')
  }

  // Openers selection (2 steps)
  const [opener1, setOpener1] = useState(null)
  if (step === 'select_openers') {
    if (!opener1) {
      return (
        <SelectPlayerModal
          title={`${batTeam?.name} — Select Striker (opener)`}
          players={batXi}
          disabledIds={[]}
          onSelect={id => setOpener1(id)}
        />
      )
    }
    return (
      <SelectPlayerModal
        title={`${batTeam?.name} — Select Non-Striker`}
        players={batXi}
        disabledIds={[opener1]}
        onSelect={id => { handleSelectOpeners(opener1, id); setOpener1(null) }}
      />
    )
  }

  if (step === 'select_bowler') {
    return (
      <SelectPlayerModal
        title={`${bowTeam?.name} — Select Bowler ${inn?.allOvers?.length > 0 ? `(Over ${inn.allOvers.length + 1})` : '(Opening)'}`}
        players={availableBowlers}
        disabledIds={[]}
        onSelect={handleSelectBowler}
      />
    )
  }

  if (step === 'wicket') {
    return <WicketModal onSelect={handleWicketHow} />
  }

  if (step === 'new_batsman') {
    return (
      <SelectPlayerModal
        title="Select New Batsman"
        players={availableBatsmen}
        disabledIds={[]}
        onSelect={handleNewBatsman}
        allowNull={true}
      />
    )
  }

  if (step === 'inning_break') {
    return <InningsBreak inn1={innings[0]} config={config} onContinue={handleStartSecondInnings} />
  }

  // ── Main scoring screen ──
  const target = innIdx === 1 && innings[0] ? innings[0].runs + 1 : null
  const needed = target ? target - (inn?.runs || 0) : null
  const ballsLeft = inn ? config.overs * 6 - inn.legalBalls : 0
  const striker   = inn?.striker ? playerById(inn.striker) : null
  const nonStriker = inn?.nonStriker ? playerById(inn.nonStriker) : null
  const currentBowler = inn?.currentBowler ? playerById(inn.currentBowler) : null
  const batSt  = inn?.batters?.[inn?.striker]   || {}
  const batNS  = inn?.batters?.[inn?.nonStriker] || {}
  const bowSt  = inn?.bowlers?.[inn?.currentBowler] || {}

  const PAD_RUNS = [
    { label:'0', type:'run', runs:0, cls:'bg-slate-100 text-navy-700' },
    { label:'1', type:'run', runs:1, cls:'bg-slate-100 text-navy-700' },
    { label:'2', type:'run', runs:2, cls:'bg-slate-100 text-navy-700' },
    { label:'3', type:'run', runs:3, cls:'bg-slate-100 text-navy-700' },
    { label:'4', type:'run', runs:4, cls:'bg-brand-100 text-brand-700 font-extrabold' },
    { label:'6', type:'run', runs:6, cls:'bg-purple-100 text-purple-700 font-extrabold' },
  ]
  const PAD_EXT = [
    { label:'W', type:'wkt', runs:0, cls:'bg-red-500 text-white font-extrabold' },
    { label:'Wd', type:'wd', runs:0, cls:'bg-amber-400 text-white font-bold' },
    { label:'Nb', type:'nb', runs:0, cls:'bg-orange-400 text-white font-bold' },
    { label:'B',  type:'b',  runs:1, cls:'bg-blue-100 text-blue-700' },
    { label:'Lb', type:'lb', runs:1, cls:'bg-blue-100 text-blue-700' },
  ]

  return (
    <div className="fixed inset-0 z-[80] bg-navy-950 flex flex-col" style={{ background:'#0a1128' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div>
          <p className="text-amber-200 text-[10px] font-semibold uppercase tracking-wider">
            {innIdx === 0 ? '1st Innings' : '2nd Innings'} · {batTeam?.name}
          </p>
          <p className="text-slate-400 text-[10px]">{assignment.teams}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <X size={15} className="text-white" />
        </button>
      </div>

      {/* Score */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex items-end gap-3">
          <p className="text-white font-extrabold leading-none" style={{ fontSize:44 }}>
            {inn?.runs || 0}<span className="text-slate-400 text-2xl">/{inn?.wkts || 0}</span>
          </p>
          <div className="mb-2">
            <p className="text-amber-300 font-bold text-lg">{fmtOvers(inn?.legalBalls || 0)} ov</p>
            <p className="text-slate-400 text-xs">RR {runRate(inn?.runs || 0, inn?.legalBalls || 0)}</p>
          </div>
        </div>
        {target && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-amber-300 text-sm font-semibold">Need {needed} off {ballsLeft} balls</span>
            <span className="text-slate-500 text-xs">Target: {target}</span>
          </div>
        )}
      </div>

      {/* Batters */}
      <div className="bg-white/5 mx-4 rounded-2xl px-3 py-2.5 mb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-brand-400 text-xs font-bold">🏏</span>
          {striker ? (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-white font-bold text-sm">{striker.name} <span className="text-amber-300 text-xs">*</span></span>
              <span className="text-white font-extrabold tabular-nums text-sm">{batSt.runs || 0}<span className="text-slate-400 text-xs"> ({batSt.balls || 0})</span></span>
            </div>
          ) : <span className="text-slate-500 text-sm italic">Select batsman</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs font-bold">•</span>
          {nonStriker ? (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-slate-300 text-sm">{nonStriker.name}</span>
              <span className="text-slate-300 tabular-nums text-sm">{batNS.runs || 0}<span className="text-slate-500 text-xs"> ({batNS.balls || 0})</span></span>
            </div>
          ) : <span className="text-slate-500 text-sm italic">Select non-striker</span>}
        </div>
      </div>

      {/* Bowler + this over */}
      <div className="bg-white/5 mx-4 rounded-2xl px-3 py-2 mb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          {currentBowler ? (
            <>
              <span className="text-slate-300 text-sm">{currentBowler.name}</span>
              <span className="text-slate-400 text-xs tabular-nums">
                {fmtOvers(bowSt.balls || 0)}-{bowSt.runs || 0}-{bowSt.wkts || 0}
                {bowSt.wd > 0 ? ` wd${bowSt.wd}` : ''}{bowSt.nb > 0 ? ` nb${bowSt.nb}` : ''}
              </span>
            </>
          ) : <span className="text-amber-400 text-sm font-semibold italic">Select bowler...</span>}
        </div>
        {/* This over balls */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-slate-500 text-[10px] font-medium mr-1">This over:</span>
          {(inn?.thisOverBalls || []).map((b, i) => <BallPill key={i} sym={b} />)}
          {(inn?.thisOverBalls || []).length === 0 && <span className="text-slate-600 text-xs">—</span>}
        </div>
      </div>

      {/* Previous overs summary */}
      {(inn?.allOvers || []).length > 0 && (
        <div className="mx-4 mb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {inn.allOvers.slice(-4).map((over, i) => {
              const overRuns = over.reduce((sum, b) => {
                if (b === '.' || b === 'W') return sum
                const n = parseInt(b.replace(/[^\d]/g, ''))
                return sum + (isNaN(n) ? (b.startsWith('Wd')||b.startsWith('Nb') ? 1 : 0) : n)
              }, 0)
              return (
                <div key={i} className="bg-white/5 rounded-xl px-2 py-1.5 flex-shrink-0 text-center">
                  <p className="text-slate-400 text-[9px] font-semibold mb-1">
                    Ov {inn.allOvers.length - (inn.allOvers.slice(-4).length - 1 - i)}
                  </p>
                  <div className="flex gap-0.5">
                    {over.map((b, j) => <BallPill key={j} sym={b} />)}
                  </div>
                  <p className="text-slate-400 text-[9px] mt-1">{overRuns} runs</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scoring pad */}
      <div className="flex-1 flex flex-col justify-end px-4 pb-6 flex-shrink-0">
        <div className="grid grid-cols-6 gap-2 mb-2">
          {PAD_RUNS.map(btn => (
            <button key={btn.label}
              disabled={!inn?.striker || !inn?.currentBowler}
              onClick={() => handleBall(btn.type, btn.runs)}
              className={`py-4 rounded-2xl text-lg font-extrabold transition-all active:scale-90 disabled:opacity-30 ${btn.cls}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PAD_EXT.map(btn => (
            <button key={btn.label}
              disabled={btn.label !== 'Wd' && btn.label !== 'Nb' && (!inn?.striker || !inn?.currentBowler)}
              onClick={() => handleBall(btn.type, btn.runs)}
              className={`py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-90 disabled:opacity-30 ${btn.cls}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main UmpireMatchSession ──────────────────────────────────────────────────
export default function UmpireMatchSession({ assignment, tossResult, onClose }) {
  const [phase, setPhase] = useState('squad')  // squad | scoring | result
  const [matchConfig, setMatchConfig] = useState(null)
  const [resultData, setResultData]   = useState(null)

  const handleStart = ({ xi1, xi2, overs, powerplay, battingFirst }) => {
    setMatchConfig({ xi1, xi2, overs, powerplay, battingFirst })
    setPhase('scoring')
  }

  const handleMatchComplete = (inn1, inn2, result) => {
    setResultData({ inn1, inn2, result })
    setPhase('result')
  }

  if (phase === 'squad') {
    return <SquadSetup assignment={assignment} tossResult={tossResult} onStart={handleStart} onClose={onClose} />
  }

  if (phase === 'scoring' && matchConfig) {
    return (
      <ScoringScreen
        assignment={assignment}
        config={{ overs: matchConfig.overs, powerplay: matchConfig.powerplay }}
        xi1={matchConfig.xi1}
        xi2={matchConfig.xi2}
        battingFirst={matchConfig.battingFirst}
        tossResult={tossResult}
        onComplete={handleMatchComplete}
        onClose={onClose}
      />
    )
  }

  if (phase === 'result' && resultData) {
    return (
      <MatchResult
        inn1={resultData.inn1}
        inn2={resultData.inn2}
        result={resultData.result}
        config={matchConfig}
        onClose={onClose}
      />
    )
  }

  return null
}
