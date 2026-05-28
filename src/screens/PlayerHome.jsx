import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, PLAYERS, TEAMS, TOURNAMENTS, teamById, playerById } from '../data/mock'
import TopBar from '../components/TopBar'
import MatchScoreSheet from '../components/MatchScoreSheet'
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
    <button onClick={onTap} className="home-block text-left relative active:scale-[0.97] transition-transform">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
        <Icon size={20} className="text-navy-500" />
      </div>
      <p className="font-bold text-navy-800 text-sm leading-tight">{title}</p>
      <p className="text-navy-400 text-[11px] mt-1">{sub}</p>
      <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
        <Lock size={9} className="text-white" strokeWidth={2.5} />
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

export default function PlayerHome() {
  const navigate  = useNavigate()
  const { user }  = useStore()
  const [locked, setLocked]           = useState(null)
  const [scoreMatch, setScoreMatch]   = useState(null)

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
            onClick={() => setScoreMatch(liveMatch)}
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
                <p className="text-blue-600 text-[10px] font-semibold">Full scorecard</p>
              </div>
            }
            onClick={() => liveMatch ? setScoreMatch(liveMatch) : navigate('/my-cricket')}
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
              onTap={() => setLocked(true)} />
            <LockedBlock icon={Building2} title="My Ground" sub="Ground Owner feature"
              onTap={() => setLocked(true)} />
            <LockedBlock icon={BarChart2} title="Manage Tournaments" sub="Organiser feature"
              onTap={() => setLocked(true)} />
            <LockedBlock icon={Send} title="Ground Requests" sub="Organiser feature"
              onTap={() => setLocked(true)} />
          </div>
        </div>

      </main>

      {locked && <RoleChangePopup onClose={() => setLocked(null)} />}
      {scoreMatch && <MatchScoreSheet match={scoreMatch} onClose={() => setScoreMatch(null)} />}
    </div>
  )
}
