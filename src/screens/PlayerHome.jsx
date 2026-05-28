import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, PLAYERS, TEAMS, TOURNAMENTS, teamById, playerById } from '../data/mock'
import TopBar from '../components/TopBar'
import RoleLockedModal from '../components/RoleLockedModal'
import {
  Activity, MapPin, Trophy, Eye, BarChart2, Building2, Circle,
  ChevronRight, Lock, Users, Send, Crown
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

export default function PlayerHome() {
  const navigate  = useNavigate()
  const { user }  = useStore()
  const [locked, setLocked] = useState(null)

  const player     = PLAYERS.find(p => p.id === user?.id) || PLAYERS[0]
  const myTeams    = TEAMS.filter(t => t.squad?.includes(player?.id))
  const myTourneys = TOURNAMENTS.filter(tr => tr.approvedTeams?.some(tid => myTeams.map(t => t.id).includes(tid)))
  const liveMatch  = MATCHES.find(m => m.status === 'live')
  const upcomingMatch = MATCHES.find(m => m.status === 'upcoming')

  const t1 = teamById(liveMatch?.team1)
  const t2 = teamById(liveMatch?.team2)
  const inns = liveMatch?.innings?.[0]
  const score = inns ? `${inns.runs}/${inns.wkts}` : '—'
  const overs = inns?.overs ? `${Math.floor(inns.overs)}.${Math.round((inns.overs % 1) * 10)} ov` : ''

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />
      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full pb-28">

        {/* Greeting */}
        <div className="mb-5 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Player'} 👋
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#dbeafe', color: '#2563eb' }}>
              🏏 Player
            </span>
            {myTeams.length > 0 && (
              <span className="text-navy-500 text-xs">{myTeams.length} team{myTeams.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Hero — live banner (read-only scorecard) */}
        {liveMatch && (
          <button
            onClick={() => navigate(`/score/${liveMatch.id}`)}
            className="w-full mb-5 rounded-2xl overflow-hidden text-left animate-slide-up"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
          >
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Circle size={8} fill="#93c5fd" className="text-blue-300 animate-pulse" />
                <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">Live — Tap to read scorecard</span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-white font-extrabold text-base">{t1?.name}</p>
                  <p className="text-blue-300 font-extrabold text-3xl tabular-nums">{score}</p>
                  <p className="text-blue-200 text-xs">{overs}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-xs mb-1">vs</p>
                  <p className="text-white font-semibold text-sm">{t2?.name}</p>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Active blocks */}
        <h3 className="font-bold text-navy-700 text-xs uppercase tracking-wider mb-3">Your Dashboard</h3>
        <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-up">

          <ActiveBlock
            icon={Activity}
            color="#2563eb"
            bg="#dbeafe30"
            title="Live Scores"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px]">{MATCHES.filter(m => m.status === 'live').length} live now</p>
                <p className="text-blue-600 text-[10px] font-semibold">Read-only scorecard</p>
              </div>
            }
            onClick={() => navigate('/my-cricket')}
          />

          <ActiveBlock
            icon={MapPin}
            color="#2563eb"
            bg="#dbeafe30"
            title="Find a Ground"
            sub={<p className="text-navy-500 text-[11px] leading-tight">Search, browse & book grounds for your match</p>}
            onClick={() => navigate('/grounds')}
          />

          <ActiveBlock
            icon={Users}
            color="#2563eb"
            bg="#dbeafe30"
            title="My Teams"
            badge={myTeams.length > 0 ? `${myTeams.length} team${myTeams.length > 1 ? 's' : ''}` : null}
            sub={<p className="text-navy-500 text-[11px] leading-tight">Join or manage your squad</p>}
            onClick={() => navigate('/teams')}
          />

          <ActiveBlock
            icon={Trophy}
            color="#2563eb"
            bg="#dbeafe30"
            title="Tournaments"
            badge={myTourneys.length > 0 ? `${myTourneys.length} joined` : null}
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px]">Join as player or captain</p>
              </div>
            }
            onClick={() => navigate('/open-tournaments')}
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
              onTap={() => setLocked({ feature: 'Umpiring & Match Officials', eligibleRoles: ['umpire'] })} />
            <LockedBlock icon={Building2} title="My Ground" sub="Ground Owner feature"
              onTap={() => setLocked({ feature: 'My Ground', eligibleRoles: ['ground_owner'] })} />
            <LockedBlock icon={BarChart2} title="Manage Tournaments" sub="Organiser feature"
              onTap={() => setLocked({ feature: 'Manage Tournaments', eligibleRoles: ['organiser'] })} />
            <LockedBlock icon={Send} title="Ground Requests" sub="Organiser feature"
              onTap={() => setLocked({ feature: 'Ground Booking Requests', eligibleRoles: ['organiser', 'ground_owner'] })} />
          </div>
        </div>

      </main>

      {locked && (
        <RoleLockedModal
          currentRole="player"
          featureName={locked.feature}
          eligibleRoles={locked.eligibleRoles}
          onClose={() => setLocked(null)}
        />
      )}
    </div>
  )
}
