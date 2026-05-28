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

// ─── Score Detail Sheet ───────────────────────────────────────────────────────
function ScoreDetailSheet({ match, onClose }) {
  if (!match) return null
  const mockBatsmen = [
    { name: 'R. Sharma',  runs: 42, balls: 31, fours: 5, sixes: 1 },
    { name: 'K. Rahul',   runs: 28, balls: 22, fours: 3, sixes: 0 },
  ]
  const mockBowler = { name: 'J. Bumrah', overs: '3.2', runs: 18, wkts: 2 }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mt-auto bg-white rounded-t-3xl animate-slide-up max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Circle size={7} fill="#ef4444" className="text-red-500 animate-pulse" />
            <span className="text-red-500 font-bold text-xs uppercase tracking-wide">Live</span>
            <span className="text-navy-400 text-xs ml-1">Over {match.overs}</span>
          </div>
          <div className="flex items-center gap-2">
            <FollowButton type="match" item={match} label="Follow" size="sm" />
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
              <X size={15} className="text-navy-600" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4 pb-10">
          {/* Scoreboard */}
          <div className="bg-navy-900 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-extrabold text-base truncate">{match.teamA}</p>
                <p className="text-brand-400 font-extrabold text-2xl tabular-nums mt-0.5">{match.scoreA}</p>
              </div>
              <div className="px-3 text-center flex-shrink-0">
                <span className="text-navy-500 font-bold text-xs bg-navy-800 px-2.5 py-1 rounded-full">VS</span>
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-white font-extrabold text-base truncate">{match.teamB}</p>
                <p className="text-navy-400 font-extrabold text-2xl tabular-nums mt-0.5">{match.scoreB || 'Yet to bat'}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-navy-800">
              <span className="text-navy-400 text-xs">Overs: <span className="text-white font-semibold">{match.overs}</span></span>
            </div>
          </div>

          {/* Batting */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Batting</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-navy-400 font-medium">Batter</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">R</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">B</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">4s</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">6s</th>
                </tr>
              </thead>
              <tbody>
                {mockBatsmen.map((b, i) => (
                  <tr key={i} className={i === 0 ? 'bg-brand-50' : ''}>
                    <td className="px-4 py-2.5 font-semibold text-navy-800 text-sm">
                      {b.name}{i === 0 && <span className="ml-1 text-[10px] text-brand-500 font-bold">*</span>}
                    </td>
                    <td className="text-center px-2 py-2.5 font-bold text-navy-900 tabular-nums">{b.runs}</td>
                    <td className="text-center px-2 py-2.5 text-navy-500 tabular-nums">{b.balls}</td>
                    <td className="text-center px-2 py-2.5 text-navy-500 tabular-nums">{b.fours}</td>
                    <td className="text-center px-2 py-2.5 text-navy-500 tabular-nums">{b.sixes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bowling */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Bowling</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-navy-400 font-medium">Bowler</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">O</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">R</th>
                  <th className="text-center px-2 py-2 text-xs text-navy-400 font-medium">W</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-navy-800">{mockBowler.name}</td>
                  <td className="text-center px-2 py-2.5 text-navy-500 tabular-nums">{mockBowler.overs}</td>
                  <td className="text-center px-2 py-2.5 text-navy-500 tabular-nums">{mockBowler.runs}</td>
                  <td className="text-center px-2 py-2.5 font-bold text-red-600 tabular-nums">{mockBowler.wkts}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-navy-400 py-1">
            Read-only view · <span className="text-brand-500 font-medium">Change role</span> to score or manage
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

      <main className="flex-1 px-4 py-4 space-y-4 pb-36">

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
