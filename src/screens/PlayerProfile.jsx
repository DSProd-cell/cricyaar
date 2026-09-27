import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PLAYERS, MATCHES, TEAMS, teamById, initials } from '../data/mock'
import { avg, sr, eco } from '../utils/cricket'
import { supabase } from '../lib/supabase'
import { uploadAvatar } from '../lib/uploads'
import TopBar from '../components/TopBar'
import { getRoleColor, CAN_COLLECT, NEEDS_AADHAAR } from '../lib/roleColors'
import { resetSplash } from '../components/SplashOverlay'
import IplTeamPicker from './IplTeamPicker'
import ShareAchievement from '../components/ShareAchievement'
import {
  BarChart2, Activity, Users, Trophy, X, MapPin, Check, ChevronRight, Camera,
  Edit, LogOut, ShieldCheck, Crown, Gift, Settings, Wallet, ArrowUpRight,
  Swords, ClipboardList, Scale, Megaphone, Building2, Star, Sun, Moon, Zap,
} from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function realProfileShape(user) {
  return {
    id: user?.id,
    name: user?.username || user?.name || 'Cricketer',
    username: user?.username || '',
    city: user?.city || '',
    bio: user?.bio || '',
    roles: user?.roles?.length ? user.roles : [user?.role || 'fan'],
    batting:  { runs: 0, innings: 0, dismissed: 0, notOut: 0, hs: 0, fifties: 0, hundreds: 0, ducks: 0 },
    bowling:  { wkts: 0, overs: 0, runs: 0, best: '—', threeWickets: 0, fiveWickets: 0 },
    fielding: { catches: 0, runOuts: 0, stumpings: 0 },
  }
}

const CITIES = ['Bengaluru']
const PLAYER_TABS = ['Overview','Batting','Bowling','Fielding','Matches','My Teams']

