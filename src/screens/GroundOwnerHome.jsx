import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, TOURNAMENTS } from '../data/mock'
import TopBar from '../components/TopBar'
import RoleLockedModal from '../components/RoleLockedModal'
import {
  MapPin, BarChart2, Send, Activity, Eye, Trophy, Users,
  ChevronRight, Lock, Shield, CheckCircle, Clock, Building2, Camera
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

// Mock ground stats
const GROUND_STATS = { totalMatches: 12, thisMonth: 3, revenue: '₹24,000' }

export default function GroundOwnerHome() {
  const navigate  = useNavigate()
  const { user }  = useStore()
  const [locked, setLocked] = useState(null)
  const isVerified = user?.groundOwnerVerified

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />
      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full pb-28">

        {/* Greeting */}
        <div className="mb-5 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Ground Owner'} 👋
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#cffafe', color: '#0891b2' }}>
              📍 Ground Owner
            </span>
            {isVerified
              ? <span className="flex items-center gap-1 text-xs text-teal-600 font-semibold"><CheckCircle size={11} />Verified</span>
              : <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold"><Clock size={11} />Verification pending</span>
            }
          </div>
        </div>

        {/* Hero — ground status card */}
        {!isVerified ? (
          <button
            onClick={() => navigate('/ground-owner')}
            className="w-full mb-5 rounded-2xl p-4 text-left animate-slide-up border-2 border-dashed border-cyan-300 bg-cyan-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center">
                <Shield size={22} className="text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-cyan-900 text-base">Verify to go live</p>
                <p className="text-cyan-600 text-xs mt-0.5">Complete Aadhaar verification to list your ground and start receiving bookings.</p>
              </div>
              <ChevronRight size={18} className="text-cyan-500" />
            </div>
          </button>
        ) : (
          <button
            onClick={() => navigate('/ground-owner')}
            className="w-full mb-5 rounded-2xl overflow-hidden text-left animate-slide-up"
            style={{ background: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)' }}
          >
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={13} className="text-teal-300" />
                <span className="text-teal-200 text-xs font-bold">✓ Verified · Ground Live</span>
              </div>
              <p className="text-white font-extrabold text-base mb-3">My Ground Dashboard</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total Matches', val: GROUND_STATS.totalMatches },
                  { label: 'This Month', val: GROUND_STATS.thisMonth },
                  { label: 'Revenue', val: GROUND_STATS.revenue },
                ].map(s => (
                  <div key={s.label} className="bg-white/15 rounded-xl px-2.5 py-2 text-center">
                    <p className="text-white font-extrabold text-lg tabular-nums">{s.val}</p>
                    <p className="text-cyan-100 text-[9px] font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </button>
        )}

        {/* Active blocks */}
        <h3 className="font-bold text-navy-700 text-xs uppercase tracking-wider mb-3">Your Dashboard</h3>
        <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-up">

          <ActiveBlock
            icon={Camera}
            color="#0891b2"
            bg="#cffafe30"
            title="Upload Ground"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px]">Photos, location, pricing</p>
                <p className="text-cyan-600 text-[10px] font-semibold">Requires admin approval</p>
              </div>
            }
            onClick={() => navigate('/ground-owner')}
          />

          <ActiveBlock
            icon={BarChart2}
            color="#0891b2"
            bg="#cffafe30"
            title="My Stats"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-700 font-bold text-lg tabular-nums">{GROUND_STATS.totalMatches}</p>
                <p className="text-navy-500 text-[11px]">matches at my ground</p>
              </div>
            }
            onClick={() => navigate('/ground-owner')}
          />

          <ActiveBlock
            icon={Send}
            color="#0891b2"
            bg="#cffafe30"
            title="Send Request"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px] leading-tight">Invite organisers & captains to use your ground</p>
              </div>
            }
            onClick={() => navigate('/grounds')}
          />

          <ActiveBlock
            icon={MapPin}
            color="#0891b2"
            bg="#cffafe30"
            title="Ground Details"
            sub={
              <div className="space-y-0.5">
                <p className="text-navy-500 text-[11px]">Charges, bank account</p>
                <p className="text-cyan-600 text-[10px] font-semibold">Manage listing</p>
              </div>
            }
            onClick={() => navigate('/ground-owner')}
          />
        </div>

        {/* Locked blocks */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={11} className="text-slate-400" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Other Role Features</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LockedBlock icon={Activity} title="My Cricket" sub="Player feature"
              onTap={() => setLocked({ feature: 'My Cricket', eligibleRoles: ['player'] })} />
            <LockedBlock icon={Eye} title="Umpiring" sub="Umpire feature"
              onTap={() => setLocked({ feature: 'Umpiring', eligibleRoles: ['umpire'] })} />
            <LockedBlock icon={Trophy} title="Tournaments" sub="Organiser feature"
              onTap={() => setLocked({ feature: 'Tournaments', eligibleRoles: ['organiser'] })} />
            <LockedBlock icon={Users} title="Team Management" sub="Player / Organiser"
              onTap={() => setLocked({ feature: 'Team Management', eligibleRoles: ['player', 'organiser'] })} />
          </div>
        </div>

      </main>

      {locked && (
        <RoleLockedModal
          currentRole="ground_owner"
          featureName={locked.feature}
          eligibleRoles={locked.eligibleRoles}
          onClose={() => setLocked(null)}
        />
      )}
    </div>
  )
}
