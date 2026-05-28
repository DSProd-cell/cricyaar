import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { teamById, playerById } from '../data/mock'
import { X, Circle, Crown, Lock } from 'lucide-react'
import FollowButton from './FollowButton'

// ─── Pro Gate ─────────────────────────────────────────────────────────────────
function ProGate({ onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-md px-6 pt-5 pb-10 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fef3c7' }}>
          <Crown size={28} className="text-amber-500 fill-amber-400" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg text-center mb-2">Pro Feature</h3>
        <p className="text-navy-500 text-sm text-center leading-relaxed mb-6">
          Full match scorecards with batting, bowling, fall of wickets and innings details are available on{' '}
          <span className="font-bold text-amber-600">CricYaar Pro</span>.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 py-3" onClick={onClose}>Maybe Later</button>
          <button
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
            onClick={() => { onClose(); navigate('/pro') }}
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Innings helpers ──────────────────────────────────────────────────────────
function sr(runs, balls) {
  return balls > 0 ? ((runs / balls) * 100).toFixed(0) : '—'
}
function eco(runs, overs) {
  const ov = parseFloat(overs)
  return ov > 0 ? (runs / ov).toFixed(1) : '—'
}

function InningsCard({ inn, battingTeam, bowlingTeam, isLive, xi }) {
  if (!inn) return null

  // All batters who faced at least one ball OR are currently at crease
  const batters = Object.entries(inn.batters || {}).map(([id, stats]) => ({
    id, ...stats,
    name: playerById(id)?.name || id,
    isStriker: inn.striker === id,
    isNonStriker: inn.nonStriker === id,
  })).filter(b => b.balls > 0 || b.id === inn.striker || b.id === inn.nonStriker)

  // Did Not Bat — in xi but haven't batted
  const battedIds = new Set(Object.keys(inn.batters || {}))
  const dnbPlayers = (xi || [])
    .filter(id => !battedIds.has(id) || (
      (inn.batters[id]?.balls ?? 0) === 0 &&
      id !== inn.striker && id !== inn.nonStriker
    ))
    .map(id => playerById(id)?.name || id)

  const bowlers = Object.entries(inn.bowlers || {})
    .filter(([, s]) => parseFloat(s.overs) > 0)
    .map(([id, stats]) => ({
      id, ...stats,
      name: playerById(id)?.name || id,
      isCurrent: inn.currentBowler === id,
    }))

  // Extras breakdown (derive from total since mock has no b/lb/wd/nb)
  const extrasTotal = Math.max(0, inn.runs - batters.reduce((s, b) => s + b.runs, 0))
  const extrasWd = Math.floor(extrasTotal * 0.40)
  const extrasNb = Math.floor(extrasTotal * 0.20)
  const extrasLb = Math.floor(extrasTotal * 0.25)
  const extrasB  = Math.max(0, extrasTotal - extrasWd - extrasNb - extrasLb)

  // Run rate
  const ovNum = parseFloat(inn.overs) || 0
  const rr = ovNum > 0 ? (inn.runs / ovNum).toFixed(2) : '0.00'

  return (
    <div className="space-y-3">
      {/* Batting table */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">
            {battingTeam?.name || 'Batting'} — Innings
          </p>
          <p className="text-xs text-navy-400 font-medium tabular-nums">
            {inn.runs}/{inn.wkts} ({inn.overs} ov)
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-3 py-1.5 text-[11px] text-navy-400 font-medium">Batter</th>
              <th className="text-left px-2 py-1.5 text-[11px] text-navy-400 font-medium hidden sm:table-cell">Dismissal</th>
              <th className="text-center px-1 py-1.5 text-[11px] text-navy-400 font-medium w-9">R</th>
              <th className="text-center px-1 py-1.5 text-[11px] text-navy-400 font-medium w-9">B</th>
              <th className="text-center px-1 py-1.5 text-[11px] text-navy-400 font-medium w-7">4s</th>
              <th className="text-center px-1 py-1.5 text-[11px] text-navy-400 font-medium w-7">6s</th>
              <th className="text-center px-1 py-1.5 text-[11px] text-navy-400 font-medium w-10">SR</th>
            </tr>
          </thead>
          <tbody>
            {batters.map((b, i) => (
              <tr key={b.id} className={`border-b border-slate-50 ${(b.isStriker || b.isNonStriker) ? 'bg-brand-50/60' : ''}`}>
                <td className="px-3 py-2">
                  <p className="font-semibold text-navy-800 text-xs leading-tight">
                    {i + 1}. {b.name}
                    {b.isStriker    && <span className="text-brand-500 font-bold ml-0.5">*</span>}
                    {b.isNonStriker && <span className="text-navy-400 text-[10px] ml-0.5">(ns)</span>}
                  </p>
                  {b.out && b.how && (
                    <p className="text-[10px] text-navy-400 mt-0.5 sm:hidden truncate max-w-[110px]">{b.how}</p>
                  )}
                  {!b.out && !b.isStriker && !b.isNonStriker && (
                    <p className="text-[10px] text-brand-500 font-semibold mt-0.5 sm:hidden">not out</p>
                  )}
                </td>
                <td className="px-2 py-2 hidden sm:table-cell text-[11px] text-navy-400">
                  {b.out
                    ? (b.how || 'c sub b Unknown')
                    : <span className="text-brand-500 font-semibold text-xs">not out</span>
                  }
                </td>
                <td className="text-center px-1 py-2 font-bold text-navy-900 text-xs tabular-nums">{b.runs}</td>
                <td className="text-center px-1 py-2 text-navy-500 text-xs tabular-nums">{b.balls}</td>
                <td className="text-center px-1 py-2 text-navy-500 text-xs tabular-nums">{b.fours}</td>
                <td className="text-center px-1 py-2 text-navy-500 text-xs tabular-nums">{b.sixes}</td>
                <td className="text-center px-1 py-2 text-navy-400 text-xs tabular-nums">{sr(b.runs, b.balls)}</td>
              </tr>
            ))}
            {/* Did not bat */}
            {dnbPlayers.length > 0 && (
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <td colSpan={7} className="px-3 py-2 text-[11px] text-navy-400">
                  <span className="font-semibold text-navy-500">Did not bat: </span>
                  {dnbPlayers.join(', ')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Extras breakdown + Total + Run Rate */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-navy-500">
              Extras <span className="text-navy-700 font-semibold">{extrasTotal}</span>
              <span className="text-navy-400 ml-1">(b {extrasB}, lb {extrasLb}, wd {extrasWd}, nb {extrasNb})</span>
            </span>
          </div>
          <div className="flex items-center justify-between font-bold text-navy-900">
            <span>Total: {inn.runs}/{inn.wkts} ({inn.overs} ov)</span>
            <span className="text-navy-500 font-medium">RR: {rr}</span>
          </div>
        </div>
      </div>

      {/* Fall of Wickets */}
      {inn.fow?.length > 0 && (
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">Fall of Wickets</p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-x-3 gap-y-1">
            {inn.fow.map((f, i) => (
              <span key={i} className="text-[11px] text-navy-500">
                <span className="font-bold text-navy-800">{f.wkt}-{f.runs}</span>
                <span className="text-navy-400"> ({playerById(f.player)?.name?.split(' ').pop() || f.player}, {f.over} ov{f.how ? `, ${f.how}` : ''})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bowling */}
      {bowlers.length > 0 && (
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">
              {bowlingTeam?.name || 'Bowling'} — Bowling
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-3 py-1.5 text-[11px] text-navy-400 font-medium">Bowler</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">O</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">M</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">R</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">W</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">Wd</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">Nb</th>
                <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-10">Eco</th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((b, i) => (
                <tr key={b.id} className={`border-b border-slate-50 ${b.isCurrent ? 'bg-amber-50/60' : ''}`}>
                  <td className="px-3 py-2 font-semibold text-navy-800 text-xs">
                    {b.name}
                    {b.isCurrent && <span className="ml-1 text-[9px] text-amber-600 font-bold bg-amber-100 px-1 rounded">Now</span>}
                  </td>
                  <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.overs}</td>
                  <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.maidens ?? 0}</td>
                  <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.runs}</td>
                  <td className={`text-center px-1.5 py-2 text-xs font-bold tabular-nums ${b.wkts > 0 ? 'text-red-600' : 'text-navy-400'}`}>{b.wkts}</td>
                  <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">{b.wd ?? 0}</td>
                  <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">{b.nb ?? 0}</td>
                  <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">{eco(b.runs, b.overs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yet to bat */}
      {isLive && inn.runs === 0 && inn.wkts === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-1">Yet to Bat</p>
          <p className="text-navy-700 font-semibold text-sm">{battingTeam?.name}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main MatchScoreSheet ─────────────────────────────────────────────────────
export default function MatchScoreSheet({ match, onClose }) {
  const { user } = useStore()
  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'

  const [inningsTab, setInningsTab] = useState(0)

  if (!match) return null

  // Show Pro gate if not subscribed
  if (!isPro) return <ProGate onClose={onClose} />

  const isLive = match.status === 'live'
  const t1 = teamById(match.team1)
  const t2 = teamById(match.team2)
  const inn0 = match.innings?.[0]
  const inn1 = match.innings?.[1]
  const hasInn1 = inn1 && (inn1.runs > 0 || inn1.wkts > 0 || inn1.batters && Object.keys(inn1.batters).length > 0)
  const activeInn = inningsTab === 0 ? inn0 : inn1
  const battingTeam  = inningsTab === 0 ? t1 : t2
  const bowlingTeam  = inningsTab === 0 ? t2 : t1

  const scoreA = inn0 ? `${inn0.runs}/${inn0.wkts}` : '—'
  const overs0 = inn0?.overs || 0
  const scoreB = hasInn1 ? `${inn1.runs}/${inn1.wkts}` : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative mt-auto bg-white rounded-t-3xl animate-slide-up max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {isLive
              ? <><Circle size={7} fill="#ef4444" className="text-red-500 animate-pulse" /><span className="text-red-500 font-bold text-xs uppercase tracking-wide">Live</span></>
              : <span className="text-navy-500 font-bold text-xs uppercase tracking-wide">{match.status}</span>
            }
            <span className="text-navy-400 text-xs ml-1">· {match.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <FollowButton type="match" item={{ id: match.id, teamA: t1?.name, teamB: t2?.name }} label="Follow" size="sm" />
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
              <X size={15} className="text-navy-600" />
            </button>
          </div>
        </div>

        {/* Scoreboard hero */}
        <div className="bg-navy-900 mx-5 mt-4 rounded-2xl px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-navy-400 text-[11px] font-semibold uppercase tracking-wide mb-0.5">1st Innings</p>
              <p className="text-white font-extrabold text-sm truncate">{t1?.name}</p>
              <p className="text-brand-400 font-extrabold text-2xl tabular-nums mt-1">{scoreA}</p>
              <p className="text-navy-500 text-xs mt-0.5">({overs0} ov)</p>
            </div>
            <div className="flex-col items-center flex-shrink-0 px-2">
              <span className="text-navy-500 font-bold text-[10px] bg-navy-800 px-2 py-0.5 rounded-full">VS</span>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-navy-400 text-[11px] font-semibold uppercase tracking-wide mb-0.5">
                {hasInn1 ? '2nd Innings' : 'Yet to bat'}
              </p>
              <p className="text-white font-extrabold text-sm truncate">{t2?.name}</p>
              {scoreB
                ? <p className="text-navy-300 font-extrabold text-2xl tabular-nums mt-1">{scoreB}</p>
                : <p className="text-navy-600 font-bold text-sm mt-1">— —</p>
              }
            </div>
          </div>
          {match.result && (
            <div className="mt-2 pt-2 border-t border-navy-800 text-center">
              <p className="text-green-300 text-xs font-semibold">
                🏆 {teamById(match.result.winner)?.name} won by {match.result.margin}
              </p>
            </div>
          )}
        </div>

        {/* Innings tabs */}
        {hasInn1 && (
          <div className="flex mx-5 mt-3 gap-1 flex-shrink-0">
            {[`${t1?.name?.split(' ')[0]} Inn.`, `${t2?.name?.split(' ')[0]} Inn.`].map((label, idx) => (
              <button
                key={idx}
                onClick={() => setInningsTab(idx)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                  inningsTab === idx ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-500'
                }`}
              >
                {idx + 1}{idx === 0 ? 'st' : 'nd'} Innings
              </button>
            ))}
          </div>
        )}

        {/* Scrollable scorecard */}
        <div className="overflow-y-auto flex-1 px-5 py-3 pb-8 space-y-3">
          <InningsCard
            inn={activeInn}
            battingTeam={battingTeam}
            bowlingTeam={bowlingTeam}
            isLive={isLive}
            xi={inningsTab === 0 ? match.xi1 : match.xi2}
          />
          <p className="text-center text-xs text-navy-400 pt-1 pb-2">
            📖 Read-only · Pro scorecard
          </p>
        </div>
      </div>
    </div>
  )
}