// ─── Edit Profile Sheet ──────────────────────────────────────────────────────
function EditProfileSheet({ player, onClose, onSave }) {
  const [name, setName]     = useState(player.name)
  const [city, setCity]     = useState('Bengaluru')
  const [bio, setBio]       = useState(player.bio || '')
  const [saving, setSaving] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-[var(--cy-surface)] rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
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
            <div className="cm-input flex items-center justify-between bg-slate-50 cursor-not-allowed select-none">
              <span className="font-semibold text-navy-800">Bengaluru</span>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2 py-0.5 uppercase tracking-wide">Live</span>
            </div>
            <p className="text-navy-400 text-xs mt-1">Currently available in Bengaluru only.</p>
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
function IplTeamProfileRow({ roleColor, onPress }) {
  const { iplTeam } = useStore()
  const [teamData, setTeamData] = useState(null)
  useEffect(() => {
    if (iplTeam) {
      import('../lib/iplTeams').then(m => setTeamData(m.getTeamById(iplTeam)))
    } else {
      setTeamData(null)
    }
  }, [iplTeam])
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
      style={{ borderBottom: `1px solid ${roleColor.border}` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
        background: teamData ? `linear-gradient(135deg,${teamData.darkBg},${teamData.midBg})` : '#f1f5f9',
        border: teamData ? `1px solid ${teamData.primary}55` : 'none',
      }}>
        <span style={{ fontSize: 18, lineHeight:1 }}>{teamData ? teamData.emoji : '🏏'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy-900 text-sm">Favourite IPL Team</p>
        <p className="text-navy-400 text-xs mt-0.5">
          {teamData ? <span style={{ color: teamData.primary, fontWeight:700 }}>{teamData.name}</span> : 'Not chosen yet — tap to see the Magic!'}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
    </button>
  )
}

function LogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[var(--cy-surface)] rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in text-center" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <LogOut size={20} className="text-red-600" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Sign Out?</h3>
        <p className="text-navy-500 text-sm mb-5">You'll need to verify your phone number again to sign back in.</p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
          <button className="btn-danger flex-1" onClick={onConfirm}>Sign Out</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PlayerProfile() {
  const { user, setUser, logout, addToast, themeMode, setThemeMode, publishedTeams, triggerShare } = useStore()
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
  const [showSignOut, setShowSignOut] = useState(false)
  const [showTeamPicker, setShowTeamPicker] = useState(false)
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

  const handleSignOut = () => {
    if (user?.role) localStorage.setItem('cricyaar_last_role', user.role)
    logout()
    resetSplash()
    navigate('/welcome')
    addToast('Signed out successfully', 'info')
  }

  // Teams: mock data + published teams (created in-app) + Supabase team_members
  const [liveTeams, setLiveTeams] = useState([])
  const [liveMatches, setLiveMatches] = useState([])

  useEffect(() => {
    if (!isOwnProfile || !user?.id) return
    // Fetch teams from Supabase team_members table
    supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data?.length) {
          const teamIds = data.map(r => r.team_id)
          // Check in publishedTeams for matching IDs
          const found = (publishedTeams || []).filter(t =>
            teamIds.includes(t.id) || t.captain === user.id || (t.squad || []).includes(user.id)
          )
          setLiveTeams(found)
        }
      })
    // Fetch recent matches from Supabase
    supabase
      .from('matches')
      .select('*')
      .or(`team1.eq.${user.id},team2.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data?.length) setLiveMatches(data) })
  }, [isOwnProfile, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // For own profile: combine mock + published + live from Supabase
  const allTeams   = [...TEAMS, ...(publishedTeams || [])]
  const playerTeams = isOwnProfile
    ? [
        ...allTeams.filter(t => (t.squad || []).includes(player.id) || t.captain === player.id),
        ...liveTeams.filter(lt => !allTeams.find(at => at.id === lt.id)),
      ]
    : allTeams.filter(t => (t.squad || []).includes(player.id))
  const myMatches = isOwnProfile
    ? [
        ...MATCHES.filter(m => m.xi1?.includes(player.id) || m.xi2?.includes(player.id)),
        ...liveMatches.filter(lm => !MATCHES.find(mm => mm.id === lm.id)),
      ]
    : MATCHES.filter(m => m.xi1?.includes(player.id) || m.xi2?.includes(player.id))

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
      <TopBar title={isOwnProfile ? 'My Profile' : player.name.split(' ')[0] + "'s Profile"} showBack />

      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <div className="bg-[var(--cy-surface)] relative">
        {/* Role-colored gradient banner */}
        <div
          className="relative h-[130px] overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom} 0%, ${roleColor.gradientTo} 100%)` }}
        >
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px)',
                'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px)',
              ].join(', '),
            }}
          />
          {/* Radial glow bottom center */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 140%, rgba(255,255,255,0.18) 0%, transparent 70%)' }} />
          {/* Large decorative emoji top-right */}
          <div className="absolute -right-2 -top-2 text-[80px] opacity-10 select-none pointer-events-none leading-none">{roleColor.emoji}</div>
          {/* Edit button top-right */}
          {isOwnProfile && (
            <button
              onClick={() => setShowEdit(true)}
              className="absolute top-3 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 border border-white/25 hover:bg-white/30 transition-colors backdrop-blur-sm"
              aria-label="Edit profile"
            >
              <Edit size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* Profile info */}
        <div className="px-4 pb-5">
          {/* Avatar overlapping banner */}
          <div className="relative" style={{ marginTop: -44 }}>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <div
              className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl overflow-hidden"
              style={{
                background: roleColor.primary,
                boxShadow: `0 0 0 3px white, 0 4px 16px ${roleColor.primary}55`,
              }}
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
                className="absolute -bottom-1 left-[60px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white hover:opacity-90 transition-opacity"
                style={{ background: roleColor.primary }}
                aria-label="Change profile photo"
              >
                <Camera size={11} className="text-white" />
              </button>
            )}
          </div>

          {/* Name / username / role tags */}
          <div className="mt-3">
            <h1 className="font-black text-navy-900 text-[22px] leading-tight tracking-tight">{player.name}</h1>
            {player.username && <p className="text-navy-400 text-sm mt-0.5 font-medium">@{player.username}</p>}

            {/* All roles — active/most-used first */}
            {(() => {
              const activeR = isOwnProfile
                ? (localStorage.getItem('cy_active_role') || role)
                : (player.roles?.[0] || 'player')
              const allRoles = isOwnProfile
                ? Array.from(new Set([activeR, ...(user?.roles || [role])].filter(r => r !== 'fan')))
                : Array.from(new Set(player.roles?.filter(r => r !== 'fan') || [activeR]))
              return (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {allRoles.map((r, idx) => {
                    const rc = getRoleColor(r)
                    const isActive = r === activeR
                    return (
                      <div
                        key={r}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{
                          background: isActive ? rc.primary : rc.light,
                          color: isActive ? '#fff' : rc.primary,
                          border: `1.5px solid ${isActive ? rc.primary : rc.border}`,
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{rc.emoji}</span>
                        <span>{rc.label}</span>
                        {isActive && <span className="ml-0.5 opacity-80 text-[9px] font-semibold">· Active</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {(player.city || (user?.phone && isOwnProfile)) && (
              <p className="text-navy-400 text-xs mt-1.5 flex items-center gap-1">
                {player.city && <><MapPin size={10} className="flex-shrink-0" />{player.city}</>}
                {player.city && user?.phone && isOwnProfile && <span className="mx-1">·</span>}
                {user?.phone && isOwnProfile && <span>{user.phone}</span>}
              </p>
            )}
            {player.bio && (
              <p className="text-navy-600 text-sm mt-2 leading-snug">{player.bio}</p>
            )}
          </div>

          {/* Teams pills */}
          {playerTeams.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {playerTeams.map(t => (
                <button key={t.id} onClick={() => navigate(`/teams/${t.id}`)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--cy-surface)] hover:opacity-80 transition-opacity"
                  style={{ border: `1px solid ${roleColor.border}`, color: roleColor.primary }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────────── */}
      <div className="mx-4 mt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: roleColor.primary }}>
          Quick Stats
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
          <div className="grid grid-cols-4">
            {quickStats.map((s, i) => (
              <div
                key={s.label}
                className="py-4 text-center"
                style={i < 3 ? { borderRight: `1px solid ${roleColor.border}` } : undefined}
              >
                <p className="font-extrabold text-lg tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                <p className="text-navy-400 text-[10px] mt-1.5 uppercase tracking-wide leading-tight px-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Payment Summary ──────────────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="mx-4 mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: roleColor.primary }}>
            Payment Summary
          </p>
          <div className="bg-[var(--cy-surface)] rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${roleColor.border}` }}>
            <button
              onClick={() => navigate('/receive-money')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
              style={{ borderBottom: `1px solid ${roleColor.border}` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.12)' }}>
                <Wallet size={17} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">Payments Received</p>
                <p className="text-navy-400 text-xs mt-0.5">View all incoming payments</p>
              </div>
              <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
            </button>
            <button
              onClick={() => navigate('/send-money')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(234,179,8,0.12)' }}>
                <ArrowUpRight size={17} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">Payments Made</p>
                <p className="text-navy-400 text-xs mt-0.5">View all outgoing payments</p>
              </div>
              <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
            </button>
          </div>
        </div>
      )}

      {/* ── Others ───────────────────────────────────────────────────────── */}
      <div className="mx-4 mt-4 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: roleColor.primary }}>
          Others
        </p>
        <div className="bg-[var(--cy-surface)] rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${roleColor.border}` }}>
          <ShareAchievement
            title={`${roleColor.label} Performance · ${player.name}`}
            stats={quickStats.map(s => ({ label: s.label, value: String(s.val) }))}
            asListItem
            label="Share Achievement"
            sublabel="Celebrate your milestones with friends"
            borderColor={roleColor.border}
            primaryColor={roleColor.primary}
            lightBg={roleColor.light}
          />
          <button
            onClick={() => triggerShare({
              title: `${roleColor.label} Performance · ${player.name}`,
              stats: quickStats.map(s => ({ label: s.label, value: String(s.val) })),
            })}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: roleColor.light }}>
              <BarChart2 size={17} style={{ color: roleColor.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy-900 text-sm">Share Performance</p>
              <p className="text-navy-400 text-xs mt-0.5">Post your stats card to social media</p>
            </div>
            <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
          </button>
        </div>
      </div>

      {/* ── Account Management ───────────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="mx-4 mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: roleColor.primary }}>
            Account
          </p>
          <div className="bg-[var(--cy-surface)] rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${roleColor.border}` }}>

            {/* KYC — gated to organiser/umpire/ground_owner */}
            {needsAadhaar && (
              user?.kycStatus === 'approved' ? (
                /* Approved state */
                <div className="w-full flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${roleColor.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dcfce7' }}>
                    <ShieldCheck size={17} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm">KYC Verification</p>
                    <p className="text-xs mt-0.5 text-green-600 font-semibold">✓ Verified</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg flex-shrink-0">Done</span>
                </div>
              ) : user?.kycStatus === 'pending' ? (
                /* Pending admin review */
                <div className="w-full flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${roleColor.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7' }}>
                    <ShieldCheck size={17} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm">KYC Verification</p>
                    <p className="text-xs mt-0.5 text-amber-600 font-semibold">⏳ Pending admin review</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex-shrink-0">Pending</span>
                </div>
              ) : user?.kycStatus === 'rejected' ? (
                /* Rejected — allow re-submission */
                <button onClick={() => navigate('/aadhaar-verify')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left" style={{ borderBottom: `1px solid ${roleColor.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2' }}>
                    <ShieldCheck size={17} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm">KYC Verification</p>
                    <p className="text-xs mt-0.5 text-red-500 font-semibold">✗ Rejected — tap to resubmit</p>
                  </div>
                  <ChevronRight size={16} className="text-red-400 flex-shrink-0" />
                </button>
              ) : (
                /* Not submitted yet */
                <button onClick={() => navigate('/aadhaar-verify')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left" style={{ borderBottom: `1px solid ${roleColor.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: roleColor.light }}>
                    <ShieldCheck size={17} style={{ color: roleColor.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm">KYC Verification</p>
                    <p className="text-navy-400 text-xs mt-0.5">Required to collect payments</p>
                  </div>
                  <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
                </button>
              )
            )}

            {/* CricYaar Pro */}
            <button
              onClick={() => navigate('/pro')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
              style={{ borderBottom: `1px solid ${roleColor.border}` }}
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
                    ? isCancelled ? 'Cancelling soon · manage plan' : 'Active · ₹1/mo'
                    : 'Tournaments, career stats, scoring · ₹1/mo'
                  }
                </p>
              </div>
              {isPro
                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50 flex-shrink-0">Active</span>
                : <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Upgrade</span>
              }
            </button>

            {/* Invite & Earn */}
            <button
              onClick={() => navigate('/invite')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
              style={{ borderBottom: `1px solid ${roleColor.border}` }}
            >
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Gift size={17} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">Invite & Earn</p>
                <p className="text-navy-400 text-xs mt-0.5">Refer friends · earn free Pro months</p>
              </div>
              <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
            </button>

            {/* Favourite IPL Team */}
            <IplTeamProfileRow roleColor={roleColor} onPress={() => setShowTeamPicker(true)} />

            {/* Fetch Past Record */}
            <button
              onClick={() => navigate('/fetch-past-record')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
              style={{ borderBottom: `1px solid ${roleColor.border}` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <span style={{ fontSize: 17 }}>🏏</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">Fetch Past Record</p>
                <p className="text-navy-400 text-xs mt-0.5">Link your old matches & career history</p>
              </div>
              <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
            </button>

            {/* Theme */}
            <div
              className="w-full px-4 py-4"
              style={{ borderBottom: `1px solid ${roleColor.border}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: roleColor.light }}>
                  {(themeMode || 'auto') === 'dark'
                    ? <Moon size={17} style={{ color: roleColor.primary }} />
                    : (themeMode || 'auto') === 'light'
                      ? <Sun size={17} style={{ color: roleColor.primary }} />
                      : <Zap size={17} style={{ color: roleColor.primary }} />
                  }
                </div>
                <p className="font-semibold text-navy-900 text-sm">App Theme</p>
              </div>
              <div className="flex rounded-xl overflow-hidden" style={{ border: `1.5px solid ${roleColor.border}`, background: roleColor.light }}>
                {[
                  { id: 'light', icon: <Sun size={13} />, label: 'Light' },
                  { id: 'auto',  icon: <Zap size={13} />,  label: 'Auto'  },
                  { id: 'dark',  icon: <Moon size={13} />, label: 'Dark'  },
                ].map(opt => {
                  const active = (themeMode || 'auto') === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setThemeMode(opt.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-bold transition-all"
                      style={{
                        background: active ? roleColor.primary : 'transparent',
                        color: active ? '#fff' : roleColor.primary,
                        borderRadius: 8,
                      }}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* App Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: roleColor.light }}>
                <Settings size={17} style={{ color: roleColor.primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm">App Settings</p>
                <p className="text-navy-400 text-xs mt-0.5">Notifications, language, privacy</p>
              </div>
              <ChevronRight size={16} style={{ color: roleColor.primary }} className="flex-shrink-0 opacity-60" />
            </button>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => setShowSignOut(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors active:scale-[0.97]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}

      {/* ── Stats Tabs (Player role only for own profile, or any role for others) ── */}
      {(role === 'player' || playerId) && (
        <>
          <div className="sticky top-0 z-10 bg-[var(--cy-surface)] flex overflow-x-auto"
            style={{ borderBottom: `2px solid var(--cy-border)`, scrollbarWidth: 'none' }}>
            {PLAYER_TABS.map(t => {
              const active = tab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-shrink-0 px-4 py-3 text-[13px] whitespace-nowrap transition-colors"
                  style={{
                    color: active ? roleColor.primary : 'var(--cy-muted)',
                    fontWeight: active ? 700 : 500,
                    borderBottom: active ? `2.5px solid ${roleColor.primary}` : '2.5px solid transparent',
                    marginBottom: -2,
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-24">
            {/* OVERVIEW */}
            {tab === 'Overview' && (
              <div className="space-y-3 animate-fade-in">
                {/* Key batting stats */}
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <div className="grid grid-cols-3">
                    {[
                      { label:'Batting Avg', val:avg(player.batting.runs, player.batting.dismissed) },
                      { label:'Strike Rate', val:sr(player.batting.runs, player.batting.innings * 22) },
                      { label:'High Score',  val:player.batting.hs },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center py-4 px-2"
                        style={i < 2 ? { borderRight: `1px solid ${roleColor.border}` } : undefined}>
                        <p className="font-black text-[22px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[10px] font-semibold mt-1.5 text-center leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent form chart */}
                <div className="bg-[var(--cy-surface)] rounded-2xl p-4" style={{ border: `1.5px solid ${roleColor.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-navy-900 text-sm">Recent Form</h3>
                    <span className="text-[10px] font-semibold text-navy-400">Last 5 innings</span>
                  </div>
                  {chartData.every(d => d.runs === 0) ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-1">
                      <BarChart2 size={28} className="opacity-20" style={{ color: roleColor.primary }} />
                      <p className="text-navy-400 text-xs font-medium mt-1">No innings recorded yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="inn" tick={{fontSize:11,fill:'#94a3b8',fontWeight:600}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{background:'#0f172a',border:'none',borderRadius:10,color:'#fff',fontSize:12,padding:'6px 12px'}}
                          formatter={(v, _n, props) => [`${v} runs`, props?.payload?.matchName || '']}
                          cursor={{fill:'rgba(124,58,237,0.06)'}}
                        />
                        <Bar dataKey="runs" radius={[6,6,2,2]}>
                          {chartData.map((d, i) => <Cell key={i} fill={d.runs >= 50 ? '#22c55e' : d.runs > 0 ? roleColor.primary : roleColor.border} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Milestones row */}
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-3 pb-1" style={{ color: roleColor.primary }}>Milestones</p>
                  <div className="grid grid-cols-3 pb-2">
                    {[
                      { label:'Fifties',  val:player.batting.fifties,  icon:'🏅' },
                      { label:'Hundreds', val:player.batting.hundreds, icon:'💯' },
                      { label:'Ducks',    val:player.batting.ducks,    icon:'🦆' },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center py-3 px-2"
                        style={i < 2 ? { borderRight: `1px solid ${roleColor.border}` } : undefined}>
                        <span className="text-lg leading-none mb-1">{s.icon}</span>
                        <p className="font-black text-[20px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[10px] font-semibold mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total runs highlight */}
                <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}>
                  <div>
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Total Runs</p>
                    <p className="font-black text-white text-[32px] tabular-nums leading-tight">{player.batting.runs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Innings</p>
                    <p className="font-black text-white text-[32px] tabular-nums leading-tight">{player.batting.innings}</p>
                  </div>
                </div>
              </div>
            )}

            {/* BATTING */}
            {tab === 'Batting' && (
              <div className="space-y-3 animate-fade-in">
                {/* Hero banner */}
                <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}>
                  <div>
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Total Runs</p>
                    <p className="font-black text-white text-[32px] tabular-nums leading-tight">{player.batting.runs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Average</p>
                    <p className="font-black text-white text-[32px] tabular-nums leading-tight">{avg(player.batting.runs, player.batting.dismissed)}</p>
                  </div>
                </div>
                {/* Core stats grid */}
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-3 pb-1" style={{ color: roleColor.primary }}>Core Stats</p>
                  <div className="grid grid-cols-2 pb-2">
                    {[
                      { label:'Innings',         val:player.batting.innings   },
                      { label:'Highest Score',   val:player.batting.hs        },
                      { label:'Strike Rate',     val:sr(player.batting.runs, player.batting.innings*22) },
                      { label:'Not Outs',        val:player.batting.notOut    },
                      { label:'Times Dismissed', val:player.batting.dismissed },
                      { label:'Ducks',           val:player.batting.ducks     },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col px-4 py-3"
                        style={{
                          borderRight: i % 2 === 0 ? `1px solid ${roleColor.border}` : undefined,
                          borderTop: i >= 2 ? `1px solid ${roleColor.border}` : undefined,
                        }}>
                        <p className="font-black text-[20px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[11px] font-semibold mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Milestones */}
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-3 pb-1" style={{ color: roleColor.primary }}>Milestones</p>
                  <div className="grid grid-cols-2 pb-2">
                    {[
                      { label:'Fifties',  val:player.batting.fifties,  icon:'🏅' },
                      { label:'Hundreds', val:player.batting.hundreds, icon:'💯' },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center py-4"
                        style={i === 0 ? { borderRight: `1px solid ${roleColor.border}` } : undefined}>
                        <span className="text-xl leading-none mb-1">{s.icon}</span>
                        <p className="font-black text-[24px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[11px] font-semibold mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BOWLING */}
            {tab === 'Bowling' && (
              <div className="space-y-3 animate-fade-in">
                {/* Hero banner */}
                <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}>
                  <div>
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Wickets</p>
                    <p className="font-black text-white text-[32px] tabular-nums leading-tight">{player.bowling.wkts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Economy</p>
                    <p className="font-black text-white text-[32px] tabular-nums leading-tight">{eco(player.bowling.runs, player.bowling.overs)}</p>
                  </div>
                </div>
                {/* Core stats grid */}
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-3 pb-1" style={{ color: roleColor.primary }}>Core Stats</p>
                  <div className="grid grid-cols-2 pb-2">
                    {[
                      { label:'Overs Bowled',  val:player.bowling.overs },
                      { label:'Runs Conceded', val:player.bowling.runs  },
                      { label:'Average',       val:avg(player.bowling.runs, player.bowling.wkts) },
                      { label:'Best Figures',  val:player.bowling.best  },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col px-4 py-3"
                        style={{
                          borderRight: i % 2 === 0 ? `1px solid ${roleColor.border}` : undefined,
                          borderTop: i >= 2 ? `1px solid ${roleColor.border}` : undefined,
                        }}>
                        <p className="font-black text-[20px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[11px] font-semibold mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hauls */}
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-3 pb-1" style={{ color: roleColor.primary }}>Hauls</p>
                  <div className="grid grid-cols-2 pb-2">
                    {[
                      { label:'3-Wkt Hauls', val:player.bowling.threeWickets, icon:'⚡' },
                      { label:'5-Wkt Hauls', val:player.bowling.fiveWickets,  icon:'🔥' },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center py-4"
                        style={i === 0 ? { borderRight: `1px solid ${roleColor.border}` } : undefined}>
                        <span className="text-xl leading-none mb-1">{s.icon}</span>
                        <p className="font-black text-[24px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[11px] font-semibold mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FIELDING */}
            {tab === 'Fielding' && (
              <div className="space-y-3 animate-fade-in">
                <div className="rounded-2xl overflow-hidden" style={{ background: roleColor.light, border: `1.5px solid ${roleColor.border}` }}>
                  <div className="grid grid-cols-3">
                    {[
                      { label:'Catches',     val:player.fielding.catches,   icon:'🤝' },
                      { label:'Run-outs',    val:player.fielding.runOuts,   icon:'🎯' },
                      { label:'Stumpings',   val:player.fielding.stumpings, icon:'🏏' },
                    ].map((s, i) => (
                      <div key={s.label} className="flex flex-col items-center py-5"
                        style={i < 2 ? { borderRight: `1px solid ${roleColor.border}` } : undefined}>
                        <span className="text-xl leading-none mb-2">{s.icon}</span>
                        <p className="font-black text-[26px] tabular-nums leading-none" style={{ color: roleColor.primary }}>{s.val}</p>
                        <p className="text-navy-500 text-[11px] font-semibold mt-1.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
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

      {/* Sign Out Confirm */}
      {showSignOut && (
        <LogoutModal
          onCancel={() => setShowSignOut(false)}
          onConfirm={handleSignOut}
        />
      )}

      {/* IPL Team Picker — full-screen overlay, no navigation */}
      {showTeamPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8500, overflowY: 'auto' }}>
          <IplTeamPicker onDone={() => setShowTeamPicker(false)} />
        </div>
      )}
    </div>
  )
}
