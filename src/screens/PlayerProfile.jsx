import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PLAYERS, MATCHES, TEAMS, teamById, initials } from '../data/mock'
import { avg, sr, eco } from '../utils/cricket'
import TopBar from '../components/TopBar'
import { BarChart2, Activity, Star, Edit, Users, Trophy, X, MapPin, Check, ChevronRight, Camera } from 'lucide-react'
import { useState, useMemo, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CITIES = ['Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Kolkata','Pune','Chandigarh','Rajkot','Other']
const TABS = ['Overview','Batting','Bowling','Fielding','Matches','My Teams']

function EditProfileSheet({ player, onClose, onSave }) {
  const [name, setName]   = useState(player.name)
  const [city, setCity]   = useState(player.city)
  const [bio, setBio]     = useState(player.bio || '')

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
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
            <input
              className="cm-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">City</label>
            <select
              className="cm-select w-full"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">
              About me <span className="text-navy-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="cm-input resize-none"
              rows={3}
              placeholder="e.g. Right-arm fast bowler, 5+ years playing competitive cricket in Mumbai leagues…"
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 160))}
            />
            <p className="text-navy-400 text-xs text-right mt-0.5">{bio.length}/160</p>
          </div>
          <button
            onClick={() => { onSave({ name, city, bio }); onClose() }}
            disabled={!name.trim()}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <Check size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlayerProfile() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()
  const { playerId } = useParams()
  // If /profile/:id, show that player; else show logged-in user
  const player   = (playerId ? PLAYERS.find(p => p.id === playerId) : PLAYERS.find(p => p.id === (user?.id || 'p1'))) || PLAYERS[0]
  const isOwnProfile = !playerId || player.id === user?.id
  const [tab, setTab] = useState('Overview')
  const [showEdit, setShowEdit] = useState(false)
  const [profileOverride, setProfileOverride] = useState(null) // local edits
  const [photoUrl, setPhotoUrl] = useState(null)
  const photoRef = useRef(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  const displayPlayer = profileOverride ? { ...player, ...profileOverride } : player

  const handleSaveProfile = (edits) => {
    setProfileOverride(edits)
    if (user && isOwnProfile) {
      setUser({ ...user, name: edits.name, city: edits.city })
    }
  }
  // Which teams is this player in?
  const playerTeams = TEAMS.filter(t => t.squad.includes(player.id))
  const myMatches = MATCHES.filter(m => m.xi1?.includes(player.id) || m.xi2?.includes(player.id))

  // Dynamic chart: last ≤5 innings from real match data
  const chartData = useMemo(() => {
    const innings = MATCHES
      .filter(m => m.innings?.length > 0)
      .flatMap(m => (m.innings || []).map(inn => ({ inn, matchName: m.name })))
      .filter(({ inn }) => inn.batters?.[player.id] !== undefined)
      .map(({ inn, matchName }, i) => ({
        inn: `#${i + 1}`,
        runs: inn.batters[player.id].runs,
        matchName,
      }))
      .slice(-5)
    // Fallback if no innings recorded yet
    return innings.length > 0 ? innings : [{ inn: '—', runs: 0, matchName: 'No innings yet' }]
  }, [player.id])

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <TopBar title={isOwnProfile ? 'My Profile' : player.name.split(' ')[0] + "'s Profile"} showBack />

      {/* Profile header */}
      <div className="bg-white px-4 pt-4 pb-0 border-b border-slate-100">
        <div className="flex items-center gap-4 mb-4">
          {/* Profile avatar with photo upload */}
          <div className="relative flex-shrink-0">
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xl overflow-hidden">
              {photoUrl
                ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
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
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-navy-900 text-xl">{displayPlayer.name}</h1>
            <p className="text-navy-500 text-sm">@{player.username} · {displayPlayer.city}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {player.roles.map(r => <span key={r} className="badge badge-green text-[10px]">{r.replace('_',' ')}</span>)}
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setShowEdit(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0 hover:bg-slate-100 transition-colors"
            >
              <Edit size={16} className="text-navy-500" />
            </button>
          )}
        </div>

        {/* Teams this player is in */}
        {playerTeams.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {playerTeams.map(t => (
              <button key={t.id} onClick={() => navigate(`/teams/${t.id}`)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background: t.color}} />
                {t.name}
              </button>
            ))}
          </div>
        )}


        {/* Career summary */}
        <div className="flex gap-4 pb-4 text-center">
          {[
            { label:'Runs',    val:player.batting.runs   },
            { label:'Innings', val:player.batting.innings },
            { label:'Wickets', val:player.bowling.wkts   },
            { label:'Matches', val:myMatches.length || 4  },
          ].map(s => (
            <div key={s.label} className="flex-1">
              <p className="font-extrabold text-navy-900 text-lg tabular-nums">{s.val}</p>
              <p className="text-navy-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="tab-bar -mx-4">
          {TABS.map(t => (
            <button key={t} className={`tab-item flex-shrink-0 ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
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
                    formatter={(v, _name, props) => [`${v} runs`, props?.payload?.matchName || '']}
                    cursor={{fill:'rgba(34,197,94,0.06)'}}
                  />
                  <Bar dataKey="runs" radius={[6,6,0,0]}>
                    {chartData.map((d,i) => <Cell key={i} fill={d.runs >= 50 ? '#22c55e' : '#e2e8f0'} />)}
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
              { label:'Total Runs',    val:player.batting.runs   },
              { label:'Innings',       val:player.batting.innings },
              { label:'Times Dismissed',val:player.batting.dismissed },
              { label:'Not Outs',      val:player.batting.notOut },
              { label:'Average',       val:avg(player.batting.runs, player.batting.dismissed) },
              { label:'Strike Rate',   val:sr(player.batting.runs, player.batting.innings*22) },
              { label:'Highest Score', val:player.batting.hs     },
              { label:'Fifties',       val:player.batting.fifties },
              { label:'Hundreds',      val:player.batting.hundreds},
              { label:'Ducks',         val:player.batting.ducks  },
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
              { label:'Wickets',        val:player.bowling.wkts   },
              { label:'Overs Bowled',   val:player.bowling.overs  },
              { label:'Runs Conceded',  val:player.bowling.runs   },
              { label:'Economy Rate',   val:eco(player.bowling.runs, player.bowling.overs) },
              { label:'Average',        val:avg(player.bowling.runs, player.bowling.wkts) },
              { label:'Best Figures',   val:player.bowling.best   },
              { label:'3-Wkt Hauls',    val:player.bowling.threeWickets },
              { label:'5-Wkt Hauls',    val:player.bowling.fiveWickets  },
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
              { label:'Catches',      val:player.fielding.catches    },
              { label:'Direct Run-outs', val:player.fielding.runOuts },
              { label:'Stumpings',    val:player.fielding.stumpings  },
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
              const t1 = teamById(m.team1), t2 = teamById(m.team2)
              const inn = m.innings?.[0]
              const batter = inn?.batters?.[player.id]
              return (
                <div key={m.id} className="card mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-navy-900 text-sm">{t1?.name} vs {t2?.name}</p>
                    <span className={`badge ${m.status==='completed'?'badge-navy':'badge-live'}`}>{m.status}</span>
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
                <button className="btn-primary text-sm mt-4 px-5" onClick={() => navigate('/teams')}>
                  Find a Team
                </button>
              </div>
            ) : playerTeams.map(team => {
              const isCap = team.captain === player.id
              const totalMatches = team.wins + team.losses + team.nr
              const winPct = totalMatches > 0 ? Math.round((team.wins / totalMatches) * 100) : 0
              return (
                <button
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="card card-hover w-full text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: team.color }}
                    >
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
                  {/* Team record */}
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

      {/* Edit Profile Sheet */}
      {showEdit && (
        <EditProfileSheet
          player={displayPlayer}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}
