import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, PLAYERS, TEAMS, TOURNAMENTS, UMPIRE_PROFILE, teamById, playerById } from '../data/mock'
import { Activity, BarChart2, MapPin, Trophy, ChevronRight, Circle, Lock, LayoutGrid, Star, Crown, Plus, X, BookOpen, Swords, Users, GraduationCap, Gift, RefreshCw, LogIn } from 'lucide-react'
import TopBar from '../components/TopBar'
import RoleLockedModal from '../components/RoleLockedModal'
import FanHome from './FanHome'
import UmpireHome from './UmpireHome'
import GroundOwnerHome from './GroundOwnerHome'
import PlayerHome from './PlayerHome'
import OrganiserHome from './OrganiserHome'
import ProPaywallSheet from '../components/ProPaywallSheet'
import AIAssistant from '../components/AIAssistant'

const liveMatch   = MATCHES.find(m => m.status === 'live')
const upcomingMatch = MATCHES.find(m => m.status === 'upcoming')

function buildBlocks(role, player, myTeams, myTournaments) {
  const t1 = teamById(liveMatch?.team1)
  const t2 = teamById(liveMatch?.team2)
  const nt1 = teamById(upcomingMatch?.team1)
  const nt2 = teamById(upcomingMatch?.team2)
  const score = liveMatch ? `${liveMatch.innings[0].runs}/${liveMatch.innings[0].wkts}` : '—'
  const overs = liveMatch ? `${Math.floor(liveMatch.innings[0].overs)}.${Math.round((liveMatch.innings[0].overs % 1) * 10)} ov` : ''

  const liveIndicator = (
    <span className="flex items-center gap-1.5 text-red-600 font-semibold text-sm">
      <Circle size={8} fill="currentColor" className="animate-pulse" />
      LIVE · {t1?.name} {score}
    </span>
  )

  const configs = {
    player: [
      { id:'cricket', icon:Activity, color:'#22c55e', title:'My Cricket', path:'/my-cricket',
        proRequired: true, proFeature:'Ball-by-ball live scoring', proDesc:'Score matches ball-by-ball and track your innings live.',
        sub: liveMatch ? liveIndicator
          : upcomingMatch ? <span className="text-navy-500 text-sm">vs {nt2?.name} · {upcomingMatch.date}</span>
          : <span className="text-navy-400 text-sm">No upcoming matches</span> },
      { id:'stats', icon:BarChart2, color:'#3b82f6', title:'My Stats', path:'/profile',
        proRequired: true, proFeature:'Career stats', proDesc:'Track your career batting, bowling and fielding statistics.',
        sub: player?.batting?.runs
          ? <span className="text-navy-500 text-sm">{player.batting.runs} runs · {player.bowling.wkts} wickets</span>
          : <span className="text-navy-400 text-sm">No stats yet</span> },
      { id:'grounds', icon:MapPin, color:'#f59e0b', title:'Find a Ground', path:'/grounds',
        sub: <span className="text-navy-500 text-sm">Find grounds near you</span> },
      { id:'teams', icon:Trophy, color:'#8b5cf6', title:'My Teams', path:'/teams',
        proRequired: true, proFeature:'Squad management', proDesc:'Create teams, manage your squad and join tournaments.',
        sub: myTeams.length
          ? <span className="text-navy-500 text-sm">{myTeams.length} team{myTeams.length>1?'s':''} · {myTournaments.length} tournament{myTournaments.length!==1?'s':''}</span>
          : <span className="text-navy-400 text-sm">No teams yet</span> },
    ],
    organiser: [
      { id:'cricket', icon:Activity, color:'#22c55e', title:'My Matches', path:'/my-cricket',
        sub: liveMatch ? liveIndicator
          : upcomingMatch ? <span className="text-navy-500 text-sm">{upcomingMatch.name}</span>
          : <span className="text-navy-400 text-sm">No upcoming matches</span> },
      { id:'stats', icon:BarChart2, color:'#94a3b8', title:'Stats', path:null, locked:true,
        lockReason:'Stats are tracked for Players.',
        eligibleRoles:['player'],
        sub: <span className="text-slate-400 text-sm">Switch to Player to track stats</span> },
      { id:'grounds', icon:MapPin, color:'#f59e0b', title:'Find a Ground', path:'/grounds',
        sub: <span className="text-navy-500 text-sm">Find grounds near you</span> },
      { id:'teams', icon:Trophy, color:'#8b5cf6', title:'Teams & Tournaments', path:'/teams',
        sub: <span className="text-navy-500 text-sm">{TEAMS.length} teams · {TOURNAMENTS.length} tournaments</span> },
    ],
    umpire: [
      { id:'cricket', icon:Activity, color:'#22c55e', title:'My Assignments', path:'/umpire-profile',
        sub: <span className="text-navy-500 text-sm">
          {UMPIRE_PROFILE.assignments.filter(a=>a.status==='upcoming').length > 0
            ? `${UMPIRE_PROFILE.assignments.filter(a=>a.status==='upcoming').length} upcoming assignment`
            : 'No upcoming assignments'}
        </span> },
      { id:'stats', icon:Star, color:'#d97706', title:'My Rating', path:'/umpire-profile',
        sub: <span className="text-navy-500 text-sm">⭐ {UMPIRE_PROFILE.rating} · {UMPIRE_PROFILE.matchesUmpired} matches</span> },
      { id:'grounds', icon:MapPin, color:'#f59e0b', title:'Find a Ground', path:'/grounds',
        sub: <span className="text-navy-500 text-sm">Find grounds near you</span> },
      { id:'teams', icon:Trophy, color:'#94a3b8', title:'Teams', path:null, locked:true,
        lockReason:'Teams are for Players and Organisers.',
        eligibleRoles:['player','organiser'],
        sub: <span className="text-slate-400 text-sm">Switch to Player or Organiser</span> },
    ],
    fan: [
      { id:'cricket', icon:Activity, color:'#22c55e', title:'Live Scores', path: liveMatch ? `/score/${liveMatch.id}` : '/my-cricket',
        sub: liveMatch ? liveIndicator
          : <span className="text-navy-400 text-sm">No live matches right now</span> },
      { id:'stats', icon:BarChart2, color:'#94a3b8', title:'My Stats', path:null, locked:true,
        lockReason:'Stats are tracked for Players.',
        eligibleRoles:['player'],
        sub: <span className="text-slate-400 text-sm">Switch to Player to track stats</span> },
      { id:'grounds', icon:MapPin, color:'#f59e0b', title:'Find a Ground', path:'/grounds',
        sub: <span className="text-navy-500 text-sm">Find grounds near you</span> },
      { id:'teams', icon:Trophy, color:'#94a3b8', title:'Teams', path:null, locked:true,
        lockReason:'Teams are for Players and Organisers.',
        eligibleRoles:['player','organiser'],
        sub: <span className="text-slate-400 text-sm">Join as a Player to join teams</span> },
    ],
    admin: [
      { id:'cricket', icon:Activity, color:'#22c55e', title:'All Matches', path:'/my-cricket',
        sub: <span className="text-navy-500 text-sm">{MATCHES.length} total · {MATCHES.filter(m=>m.status==='live').length} live</span> },
      { id:'stats', icon:LayoutGrid, color:'#3b82f6', title:'Platform Stats', path:'/profile',
        sub: <span className="text-navy-500 text-sm">{MATCHES.length} matches · {TEAMS.length} teams · {TOURNAMENTS.length} tournaments</span> },
      { id:'grounds', icon:MapPin, color:'#f59e0b', title:'Find a Ground', path:'/grounds',
        sub: <span className="text-navy-500 text-sm">Find grounds near you</span> },
      { id:'teams', icon:Trophy, color:'#8b5cf6', title:'Teams & Tournaments', path:'/teams',
        sub: <span className="text-navy-500 text-sm">{TEAMS.length} teams · {TOURNAMENTS.length} tournaments</span> },
    ],
  }
  return configs[role] || configs.fan
}

