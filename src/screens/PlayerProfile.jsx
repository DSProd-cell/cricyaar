import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PLAYERS, MATCHES, TEAMS, teamById, initials } from '../data/mock'
import { avg, sr, eco } from '../utils/cricket'
import { supabase } from '../lib/supabase'
import { uploadAvatar } from '../lib/uploads'
import TopBar from '../components/TopBar'
import { getRoleColor, CAN_COLLECT, NEEDS_AADHAAR } from '../lib/roleColors'
import {
  BarChart2, Activity, Users, Trophy, X, MapPin, Check, ChevronRight, Camera,
  Edit, LogOut, RefreshCw, ShieldCheck, Crown, Gift, Settings, Wallet, ArrowUpRight,
  Swords, ClipboardList, Scale, Megaphone, Building2, Star,
} from 'lucide-react'
import { useState, useMemo, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function realProfileShape(user) {
  return {
    id: user?.id,
    name: user?.name || 'Player',
    username: user?.username || '',
    city: user?.city || '',
    bio: user?.bio || '',
    roles: user?.roles?.length ? user.roles : [user?.role || 'fan'],
    batting:  { runs: 0, innings: 0, dismissed: 0, notOut: 0, hs: 0, fifties: 0, hundreds: 0, ducks: 0 },
    bowling:  { wkts: 0, overs: 0, runs: 0, best: '—', threeWickets: 0, fiveWickets: 0 },
    fielding: { catches: 0, runOuts: 0, stumpings: 0 },
  }
}

const CITIES = ['Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Kolkata','Pune','Chandigarh','Rajkot','Other']
const PLAYER_TABS = ['Overview','Batting','Bowling','Fielding','Matches','My Teams']

// ─── Edit Profile Sheet ──────────────────────────────────────────────────────
function EditProfileSheet({ player, onClose, onSave }) {
  const [name, setName]     = useState(player.name)
  const [city, setCity]     = useState(player.city)
  const [bio, setBio]       = useState(player.bio || '')
  const [saving, setSaving] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="font-extrabold text-navy-900 text-lg">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-navy-500" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 pb-8">
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">Full Name</label>
            <input className="cm-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">City</label>
            <select className="cm-select w-full" value={city} onChange={e => setCity(e.target.value)}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">
              About me <span className="text-navy-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="cm-input resize-none" rows={3}
              placeholder="e.g. Right-arm fast bowler, 5+ years in Mumbai leagues…"
              value={bio} onChange={e => setBio(e.target.value.slice(0, 160))}
            />
            <p className="text-navy-400 text-xs text-right mt-0.5">{bio.length}/160</p>
          </div>
          <button
            onClick={async () => { setSaving(true); await onSave({ name, city, bio }); setSaving(false); onClose() }}
            disabled={!name.trim() || saving}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <Check size={18} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Role-specific quick stats ───────────────────────────────────────────────
function roleStats(role, player) {
  switch (role) {
    case 'player':
      return [
        { label: 'Runs',    val: player.batting.runs    },
        { label: 'Innings', val: player.batting.innings  },
        { label: 'Wickets', val: player.bowling.wkts    },
        { label: 'Matches', val: player.batting.innings  },
      ]
    case 'organiser':
      return [
        { label: 'Tournaments', val: 0 },
        { label: 'Matches',     val: 0 },
        { label: 'Teams',       val: 0 },
        { label: 'Cities',      val: 1 },
      ]
    case 'umpire':
      return [
        { label: 'Matches',  val: 0    },
        { label: 'Rating',   val: '—'  },
        { label: 'Seasons',  val: 0    },
        { label: 'Cities',   val: 1    },
      ]
    case 'ground_owner':
      return [
        { label: 'Grounds',    val: 0  },
        { label: 'Bookings',   val: 0  },
        { label: 'This Month', val: 0  },
        { label: 'Rating',     val: '—'},
      ]
    default: // fan
      return [
        { label: 'Following',   val: 0 },
        { label: 'Watching',    val: 0 },
        { label: 'Teams',       val: 0 },
        { label: 'Matches',     val: 0 },
      ]
  }
}

// ─── Logout confirm modal ────────────────────────────────────────────────────
function LogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in text-center" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <LogOut size={20} className="text-red-600" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Log out?</h3>
        <p className="text-navy-500 text-sm mb-5">You'll need to verify your phone number again to log back in.</p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
          <button className="btn-danger flex-1" onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PlayerProfile() {
  const { user, setUser, logout, addToast, setOtpMode, setProIntent } = useStore()
  const navigate   = useNavigate()
  const { playerId } = useParams()

  const player     = playerId ? (PLAYERS.find(p => p.id === playerId) || PLAYERS[0]) : realProfileShape(user)
  const isOwnProfile = !playerId || player.id === user?.id

  const role       = isOwnProfile ? (user?.role || 'fan') : (player.roles?.[0] || 'fan')
  const roleColor  = getRoleColor(role)
  const isPro      = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isCancelled = user?.subscription === 'pro_cancelled'
  const canCollect  = CAN_COLLECT.includes(role)
  const needsAadhaar = NEEDS_AADHAAR.includes(role)

  const [tab, setTab]             = useState('Overview')
  const [showEdit, setShowEdit]   = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoRef = useRef(null)

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setPhotoUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      if (error) throw error
      setUser({ ...user, avatar: url })
      addToast('Profile photo updated!', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to upload photo.', 'error')
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleSaveProfile = async (edits) => {
    if (!user || !isOwnProfile) return
    const { error } = await supabase.from('profiles').update({ name: edits.name, city: edits.city, bio: edits.bio }).eq('id', user.id)
    if (error) { addToast(error.message || 'Failed to save profile.', 'error'); return }
    setUser({ ...user, name: edits.name, city: edits.city, bio: edits.bio })
    addToast('Profile updated!', 'success')
  }

  const handleChangeRole = () => {
    if (!user?.phone) {
      setOtpMode('role-switch'); setProIntent(false)
      navigate('/login?mode=signup')
    } else {
      navigate('/role-select')
    }
  }

  const handleLogout = () => {
    if (user?.role) localStorage.setItem('cricyaar_last_role', user.role)
    logout()
    navigate('/login')
    addToast('Logged out. Sign in to continue.', 'info')
  }

  const playerTeams  = TEAMS.filter(t => t.squad.includes(player.id))
  const myMatches    = MATCHES.filter(m => m.xi1?.includes(player.id) || m.xi2?.includes(player.id))

  const chartData = useMemo(() => {
    const innings = MATCHES
      .filter(m => m.innings?.length > 0)
      .flatMap(m => (m.innings || []).map(inn => ({ inn, matchName: m.name })))
      .filter(({ inn }) => inn.batters?.[player.id] !== undefined)
      .map(({ inn, matchName }, i) => ({ inn: `#${i + 1}`, runs: inn.batters[player.id].runs, matchName }))
      .slice(-5)
    return innings.length > 0 ? innings : [{ inn: '—', runs: 0, matchName: 'No innings yet' }]
  }, [player.id])

  const quickStats = roleStats(role, player)

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden bg-slate-50">
      <TopBar title={isOwnProfile ? 'My Profile' : player.name.split(' ')[0] + "'s Profile"} showBack={!isOwnProfile} />

      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <div className="bg-white px-4 pt-5 pb-5 relative">
        {/* Role color accent strip at top */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-b-none" style={{ background: roleColor.primary }} />

        <div className="flex items-start gap-4 mt-2">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <div
              className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl overflow-hidden shadow-sm"
              style={{ background: roleColor.primary }}
            >
              {photoUploading
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : (isOwnProfile ? user?.avatar : null)
                  ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  : initials(player.name)
              }
            </div>
            {isOwnProfile && (
              <button
                onClick={() => photoRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-navy-900 rounded-full flex items-center justify-center border-2 border-white hover:bg-navy-700 transition-colors"
                aria-label="Change profile photo"
              >
                <Camera size={11} className="text-white" />
              </button>
            )}
          </div>

          {/* Name / username / role tag */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="font-extrabold text-navy-900 text-xl leading-tight truncate">{player.name}</h1>
                <p className="text-navy-500 text-sm mt-0.5">@{player.username}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0 hover:bg-slate-100 transition-colors"
                >
                  <Edit size={15} className="text-navy-500" />
                </button>
              )}
            </div>

            {/* Single role status tag */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: roleColor.light, color: roleColor.primary, border: `1.5px solid ${roleColor.border}` }}>
              <span>{getRoleColor(role) && roleColor.emoji || '🏏'}</span>
              <span>{roleColor.label || role}</span>
              <span className="w-1.5 h-1.5 rounded-full ml-0.5 bg-current opacity-70" />
              <span className="opacity-80">Active</span>
            </div>

            {/* City / phone */}
            {(player.city || user?.phone) && (
              <p className="text-navy-400 text-xs mt-1.5 flex items-center gap-1">
                {player.city && <><MapPin size={10} className="flex-shrink-0" />{player.city}</>}
                {player.city && user?.phone && <span className="mx-1">·</span>}
                {user?.phone && isOwnProfile && <span>{user.phone}</span>}
              </p>
            )}
          </div>
        </div>

        {/* Teams pills */}
        {playerTeams.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {playerTeams.map(t => (
              <button key={t.id} onClick={() => navigate(`/teams/${t.id}`)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────────── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {quickStats.map(s => (
            <div key={s.label} className="py-3 text-center">
              <p className="font-extrabold text-navy-900 text-lg tabular-nums leading-none">{s.val}</p>
              <p className="text-navy-400 text-[10px] mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial Actions ────────────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="mx-4 mt-3 flex gap-2">
          {canCollect && (
            <button
              onClick={() => navigate('/earnings')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97]"
              style={{ background: roleColor.primary, boxShadow: `0 4px 12px ${roleColor.primary}33` }}
            >
              <Wallet size={16} />
              Collect Money
            </button>
          )}
          <button
            onClick={() => addToast('Send Money coming soon!', 'info')}
            className={`${canCollect ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border border-slate-200 bg-white text-navy-700 transition-all active:scale-[0.97] hover:border-slate-300`}
          >
            <ArrowUpRight size={16} />
            Send Money
          </button>
        </div>
      )}

      {/* ── Account Management ───────────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="mx-4 mt-3">
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">

            {/* Aadhaar — gated to organiser/umpire/ground_owner */}
            {needsAadhaar && (
              <button
                onClick={() => navigate('/aadhaar-verify')}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={17} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm">Aadhaar Verification</p>
                  <p className="text-navy-400 text-xs mt-0.5">Required to collect payments</p>
                </div>
                <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
              </button>
            )}

            {/* CricYaar Pro */}
            <button
              onClick={() => navigate('/pro')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7' }}>
                <Crown size={17} className="text-amber-500 fill-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">
                  {isPro ? 'CricYaar Pro Member' : 'Upgrade to Pro'}
                </p>
                <p className="text-navy-400 text-xs mt-0.5">
                  {isPro
                    ? isCancelled ? 'Cancelling soon · manage plan' : 'Active · ₹99/mo'
                    : 'Tournaments, career stats, scoring · ₹99/mo'
                  }
                </p>
              </div>
              {isPro
                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50 flex-shrink-0">Active</span>
                : <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Upgrade</span>
              }
            </button>

            {/* Change Role */}
            <button
              onClick={handleChangeRole}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={17} className="text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">Change Role</p>
                <p className="text-navy-400 text-xs mt-0.5">Current: {roleColor.label}</p>
              </div>
              <span className="text-[10px] text-navy-400 flex-shrink-0">OTP required</span>
            </button>

            {/* Invite & Earn */}
            <button
              onClick={() => navigate('/invite')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Gift size={17} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">Invite & Earn</p>
                <p className="text-navy-400 text-xs mt-0.5">Refer friends · earn free Pro months</p>
              </div>
              <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
            </button>

            {/* App Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Settings size={17} className="text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">App Settings</p>
                <p className="text-navy-400 text-xs mt-0.5">Notifications, language, privacy</p>
              </div>
              <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogout(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors active:scale-[0.97]"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}

      {/* ── Stats Tabs (Player role only for own profile, or any role for others) ── */}
      {(role === 'player' || playerId) && (
        <>
          <div className="tab-bar mt-4 bg-white border-t border-b border-slate-100">
            {PLAYER_TABS.map(t => (
              <button key={t} className={`tab-item flex-shrink-0 ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-24">
            {/* OVERVIEW */}
            {tab === 'Overview' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'Batting Avg', val:avg(player.batting.runs, player.batting.dismissed) },
                    { label:'Strike Rate', val:sr(player.batting.runs, player.batting.innings * 22) },
                    { label:'High Score',  val:player.batting.hs },
                  ].map(s => (
                    <div key={s.label} className="stat-tile">
                      <p className="font-bold text-navy-900 text-lg tabular-nums">{s.val}</p>
                      <p className="text-navy-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 className="font-semibold text-navy-900 text-sm mb-3">Recent form (last 5 innings)</h3>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={chartData} barSize={28}>
                      <XAxis dataKey="inn" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{background:'#0f172a',border:'none',borderRadius:8,color:'#fff',fontSize:12,padding:'4px 10px'}}
                        formatter={(v, _n, props) => [`${v} runs`, props?.payload?.matchName || '']}
                        cursor={{fill:'rgba(34,197,94,0.06)'}}
                      />
                      <Bar dataKey="runs" radius={[6,6,0,0]}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.runs >= 50 ? '#22c55e' : '#e2e8f0'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'50s',   val:player.batting.fifties  },
                    { label:'100s',  val:player.batting.hundreds },
                    { label:'Ducks', val:player.batting.ducks    },
                  ].map(s => (
                    <div key={s.label} className="stat-tile">
                      <p className="font-bold text-navy-900 text-lg tabular-nums">{s.val}</p>
                      <p className="text-navy-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BATTING */}
            {tab === 'Batting' && (
              <div className="space-y-3 animate-fade-in">
                {[
                  { label:'Total Runs',       val:player.batting.runs      },
                  { label:'Innings',          val:player.batting.innings   },
                  { label:'Times Dismissed',  val:player.batting.dismissed },
                  { label:'Not Outs',         val:player.batting.notOut    },
                  { label:'Average',          val:avg(player.batting.runs, player.batting.dismissed) },
                  { label:'Strike Rate',      val:sr(player.batting.runs, player.batting.innings*22) },
                  { label:'Highest Score',    val:player.batting.hs        },
                  { label:'Fifties',          val:player.batting.fifties   },
                  { label:'Hundreds',         val:player.batting.hundreds  },
                  { label:'Ducks',            val:player.batting.ducks     },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-navy-500 text-sm">{s.label}</span>
                    <span className="font-bold text-navy-900 tabular-nums">{s.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* BOWLING */}
            {tab === 'Bowling' && (
              <div className="space-y-3 animate-fade-in">
                {[
                  { label:'Wickets',       val:player.bowling.wkts  },
                  { label:'Overs Bowled',  val:player.bowling.overs },
                  { label:'Runs Conceded', val:player.bowling.runs  },
                  { label:'Economy Rate',  val:eco(player.bowling.runs, player.bowling.overs) },
                  { label:'Average',       val:avg(player.bowling.runs, player.bowling.wkts) },
                  { label:'Best Figures',  val:player.bowling.best  },
                  { label:'3-Wkt Hauls',   val:player.bowling.threeWickets },
                  { label:'5-Wkt Hauls',   val:player.bowling.fiveWickets  },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-navy-500 text-sm">{s.label}</span>
                    <span className="font-bold text-navy-900 tabular-nums">{s.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* FIELDING */}
            {tab === 'Fielding' && (
              <div className="space-y-3 animate-fade-in">
                {[
                  { label:'Catches',         val:player.fielding.catches  },
                  { label:'Direct Run-outs', val:player.fielding.runOuts  },
                  { label:'Stumpings',       val:player.fielding.stumpings },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-navy-500 text-sm">{s.label}</span>
                    <span className="font-bold text-navy-900 tabular-nums">{s.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* MATCHES */}
            {tab === 'Matches' && (
              <div className="animate-fade-in">
                {myMatches.length === 0 ? (
                  <div className="text-center py-12 text-navy-400">
                    <Activity size={36} className="mx-auto mb-2" />
                    <p>No matches recorded yet</p>
                  </div>
                ) : myMatches.map(m => {
                  const t1  = teamById(m.team1), t2 = teamById(m.team2)
                  const inn = m.innings?.[0]
                  const batter = inn?.batters?.[player.id]
                  return (
                    <div key={m.id} className="card mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-navy-900 text-sm">{t1?.name} vs {t2?.name}</p>
                        <span className={`badge ${m.status === 'completed' ? 'badge-navy' : 'badge-live'}`}>{m.status}</span>
                      </div>
                      <p className="text-navy-400 text-xs mb-2">{m.date} · {m.overs} ov</p>
                      {batter && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="badge badge-green">{batter.runs} ({batter.balls})</span>
                          {batter.fours > 0 && <span className="text-navy-500 text-xs">{batter.fours}×4</span>}
                          {batter.sixes > 0 && <span className="text-navy-500 text-xs">{batter.sixes}×6</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* MY TEAMS */}
            {tab === 'My Teams' && (
              <div className="animate-fade-in space-y-3">
                {playerTeams.length === 0 ? (
                  <div className="text-center py-12 text-navy-400">
                    <Users size={36} className="mx-auto mb-2" />
                    <p className="font-semibold">Not in any teams yet</p>
                    <button className="btn-primary text-sm mt-4 px-5" onClick={() => navigate('/teams')}>Find a Team</button>
                  </div>
                ) : playerTeams.map(team => {
                  const isCap = team.captain === player.id
                  const totalMatches = team.wins + team.losses + team.nr
                  const winPct = totalMatches > 0 ? Math.round((team.wins / totalMatches) * 100) : 0
                  return (
                    <button key={team.id} onClick={() => navigate(`/teams/${team.id}`)} className="card card-hover w-full text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: team.color }}>
                          {initials(team.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-navy-900">{team.name}</p>
                            {isCap && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">⭐ Captain</span>}
                          </div>
                          <p className="text-navy-500 text-xs">{team.city} · {team.squad.length} players</p>
                        </div>
                        <ChevronRight size={15} className="text-navy-300 flex-shrink-0" />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {[
                          { label:'Played', val: totalMatches },
                          { label:'Won',    val: team.wins,    color:'#16a34a' },
                          { label:'Lost',   val: team.losses,  color:'#dc2626' },
                          { label:'Win%',   val: `${winPct}%`, color: winPct >= 50 ? '#16a34a' : '#dc2626' },
                        ].map(s => (
                          <div key={s.label} className="bg-slate-50 rounded-xl py-2 px-1 min-w-0">
                            <p className="font-extrabold text-sm tabular-nums truncate" style={s.color ? { color: s.color } : { color: '#0f172a' }}>{s.val}</p>
                            <p className="text-navy-400 text-[10px] leading-tight">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* Non-player roles — spacer so logout isn't cut off by bottom nav */}
      {role !== 'player' && isOwnProfile && <div className="h-24" />}

      {/* Edit Profile Sheet */}
      {showEdit && (
        <EditProfileSheet
          player={{ ...player, bio: player.bio || '' }}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Logout Confirm */}
      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  )
}
