import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { initials, ROLE_META } from '../data/mock'
import TopBar from '../components/TopBar'
import { User, Bell, Globe, Shield, Info, LogOut, ChevronRight, Camera, Phone, RefreshCw, Activity, BarChart2, Eye, Tv, Crown, Import, Sparkles, Gift, ShieldCheck, BarChart3 } from 'lucide-react'
import { useState } from 'react'

const ROLE_ICONS = {
  player: Activity, organiser: BarChart2, umpire: Eye, fan: Tv, admin: Shield,
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, addToast, setSubscription } = useStore()
  const [pushNotifs, setPushNotifs] = useState(true)
  const [showLogout, setShowLogout] = useState(false)

  const role = user?.role || 'fan'
  const roleMeta = ROLE_META[role] || { label: role, color: '#64748b', bg: '#f1f5f9', desc: '' }
  const RoleIcon = ROLE_ICONS[role] || Activity
  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isCancelled = user?.subscription === 'pro_cancelled'

  const handleChangeRole = () => {
    // PRD v2: Role change is zero-friction — no OTP, no cooldown, go straight to role-select
    navigate('/role-select')
  }

  const handleLogout = () => {
    logout()
    navigate('/usp')
    addToast('Logged out', 'info')
  }

  const ROWS = [
    { icon:Bell,   label:'Push notifications', desc:pushNotifs ? 'On' : 'Off', action:() => setPushNotifs(p => !p), toggle:true, value:pushNotifs },
    { icon:Phone,  label:'Change phone number', desc:user?.phone || '+91 —',    action:() => addToast('OTP flow would open here', 'info') },
    { icon:Globe,  label:'Language',            desc:'English (India)',          action:() => {} },
    { icon:Shield, label:'Privacy & data',      desc:'',                         action:() => {} },
    { icon:Info,   label:'About CricYaar',      desc:'v1.0.0 — Demo build',     action:() => {} },
  ]

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Settings" showBack />
      <main className="flex-1 px-4 py-4 pb-24 max-w-2xl mx-auto w-full">

        {/* Profile */}
        <div className="card mb-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xl">
                {initials(user?.name || 'U')}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-navy-900 rounded-full flex items-center justify-center border-2 border-white">
                <Camera size={11} className="text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-navy-900 text-lg">{user?.name || 'User'}</p>
              <p className="text-navy-500 text-sm">@{user?.username || 'username'}</p>
              <p className="text-navy-400 text-xs mt-0.5">{user?.phone}</p>
            </div>
            <button className="btn-secondary text-sm py-2 px-4 flex-shrink-0">Edit</button>
          </div>
        </div>

        {/* CricYaar Pro section */}
        <div className="card mb-4 animate-slide-up">
          <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">CricYaar Pro</p>
          {isPro ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#fef3c7' }}>
                <Crown size={18} className="text-amber-500 fill-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-900 text-sm">Pro Member</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: isCancelled ? '#fee2e2' : '#fef3c7', color: isCancelled ? '#dc2626' : '#d97706' }}>
                    {isCancelled ? 'Cancelling' : 'Active'}
                  </span>
                </div>
                <p className="text-navy-400 text-xs mt-0.5">
                  {isCancelled ? 'Access until Apr 20, 2024' : 'Renews Apr 20, 2024 · ₹99/mo'}
                </p>
              </div>
              <button
                onClick={() => navigate('/pro')}
                className="text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors flex-shrink-0"
              >
                Manage
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100">
                <Crown size={18} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-900 text-sm">Upgrade to Pro</p>
                <p className="text-navy-400 text-xs mt-0.5">Tournaments, scoring, career stats · ₹99/mo</p>
              </div>
              <button
                onClick={() => navigate('/pro')}
                className="flex-shrink-0 px-3 py-2 rounded-xl font-bold text-white text-xs"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                Upgrade
              </button>
            </div>
          )}
        </div>

        {/* CricHeroes Import — shown to all non-fan roles */}
        {role !== 'fan' && (
          <button
            onClick={() => navigate('/cricheros-import')}
            className="card mb-2 w-full text-left flex items-center gap-3 animate-slide-up hover:border-brand-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Import size={18} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy-900 text-sm">Import from CricHeroes</p>
              <p className="text-navy-400 text-xs mt-0.5">Bring your match history and stats across</p>
            </div>
            <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
          </button>
        )}

        {/* New CricYaar master PRD settings */}
        <button onClick={() => navigate('/invite')}
          className="card mb-2 w-full text-left flex items-center gap-3 hover:border-brand-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Gift size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-navy-900 text-sm">Invite & Earn</p>
            <p className="text-navy-400 text-xs mt-0.5">Refer friends · earn free Pro months</p>
          </div>
          <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
        </button>

        {role !== 'fan' && (
          <button onClick={() => navigate('/aadhaar-verify')}
            className="card mb-2 w-full text-left flex items-center gap-3 hover:border-teal-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy-900 text-sm">Aadhaar Verification</p>
              <p className="text-navy-400 text-xs mt-0.5">Verify identity for ground listing</p>
            </div>
            <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
          </button>
        )}

        {role !== 'fan' && (
          <button onClick={() => navigate('/earnings')}
            className="card mb-4 w-full text-left flex items-center gap-3 hover:border-brand-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={18} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy-900 text-sm">Payout Settings & Earnings</p>
              <p className="text-navy-400 text-xs mt-0.5">Ground owner earnings dashboard</p>
            </div>
            <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
          </button>
        )}

        {/* Change My Role — v1 section */}
        <div className="card mb-4 animate-slide-up">
          <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">Your Role</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: roleMeta.bg }}>
              <RoleIcon size={18} style={{ color: roleMeta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-900">{roleMeta.label}</span>
                <span className="badge text-xs px-2 py-0.5 rounded-md" style={{ background: roleMeta.bg, color: roleMeta.color }}>
                  Active
                </span>
              </div>
              <p className="text-navy-500 text-xs mt-0.5 leading-tight">{roleMeta.desc}</p>
            </div>
          </div>
          <button
            onClick={handleChangeRole}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw size={16} className="text-navy-500 group-hover:text-brand-600 transition-colors" />
              <span className="font-semibold text-navy-700 group-hover:text-brand-700 text-sm transition-colors">Change My Role</span>
            </div>
            <span className="text-xs text-navy-400">OTP required</span>
          </button>
        </div>

        {/* Settings rows */}
        <div className="card divide-y divide-slate-50 p-0 overflow-hidden animate-slide-up mb-4">
          {ROWS.map((row, i) => {
            const Icon = row.icon
            return (
              <button key={i} onClick={row.action} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm">{row.label}</p>
                  {row.desc && <p className="text-navy-400 text-xs mt-0.5">{row.desc}</p>}
                </div>
                {row.toggle ? (
                  <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${row.value ? 'bg-brand-500' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${row.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="btn-danger w-full gap-2 animate-slide-up"
          style={{animationDelay:'0.05s'}}
        >
          <LogOut size={16} />
          Log out
        </button>

        {/* What's New footer link */}
        <button
          onClick={() => navigate('/whats-new')}
          className="flex items-center justify-center gap-1.5 mt-4 mb-6 mx-auto text-navy-400 text-xs hover:text-brand-500 transition-colors"
        >
          <Sparkles size={12} />
          What's New in v3
        </button>
      </main>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowLogout(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogOut size={20} className="text-red-600" />
            </div>
            <h3 className="font-bold text-navy-900 text-lg mb-1">Log out?</h3>
            <p className="text-navy-500 text-sm mb-5">You'll need to verify your phone number again to log back in.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
