import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, TEAMS, TOURNAMENTS, teamById } from '../data/mock'
import TopBar from '../components/TopBar'
import RoleLockedModal from '../components/RoleLockedModal'
import {
  BarChart2, Trophy, MapPin, Activity, Eye, Building2,
  Circle, ChevronRight, Lock, Users, Send
} from 'lucide-react'

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
    <button onClick={onTap} className="home-block text-left relative opacity-40">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
        <Icon size={20} className="text-slate-400" />
      </div>
      <p className="font-bold text-slate-400 text-sm leading-tight">{title}</p>
      <p className="text-slate-400 text-[11px] mt-1">{sub}</p>
      <Lock size={12} className="absolute top-4 right-3 text-slate-300" />
    </button>
  )
}

export default function OrganiserHome() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [locked, setLocked] = useState(null)

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
        </div>

        {/* Locked blocks */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={11} className="text-slate-400" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Other Role Features</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LockedBlock icon={Eye} title="Umpiring" sub="Umpire feature"
              onTap={() => setLocked({ feature: 'Umpiring', eligibleRoles: ['umpire'] })} />
            <LockedBlock icon={Building2} title="My Ground" sub="Ground Owner feature"
              onTap={() => setLocked({ feature: 'My Ground', eligibleRoles: ['ground_owner'] })} />
            <LockedBlock icon={Users} title="Player Stats" sub="Player feature"
              onTap={() => setLocked({ feature: 'Player Career Stats', eligibleRoles: ['player'] })} />
            <LockedBlock icon={Send} title="Umpire Earnings" sub="Umpire feature"
              onTap={() => setLocked({ feature: 'Umpire Earnings & Charges', eligibleRoles: ['umpire'] })} />
          </div>
        </div>

      </main>

      {locked && (
        <RoleLockedModal
          currentRole="organiser"
          featureName={locked.feature}
          eligibleRoles={locked.eligibleRoles}
          onClose={() => setLocked(null)}
        />
      )}
    </div>
  )
}
