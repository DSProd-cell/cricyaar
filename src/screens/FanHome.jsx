import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CITY_LIVE_DATA, ALL_CITIES, TOURNAMENTS } from '../data/mock'
import {
  MapPin, Settings, Search, X, RefreshCw, Circle, ArrowRight,
  Lock, Activity, Eye, Trophy, BarChart2, Building2, Users,
  Crown, ChevronRight, Calendar, Users2
} from 'lucide-react'
import FollowButton from '../components/FollowButton'

// ─── City Picker ──────────────────────────────────────────────────────────────
function CityPickerModal({ currentCity, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  const filtered = ALL_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative mt-auto bg-white rounded-t-3xl px-5 pt-4 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-900 text-lg">Choose your city</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-600" />
          </button>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input ref={inputRef} className="cm-input pl-9" placeholder="Search city…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filtered.map(city => (
            <button key={city} onClick={() => { onSelect(city); onClose() }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${city === currentCity ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-slate-50 text-navy-700'}`}>
              <MapPin size={15} className={city === currentCity ? 'text-brand-500' : 'text-slate-400'} />
              {city}
              {city === currentCity && <span className="ml-auto text-xs text-brand-500 font-medium">Current</span>}
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center text-navy-400 py-6 text-sm">No cities found</p>}
        </div>
      </div>
    </div>
  )
}

// ─── helpers to generate realistic mock innings from a score string ───────────
function parseSc(sc) {
  if (!sc || sc === 'Yet to bat') return null
  const [r, w] = sc.split('/')
  return { runs: parseInt(r) || 0, wkts: parseInt(w) || 0 }
}

function mockInnings(sc, overs, teamName) {
  const parsed = parseSc(sc)
  if (!parsed) return null
  const { runs, wkts } = parsed

  // All 11 players — batting order
  const NAMES = ['R. Sharma','V. Kohli','S. Iyer','H. Pandya','K. Rahul',
                 'R. Jadeja','D. Karthik','K. Yadav','J. Bumrah','M. Shami','U. Yadav']
  const BOWL  = ['A. Singh','P. Kumar','N. Rao','S. Verma','K. Patel','T. Gupta']
  const DISM  = ['c sub b','b','lbw b','c & b','run out','c wk b','lbw b']

  const batters = []
  let remaining = runs

  // Dismissed batters
  for (let i = 0; i < Math.min(wkts, 9); i++) {
    const share = Math.max(2, Math.floor(remaining / Math.max(wkts - i + 1, 1) * (0.6 + Math.random() * 0.8)))
    const r = Math.min(share, remaining - (wkts - i - 1) * 2)
    const b = Math.max(r, Math.floor(r * (0.7 + Math.random() * 0.7)))
    batters.push({
      name: NAMES[i], runs: Math.max(r, 0), balls: Math.max(b, 1),
      fours: Math.floor(Math.max(r, 0) / 16), sixes: Math.floor(Math.max(r, 0) / 38),
      dismissal: `${DISM[i % DISM.length]} ${BOWL[i % BOWL.length]}`,
      out: true, dnb: false,
    })
    remaining = Math.max(0, remaining - Math.max(r, 0))
  }

  // Active not-out batters (max 2 at crease)
  const notOutCount = wkts < 10 ? Math.min(2, 11 - wkts) : 0
  const notOutStart = wkts
  for (let j = 0; j < notOutCount; j++) {
    const r = j === 0 ? Math.max(3, Math.floor(remaining * 0.65)) : Math.max(0, remaining - Math.floor(remaining * 0.65))
    const b = Math.max(r, Math.floor(r * (0.75 + Math.random() * 0.5)))
    batters.push({
      name: NAMES[notOutStart + j], runs: Math.max(r, 0), balls: Math.max(b, 1),
      fours: Math.floor(Math.max(r, 0) / 18), sixes: Math.floor(Math.max(r, 0) / 40),
      dismissal: null, out: false, dnb: false,
      isStriker: j === 0,
    })
  }

  // Did not bat — remaining players to complete XI
  const battedCount = batters.length
  for (let k = battedCount; k < 11; k++) {
    batters.push({ name: NAMES[k], dnb: true, out: false })
  }

  // Extras breakdown
  const battedRuns = batters.filter(b => !b.dnb).reduce((s, b) => s + b.runs, 0)
  const totalExtras = Math.max(0, runs - battedRuns)
  const wd = Math.floor(totalExtras * 0.4)
  const nb = Math.floor(totalExtras * 0.2)
  const lb = Math.floor(totalExtras * 0.25)
  const b_ = totalExtras - wd - nb - lb
  const extras = { total: totalExtras, wd, nb, lb, b: Math.max(0, b_) }

  const totalOv = overs || '20.0'
  const ovNum = parseFloat(totalOv)
  const rr = ovNum > 0 ? (runs / ovNum).toFixed(2) : '0.00'

  // Bowling — 5–6 bowlers
  const bowlCount = Math.min(6, Math.max(4, Math.ceil(ovNum / 4)))
  const bowlers = []
  let runsLeft = runs - extras.total
  let wktsLeft = wkts
  for (let k = 0; k < bowlCount; k++) {
    const isLast = k === bowlCount - 1
    const bowlOv = isLast
      ? (ovNum - bowlers.reduce((s, b) => s + parseFloat(b.overs), 0)).toFixed(1)
      : `${Math.floor(ovNum / bowlCount)}.0`
    const w = isLast ? wktsLeft : (k < 3 ? Math.min(wktsLeft, k === 0 ? 2 : 1) : 0)
    const r = isLast ? Math.max(0, runsLeft) : Math.max(0, Math.floor(runsLeft / (bowlCount - k) * (0.7 + Math.random() * 0.5)))
    bowlers.push({
      name: BOWL[k % BOWL.length],
      overs: bowlOv, maidens: r < 12 ? 1 : 0,
      runs: Math.max(0, r), wkts: Math.max(0, w),
      wd: Math.floor(Math.random() * 3), nb: Math.floor(Math.random() * 2),
    })
    runsLeft = Math.max(0, runsLeft - r)
    wktsLeft = Math.max(0, wktsLeft - w)
  }

  // Fall of wickets
  const fow = batters.filter(b => b.out).map((b, i) => {
    const cumRuns = batters.slice(0, i + 1).filter(x => !x.dnb).reduce((s, x) => s + x.runs, 0)
      + Math.floor(extras.total * (i + 1) / Math.max(wkts, 1))
    return {
      wkt: i + 1,
      runs: cumRuns,
      over: `${Math.floor(ovNum * (i + 1) / Math.max(wkts, 1))}.${Math.floor(Math.random() * 5)}`,
      player: b.name.split(' ').pop(),
    }
  })

  return { batters, bowlers, extras, total: runs, wkts, overs: totalOv, rr, fow, teamName }
}

// ─── Score Detail Sheet ───────────────────────────────────────────────────────
function ScoreDetailSheet({ match, onClose }) {
  if (!match) return null

  const inn1 = mockInnings(match.scoreA, match.overs, match.teamA)
  const inn2 = parseSc(match.scoreB) ? mockInnings(match.scoreB, match.overs, match.teamB) : null
  const hasSecond = !!inn2
  const [inningsTab, setInningsTab] = useState(0)  // 0 = 1st, 1 = 2nd
  const activeInn = inningsTab === 0 ? inn1 : inn2

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mt-auto bg-white rounded-t-3xl animate-slide-up max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Circle size={7} fill="#ef4444" className="text-red-500 animate-pulse" />
            <span className="text-red-500 font-bold text-xs uppercase tracking-wide">Live</span>
            <span className="text-navy-400 text-xs ml-1">· Ov {match.overs}</span>
          </div>
          <div className="flex items-center gap-2">
            <FollowButton type="match" item={match} label="Follow" size="sm" />
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
              <X size={15} className="text-navy-600" />
            </button>
          </div>
        </div>

        {/* Scoreboard hero */}
        <div className="bg-navy-900 mx-5 mt-4 rounded-2xl px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-navy-400 text-[11px] font-semibold uppercase tracking-wide mb-0.5">Batting</p>
              <p className="text-white font-extrabold text-sm leading-tight truncate">{match.teamA}</p>
              <p className="text-brand-400 font-extrabold text-2xl tabular-nums mt-1">{match.scoreA}</p>
              <p className="text-navy-500 text-xs mt-0.5">({match.overs} ov)</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 flex-shrink-0">
              <span className="text-navy-500 text-[10px] font-bold bg-navy-800 px-2 py-0.5 rounded-full">VS</span>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-navy-400 text-[11px] font-semibold uppercase tracking-wide mb-0.5">
                {hasSecond ? 'Batting' : 'Yet to bat'}
              </p>
              <p className="text-white font-extrabold text-sm leading-tight truncate">{match.teamB}</p>
              {hasSecond
                ? <p className="text-navy-300 font-extrabold text-2xl tabular-nums mt-1">{match.scoreB}</p>
                : <p className="text-navy-600 font-bold text-sm mt-1">— —</p>
              }
            </div>
          </div>
        </div>

        {/* Innings tabs (only if 2nd inn exists) */}
        {hasSecond && (
          <div className="flex mx-5 mt-3 gap-1 flex-shrink-0">
            {[`${match.teamA} Innings`, `${match.teamB} Innings`].map((label, idx) => (
              <button
                key={idx}
                onClick={() => setInningsTab(idx)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                  inningsTab === idx ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-500'
                }`}
              >
                {idx + 1}st Innings
              </button>
            ))}
          </div>
        )}

        {/* Scrollable scorecard */}
        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3 pb-8">

          {activeInn && (
            <>
              {/* Batting table */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">
                    {activeInn.teamName} — Batting
                  </p>
                  <p className="text-xs text-navy-400 font-medium">{activeInn.total}/{activeInn.wkts} ({activeInn.overs} ov)</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-3 py-1.5 text-[11px] text-navy-400 font-medium">Batter</th>
                      <th className="text-left px-2 py-1.5 text-[11px] text-navy-400 font-medium hidden sm:table-cell">Dismissal</th>
                      <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">R</th>
                      <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-8">B</th>
                      <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-7">4s</th>
                      <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-7">6s</th>
                      <th className="text-center px-1.5 py-1.5 text-[11px] text-navy-400 font-medium w-10">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInn.batters.filter(b => !b.dnb).map((b, i) => (
                      <tr key={i} className={`border-b border-slate-50 ${b.isStriker ? 'bg-brand-50/70' : (!b.out && !b.dnb ? 'bg-slate-50/60' : '')}`}>
                        <td className="px-3 py-2">
                          <p className="font-semibold text-navy-800 text-xs leading-tight">
                            {i + 1}. {b.name}
                            {b.isStriker && <span className="text-brand-500 font-bold ml-0.5">*</span>}
                          </p>
                          {b.dismissal && <p className="text-[10px] text-navy-400 mt-0.5 sm:hidden truncate max-w-[110px]">{b.dismissal}</p>}
                          {!b.out && !b.dnb && !b.dismissal && <p className="text-[10px] text-brand-500 font-semibold mt-0.5 sm:hidden">not out</p>}
                        </td>
                        <td className="px-2 py-2 text-[11px] text-navy-400 hidden sm:table-cell">
                          {b.dismissal || <span className="text-brand-500 font-semibold text-xs">not out</span>}
                        </td>
                        <td className="text-center px-1.5 py-2 font-bold text-navy-900 text-xs tabular-nums">{b.runs}</td>
                        <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.balls}</td>
                        <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.fours}</td>
                        <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.sixes}</td>
                        <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">
                          {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '—'}
                        </td>
                      </tr>
                    ))}
                    {/* Did not bat row */}
                    {activeInn.batters.some(b => b.dnb) && (
                      <tr className="border-b border-slate-50 bg-slate-50/30">
                        <td colSpan={7} className="px-3 py-2 text-[11px] text-navy-400">
                          <span className="font-semibold text-navy-500">Did not bat: </span>
                          {activeInn.batters.filter(b => b.dnb).map(b => b.name).join(', ')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Extras breakdown + Total */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">
                      Extras <span className="text-navy-700 font-semibold">{activeInn.extras.total}</span>
                      <span className="text-navy-400 ml-1">(b {activeInn.extras.b}, lb {activeInn.extras.lb}, wd {activeInn.extras.wd}, nb {activeInn.extras.nb})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-navy-900">
                    <span>Total: {activeInn.total}/{activeInn.wkts} ({activeInn.overs} ov)</span>
                    <span className="text-navy-500 font-medium">RR: {activeInn.rr}</span>
                  </div>
                </div>
              </div>

              {/* Fall of Wickets */}
              {activeInn.fow.length > 0 && (
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">Fall of Wickets</p>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-x-3 gap-y-1">
                    {activeInn.fow.map((f, i) => (
                      <span key={i} className="text-[11px] text-navy-500">
                        <span className="font-bold text-navy-800">{f.wkt}-{f.runs}</span>
                        <span className="text-navy-400"> ({f.player}, {f.over})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bowling table */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">
                    {inningsTab === 0 ? match.teamB : match.teamA} — Bowling
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
                    {activeInn.bowlers.map((b, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-3 py-2 font-semibold text-navy-800 text-xs">{b.name}</td>
                        <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.overs}</td>
                        <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.maidens}</td>
                        <td className="text-center px-1.5 py-2 text-navy-500 text-xs tabular-nums">{b.runs}</td>
                        <td className={`text-center px-1.5 py-2 text-xs font-bold tabular-nums ${b.wkts > 0 ? 'text-red-600' : 'text-navy-400'}`}>{b.wkts}</td>
                        <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">{b.wd ?? 0}</td>
                        <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">{b.nb ?? 0}</td>
                        <td className="text-center px-1.5 py-2 text-navy-400 text-xs tabular-nums">
                          {parseFloat(b.overs) > 0 ? (b.runs / parseFloat(b.overs)).toFixed(1) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Yet to bat */}
              {!hasSecond && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-1">Yet to Bat</p>
                  <p className="text-navy-700 font-semibold text-sm">{match.teamB}</p>
                </div>
              )}
            </>
          )}

          <p className="text-center text-xs text-navy-400 pt-1 pb-2">
            📖 Read-only scorecard · <span className="text-brand-500 font-medium">Change role</span> to manage
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Pro Gate Popup ───────────────────────────────────────────────────────────
function ProGatePopup({ tournament, onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-md px-6 pt-5 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fef3c7' }}>
          <Crown size={26} className="text-amber-500 fill-amber-400" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg text-center mb-1">Pro Feature</h3>
        <p className="text-navy-500 text-sm text-center leading-relaxed mb-1">
          <span className="font-semibold text-navy-700">{tournament?.name}</span>
        </p>
        <p className="text-navy-400 text-sm text-center leading-relaxed mb-6">
          Upgrade to <span className="font-bold text-amber-600">CricYaar Pro</span> to view full tournament details — standings, fixtures, results and live scorecard.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 py-3" onClick={onClose}>Maybe Later</button>
          <button
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            onClick={() => { onClose(); navigate('/pro') }}
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Locked blocks config ─────────────────────────────────────────────────────
const LOCKED_BLOCKS = [
  { icon: Activity,  title: 'My Cricket',     sub: 'Player feature'       },
  { icon: Eye,       title: 'Umpiring',        sub: 'Umpire feature'       },
  { icon: Trophy,    title: 'Tournaments',     sub: 'Organiser / Player'   },
  { icon: BarChart2, title: 'My Stats',        sub: 'Player / Organiser'   },
  { icon: Building2, title: 'My Ground',       sub: 'Ground Owner feature' },
  { icon: Users,     title: 'Team Management', sub: 'Player / Organiser'   },
]

// ─── FanHome ──────────────────────────────────────────────────────────────────
export default function FanHome() {
  const navigate = useNavigate()
  const { user } = useStore()

  const [city, setCity]               = useState(user?.city || 'Mumbai')
  const [showPicker, setShowPicker]   = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [ticking, setTicking]         = useState(false)
  const [activeTab, setActiveTab]     = useState('matches')  // 'matches' | 'tournaments'
  const [selectedMatch, setSelectedMatch]       = useState(null)
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [locked, setLocked]           = useState(false)

  const data = CITY_LIVE_DATA[city] || { live: [], today: 0 }
  const activeTournaments = TOURNAMENTS.filter(t => t.status === 'active')
  const allTournaments    = TOURNAMENTS

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => {
      setTicking(true)
      setTimeout(() => { setLastRefresh(new Date()); setTicking(false) }, 400)
    }, 60000)
    return () => clearInterval(t)
  }, [])

  const handleCitySelect = (c) => { setCity(c); setLastRefresh(new Date()) }
  const refreshTime = lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">CY</span>
          </div>
          <span className="font-extrabold text-navy-900 text-lg">CricYaar</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            <MapPin size={13} className="text-brand-600" />
            <span className="text-brand-700 font-semibold text-sm">{city}</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Settings"
          >
            <Settings size={17} className="text-navy-600" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-[57px] z-10 flex px-4 gap-4">
        {[
          { id: 'matches',     label: '🔴 Live Matches' },
          { id: 'tournaments', label: '🏆 Tournaments'  },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-navy-400 hover:text-navy-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-4 space-y-4 pb-44">

        {/* ── MATCHES TAB ── */}
        {activeTab === 'matches' && (
          <>
            {/* Live now card */}
            <div className="card animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-3xl font-extrabold text-navy-900 tabular-nums leading-none">{data.live.length}</h2>
                  <p className="text-navy-500 text-sm mt-1">
                    {data.live.length === 1 ? 'match' : 'matches'} live now in{' '}
                    <span className="font-semibold text-navy-700">{city}</span>
                  </p>
                </div>
                <button
                  onClick={() => { setTicking(true); setTimeout(() => { setLastRefresh(new Date()); setTicking(false) }, 400) }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  aria-label="Refresh"
                >
                  <RefreshCw size={15} className={`text-navy-500 ${ticking ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {data.live.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-navy-400 text-sm">No matches happening in {city} right now.</p>
                  <p className="text-navy-300 text-xs mt-1">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.live.map((row, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedMatch(row)}
                      className="w-full bg-navy-900 rounded-xl px-4 py-3 text-left active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Circle size={6} fill="#ef4444" className="text-red-500 animate-pulse flex-shrink-0" />
                        <span className="text-red-400 font-semibold text-xs uppercase tracking-wide">Live</span>
                        <span className="text-navy-500 text-xs ml-auto">Ov {row.overs}</span>
                        <FollowButton type="match" item={row} size="sm" className="ml-1" />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white font-semibold truncate flex-1">{row.teamA}</span>
                        <span className="text-brand-400 font-extrabold tabular-nums">{row.scoreA}</span>
                        <span className="text-navy-500 text-xs">vs</span>
                        <span className="text-white font-semibold truncate flex-1 text-right">{row.teamB}</span>
                        <span className="text-navy-400 text-xs tabular-nums">{row.scoreB}</span>
                      </div>
                      <p className="text-navy-600 text-[10px] mt-1.5 text-right">Tap for full scorecard →</p>
                    </button>
                  ))}
                  <p className="text-xs text-navy-400 text-right mt-1">Updated {refreshTime}</p>
                </div>
              )}
            </div>

            {/* Today's count */}
            <div className="card animate-slide-up">
              <h2 className="text-3xl font-extrabold text-navy-900 tabular-nums leading-none">{data.today}</h2>
              <p className="text-navy-500 text-sm mt-1">
                {data.today === 1 ? 'match' : 'matches'} scheduled today in{' '}
                <span className="font-semibold text-navy-700">{city}</span>
              </p>
            </div>
          </>
        )}

        {/* ── TOURNAMENTS TAB ── */}
        {activeTab === 'tournaments' && (
          <>
            {allTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Trophy size={40} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No tournaments yet</p>
              </div>
            ) : (
              allTournaments.map(t => (
                <div key={t.id} className="card animate-fade-in">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          t.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.status === 'active' ? '🟢 Active' : '✅ Completed'}
                        </span>
                        <span className="text-[10px] text-navy-400 font-medium">{t.overs} overs · {t.type}</span>
                      </div>
                      <h3 className="font-extrabold text-navy-900 text-base leading-tight">{t.name}</h3>
                    </div>
                    <FollowButton type="tournament" item={t} size="sm" />
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap gap-3 mb-3 text-xs text-navy-500">
                    <span className="flex items-center gap-1">
                      <Users2 size={11} className="text-navy-400" />
                      {t.registeredTeams?.length || 0} teams
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-navy-400" />
                      {new Date(t.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      {' – '}
                      {new Date(t.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Trophy size={11} />
                      {t.prize}
                    </span>
                  </div>

                  {/* Pro-gated details button */}
                  <button
                    onClick={() => setSelectedTournament(t)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      <Crown size={13} className="text-amber-500" />
                      <span className="text-amber-700 font-semibold text-sm">View standings & fixtures</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md">PRO</span>
                      <ChevronRight size={14} className="text-amber-500" />
                    </div>
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ── OTHER ROLE FEATURES (both tabs) ── */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={12} className="text-navy-400" />
            <p className="text-navy-400 text-xs font-bold uppercase tracking-wider">Other Role Features</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {LOCKED_BLOCKS.map(({ icon: Icon, title, sub }) => (
              <button
                key={title}
                onClick={() => setLocked(true)}
                className="home-block text-left relative active:scale-[0.97] transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                  <Icon size={20} className="text-navy-500" />
                </div>
                <p className="font-bold text-navy-800 text-sm leading-tight">{title}</p>
                <p className="text-navy-400 text-[11px] mt-1">{sub}</p>
                <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                  <Lock size={9} className="text-white" strokeWidth={2.5} />
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Bottom banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-navy-700 font-semibold text-sm">Want to play, score, or organise?</p>
            <p className="text-navy-400 text-xs mt-0.5">Change your role in Settings.</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm flex-shrink-0 hover:bg-brand-600 transition-colors"
          >
            Change Role
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* City Picker */}
      {showPicker && (
        <CityPickerModal currentCity={city} onSelect={handleCitySelect} onClose={() => setShowPicker(false)} />
      )}

      {/* Score detail sheet */}
      {selectedMatch && (
        <ScoreDetailSheet match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      {/* Pro gate for tournament */}
      {selectedTournament && (
        <ProGatePopup tournament={selectedTournament} onClose={() => setSelectedTournament(null)} />
      )}

      {/* Role change popup */}
      {locked && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setLocked(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md px-6 pt-5 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-navy-500" />
            </div>
            <h3 className="font-bold text-navy-900 text-lg text-center mb-2">Feature Locked</h3>
            <p className="text-navy-500 text-sm text-center leading-relaxed mb-6">
              Please change the role to access these features.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 py-3" onClick={() => setLocked(false)}>Cancel</button>
              <button className="btn-primary flex-1 py-3" onClick={() => { setLocked(false); navigate('/role-select') }}>
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
