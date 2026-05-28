import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, TEAMS, TOURNAMENTS, teamById } from '../data/mock'
import TopBar from '../components/TopBar'
import {
  BarChart2, Trophy, MapPin, Activity, Eye, Building2,
  Circle, ChevronRight, Lock, Users, Send, Crown, Check,
  Zap, X, UserPlus
} from 'lucide-react'

// ── Add Teams to Tournament sheet (Pro-gated) ─────────────────────────────
function AddTeamsSheet({ onClose, isPro, onUpgrade }) {
  const [selectedTournament, setSelectedTournament] = useState(TOURNAMENTS[0]?.id || '')
  const [selectedTeams, setSelectedTeams] = useState([])

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    )
  }

  const { addToast } = useStore()

  const handleConfirm = () => {
    if (!isPro) { onUpgrade(); return }
    addToast(`${selectedTeams.length} team${selectedTeams.length !== 1 ? 's' : ''} added to tournament! 🏆`, 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up"
        style={{ maxHeight: '88dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-extrabold text-navy-900 text-lg">Add Teams to Tournament</h2>
            {!isPro && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Crown size={11} className="text-amber-500 fill-amber-400" />
                <span className="text-amber-600 text-xs font-bold">Pro feature</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 'calc(88dvh - 130px)' }}>
          {/* Pro upgrade banner */}
          {!isPro && (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg, #1c1209, #2d1a00)', border: '1.5px solid #d97706' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-amber-200 font-extrabold text-sm">Pro required to add teams</span>
              </div>
              <p className="text-amber-700 text-xs mb-3">Preview below — upgrade to activate team registrations.</p>
              {['Register teams from your contact list', 'Set entry fees & collect payments', 'Approve or reject team applications'].map(f => (
                <div key={f} className="flex items-center gap-2 mb-1.5">
                  <Check size={11} className="text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-amber-200 text-xs">{f}</span>
                </div>
              ))}
              <button
                onClick={onUpgrade}
                className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
              >
                <Zap size={13} /> Upgrade to Pro — ₹99/month
              </button>
            </div>
          )}

          {/* Select tournament */}
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">Select Tournament</label>
            <select
              value={selectedTournament}
              onChange={e => setSelectedTournament(e.target.value)}
              disabled={!isPro}
              className="cm-select w-full"
            >
              {TOURNAMENTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Team list */}
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-2 flex items-center gap-1.5">
              <Users size={13} className="text-navy-500" />
              Select Teams to Add
              {selectedTeams.length > 0 && (
                <span className="ml-auto text-brand-600 text-xs font-bold">{selectedTeams.length} selected</span>
              )}
            </label>
            <div className="space-y-2">
              {TEAMS.map(team => {
                const isSelected = selectedTeams.includes(team.id)
                return (
                  <button
                    key={team.id}
                    onClick={() => isPro && toggleTeam(team.id)}
                    disabled={!isPro}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${!isPro ? 'opacity-50' : ''}`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: team.color }}
                    >
                      {team.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 text-sm">{team.name}</p>
                      <p className="text-navy-400 text-xs">{team.city} · {team.squad?.length || 11} players</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                    {!isPro && <Lock size={13} className="text-slate-300 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-8 pt-3 border-t border-slate-100 flex-shrink-0 bg-white">
          {isPro ? (
            <button
              onClick={handleConfirm}
              disabled={selectedTeams.length === 0}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)' }}
            >
              <UserPlus size={18} />
              Add {selectedTeams.length || ''} Team{selectedTeams.length !== 1 ? 's' : ''} to Tournament
            </button>
          ) : (
            <button
              onClick={onUpgrade}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Crown size={18} className="fill-white" />
              Upgrade to Pro to Add Teams
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveBlock({ icon: Icon, color, bg, title, sub, badge, onClick }) {
  return (
    <button onClick={onClick} className="home-block text-left relative active:scale-[0.97] transition-transform">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2" style={{ background: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="font-bold text-navy-900 text-sm leading-tight">{title}</p>
      {badge && (
        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: bg, color }}>{badge}</span>
      )}
      <div className="mt-1">{sub}</div>
      <ChevronRight size={13} className="absolute top-4 right-3 text-navy-300" />
    </button>
  )
}

function LockedBlock({ icon: Icon, title, sub, onTap }) {
  return (
    <button onClick={onTap} className="home-block text-left relative active:scale-[0.97] transition-transform">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
        <Icon size={20} className="text-navy-500" />
      </div>
      <p className="font-bold text-navy-800 text-sm leading-tight">{title}</p>
      <p className="text-navy-400 text-[11px] mt-1">{sub}</p>
      <div className="absolute top-3 right-3 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
        <Lock size={10} className="text-navy-400" />
      </div>
    </button>
  )
}

function RoleChangePopup({ onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-md px-6 pt-5 pb-10 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-navy-500" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg text-center mb-2">Feature Locked</h3>
        <p className="text-navy-500 text-sm text-center leading-relaxed mb-6">
          Please change the role to access these features.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 py-3" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1 py-3" onClick={() => { onClose(); navigate('/role-select') }}>
            Change Role
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrganiserHome() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [locked, setLocked] = useState(null)
  const [showAddTeams, setShowAddTeams] = useState(false)

  const isPro = user?.subscription === 'pro_active'

  const liveMatch   = MATCHES.find(m => m.status === 'live')
  const liveCount   = MATCHES.filter(m => m.status === 'live').length
  const totalGrounds = 8 // mock
  const t1 = teamById(liveMatch?.team1)
  const t2 = teamById(liveMatch?.team2)
  const inns = liveMatch?.innings?.[0]
  const score = inns ? `${inns.runs}/${inns.wkts}` : '—'

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />
      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full pb-28">

        {/* Greeting */}
        <div className="mb-5 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Organiser'} 👋
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#dcfce7', color: '#16a34a' }}>
              🏆 Organiser
            </span>
            <span className="text-navy-400 text-xs">·</span>
            <span className="text-navy-500 text-xs">{TOURNAMENTS.length} tournaments · {MATCHES.length} matches</span>
          </div>
        </div>

        {/* Hero — stats bar */}
        <div
          className="w-full mb-5 rounded-2xl p-4 animate-slide-up"
          style={{ background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)' }}
        >
          <p className="text-green-100 text-xs font-bold uppercase tracking-wide mb-3">My Organiser Stats</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Tournaments', val: TOURNAMENTS.length },
              { label: 'Matches', val: MATCHES.length },
              { label: 'Teams', val: TEAMS.length },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-xl px-2 py-2.5 text-center">
                <p className="text-white font-extrabold text-2xl tabular-nums">{s.val}</p>
                <p className="text-green-100 text-[9px] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          {liveMatch && (
            <button
              onClick={() => navigate(`/score/${liveMatch.id}`)}
              className="mt-3 w-full flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2"
            >
              <Circle size={7} fill="#86efac" className="text-green-300 animate-pulse flex-shrink-0" />
              <span className="text-white text-xs font-semibold flex-1 truncate">{t1?.name} {score} vs {t2?.name}</span>
              <ChevronRight size={13} className="text-green-200" />
            </button>
          )}
        </div>

        {/* Active blocks */}
        <h3 className="font-bold text-navy-700 text-xs uppercase tracking-wider mb-3">Your Dashboard</h3>
        <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-up">

          <ActiveBlock
            icon={Trophy}
            color="#16a34a"
            bg="#dcfce730"
            title="My Tournaments"
            badge={`${TOURNAMENTS.length} running`}
            sub={<p className="text-navy-500 text-[11px]">Manage your tournaments</p>}
            onClick={() => navigate('/open-tournaments')}
          />

          <ActiveBlock
            icon={Activity}
            color="#16a34a"
            bg="#dcfce730"
            title="My Matches"
            badge={liveCount > 0 ? `${liveCount} live` : null}
            sub={<p className="text-navy-500 text-[11px]">{MATCHES.length} matches total</p>}
            onClick={() => navigate('/my-cricket')}
          />

          <ActiveBlock
            icon={MapPin}
            color="#16a34a"
            bg="#dcfce730"
            title="Browse Grounds"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px]">{totalGrounds} grounds nearby</p>
                <p className="text-green-600 text-[10px] font-semibold">Send booking requests</p>
              </div>
            }
            onClick={() => navigate('/grounds')}
          />

          <ActiveBlock
            icon={BarChart2}
            color="#16a34a"
            bg="#dcfce730"
            title="My Stats"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px]">{totalGrounds} grounds used</p>
                <p className="text-navy-500 text-[11px]">{TEAMS.length} teams in contact</p>
              </div>
            }
            onClick={() => navigate('/profile')}
          />

          {/* Add Teams to Tournament — Pro-gated */}
          <button
            onClick={() => setShowAddTeams(true)}
            className="home-block text-left relative active:scale-[0.97] transition-transform col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#dcfce730' }}>
                <Users size={20} style={{ color: '#16a34a' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-900 text-sm">Add Teams to Tournament</p>
                {isPro
                  ? <p className="text-navy-500 text-[11px] mt-0.5">Register teams & manage entries</p>
                  : <div className="flex items-center gap-1 mt-0.5">
                      <Crown size={10} className="text-amber-500 fill-amber-400" />
                      <span className="text-amber-600 text-[11px] font-semibold">Pro feature</span>
                    </div>
                }
              </div>
              <ChevronRight size={13} className="text-navy-300 flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Locked blocks */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={11} className="text-slate-400" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Other Role Features</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LockedBlock icon={Eye} title="Umpiring" sub="Umpire feature"
              onTap={() => setLocked(true)} />
            <LockedBlock icon={Building2} title="My Ground" sub="Ground Owner feature"
              onTap={() => setLocked(true)} />
            <LockedBlock icon={Users} title="Player Stats" sub="Player feature"
              onTap={() => setLocked(true)} />
            <LockedBlock icon={Send} title="Umpire Earnings" sub="Umpire feature"
              onTap={() => setLocked(true)} />
          </div>
        </div>

      </main>

      {locked && <RoleChangePopup onClose={() => setLocked(null)} />}
      {showAddTeams && (
        <AddTeamsSheet
          isPro={isPro}
          onClose={() => setShowAddTeams(false)}
          onUpgrade={() => { setShowAddTeams(false); navigate('/pro-payment') }}
        />
      )}
    </div>
  )
}