function CricYaarFAB({ role, isPro }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const isCapOrOrg = ['captain','organiser','admin'].includes(role)

  const actions = [
    { icon: RefreshCw, label: 'Change Role', path: '/role-select', roles: ['player','captain','organiser','umpire','fan','admin'] },
    { icon: Swords, label: 'Find Opponent', path: '/opponent-finder', roles: ['captain','organiser','admin'], pro: true },
    { icon: LogIn, label: 'Join a Team', path: '/teams', roles: ['player','captain','organiser','admin'], pro: true },
    { icon: GraduationCap, label: 'Join a Tournament', path: '/open-tournaments', roles: ['player','captain','organiser','umpire','admin'], pro: true },
    { icon: BookOpen, label: 'Book a Ground', path: '/ground-booking', roles: ['captain','organiser','admin'], pro: true },
    { icon: Users, label: 'Import from CricHeroes', path: '/cricheros-import', roles: ['player','captain','organiser','umpire','admin'], pro: true },
    { icon: Gift, label: 'Invite Friends', path: '/invite', roles: ['player','captain','organiser','umpire','fan','admin'] },
    { icon: Crown, label: isPro ? 'Manage Pro' : 'Upgrade to Pro', path: '/pro', roles: ['player','captain','organiser','umpire'], proGate: false },
  ].filter(a => a.roles.includes(role))

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {open && (
          <div className="flex flex-col items-end gap-2 animate-slide-up">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={() => { navigate(a.path); setOpen(false) }}
                className="flex items-center gap-2 bg-white border border-navy-200 rounded-full px-3 py-2 shadow-md text-sm font-semibold text-navy-800 hover:bg-navy-50 transition-all active:scale-95"
              >
                {a.pro && !isPro && <Crown size={11} className="text-amber-500" />}
                {a.label}
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                  <a.icon size={14} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
          style={{ boxShadow: '0 4px 12px rgba(34,197,94,0.4)' }}
        >
          {open ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>
    </>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useStore()
  const role = user?.role || 'fan'

  // Route to role-specific home screens
  if (role === 'fan')          return <><FanHome /><AIAssistant fanMode /></>
  if (role === 'umpire')       return <><UmpireHome /><AIAssistant /></>
  if (role === 'ground_owner') return <><GroundOwnerHome /><AIAssistant /></>
  if (role === 'player')       return <><PlayerHome /><AIAssistant /></>
  if (role === 'organiser')    return <><OrganiserHome /><AIAssistant /></>

  const player     = PLAYERS.find(p => p.id === user?.id) || PLAYERS[0]
  const myTeams    = TEAMS.filter(t => t.squad.includes(player?.id))
  const myTournaments = TOURNAMENTS.filter(tr => tr.approvedTeams.some(tid => myTeams.map(t=>t.id).includes(tid)))

  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const [lockedModal, setLockedModal]   = useState(null) // { feature, eligibleRoles, lockReason }
  const [proPaywall, setProPaywall]     = useState(null) // { featureName, featureDesc }

  const inns  = liveMatch?.innings?.[0]
  const score = inns ? `${inns.runs}/${inns.wkts}` : '—'
  const overs = inns?.overs ? `${Math.floor(inns.overs)}.${Math.round((inns.overs % 1) * 10)} ov` : '0.0 ov'
  const t1    = teamById(liveMatch?.team1)
  const t2    = teamById(liveMatch?.team2)

  const blocks = buildBlocks(role, player, myTeams, myTournaments)

  // Admin first-login banner
  const [adminBanner, setAdminBanner] = useState(role === 'admin')

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar />
      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">

        {/* Admin first-login banner */}
        {adminBanner && (
          <div className="mb-4 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-3 animate-slide-up">
            <p className="text-purple-800 text-sm font-medium">
              🛡️ You're signed in as <strong>Admin</strong>. You have full platform access.
            </p>
            <button onClick={() => setAdminBanner(false)} className="text-purple-500 hover:text-purple-700 text-xs font-semibold flex-shrink-0">
              Dismiss
            </button>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-5 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900">
            Hey, {user?.name?.split(' ')[0] || 'Cricketer'} 👋
          </h2>
          <p className="text-navy-500 text-sm mt-0.5">Ready to play?</p>
        </div>

        {/* Live banner — shown for all roles that can see live (non-Fan gets link to scorer, Fan gets read-only) */}
        {liveMatch && (
          <button
            onClick={() => navigate(`/score/${liveMatch.id}`)}
            className="w-full mb-5 p-4 bg-navy-900 rounded-2xl text-left animate-slide-up cursor-pointer hover:bg-navy-800 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Circle size={8} fill="#ef4444" className="text-red-500 animate-pulse" />
                <span className="text-red-400 font-bold text-xs uppercase tracking-wide">Live</span>
              </div>
              <span className="text-navy-400 text-xs truncate">{liveMatch.name}</span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-base truncate">{t1?.name}</p>
                <p className="text-brand-400 font-extrabold text-3xl tabular-nums">{score}</p>
                <p className="text-navy-400 text-xs mt-0.5">{overs}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-navy-400 text-xs mb-1">vs</p>
                <p className="text-white font-semibold text-sm truncate max-w-[110px]">{t2?.name}</p>
                <span className="badge badge-amber mt-1">Yet to bat</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-brand-400 text-sm font-semibold">
              <span>{role === 'organiser' || role === 'admin' ? 'Open scoring' : 'View score'}</span>
              <ChevronRight size={14} />
            </div>
          </button>
        )}

        {/* 4 blocks */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{animationDelay:'0.05s'}}>
          {blocks.map(({ id, icon: Icon, color, title, sub, path, locked, lockReason, eligibleRoles, proRequired, proFeature, proDesc }) => {
            const needsPro = proRequired && !isPro
            return (
            <button
              key={id}
              className={`home-block text-left relative ${locked ? 'opacity-60' : ''}`}
              onClick={() => {
                if (locked) {
                  setLockedModal({ feature: title, eligibleRoles: eligibleRoles || [], lockReason })
                } else if (needsPro) {
                  setProPaywall({ featureName: proFeature, featureDesc: proDesc })
                } else if (path) {
                  navigate(path)
                }
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: locked ? '#f1f5f9' : `${color}18` }}
              >
                <Icon size={20} style={{ color: locked ? '#94a3b8' : color }} />
              </div>
              <p className={`font-bold text-base mt-1 ${locked ? 'text-slate-400' : 'text-navy-900'}`}>{title}</p>
              <div className="mt-0.5">{sub}</div>
              {locked
                ? <Lock size={13} className="absolute top-4 right-4 text-slate-300" />
                : needsPro
                  ? <Crown size={13} className="absolute top-4 right-4 text-amber-400 fill-amber-300" />
                  : <ChevronRight size={14} className="absolute top-4 right-4 text-navy-300" />
              }
            </button>
          )})}

        </div>

        {/* Quick upcoming matches */}
        {MATCHES.filter(m => m.status === 'upcoming').length > 0 && (
          <div className="mt-6 animate-slide-up" style={{animationDelay:'0.1s'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-navy-900">Upcoming</h3>
              <button onClick={() => navigate('/my-cricket')} className="text-brand-600 text-sm font-medium hover:text-brand-700">See all →</button>
            </div>
            {MATCHES.filter(m=>m.status==='upcoming').map(m => {
              const ta = teamById(m.team1), tb = teamById(m.team2)
              return (
                <button key={m.id} onClick={() => navigate('/my-cricket')} className="card card-hover w-full text-left flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:`${ta?.color || '#22c55e'}18`}}>
                    <Activity size={16} style={{color: ta?.color || '#22c55e'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">{ta?.name} vs {tb?.name}</p>
                    <p className="text-navy-500 text-xs">{m.date} · {m.time} · {m.overs} overs</p>
                  </div>
                  <span className="badge badge-blue flex-shrink-0">Upcoming</span>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* Role-Locked Modal */}
      {lockedModal && (
        <RoleLockedModal
          currentRole={role}
          featureName={lockedModal.feature}
          eligibleRoles={lockedModal.eligibleRoles}
          onClose={() => setLockedModal(null)}
        />
      )}

      {/* Pro Paywall Sheet */}
      {proPaywall && (
        <ProPaywallSheet
          featureName={proPaywall.featureName}
          featureDesc={proPaywall.featureDesc}
          onClose={() => setProPaywall(null)}
        />
      )}

      {/* CricYaar FAB */}
      <CricYaarFAB role={role} isPro={user?.subscription === 'pro_active'} />
    </div>
  )
}
