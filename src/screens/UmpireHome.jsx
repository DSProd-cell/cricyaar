import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import {
  MATCHES, UMPIRE_PROFILE, OPEN_MATCHES, UMPIRE_OPEN_TOURNAMENTS,
  UMPIRE_GROUND_VISITS, UMPIRE_MY_REQUESTS, teamById, playerById
} from '../data/mock'
import UmpireMatchSession from './UmpireMatchSession'
import TopBar from '../components/TopBar'
import ProPaywallSheet from '../components/ProPaywallSheet'
import MatchScoreSheet from '../components/MatchScoreSheet'
import {
  Eye, BarChart2, Calendar, Send, Star, MapPin, Clock,
  CheckCircle, Circle, AlertCircle, ChevronRight, ChevronLeft, Shield,
  Activity, Trophy, Users, ChevronDown, ChevronUp, X,
  Navigation, Home, Bell, BadgeCheck, XCircle, Loader,
  ArrowRight, Lock, FileText, Settings, Check
} from 'lucide-react'

// ── Format helpers ────────────────────────────────────────────────────────────
const FORMAT_COLORS = {
  T20: 'bg-brand-50 text-brand-700',
  T10: 'bg-purple-50 text-purple-700',
}
const STATUS_COLORS = {
  approved: { bg:'bg-green-50',  border:'border-green-200', text:'text-green-700',  icon: BadgeCheck,  label:'Approved' },
  rejected: { bg:'bg-red-50',   border:'border-red-200',   text:'text-red-700',    icon: XCircle,     label:'Rejected' },
  pending:  { bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-700',  icon: Loader,      label:'Pending'  },
}

// ══════════════════════════════════════════════════════════════════════════════
// Scorecard Viewer — read-only slide-up for a completed match
// ══════════════════════════════════════════════════════════════════════════════
function fmtOvers(b) { return `${Math.floor(b/6)}.${b%6}` }

function ScorecardViewer({ match, onClose }) {
  const { assignment, inn1, inn2, result, specialOutcome, completedAt } = match
  const winTeam = result?.winner ? teamById(result.winner) : null
  const t1 = inn1 ? teamById(inn1.battingTeamId) : null
  const t2 = inn2 ? teamById(inn2.battingTeamId) : null

  const InningsTable = ({ inn, label }) => {
    if (!inn) return null
    const team = teamById(inn.battingTeamId)
    const batters = (inn.battingXi || []).map(id => ({ id, p: playerById(id), b: inn.batters?.[id] || { runs:0, balls:0, fours:0, sixes:0, out:false } })).filter(x => x.p)
    const bowlers = Object.entries(inn.bowlers || {}).map(([id, b]) => ({ id, p: playerById(id), b })).filter(x => x.p)
    const extras = (inn.extras?.wd||0) + (inn.extras?.nb||0) + (inn.extras?.b||0) + (inn.extras?.lb||0)
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between bg-navy-900 rounded-t-xl px-3 py-2">
          <p className="text-white font-bold text-sm">{label} — {team?.name}</p>
          <p className="text-amber-300 font-extrabold text-sm">{inn.runs}/{inn.wkts} ({fmtOvers(inn.legalBalls)} ov)</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-navy-500 font-semibold">Batter</th>
                <th className="px-2 py-2 text-center text-navy-500 font-semibold">R</th>
                <th className="px-2 py-2 text-center text-navy-500 font-semibold">B</th>
                <th className="px-2 py-2 text-center text-navy-500 font-semibold">4s</th>
                <th className="px-2 py-2 text-center text-navy-500 font-semibold">6s</th>
                <th className="px-2 py-2 text-center text-navy-500 font-semibold">SR</th>
              </tr></thead>
              <tbody>
                {batters.map(({ id, p, b }) => (
                  <tr key={id} className="border-b border-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-navy-900">{p.name}</p>
                      <p className="text-navy-400 text-[10px]">{inn.retiredHurt?.includes(id)?'retired hurt':b.out?b.how||'Out':inn.striker===id?'batting *':inn.nonStriker===id?'batting':'not out'}</p>
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-navy-900">{b.runs}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.balls}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.fours}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.sixes}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.balls>0?((b.runs/b.balls)*100).toFixed(0):'-'}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50"><td colSpan={6} className="px-3 py-1.5 text-xs text-navy-500">
                  Extras: {extras} (wd {inn.extras?.wd||0}, nb {inn.extras?.nb||0}, b {inn.extras?.b||0}, lb {inn.extras?.lb||0})
                </td></tr>
              </tbody>
            </table>
          </div>
          {bowlers.length > 0 && (
            <div className="border-t border-slate-200 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-navy-500 font-semibold">Bowler</th>
                  <th className="px-2 py-2 text-center text-navy-500 font-semibold">O</th>
                  <th className="px-2 py-2 text-center text-navy-500 font-semibold">R</th>
                  <th className="px-2 py-2 text-center text-navy-500 font-semibold">W</th>
                  <th className="px-2 py-2 text-center text-navy-500 font-semibold">Eco</th>
                </tr></thead>
                <tbody>
                  {bowlers.map(({ id, p, b }) => (
                    <tr key={id} className="border-b border-slate-50">
                      <td className="px-3 py-2 font-semibold text-navy-900">{p.name}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{fmtOvers(b.balls)}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{b.runs}</td>
                      <td className="px-2 py-2 text-center font-bold text-navy-900">{b.wkts}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{b.balls>0?(b.runs/(b.balls/6)).toFixed(1):'-'}</td>
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
    <div className="fixed inset-0 z-[90] flex flex-col bg-slate-50 animate-slide-up">
      {/* Header */}
      <div className="bg-navy-900 px-4 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-amber-200 text-xs font-bold uppercase tracking-wide">Match Scorecard</p>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X size={15} className="text-white" />
          </button>
        </div>
        <p className="text-white font-extrabold text-lg mb-1">{assignment?.teams}</p>
        <p className="text-amber-200 text-xs mb-3">{assignment?.date} · {assignment?.ground}</p>

        {/* Result */}
        {specialOutcome ? (
          specialOutcome.type === 'cancelled'
            ? <p className="text-amber-300 font-semibold text-sm">Match Cancelled — {specialOutcome.reason}</p>
            : <p className="text-amber-300 font-bold text-sm">{specialOutcome.winner?.name} won by {specialOutcome.type === 'walkover' ? 'Walkover' : 'Declaration'} 🏆</p>
        ) : result?.winner ? (
          <p className="text-amber-300 font-bold text-sm">{winTeam?.name} won by {result.margin} 🏆</p>
        ) : (
          <p className="text-amber-300 font-bold text-sm">Match Tied</p>
        )}

        {inn1 && inn2 && (
          <div className="flex items-center justify-between mt-3 bg-white/10 rounded-xl px-4 py-2 text-xs text-amber-100">
            <span>{t1?.name}: {inn1.runs}/{inn1.wkts} ({fmtOvers(inn1.legalBalls)})</span>
            <span className="text-amber-300 font-bold">vs</span>
            <span>{t2?.name}: {inn2.runs}/{inn2.wkts} ({fmtOvers(inn2.legalBalls)})</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-amber-200 text-[11px]">
          <Lock size={10} /><span>Read-only scorecard</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {inn1 && <InningsTable inn={inn1} label="1st Innings" />}
        {inn2 && <InningsTable inn={inn2} label="2nd Innings" />}
        {!inn1 && !inn2 && (
          <div className="text-center py-12 text-navy-400">
            <FileText size={32} className="mx-auto mb-3 text-navy-300" />
            <p className="font-semibold">No ball-by-ball data available</p>
            <p className="text-sm mt-1">Match ended via {specialOutcome?.type || 'decision'}</p>
          </div>
        )}
      </div>
      <div className="px-4 pb-6 pt-2 border-t border-slate-100 bg-white flex-shrink-0">
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl bg-navy-900 text-white font-bold text-sm">
          Close Scorecard
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Match Config Screen — shown before toss to set up match details
// ══════════════════════════════════════════════════════════════════════════════
function MatchConfigScreen({ assignment, onNext, onSchedule, onClose }) {
  const t1 = teamById(assignment.team1Id)
  const t2 = teamById(assignment.team2Id)

  const MATCH_TYPES = [
    { id: 'limited', label: 'Limited Overs' },
    { id: 'box',     label: 'Box Cricket'   },
    { id: 'pair',    label: 'Pair Cricket'  },
    { id: 'test',    label: 'Test Match'    },
    { id: 'hundred', label: 'The Hundred'   },
  ]
  const PITCH_TYPES = ['Turf', 'Concrete', 'Matting', 'Mud', 'Synthetic']
  const BALL_TYPES = [
    { id: 'tennis',  label: 'Tennis',  color: '#009B4D', emoji: '🎾' },
    { id: 'leather', label: 'Leather', color: '#DC2626', emoji: '🏏' },
    { id: 'other',   label: 'Other',   color: '#D97706', emoji: '🟡' },
  ]

  const [matchType, setMatchType]   = useState('limited')
  const [overs, setOvers]           = useState(String(assignment.defaultOvers || 20))
  const [oversPerBowler, setOPB]    = useState('4')
  const [city, setCity]             = useState(assignment.city || '')
  const [ground, setGround]         = useState(assignment.ground || '')
  const [dateTime, setDateTime]     = useState(assignment.date || '')
  const [ballType, setBallType]     = useState('tennis')
  const [wagonWheel, setWagonWheel] = useState(true)
  const [pitchType, setPitchType]   = useState('Turf')

  const inputCls = "w-full border-b border-slate-300 pb-1.5 pt-0.5 text-sm text-navy-900 outline-none focus:border-brand-500 bg-transparent"
  const labelCls = "text-xs text-navy-400 mb-0.5 block"

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0 pt-safe-top">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <ChevronLeft size={20} className="text-navy-700"/>
        </button>
        <h1 className="font-bold text-navy-900 text-base">Start a match</h1>
        <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <Settings size={16} className="text-navy-500"/>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Teams row */}
        <div className="flex items-center justify-around px-4 py-6 border-b border-slate-100">
          {/* Team 1 */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center"
              style={{ background: t1?.color ? `${t1.color}22` : '#f1f5f9' }}>
              <span className="font-extrabold text-xl" style={{ color: t1?.color || '#64748b' }}>
                {t1?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <p className="text-xs font-semibold text-navy-800 text-center max-w-[90px] truncate">{t1?.name}</p>
            <button className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-[11px] font-bold">
              Select squad
            </button>
          </div>

          {/* VS diamond */}
          <div className="flex-shrink-0 mx-3">
            <div className="w-10 h-10 bg-slate-200 rotate-45 rounded-sm flex items-center justify-center">
              <span className="text-[11px] font-extrabold text-navy-600 -rotate-45">VS</span>
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center"
              style={{ background: t2?.color ? `${t2.color}22` : '#f1f5f9' }}>
              <span className="font-extrabold text-xl" style={{ color: t2?.color || '#64748b' }}>
                {t2?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <p className="text-xs font-semibold text-navy-800 text-center max-w-[90px] truncate">{t2?.name}</p>
            <button className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-[11px] font-bold">
              Select squad
            </button>
          </div>
        </div>

        <div className="px-4 py-5 space-y-6">

          {/* Match type */}
          <div>
            <p className="font-bold text-navy-900 text-sm mb-3">Match type</p>
            <div className="flex flex-wrap gap-2">
              {MATCH_TYPES.map(t => (
                <button key={t.id} onClick={() => setMatchType(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    matchType === t.id
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-navy-700 border-slate-300'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overs row */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={labelCls}>No. of overs*</label>
              <input type="number" min="1" max="50" value={overs}
                onChange={e => setOvers(e.target.value)} className={inputCls}/>
            </div>
            <div className="flex-1">
              <label className={labelCls}>Overs per bowler</label>
              <input type="number" min="1" max="20" value={oversPerBowler}
                onChange={e => setOPB(e.target.value)} className={inputCls}/>
            </div>
            <button className="flex items-center gap-0.5 text-brand-500 font-bold text-sm pb-2 whitespace-nowrap flex-shrink-0">
              Power Play<ChevronRight size={14}/>
            </button>
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>City / town*</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              className={inputCls} placeholder="Enter city"/>
          </div>

          {/* Ground */}
          <div>
            <label className={labelCls}>Ground*</label>
            <input value={ground} onChange={e => setGround(e.target.value)}
              className={inputCls} placeholder="Enter ground name"/>
          </div>

          {/* Date and time */}
          <div>
            <label className={labelCls}>Date and time</label>
            <input value={dateTime} onChange={e => setDateTime(e.target.value)}
              className={inputCls} placeholder="e.g. Sun, May 31 2026 06:30 AM"/>
          </div>

          {/* Ball type */}
          <div>
            <p className="font-bold text-navy-900 text-sm mb-4">Ball type</p>
            <div className="flex gap-8">
              {BALL_TYPES.map(b => (
                <button key={b.id} onClick={() => setBallType(b.id)}
                  className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                    ballType === b.id ? 'border-transparent' : 'border-slate-300 bg-slate-50'
                  }`}
                    style={ballType === b.id ? { background: b.color } : {}}>
                    {ballType === b.id
                      ? <Check size={22} className="text-white" strokeWidth={3}/>
                      : <span className="text-2xl">{b.emoji}</span>
                    }
                  </div>
                  <span className="text-xs font-semibold text-navy-700">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wagon wheel */}
          <div>
            <p className="font-bold text-navy-900 text-sm mb-2">Wagon wheel</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-500">Show Wagon wheel for 1s, 2s and 3s</p>
              <button onClick={() => setWagonWheel(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ml-3 ${wagonWheel ? 'bg-brand-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${wagonWheel ? 'left-6' : 'left-0.5'}`}/>
              </button>
            </div>
          </div>

          {/* Pitch type */}
          <div className="pb-4">
            <p className="font-bold text-navy-900 text-sm mb-3">Pitch type</p>
            <div className="flex flex-wrap gap-2">
              {PITCH_TYPES.map(p => (
                <button key={p} onClick={() => setPitchType(p)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    pitchType === p
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-navy-700 border-slate-300'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex border-t border-slate-200 flex-shrink-0">
        <button onClick={onSchedule}
          className="flex-1 py-4 bg-white text-navy-700 font-bold text-sm border-r border-slate-200 active:bg-slate-50">
          Schedule match
        </button>
        <button
          onClick={() => onNext({ matchType, overs: parseInt(overs), oversPerBowler: parseInt(oversPerBowler), city, ground, dateTime, ballType, wagonWheel, pitchType })}
          className="flex-1 py-4 text-white font-bold text-sm active:opacity-90"
          style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
          Next (Toss)
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — MY ASSIGNMENTS
// ══════════════════════════════════════════════════════════════════════════════
function MyAssignments({ navigate, addToast }) {
  const { umpireSessionData, setUmpireSession, umpireCompletedMatches, addUmpireCompletedMatch } = useStore()
  const allUpcoming   = UMPIRE_PROFILE.assignments.filter(a => a.status === 'upcoming')
  const completedMock = UMPIRE_PROFILE.assignments.filter(a => a.status === 'completed')
  const liveMatch     = MATCHES.find(m => m.status === 'live')
  const [configAssignment, setConfigAssignment] = useState(null) // match config screen
  const [tossAssignment, setTossAssignment]     = useState(null)
  const [scoreMatch, setScoreMatch]             = useState(null)
  const [activeSession, setActiveSession]       = useState(null) // { assignment, tossResult }
  const [viewScorecard, setViewScorecard]       = useState(null) // stored match object

  // sessions is now driven by the persisted store
  const sessions = umpireSessionData || {}

  const StarRating = ({ n }) => (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11} className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </span>
  )

  // Split upcoming: completed-in-store go to history, rest stay as pending
  const upcoming = allUpcoming.filter(a => !umpireCompletedMatches?.find(cm => cm.assignment?.id === a.id))
  const liveMatchCompleted = liveMatch && umpireCompletedMatches?.find(cm => cm.assignment?.id === liveMatch.id)

  return (
    <>
    <div className="space-y-4 animate-slide-up">

      {/* Live match banner — only show if NOT already completed */}
      {liveMatch && !liveMatchCompleted && (
        <button
          onClick={() => setScoreMatch(liveMatch)}
          className="w-full rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg,#78350f,#d97706)' }}
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Circle size={8} fill="#fde68a" className="text-yellow-200 animate-pulse" />
              <span className="text-yellow-200 text-xs font-bold uppercase tracking-wide">You're assigned — Live Now</span>
            </div>
            <p className="text-white font-extrabold text-base mb-1">{liveMatch.name}</p>
            <p className="text-amber-100 text-xs mb-3">
              {teamById(liveMatch.team1)?.name} vs {teamById(liveMatch.team2)?.name}
            </p>
            <div className="flex items-center gap-2 text-amber-100 text-xs border-t border-white/20 pt-2.5">
              <MapPin size={11} />
              <span>Wankhede Cricket Ground, Mumbai</span>
              <span className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl">
                <Eye size={12} className="text-white" />
                <span className="text-white font-bold">Score Now →</span>
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Upcoming assignments — only truly pending/in-progress ones */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Calendar size={15} className="text-amber-500" />
          <p className="font-bold text-navy-900 text-sm flex-1">Upcoming Assignments</p>
          {upcoming.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{upcoming.length} upcoming</span>
          )}
        </div>
        <div className="p-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-6">
              <Clock size={28} className="mx-auto text-navy-300 mb-2" />
              <p className="text-navy-500 text-sm font-medium">No upcoming assignments</p>
              <p className="text-navy-400 text-xs mt-1">Browse Ongoing Matches to raise requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => {
                const sess = sessions[a.id]
                const tossComplete = !!sess?.tossResult

                return (
                <div key={a.id} className="border rounded-xl p-3 border-amber-200 bg-amber-50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚖️ Assigned</span>
                    <span className="text-[10px] text-navy-400">{a.date}</span>
                  </div>
                  <p className="font-extrabold text-navy-900 text-sm mb-1 leading-tight">{a.teams}</p>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-1">
                    <MapPin size={10} className="text-navy-400" />
                    <span>{a.ground}, {a.city}</span>
                  </div>

                  {/* Pending/in-progress only — completed ones filtered out above */}
                  <>
                      <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-2.5">
                        <Clock size={10} className="text-navy-400" />
                        <span>Match Day · Arrive 30 min early</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                          <Activity size={10} />Score access
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} />Result sign-off
                        </div>
                      </div>

                      {tossComplete && (
                        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
                          <CheckCircle size={13} className="text-green-600 flex-shrink-0" />
                          <p className="text-green-800 text-xs font-semibold flex-1">
                            Toss done · <strong>{sess.tossResult.winnerName}</strong> elected to{' '}
                            <strong>{sess.tossResult.choice}</strong> first
                          </p>
                          <span className="text-green-600 text-[10px] font-bold uppercase">Locked</span>
                        </div>
                      )}

                      {!tossComplete ? (
                        <button
                          onClick={() => setConfigAssignment(a)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                          style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 4px 12px rgba(13,148,136,0.35)' }}
                        >
                          🏏 Start a Match
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSession({ assignment: a, tossResult: sess.tossResult })}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                          style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow:'0 4px 12px rgba(34,197,94,0.35)' }}
                        >
                          <Activity size={15} /> Resume Match →
                        </button>
                      )}
                  </>
                </div>
              )})}

            </div>
          )}
        </div>
      </div>

      {/* Match Config Screen — shown before toss */}
      {configAssignment && (
        <MatchConfigScreen
          assignment={configAssignment}
          onNext={(_config) => {
            setTossAssignment(configAssignment)
            setConfigAssignment(null)
          }}
          onSchedule={() => {
            addToast('Match scheduled!', 'success')
            setConfigAssignment(null)
          }}
          onClose={() => setConfigAssignment(null)}
        />
      )}

      {/* Toss Modal */}
      {tossAssignment && (
        <TossModal
          assignment={tossAssignment}
          onComplete={(winnerName, winnerIdx, choice) => {
            setUmpireSession(tossAssignment.id, { tossResult: { winnerName, winnerIdx, choice } })
            addToast(`Toss done! ${winnerName} will ${choice} first.`, 'success')
            setTossAssignment(null)
          }}
          onClose={() => setTossAssignment(null)}
          addToast={addToast}
        />
      )}

      {/* Match session (full-screen overlay) */}
      {activeSession && (
        <UmpireMatchSession
          assignment={activeSession.assignment}
          tossResult={activeSession.tossResult}
          onMatchSaved={(data) => {
            addUmpireCompletedMatch({
              id: `cm_${activeSession.assignment.id}_${Date.now()}`,
              assignment: activeSession.assignment,
              ...data,
            })
            addToast('Match result saved & published! 🏆', 'success')
          }}
          onClose={() => setActiveSession(null)}
        />
      )}

      {/* Scorecard viewer */}
      {viewScorecard && <ScorecardViewer match={viewScorecard} onClose={() => setViewScorecard(null)} />}

      {/* Match history — store completed + mock completed */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <CheckCircle size={15} className="text-green-500" />
          <p className="font-bold text-navy-900 text-sm flex-1">Match History</p>
          <span className="text-navy-400 text-xs">{(umpireCompletedMatches?.length || 0) + completedMock.length} matches</span>
        </div>
        <div className="divide-y divide-slate-50">
          {/* Store completed (live matches scored in app) */}
          {(umpireCompletedMatches || []).map(cm => (
            <div key={cm.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={15} className="text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm leading-tight truncate">{cm.assignment?.teams}</p>
                <p className="text-navy-400 text-xs mt-0.5">
                  {cm.specialOutcome?.type === 'cancelled' ? 'Cancelled' :
                   cm.result?.winner ? `${teamById(cm.result.winner)?.name} won by ${cm.result.margin}` :
                   cm.specialOutcome?.winner?.name ? `${cm.specialOutcome.winner.name} won` : 'Tied'}
                </p>
              </div>
              <button
                onClick={() => setViewScorecard(cm)}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-xl px-2.5 py-1.5 flex-shrink-0"
              >
                <Eye size={11} /> Scorecard
              </button>
            </div>
          ))}
          {/* Mock completed */}
          {completedMock.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={15} className="text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm leading-tight truncate">{a.teams}</p>
                <p className="text-navy-400 text-xs mt-0.5">{a.date} · {a.ground}</p>
              </div>
              {a.rating != null && (
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">{a.rating}.0</span>
                  <span className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={9} className={i <= a.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                    ))}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    {scoreMatch && <MatchScoreSheet match={scoreMatch} onClose={() => setScoreMatch(null)} />}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — MY STATS
// ══════════════════════════════════════════════════════════════════════════════
function MyStats() {
  const { umpireSessionData, umpireCompletedMatches, addUmpireCompletedMatch } = useStore()
  const [subTab, setSubTab]           = useState('upcoming')  // 'upcoming' | 'completed'
  const [viewScorecard, setViewScorecard] = useState(null)

  const totalMatches  = UMPIRE_PROFILE.matchesUmpired
  const totalGrounds  = UMPIRE_GROUND_VISITS.length
  const nearest       = [...UMPIRE_GROUND_VISITS].sort((a, b) => a.distanceKm - b.distanceKm)[0]
  const avgDistance   = Math.round(UMPIRE_GROUND_VISITS.reduce((s, g) => s + g.distanceKm, 0) / UMPIRE_GROUND_VISITS.length)

  const sessions = umpireSessionData || {}

  // Upcoming: mock assignments not yet completed in store
  const mockUpcoming  = UMPIRE_PROFILE.assignments.filter(a => a.status === 'upcoming')
  const mockCompleted = UMPIRE_PROFILE.assignments.filter(a => a.status === 'completed')

  // Store completed matches (user-scored)
  const storeDone = umpireCompletedMatches || []

  // Mark which upcoming assignments are actually done (result declared in store)
  const doneAssignmentIds = new Set(storeDone.map(cm => cm.assignment?.id).filter(Boolean))

  const upcomingActive = mockUpcoming.filter(a => !doneAssignmentIds.has(a.id))
  const upcomingDone   = mockUpcoming.filter(a =>  doneAssignmentIds.has(a.id))

  const totalCompleted = storeDone.length + mockCompleted.length + upcomingDone.length

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Scorecard viewer overlay */}
      {viewScorecard && <ScorecardViewer match={viewScorecard} onClose={() => setViewScorecard(null)} />}

      {/* Sub-tabs: Upcoming / Completed */}
      <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl">
        {[
          { key:'upcoming',  label:'Upcoming',  count: upcomingActive.length },
          { key:'completed', label:'Completed', count: totalCompleted },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${subTab === t.key ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'}`}>
            {t.label}
            <span className={`min-w-[16px] h-4 rounded-full text-[9px] font-bold inline-flex items-center justify-center px-1 ${t.count > 0 ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── UPCOMING sub-tab ── */}
      {subTab === 'upcoming' && (
        <div className="space-y-3">
          {upcomingActive.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
              <p className="font-semibold text-navy-700">All assignments completed!</p>
              <p className="text-navy-400 text-sm mt-1">Switch to Completed tab to view scorecards.</p>
            </div>
          ) : upcomingActive.map(a => {
            const sess = sessions[a.id]
            const tossComplete = !!sess?.tossResult
            return (
              <div key={a.id} className="bg-white rounded-2xl shadow-card p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚖️ To Umpire</span>
                  <span className="text-[10px] text-navy-400">{a.date}</span>
                </div>
                <p className="font-extrabold text-navy-900 text-sm mb-1">{a.teams}</p>
                <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-1">
                  <MapPin size={10} /><span>{a.ground}, {a.city}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {tossComplete ? (
                    <span className="flex items-center gap-1 text-[11px] text-green-700 font-semibold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <CheckCircle size={10} />Toss done · In progress
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      <Circle size={10} />Toss pending
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── COMPLETED sub-tab ── */}
      {subTab === 'completed' && (
        <div className="space-y-3">
          {totalCompleted === 0 ? (
            <div className="text-center py-10">
              <Trophy size={32} className="mx-auto text-navy-300 mb-3" />
              <p className="font-semibold text-navy-600">No completed matches yet</p>
              <p className="text-navy-400 text-sm mt-1">Scored matches will appear here once results are declared.</p>
            </div>
          ) : (
            <>
              {/* Store completed (with full scorecard) */}
              {storeDone.map(cm => {
                const res = cm.specialOutcome?.type === 'cancelled'
                  ? `Cancelled — ${cm.specialOutcome.reason}`
                  : cm.result?.winner
                    ? `${teamById(cm.result.winner)?.name} won by ${cm.result.margin}`
                    : cm.specialOutcome?.winner?.name
                      ? `${cm.specialOutcome.winner.name} won`
                      : 'Tied'
                return (
                  <div key={cm.id} className="bg-white rounded-2xl shadow-card p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ Result Declared</span>
                      <span className="text-[10px] text-navy-400">{cm.assignment?.date}</span>
                    </div>
                    <p className="font-extrabold text-navy-900 text-sm mb-1">{cm.assignment?.teams}</p>
                    <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-1">
                      <MapPin size={10} /><span>{cm.assignment?.ground}, {cm.assignment?.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mt-2 mb-3">
                      <Trophy size={12} className="text-green-700 flex-shrink-0" />
                      <p className="text-green-800 text-xs font-semibold flex-1">{res}</p>
                    </div>
                    <button
                      onClick={() => setViewScorecard(cm)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 border-brand-300 text-brand-700 bg-brand-50 transition-all active:scale-95"
                    >
                      <Eye size={15} /> View Full Scorecard
                    </button>
                  </div>
                )
              })}

              {/* Upcoming that got completed via store */}
              {upcomingDone.map(a => {
                const cm = storeDone.find(c => c.assignment?.id === a.id)
                if (!cm) return null
                return (
                  <div key={a.id} className="bg-white rounded-2xl shadow-card p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ Result Declared</span>
                      <span className="text-[10px] text-navy-400">{a.date}</span>
                    </div>
                    <p className="font-extrabold text-navy-900 text-sm mb-1">{a.teams}</p>
                    <button onClick={() => setViewScorecard(cm)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 border-brand-300 text-brand-700 bg-brand-50 mt-2 active:scale-95">
                      <Eye size={15} /> View Full Scorecard
                    </button>
                  </div>
                )
              })}

              {/* Mock completed (no scorecard stored, show limited info) */}
              {mockCompleted.map(a => (
                <div key={a.id} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">📋 Past Match</span>
                    <span className="text-[10px] text-navy-400">{a.date}</span>
                  </div>
                  <p className="font-extrabold text-navy-900 text-sm mb-1">{a.teams}</p>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-1">
                    <MapPin size={10} /><span>{a.ground}, {a.city}</span>
                  </div>
                  {a.rating != null && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-amber-600 font-bold">{a.rating}.0</span>
                      <span className="flex">
                        {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i<=a.rating?'text-amber-400 fill-amber-400':'text-slate-200 fill-slate-200'} />)}
                      </span>
                      <span className="text-[10px] text-navy-400 ml-1">Umpire rating</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Career Summary (always visible) ── */}

      {/* Headline numbers */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg,#78350f,#d97706)' }}
      >
        <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-3">Career Summary</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Matches Umpired', val: totalMatches, icon:'⚖️' },
            { label:'Grounds Visited', val: totalGrounds, icon:'🏟️' },
            { label:'Avg Distance',    val: `${avgDistance} km`, icon:'📍' },
            { label:'Rating',          val: `${UMPIRE_PROFILE.rating} ⭐`, icon:'🌟' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl px-3 py-3 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-white font-extrabold text-xl tabular-nums leading-none">{s.val}</p>
              <p className="text-amber-100 text-[10px] font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearest ground visited */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation size={15} className="text-brand-500" />
          <p className="font-bold text-navy-900 text-sm">Nearest Ground Visited</p>
        </div>
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-3 py-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Home size={16} className="text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-navy-900 text-sm leading-tight">{nearest.groundName}</p>
            <p className="text-navy-500 text-xs mt-0.5">{nearest.city}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-brand-700 text-lg tabular-nums">{nearest.distanceKm} km</p>
            <p className="text-navy-400 text-[10px]">from home</p>
          </div>
        </div>
      </div>

      {/* All grounds visited */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <MapPin size={15} className="text-amber-500" />
          <p className="font-bold text-navy-900 text-sm flex-1">Grounds Visited</p>
          <span className="text-navy-400 text-xs">{totalGrounds} grounds</span>
        </div>
        <div className="divide-y divide-slate-50">
          {[...UMPIRE_GROUND_VISITS].sort((a, b) => a.distanceKm - b.distanceKm).map((g, idx) => (
            <div key={g.groundId} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                idx === 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {idx === 0 ? '🏠' : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm leading-tight truncate">{g.groundName}</p>
                <p className="text-navy-400 text-xs">{g.city} · Last: {g.lastVisited}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-navy-900 text-sm tabular-nums">{g.distanceKm >= 100 ? `${g.distanceKm} km` : `${g.distanceKm} km`}</p>
                <p className="text-navy-400 text-[10px]">{g.matches} match{g.matches !== 1 ? 'es' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <p className="font-bold text-navy-900 text-sm mb-3">Rating Breakdown</p>
        <div className="space-y-2">
          {[5,4,3,2,1].map(star => {
            const count = UMPIRE_PROFILE.ratingBreakdown[star] || 0
            const total = Object.values(UMPIRE_PROFILE.ratingBreakdown).reduce((a,b) => a+b, 0)
            const pct   = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8 flex-shrink-0">
                  <span className="text-xs font-semibold text-navy-700">{star}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width:`${pct}%` }} />
                </div>
                <span className="text-xs text-navy-400 w-4 text-right flex-shrink-0">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 3 — ONGOING MATCHES (Individual + Tournament)
// ══════════════════════════════════════════════════════════════════════════════
function OngoingMatches({ user, addToast, umpireRequests, addUmpireRequest, withdrawUmpireRequest,
                         umpireTournamentRequests, addUmpireTournamentRequest, withdrawUmpireTournamentRequest }) {
  const [subTab, setSubTab] = useState('matches')
  const [showPaywall, setShowPaywall]     = useState(false)
  const [requestModal, setRequestModal]   = useState(null)
  const [expandedTournament, setExpandedTournament] = useState(null)

  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const pendingMatchCount       = umpireRequests.filter(r => r.status === 'pending').length
  const pendingTournamentCount  = umpireTournamentRequests.filter(r => r.status === 'pending').length

  const MAX_MATCH_REQUESTS      = 3
  const MAX_TOURNAMENT_REQUESTS = 2

  const isMatchRequested      = id => umpireRequests.some(r => r.matchId === id)
  const isTournamentRequested = id => umpireTournamentRequests.some(r => r.tournamentId === id)

  const handleMatchRequest = (match) => {
    if (!isPro) { setShowPaywall(true); return }
    if (pendingMatchCount >= MAX_MATCH_REQUESTS) { addToast(`Max ${MAX_MATCH_REQUESTS} pending requests at a time.`, 'error'); return }
    addUmpireRequest(match.id, match.name)
    addToast('Umpire request sent to organiser! 🏏', 'success')
  }

  const handleWithdraw = (matchId) => {
    withdrawUmpireRequest(matchId)
    addToast('Request withdrawn.', 'info')
  }

  const handleTournamentRequest = (tournament, type, dates, note) => {
    if (!isPro) { setShowPaywall(true); return }
    if (type === 'full' && pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS) {
      addToast(`Max ${MAX_TOURNAMENT_REQUESTS} tournament requests at a time.`, 'error'); return
    }
    addUmpireTournamentRequest(tournament.id, tournament.name, type)
    addToast(type === 'full' ? `Full tournament request sent for ${tournament.name}! 🏆` : `Match requests sent!`, 'success')
    setRequestModal(null)
  }

  return (
    <div className="animate-slide-up">
      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl mb-4">
        {[
          { key:'matches',     label:'Individual Matches', count: pendingMatchCount },
          { key:'tournaments', label:'Tournaments',        count: pendingTournamentCount },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === t.key ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold inline-flex items-center justify-center px-1">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Individual Matches ── */}
      {subTab === 'matches' && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
            pendingMatchCount >= MAX_MATCH_REQUESTS ? 'bg-red-50 border border-red-200'
              : pendingMatchCount > 0 ? 'bg-amber-50 border border-amber-200'
              : 'bg-slate-50 border border-slate-200'
          }`}>
            <AlertCircle size={15} className={pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-500' : pendingMatchCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-700' : pendingMatchCount > 0 ? 'text-amber-800' : 'text-navy-600'}`}>
                {pendingMatchCount} / {MAX_MATCH_REQUESTS} pending requests
              </p>
              <p className="text-xs text-navy-400 mt-0.5">Organisers will contact you if selected</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_MATCH_REQUESTS }).map((_, i) => (
                <Circle key={i} size={7} className={i < pendingMatchCount ? 'text-amber-500 fill-amber-500' : 'text-slate-300 fill-slate-300'} />
              ))}
            </div>
          </div>

          {OPEN_MATCHES.map(match => {
            const requested = isMatchRequested(match.id)
            return (
              <div key={match.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[match.format] || 'bg-slate-100 text-slate-600'}`}>
                        {match.format} · {match.overs} ov
                      </span>
                    </div>
                    <p className="font-bold text-navy-900 text-sm leading-tight">{match.teams}</p>
                  </div>
                  {requested && (
                    <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="text-green-700 text-xs font-semibold">Requested</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-navy-500 text-xs">
                    <Calendar size={11} className="text-navy-400" /><span>{match.date}</span>
                    <Clock size={11} className="text-navy-400 ml-1" /><span>{match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-navy-500 text-xs">
                    <MapPin size={11} className="text-navy-400" /><span className="truncate">{match.ground}, {match.city}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-navy-400">By <span className="font-medium text-navy-600">{match.organiser}</span></p>
                  {requested ? (
                    <button onClick={() => handleWithdraw(match.id)} className="text-red-500 text-xs font-semibold">Withdraw</button>
                  ) : (
                    <button
                      onClick={() => handleMatchRequest(match)}
                      disabled={pendingMatchCount >= MAX_MATCH_REQUESTS && isPro}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pendingMatchCount >= MAX_MATCH_REQUESTS && isPro
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      {isPro ? 'Request to Umpire' : 'Request ✦ Pro'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tournaments ── */}
      {subTab === 'tournaments' && (
        <div className="space-y-3">
          {UMPIRE_OPEN_TOURNAMENTS.map(tournament => {
            const slotsLeft  = tournament.totalUmpireSlots - tournament.umpireSlotsFilled
            const requested  = isTournamentRequested(tournament.id)
            const isExpanded = expandedTournament === tournament.id

            return (
              <div key={tournament.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[tournament.format] || 'bg-slate-100 text-slate-600'}`}>
                        {tournament.format} · {tournament.overs} ov
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tournament.status === 'live' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {tournament.status === 'live' ? '🔴 Live' : '🟢 Upcoming'}
                      </span>
                    </div>
                    <p className="font-bold text-navy-900 text-sm leading-tight">{tournament.name}</p>
                    <p className="text-navy-500 text-xs mt-0.5">{tournament.city} · By {tournament.organiser}</p>
                  </div>
                  {requested && (
                    <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="text-green-700 text-xs font-semibold">Sent</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-navy-500">
                  <div className="flex items-center gap-1"><Calendar size={11} />{tournament.startDate} – {tournament.endDate}</div>
                  <span>·</span>
                  <span><span className="font-semibold text-navy-700">{slotsLeft}</span> umpire slot{slotsLeft !== 1 ? 's' : ''} open</span>
                </div>

                <button
                  onClick={() => setExpandedTournament(isExpanded ? null : tournament.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mb-3"
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isExpanded ? 'Hide' : 'Show'} schedule ({tournament.matches.length} matches)
                </button>

                {isExpanded && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-2">
                    {tournament.matches.map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-xs">
                        <span className="text-navy-400 font-medium w-12 flex-shrink-0">{m.date}</span>
                        <span className="text-navy-700 font-semibold flex-1 truncate">{m.teams}</span>
                        <span className="text-navy-400 truncate">{m.ground}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!requested ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!isPro) { setShowPaywall(true); return }
                        if (pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS) { addToast('Max 2 tournament requests at a time.', 'error'); return }
                        setRequestModal(tournament)
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
                    >
                      {isPro ? 'Request: Full Tournament' : 'Request ✦ Pro'}
                    </button>
                    <button
                      onClick={() => {
                        if (!isPro) { setShowPaywall(true); return }
                        handleTournamentRequest(tournament, 'specific', [], '')
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 text-navy-700 font-semibold text-xs hover:bg-slate-200 transition-colors flex-shrink-0"
                    >
                      Specific Matches
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { withdrawUmpireTournamentRequest(tournament.id); addToast('Request withdrawn.', 'info') }}
                    className="text-red-500 text-xs font-semibold"
                  >
                    Withdraw request
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Full tournament request modal */}
      {requestModal && (
        <TournamentRequestModal
          tournament={requestModal}
          onClose={() => setRequestModal(null)}
          onSend={handleTournamentRequest}
        />
      )}

      {showPaywall && (
        <ProPaywallSheet
          featureName="Umpire requests"
          featureDesc="Request to umpire matches and tournaments. Pro members can have up to 3 match requests and 2 full-tournament requests active."
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TOSS MODAL — Online Coin Toss
// ══════════════════════════════════════════════════════════════════════════════
function TossModal({ assignment, onComplete, onClose, addToast }) {
  const [step, setStep]           = useState('caller')   // caller | call | flipping | result | choice | final
  const [caller, setCaller]       = useState(null)        // 0 or 1
  const [call, setCall]           = useState(null)        // 'heads' | 'tails'
  const [tossResult, setTossResult] = useState(null)
  const [winnerIdx, setWinnerIdx] = useState(null)
  const [choice, setChoice]       = useState(null)        // 'bat' | 'field'

  const parts = (assignment.teams || 'Team A vs Team B').split(' vs ')
  const team1 = parts[0]?.trim() || 'Team A'
  const team2 = parts[1]?.trim() || 'Team B'
  const teams = [team1, team2]

  const doFlip = () => {
    setStep('flipping')
    const result = Math.random() > 0.5 ? 'heads' : 'tails'
    setTimeout(() => {
      setTossResult(result)
      const won = call === result ? caller : (caller === 0 ? 1 : 0)
      setWinnerIdx(won)
      setStep('result')
    }, 1800)
  }

  const winnerName = winnerIdx !== null ? teams[winnerIdx] : ''

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              <span className="text-base">🪙</span>
            </div>
            <h2 className="font-extrabold text-navy-900 text-base">Online Toss</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="px-5 py-4 pb-8">
          {/* Match info */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold text-navy-900 text-sm text-center flex-1">{team1}</p>
              <span className="text-xs font-bold text-navy-400 px-2 py-1 bg-white rounded-full border border-slate-200 flex-shrink-0">vs</span>
              <p className="font-extrabold text-navy-900 text-sm text-center flex-1">{team2}</p>
            </div>
          </div>

          {/* Step: caller selection */}
          {step === 'caller' && (
            <div>
              <p className="text-navy-600 font-semibold text-sm text-center mb-4">Which team calls the toss?</p>
              <div className="grid grid-cols-2 gap-3">
                {teams.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setCaller(i); setStep('call') }}
                    className="py-4 px-3 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all active:scale-95 text-center"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: call heads/tails */}
          {step === 'call' && (
            <div>
              <p className="text-navy-600 font-semibold text-sm text-center mb-1">
                <span className="text-brand-600">{teams[caller]}</span> calls...
              </p>
              <p className="text-navy-400 text-xs text-center mb-5">Select heads or tails</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { key:'heads', label:'Heads', emoji:'👑' },
                  { key:'tails', label:'Tails', emoji:'🌀' },
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCall(c.key)}
                    className="py-5 rounded-2xl font-extrabold text-lg border-2 transition-all active:scale-95 flex flex-col items-center gap-1"
                    style={call === c.key
                      ? { borderColor: '#22c55e', background: '#f0fdf4', color: '#15803d' }
                      : { borderColor: '#e2e8f0', background: '#f8fafc', color: '#334155' }
                    }
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-sm font-bold">{c.label}</span>
                  </button>
                ))}
              </div>
              {call && (
                <button onClick={doFlip} className="btn-primary w-full">
                  Flip the Coin!
                </button>
              )}
            </div>
          )}

          {/* Step: flipping */}
          {step === 'flipping' && (
            <div className="text-center py-6">
              <div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 animate-spin"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 8px 32px rgba(251,191,36,0.4)' }}
              >
                🪙
              </div>
              <p className="font-bold text-navy-700 text-base">Flipping the coin...</p>
              <p className="text-navy-400 text-sm mt-1">Hold tight!</p>
            </div>
          )}

          {/* Step: result → winner chooses */}
          {step === 'result' && (
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3"
                style={tossResult === 'heads'
                  ? { background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 8px 24px rgba(251,191,36,0.4)' }
                  : { background: 'linear-gradient(135deg, #94a3b8, #475569)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }
                }
              >
                {tossResult === 'heads' ? '👑' : '🌀'}
              </div>
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-1">It's...</p>
              <p className="text-2xl font-extrabold text-navy-900 capitalize mb-3">{tossResult}!</p>
              <div className="bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 mb-5">
                <p className="font-extrabold text-brand-700 text-sm">🎉 {winnerName} wins the toss!</p>
              </div>
              <p className="text-navy-600 font-semibold text-sm mb-4">What does {winnerName} choose?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key:'bat',   emoji:'🏏', label:'Bat First'   },
                  { key:'field', emoji:'🧤', label:'Field First' },
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => { setChoice(c.key); setStep('final') }}
                    className="py-4 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all active:scale-95 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: final summary */}
          {step === 'final' && (
            <div className="text-center py-2">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
              >
                ✅
              </div>
              <p className="font-extrabold text-navy-900 text-lg mb-2">Toss Complete!</p>
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5">
                <p className="font-bold text-green-800 text-base leading-relaxed">
                  {winnerName} won the toss<br />
                  <span className="text-green-600">and elected to {choice === 'bat' ? '🏏 bat' : '🧤 field'} first.</span>
                </p>
              </div>
              <p className="text-navy-400 text-xs mb-5">Both teams have been notified via the app</p>
              <button
                onClick={() => onComplete(winnerName, winnerIdx, choice)}
                className="btn-primary w-full"
              >
                Start Match →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Full tournament date-picker modal ─────────────────────────────────────────
function TournamentRequestModal({ tournament, onClose, onSend }) {
  const [selectedDates, setSelectedDates] = useState(tournament.upcomingMatchDates.map(() => true))
  const [note, setNote] = useState('')
  const toggleDate = i => setSelectedDates(prev => prev.map((v, idx) => idx === i ? !v : v))
  const confirmed = tournament.upcomingMatchDates.filter((_, i) => selectedDates[i])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-modal animate-slide-up max-h-[88dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-bold text-navy-900">Request: Full Tournament</h2>
            <p className="text-navy-500 text-xs mt-0.5">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={14} className="text-navy-500" /></button>
        </div>
        <div className="px-5 pb-8">
          <p className="text-sm font-semibold text-navy-700 mb-2">Confirm your availability</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {tournament.upcomingMatchDates.map((date, i) => (
              <button
                key={i}
                onClick={() => toggleDate(i)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  selectedDates[i] ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-navy-500'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedDates[i] ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                  {selectedDates[i] && <CheckCircle size={10} className="text-white" />}
                </div>
                {date}
              </button>
            ))}
          </div>
          <textarea
            className="cm-input resize-none mb-1"
            rows={2}
            placeholder="e.g. Available all days. BCCI Level 2 certified."
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 150))}
          />
          <p className="text-navy-400 text-xs text-right mb-4">{note.length}/150</p>
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-4">
            <p className="text-xs text-navy-500">{confirmed.length} date{confirmed.length !== 1 ? 's' : ''} selected: <span className="font-semibold text-navy-700">{confirmed.join(', ') || 'None'}</span></p>
          </div>
          <button
            onClick={() => onSend(tournament, 'full', confirmed, note)}
            disabled={confirmed.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send Full Tournament Request
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 4 — MY REQUESTS
// ══════════════════════════════════════════════════════════════════════════════
function MyRequests({ umpireRequests, umpireTournamentRequests, addToast }) {
  // Merge store requests + pre-seeded mock requests
  const [seenIds, setSeenIds]   = useState([])
  const [requests, setRequests] = useState(UMPIRE_MY_REQUESTS)

  // Fire notifications for any unseen approved/rejected on first render
  useEffect(() => {
    const unseen = requests.filter(r => !r.seen && r.status !== 'pending')
    if (unseen.length > 0) {
      setTimeout(() => {
        unseen.forEach(r => {
          if (r.status === 'approved') addToast(`✅ Request approved: "${r.name}"`, 'success')
          if (r.status === 'rejected') addToast(`Request rejected: "${r.name}". ${r.reason || ''}`, 'error')
        })
        setRequests(prev => prev.map(r => ({ ...r, seen: true })))
      }, 500)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Merge in store's live requests
  const storeMatchRequests = umpireRequests.map(r => ({
    id: r.matchId,
    type: 'match',
    name: r.matchName,
    organiser: 'Organiser',
    date: 'Pending',
    city: '—',
    sentOn: 'Just now',
    status: r.status,
    seen: true,
  }))
  const storeTournamentRequests = umpireTournamentRequests.map(r => ({
    id: r.tournamentId,
    type: 'tournament',
    name: r.tournamentName,
    organiser: 'Organiser',
    date: 'Pending',
    city: '—',
    sentOn: 'Just now',
    status: r.status,
    seen: true,
  }))

  const allRequests = [...storeMatchRequests, ...storeTournamentRequests, ...requests]
  const approved = allRequests.filter(r => r.status === 'approved')
  const rejected = allRequests.filter(r => r.status === 'rejected')
  const pending  = allRequests.filter(r => r.status === 'pending')

  const RequestCard = ({ r }) => {
    const s = STATUS_COLORS[r.status]
    const Icon = s.icon
    return (
      <div className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
        <div className="flex items-start gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${r.status === 'approved' ? 'bg-green-100' : r.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <Icon size={14} className={s.text} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.type === 'tournament' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                {r.type === 'tournament' ? '🏆' : '🏏'} {r.type === 'tournament' ? 'Tournament' : 'Match'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
                {s.label}
              </span>
            </div>
            <p className="font-bold text-navy-900 text-sm leading-tight">{r.name}</p>
            <p className="text-navy-500 text-xs mt-0.5">{r.date} · {r.city}</p>
            {r.reason && (
              <p className="text-red-600 text-xs mt-1 font-medium">Reason: {r.reason}</p>
            )}
            <p className="text-navy-400 text-[10px] mt-1">Sent {r.sentOn}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:'Approved', val: approved.length, color:'#16a34a', bg:'#dcfce7', icon:'✅' },
          { label:'Pending',  val: pending.length,  color:'#d97706', bg:'#fef3c7', icon:'⏳' },
          { label:'Rejected', val: rejected.length, color:'#dc2626', bg:'#fee2e2', icon:'❌' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="font-extrabold text-xl tabular-nums leading-none" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notification info */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <Bell size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs leading-relaxed">
          You'll receive an <strong>in-app notification</strong> whenever a request is approved or rejected by the organiser or captain.
        </p>
      </div>

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Approved ({approved.length})</p>
          <div className="space-y-2">{approved.map(r => <RequestCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Awaiting Response ({pending.length})</p>
          <div className="space-y-2">{pending.map(r => <RequestCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Not Selected ({rejected.length})</p>
          <div className="space-y-2">{rejected.map(r => <RequestCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {allRequests.length === 0 && (
        <div className="text-center py-12">
          <Send size={32} className="mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500 font-semibold">No requests yet</p>
          <p className="text-navy-400 text-sm mt-1">Browse Ongoing Matches to raise your first request</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════
export default function UmpireHome() {
  const navigate = useNavigate()
  const { user, addToast,
          umpireRequests, addUmpireRequest, withdrawUmpireRequest,
          umpireTournamentRequests, addUmpireTournamentRequest, withdrawUmpireTournamentRequest,
        } = useStore()

  const [activeTab, setActiveTab] = useState('assignments')

  const upcomingCount   = UMPIRE_PROFILE.assignments.filter(a => a.status === 'upcoming').length
  const pendingRequests = (umpireRequests?.length || 0) + (umpireTournamentRequests?.length || 0)
  const unseenUpdates   = UMPIRE_MY_REQUESTS.filter(r => !r.seen && r.status !== 'pending').length

  const TABS = [
    { key:'assignments', label:'My Assignments',  badge: upcomingCount   > 0 ? upcomingCount   : null },
    { key:'stats',       label:'My Stats',         badge: null },
    { key:'matches',     label:'Ongoing Matches',  badge: null },
    { key:'requests',    label:'My Requests',      badge: unseenUpdates   > 0 ? unseenUpdates   : null, badgeColor:'bg-red-500' },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-44">

        {/* Greeting */}
        <div className="mb-4 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Umpire'} 👋
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background:'#fef3c7', color:'#d97706' }}>
              ⚖️ Umpire
            </span>
            <span className="text-navy-400 text-xs">·</span>
            <span className="text-navy-500 text-xs">⭐ {UMPIRE_PROFILE.rating} · {UMPIRE_PROFILE.matchesUmpired} matches umpired</span>
          </div>
        </div>

        {/* Tab bar — scrollable on small screens */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl mb-4 animate-fade-in overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              {tab.label}
              {tab.badge != null && (
                <span className={`min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold inline-flex items-center justify-center px-1 ${tab.badgeColor || 'bg-amber-500'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'assignments' && <MyAssignments navigate={navigate} addToast={addToast} />}
        {activeTab === 'stats'       && <MyStats />}
        {activeTab === 'matches'     && (
          <OngoingMatches
            user={user}
            addToast={addToast}
            umpireRequests={umpireRequests}
            addUmpireRequest={addUmpireRequest}
            withdrawUmpireRequest={withdrawUmpireRequest}
            umpireTournamentRequests={umpireTournamentRequests}
            addUmpireTournamentRequest={addUmpireTournamentRequest}
            withdrawUmpireTournamentRequest={withdrawUmpireTournamentRequest}
          />
        )}
        {activeTab === 'requests' && (
          <MyRequests
            umpireRequests={umpireRequests}
            umpireTournamentRequests={umpireTournamentRequests}
            addToast={addToast}
          />
        )}

      </main>
    </div>
  )
}
