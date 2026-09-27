import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, PLAYERS, TEAMS, TOURNAMENTS, teamById, playerById } from '../data/mock'
import TopBar from '../components/TopBar'
import MatchScoreSheet from '../components/MatchScoreSheet'
import RoleStrip from '../components/RoleStrip'
import RoleGateSheet from '../components/RoleGateSheet'
import {
  Activity, MapPin, Trophy, Eye, BarChart2, Building2, Circle,
  ChevronRight, Lock, Users, Send, Crown, Wallet, IndianRupee
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
        className="relative bg-[var(--cy-surface)] rounded-t-3xl w-full max-w-md px-6 pt-5 pb-10 animate-slide-up"
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

export default function PlayerHome({ activeRole, setActiveRole }) {
  const navigate  = useNavigate()
  const { user, setShowProSheet }  = useStore()
  const [scoreMatch, setScoreMatch]   = useState(null)
  const [gateRole, setGateRole]       = useState(null)

  const isPro = user?.subscription === 'pro_active' ||
    (user?.subscription === 'pro_cancelled' && user?.pro_renewal_date && new Date(user.pro_renewal_date) > new Date())

  const player     = PLAYERS.find(p => p.id === user?.id) || PLAYERS[0]
  const myTeams    = TEAMS.filter(t => t.squad?.includes(player?.id))
  const myTourneys = TOURNAMENTS.filter(tr => tr.approvedTeams?.some(tid => myTeams.map(t => t.id).includes(tid)))
  const liveMatch  = MATCHES.find(m => m.status === 'live')
  const upcomingMatch = MATCHES.find(m => m.status === 'upcoming')

  const proTap = (path) => {
    if (isPro) navigate(path)
    else setShowProSheet(true)
  }

  const t1 = teamById(liveMatch?.team1)
  const t2 = teamById(liveMatch?.team2)
  const inns = liveMatch?.innings?.[0]
  const score = inns ? `${inns.runs}/${inns.wkts}` : '—'
  const overs = inns?.overs ? `${Math.floor(inns.overs)}.${Math.round((inns.overs % 1) * 10)} ov` : ''

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />
      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full pb-44">

        {/* Greeting */}
        <div className="mb-4 animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="text-2xl font-extrabold text-navy-900">
              Hey, {user?.name?.split(' ')[0] || 'Player'} 👋
            </h2>
            {isPro && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 800,
                padding: '3px 10px', borderRadius: 20,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                letterSpacing: '0.02em',
              }}>
                <Crown size={10} color="#fff" /> Pro Active
              </span>
            )}
          </div>
        </div>

        {/* Role strip — all 4 tabs always visible */}
        <RoleStrip
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          onLockedTap={(key) => setGateRole(key)}
        />

        {/* KYC + Pro gate sheet */}
        {gateRole && (
          <RoleGateSheet role={gateRole} onClose={() => setGateRole(null)} />
        )}

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

        {/* Dashboard — free: live score only; rest = Pro */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 className="font-bold text-navy-700 text-xs uppercase tracking-wider">Your Dashboard</h3>
          {!isPro && (
            <button
              onClick={() => setShowProSheet(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              <Crown size={10} /> Upgrade to Pro
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-up">

          {/* Live Scores — free for everyone */}
          <ActiveBlock
            icon={Activity}
            color="#16a34a"
            bg="#dcfce730"
            title="Live Scores"
            sub={<p className="text-navy-500 text-[11px]">{MATCHES.filter(m => m.status === 'live').length} live now</p>}
            onClick={() => liveMatch ? setScoreMatch(liveMatch) : navigate('/my-cricket')}
          />

          {/* Find Ground — Pro */}
          {isPro ? (
            <ActiveBlock
              icon={MapPin}
              color="#d97706"
              bg="#fef3c730"
              title="Find a Ground"
              sub={<p className="text-navy-500 text-[11px] leading-tight">Browse & book grounds nearby</p>}
              onClick={() => navigate('/grounds')}
            />
          ) : (
            <LockedBlock
              icon={MapPin}
              title="Find a Ground"
              sub="Pro required to browse & book"
              onTap={() => setShowProSheet(true)}
            />
          )}

          {/* My Teams — Pro */}
          {isPro ? (
            <ActiveBlock
              icon={Users}
              color="#7c3aed"
              bg="#f3e8ff30"
              title="My Teams"
              badge={myTeams.length > 0 ? `${myTeams.length} team${myTeams.length > 1 ? 's' : ''}` : null}
              sub={<p className="text-navy-500 text-[11px] leading-tight">Join or manage your squad</p>}
              onClick={() => navigate('/teams')}
            />
          ) : (
            <LockedBlock
              icon={Users}
              title="My Teams"
              sub="Pro required to join teams"
              onTap={() => setShowProSheet(true)}
            />
          )}

          {/* Tournaments — Pro */}
          {isPro ? (
            <ActiveBlock
              icon={Trophy}
              color="#2563eb"
              bg="#dbeafe30"
              title="Tournaments"
              badge={myTourneys.length > 0 ? `${myTourneys.length} joined` : null}
              sub={<p className="text-navy-500 text-[11px]">Join as player or captain</p>}
              onClick={() => navigate('/open-tournaments')}
            />
          ) : (
            <LockedBlock
              icon={Trophy}
              title="Tournaments"
              sub="Pro required to participate"
              onTap={() => setShowProSheet(true)}
            />
          )}
        </div>

        {/* Pay / Request row */}
        <h3 className="font-bold text-navy-700 text-xs uppercase tracking-wider mb-3">Payments</h3>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => navigate('/send-money', { state: { purpose: 'match_fee' } })}
            className="home-block text-left relative active:scale-[0.97] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(234,179,8,0.15)' }}>
              <Send size={20} style={{ color: '#ca8a04' }} />
            </div>
            <p className="font-bold text-navy-900 text-sm">Send Amount</p>
            <p className="text-navy-500 text-[11px] leading-tight mt-0.5">Match fee, umpire, ground</p>
          </button>
          <button
            onClick={() => navigate('/receive-money')}
            className="home-block text-left relative active:scale-[0.97] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Wallet size={20} style={{ color: '#16a34a' }} />
            </div>
            <p className="font-bold text-navy-900 text-sm">Receive Amount</p>
            <p className="text-navy-500 text-[11px] leading-tight mt-0.5">Share your UPI via WhatsApp</p>
          </button>
        </div>

      </main>

      {scoreMatch && <MatchScoreSheet match={scoreMatch} onClose={() => setScoreMatch(null)} />}
    </div>
  )
}
