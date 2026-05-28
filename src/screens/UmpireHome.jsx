import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, UMPIRE_PROFILE, OPEN_MATCHES, playerById, teamById } from '../data/mock'
import TopBar from '../components/TopBar'
import RoleLockedModal from '../components/RoleLockedModal'
import {
  Eye, BarChart2, Trophy, MapPin, Activity, Star,
  ChevronRight, Circle, Lock, Users, Building2, Clock,
  IndianRupee, Calendar, CheckCircle, Shield
} from 'lucide-react'

function ActiveBlock({ icon: Icon, color, bg, title, sub, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="home-block text-left relative active:scale-[0.97] transition-transform"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2" style={{ background: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="font-bold text-navy-900 text-sm leading-tight">{title}</p>
      {badge && (
        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: bg, color }}>
          {badge}
        </span>
      )}
      <div className="mt-1">{sub}</div>
      <ChevronRight size={13} className="absolute top-4 right-3 text-navy-300" />
    </button>
  )
}

function LockedBlock({ icon: Icon, title, sub, forRoles, onTap }) {
  return (
    <button
      onClick={onTap}
      className="home-block text-left relative opacity-40"
    >
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
        <Icon size={20} className="text-slate-400" />
      </div>
      <p className="font-bold text-slate-400 text-sm leading-tight">{title}</p>
      <p className="text-slate-400 text-[11px] mt-1">{sub}</p>
      <Lock size={12} className="absolute top-4 right-3 text-slate-300" />
    </button>
  )
}

export default function UmpireHome() {
  const navigate   = useNavigate()
  const { user }   = useStore()
  const [locked, setLocked] = useState(null)

  const upcomingAssignments = UMPIRE_PROFILE.assignments.filter(a => a.status === 'upcoming')
  const liveMatch = MATCHES.find(m => m.status === 'live')
  // In demo: treat umpire as always assigned to the live match so the hero banner is visible
  const isAssigned = !!liveMatch

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full pb-28">

        {/* Greeting */}
        <div className="mb-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-2xl font-extrabold text-navy-900">
              Hey, {user?.name?.split(' ')[0] || 'Umpire'} 👋
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: '#fef3c7', color: '#d97706' }}>
              ⚖️ Umpire
            </span>
            <span className="text-navy-400 text-xs">·</span>
            <span className="text-navy-500 text-xs">⭐ {UMPIRE_PROFILE.rating} · {UMPIRE_PROFILE.matchesUmpired} matches umpired</span>
          </div>
        </div>

        {/* Hero — assigned live match */}
        {liveMatch && isAssigned && (
          <button
            onClick={() => navigate(`/score/${liveMatch.id}`)}
            className="w-full mb-5 rounded-2xl overflow-hidden text-left animate-slide-up"
            style={{ background: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)' }}
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Circle size={8} fill="#fde68a" className="text-yellow-200 animate-pulse" />
                <span className="text-yellow-200 text-xs font-bold uppercase tracking-wide">You're assigned — Live</span>
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-white font-extrabold text-base">{liveMatch.name}</p>
                  <p className="text-amber-100 text-xs mt-0.5">
                    {teamById(liveMatch.team1)?.name} vs {teamById(liveMatch.team2)?.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl">
                  <Eye size={13} className="text-white" />
                  <span className="text-white text-xs font-bold">Score Now</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-amber-100 border-t border-white/20 pt-2.5 mt-1">
                <span className="flex items-center gap-1"><Shield size={11} />Toss</span>
                <span className="flex items-center gap-1"><Activity size={11} />Scoring</span>
                <span className="flex items-center gap-1"><CheckCircle size={11} />Match Result</span>
              </div>
            </div>
          </button>
        )}

        {/* Active blocks */}
        <h3 className="font-bold text-navy-700 text-xs uppercase tracking-wider mb-3">Your Dashboard</h3>
        <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-up">

          <ActiveBlock
            icon={Eye}
            color="#d97706"
            bg="#fef3c720"
            title="My Assignments"
            badge={upcomingAssignments.length > 0 ? `${upcomingAssignments.length} upcoming` : null}
            sub={<p className="text-navy-500 text-[11px] leading-tight">{UMPIRE_PROFILE.matchesUmpired} matches umpired total</p>}
            onClick={() => navigate('/umpire-profile')}
          />

          <ActiveBlock
            icon={Star}
            color="#d97706"
            bg="#fef3c720"
            title="My Stats"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-700 font-bold text-base tabular-nums">{UMPIRE_PROFILE.matchesUmpired}</p>
                <p className="text-navy-500 text-[11px]">matches as umpire</p>
              </div>
            }
            onClick={() => navigate('/umpire-profile')}
          />

          <ActiveBlock
            icon={Calendar}
            color="#d97706"
            bg="#fef3c720"
            title="Ongoing Matches"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px] leading-tight">{OPEN_MATCHES?.length || 5} matches open</p>
                <p className="text-amber-600 text-[10px] font-semibold">Request + set charges</p>
              </div>
            }
            onClick={() => navigate('/browse-matches')}
          />

          <ActiveBlock
            icon={IndianRupee}
            color="#d97706"
            bg="#fef3c720"
            title="My Profile"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px] leading-tight">Charges, slots, gender</p>
                <p className="text-amber-600 text-[10px] font-semibold">Visible to organisers</p>
              </div>
            }
            onClick={() => navigate('/umpire-profile')}
          />
        </div>

        {/* Locked blocks — other roles */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={11} className="text-slate-400" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Other Role Features</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LockedBlock icon={Activity} title="My Cricket" sub="Player feature" forRoles="Player"
              onTap={() => setLocked({ feature: 'My Cricket', eligibleRoles: ['player'] })} />
            <LockedBlock icon={Trophy} title="Manage Tournaments" sub="Organiser feature" forRoles="Organiser"
              onTap={() => setLocked({ feature: 'Manage Tournaments', eligibleRoles: ['organiser'] })} />
            <LockedBlock icon={Users} title="Team Management" sub="Player / Organiser" forRoles="Player, Organiser"
              onTap={() => setLocked({ feature: 'Team Management', eligibleRoles: ['player', 'organiser'] })} />
            <LockedBlock icon={Building2} title="My Ground" sub="Ground Owner feature" forRoles="Ground Owner"
              onTap={() => setLocked({ feature: 'My Ground', eligibleRoles: ['ground_owner'] })} />
          </div>
        </div>

      </main>

      {locked && (
        <RoleLockedModal
          currentRole="umpire"
          featureName={locked.feature}
          eligibleRoles={locked.eligibleRoles}
          onClose={() => setLocked(null)}
        />
      )}
    </div>
  )
}
