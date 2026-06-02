import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEAMS, TOURNAMENTS, OPEN_TEAMS_LIST, TEAM_JOIN_REQUESTS_INBOX, ROLE_META, teamById, tournamentById, initials } from '../data/mock'
import TopBar from '../components/TopBar'
import { useStore } from '../store/useStore'
import RoleLockedModal from '../components/RoleLockedModal'
import ProPaywallSheet from '../components/ProPaywallSheet'
import CreateTeamSheet from '../components/CreateTeamSheet'
import { Trophy, Users, Plus, Copy, ChevronRight, Calendar, Check, Search, X, UserPlus, Bell, CheckCircle, XCircle, Clock, Globe, Lock } from 'lucide-react'

const POSITION_TAGS = { Batsman:'bg-blue-50 text-blue-700', Bowler:'bg-green-50 text-green-700', 'All-rounder':'bg-purple-50 text-purple-700', Wicketkeeper:'bg-amber-50 text-amber-700' }
const CITIES = ['All','Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Chandigarh']

function TeamCard({ team, onClick }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(team.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={onClick} className="card card-hover w-full text-left mb-3 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{background:team.color}}>
          {initials(team.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-navy-900">{team.name}</p>
            {team.visibility === 'open' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                <Globe size={9} />Open
              </span>
            )}
          </div>
          <p className="text-navy-500 text-xs">{team.city} · {team.squad.length} players</p>
        </div>
        <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <span className="text-brand-600 font-bold">{team.wins}W</span>
          <span className="text-red-500 font-bold">{team.losses}L</span>
          {team.nr > 0 && <span className="text-navy-400 font-medium">{team.nr}NR</span>}
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold text-navy-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 hover:border-brand-400 hover:text-brand-600 transition-all">
          {copied ? <><Check size={11} className="text-brand-500" />Copied!</> : <><Copy size={11} />{team.code}</>}
        </button>
      </div>
    </button>
  )
}

function TournamentCard({ tournament, onClick }) {
  const statusStyle = { active:'badge-green', completed:'badge-navy', upcoming:'badge-blue' }
  return (
    <button onClick={onClick} className="card card-hover w-full text-left mb-3 animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-bold text-navy-900 leading-tight">{tournament.name}</p>
          <p className="text-navy-500 text-xs mt-0.5">{tournament.type} · {tournament.overs} overs</p>
        </div>
        <span className={`badge ${statusStyle[tournament.status]} flex-shrink-0`}>{tournament.status}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-navy-500">
        <div className="flex items-center gap-1"><Calendar size={12} />{tournament.startDate}</div>
        <span>·</span>
        <div className="flex items-center gap-1"><Users size={12} />{(tournament.approvedTeams?.length ?? 0)} teams</div>
        {tournament.entryFee > 0 && <><span>·</span><span>₹{Number(tournament.entryFee).toLocaleString('en-IN')} entry</span></>}
      </div>
      {tournament.prize && <p className="text-brand-600 text-xs font-medium mt-2">🏆 {tournament.prize}</p>}
    </button>
  )
}

function JoinTeamModal({ onClose, onJoin, teams }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const handleJoin = () => {
    const found = (teams || TEAMS).find(t => t.code.toUpperCase() === code.toUpperCase())
    if (!found) { setError('Invalid code. Please check with your captain.'); return }
    onJoin(found)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Join a team</h3>
        <p className="text-navy-500 text-sm mb-4">Enter the 7-character team code (e.g. MUM-7X2)</p>
        <input className={`cm-input mb-1 uppercase tracking-widest font-bold ${error?'error':''}`} placeholder="MUM-7X2" value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }} maxLength={7} autoFocus />
        {error && <p className="text-red-600 text-xs mb-3" role="alert">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleJoin} disabled={code.length < 5}>Join Team</button>
        </div>
      </div>
    </div>
  )
}

function RequestToJoinModal({ team, onClose, onSend }) {
  const [msg, setMsg] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Request to Join</h3>
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background:team.color}}>
            {initials(team.name)}
          </div>
          <div>
            <p className="font-bold text-navy-900 text-sm">{team.name}</p>
            <p className="text-navy-500 text-xs">{team.city} · {team.squadSize} of {team.maxSquad} players</p>
          </div>
        </div>
        <label className="block text-sm font-semibold text-navy-700 mb-1.5">Add a note to the captain <span className="text-navy-400 font-normal">(optional)</span></label>
        <textarea
          className="cm-input resize-none"
          rows={3}
          placeholder="e.g. Right-arm fast bowler, available all weekends, 15+ wickets this season…"
          value={msg}
          onChange={e => setMsg(e.target.value.slice(0, 100))}
        />
        <p className="text-navy-400 text-xs text-right mt-1 mb-4">{msg.length}/100</p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1 gap-2" onClick={() => { onSend(team, msg); onClose() }}>
            <UserPlus size={15} />Send Request
          </button>
        </div>
      </div>
    </div>
  )
}

function JoinRequestsSheet({ requests, onClose, onAccept, onDecline }) {
  const pending = requests.filter(r => r.status === 'pending')
  const others  = requests.filter(r => r.status !== 'pending')
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl shadow-modal animate-slide-up max-h-[85dvh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-bold text-navy-900 text-lg">Join Requests</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={14} className="text-navy-500" />
          </button>
        </div>
        <div className="px-4 pb-8">
          {pending.length === 0 && others.length === 0 && (
            <div className="text-center py-10">
              <UserPlus size={36} className="mx-auto text-navy-300 mb-3" />
              <p className="font-semibold text-navy-500">No join requests yet</p>
              <p className="text-navy-400 text-sm mt-1">Set your team to Open so players can request to join</p>
            </div>
          )}
          {pending.length > 0 && (
            <>
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">Pending ({pending.length})</p>
              <div className="space-y-3 mb-4">
                {pending.map(req => (
                  <div key={req.id} className="card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-600 font-extrabold text-sm">
                        {req.playerName.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-navy-900 text-sm">{req.playerName}</p>
                        <p className="text-navy-500 text-xs">@{req.username} · {req.city}</p>
                        {req.message && <p className="text-navy-600 text-xs mt-1.5 italic">"{req.message}"</p>}
                      </div>
                      <span className="text-navy-400 text-xs flex-shrink-0">{req.requested}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onAccept(req.id)} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-brand-600 transition-colors">
                        <CheckCircle size={14} />Accept
                      </button>
                      <button onClick={() => onDecline(req.id)} className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm flex items-center gap-1.5 hover:bg-red-100 transition-colors">
                        <XCircle size={14} />Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {others.length > 0 && (
            <>
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">Recent</p>
              <div className="space-y-2">
                {others.map(req => (
                  <div key={req.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                      {req.playerName.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-700 text-sm">{req.playerName}</p>
                      <p className="text-navy-400 text-xs">@{req.username}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${req.status==='accepted'?'bg-green-50 text-green-700':'bg-slate-100 text-slate-500'}`}>
                      {req.status === 'accepted' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Teams() {
  const navigate  = useNavigate()
  const { teamsTab, setTeamsTab, addToast, user, teamJoinRequests, addTeamJoinRequest, publishedTournaments, publishedTeams } = useStore()

  // Merge mock static data with user-published data
  const allTeams       = [...TEAMS,       ...publishedTeams]
  const allTournaments = [...TOURNAMENTS, ...publishedTournaments]
  const [showJoin, setShowJoin] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinRequests, setShowJoinRequests] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(null) // team object
  const [showPaywall, setShowPaywall] = useState(false)
  const [lockedModal, setLockedModal] = useState(null)
  const [localRequests, setLocalRequests] = useState(TEAM_JOIN_REQUESTS_INBOX.map(r => ({...r})))
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [posFilter, setPosFilter] = useState('Any')

  const role = user?.role || 'fan'
  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const canCreateTeam = ['player','organiser','admin'].includes(role)
  const canJoinTeam   = ['player','organiser','admin'].includes(role)
  const canCreateTournament = ['organiser','admin'].includes(role)
  const isCaptain = allTeams.some(t => t.captain === user?.id)

  const pendingJoinReqs = localRequests.filter(r => r.status === 'pending').length

  // Find a Team — filtered open teams
  const filteredOpenTeams = useMemo(() => {
    return OPEN_TEAMS_LIST.filter(t => {
      if (cityFilter !== 'All' && t.city !== cityFilter) return false
      if (posFilter !== 'Any' && !t.lookingFor.includes(posFilter)) return false
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.city.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [searchQuery, cityFilter, posFilter])

  const isRequested = (teamId) => teamJoinRequests.some(r => r.teamId === teamId)
  const pendingRequests = teamJoinRequests.filter(r => r.status === 'pending').length

  const handleJoinRequest = (team, message) => {
    if (!isPro && role !== 'admin') { setShowPaywall(true); return }
    if (pendingRequests >= 5) { addToast('Max 5 pending join requests at a time.', 'error'); return }
    addTeamJoinRequest(team.id, team.name, message)
    addToast(`Request sent to ${team.name}! 🏏`, 'success')
  }

  const handleAccept = (reqId) => {
    setLocalRequests(prev => prev.map(r => r.id === reqId ? {...r, status:'accepted'} : r))
    addToast('Player added to your squad!', 'success')
  }
  const handleDecline = (reqId) => {
    setLocalRequests(prev => prev.map(r => r.id === reqId ? {...r, status:'declined'} : r))
    addToast('Request declined.', 'info')
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <TopBar title="Teams & Tournaments" showBack />

      <div className="tab-bar overflow-x-auto no-scrollbar">
        <button className={`tab-item flex-shrink-0 whitespace-nowrap ${teamsTab==='teams'?'active':''}`} onClick={() => setTeamsTab('teams')}>My Teams</button>
        <button className={`tab-item flex-shrink-0 whitespace-nowrap ${teamsTab==='find'?'active':''}`} onClick={() => setTeamsTab('find')}>
          Find a Team
          {pendingRequests > 0 && <span className="ml-1.5 min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">{pendingRequests}</span>}
        </button>
        <button className={`tab-item flex-shrink-0 whitespace-nowrap ${teamsTab==='tournaments'?'active':''}`} onClick={() => setTeamsTab('tournaments')}>Tournaments</button>
      </div>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-24">

        {/* ── MY TEAMS TAB ── */}
        {teamsTab === 'teams' && (
          <>
            {/* Join Requests button for captains */}
            {(isCaptain || role === 'organiser' || role === 'admin') && (
              <button
                onClick={() => setShowJoinRequests(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl mb-4 hover:border-amber-400 transition-colors animate-fade-in"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Bell size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-navy-900 text-sm">Join Requests</p>
                  <p className="text-navy-500 text-xs">
                    {pendingJoinReqs > 0 ? `${pendingJoinReqs} pending request${pendingJoinReqs>1?'s':''}` : 'No pending requests'}
                  </p>
                </div>
                {pendingJoinReqs > 0 && (
                  <span className="min-w-[24px] h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center px-1.5">{pendingJoinReqs}</span>
                )}
                <ChevronRight size={16} className="text-navy-300 flex-shrink-0" />
              </button>
            )}

            {allTeams.length === 0 ? (
              <div className="text-center py-16">
                <Users size={40} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No teams yet</p>
                <p className="text-navy-400 text-sm mt-1">Create one or enter a join code</p>
              </div>
            ) : allTeams.map(t => (
              <TeamCard key={t.id} team={t} onClick={() => navigate(`/teams/${t.id}`)} />
            ))}

            <div className="flex gap-3 mt-2">
              {canJoinTeam ? (
                <button className="btn-secondary flex-1 gap-2" onClick={() => setShowJoin(true)}>
                  <Users size={16} />Join with code
                </button>
              ) : (
                <button className="btn-secondary flex-1 gap-2 opacity-50" onClick={() => setLockedModal({ feature:'Join Team', eligibleRoles:['player','organiser'] })}>
                  <Users size={16} />Join with code
                </button>
              )}
              {canCreateTeam ? (
                <button className="btn-primary flex-1 gap-2" onClick={() => setShowCreateTeam(true)}>
                  <Plus size={16} />Create team
                </button>
              ) : (
                <button className="btn-secondary flex-1 gap-2 opacity-50" onClick={() => setLockedModal({ feature:'Create Team', eligibleRoles:['player','organiser'] })}>
                  <Plus size={16} />Create team
                </button>
              )}
            </div>
          </>
        )}

        {/* ── FIND A TEAM TAB ── */}
        {teamsTab === 'find' && (
          <>
            {/* Request limit indicator */}
            {pendingRequests > 0 && (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-4 animate-fade-in ${pendingRequests >= 5 ? 'bg-red-50 border border-red-200' : 'bg-brand-50 border border-brand-200'}`}>
                <Clock size={15} className={pendingRequests >= 5 ? 'text-red-500' : 'text-brand-500'} />
                <p className={`text-sm font-semibold flex-1 ${pendingRequests >= 5 ? 'text-red-700' : 'text-brand-700'}`}>
                  {pendingRequests}/5 pending requests
                  {pendingRequests >= 5 && ' — limit reached'}
                </p>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="cm-input pl-10 h-11" placeholder="Search teams or cities…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {/* City filter chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
              {CITIES.map(c => (
                <button key={c} className={`filter-chip flex-shrink-0 ${cityFilter===c?'active':''}`} onClick={() => setCityFilter(c)}>
                  {c === 'All' ? 'All Cities' : c}
                </button>
              ))}
            </div>

            {/* Position filter chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
              {['Any','Batsman','Bowler','All-rounder','Wicketkeeper'].map(p => (
                <button key={p} className={`filter-chip flex-shrink-0 ${posFilter===p?'active':''}`} onClick={() => setPosFilter(p)}>
                  {p === 'Any' ? 'Any Position' : p}
                </button>
              ))}
            </div>

            <p className="text-navy-500 text-sm mb-3 font-medium">{filteredOpenTeams.length} open team{filteredOpenTeams.length !== 1 ? 's' : ''}</p>

            {filteredOpenTeams.length === 0 ? (
              <div className="text-center py-16">
                <Users size={40} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No open teams found</p>
                <p className="text-navy-400 text-sm mt-1">Try different filters or another city</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOpenTeams.map(team => {
                  const requested = isRequested(team.id)
                  const spotsLeft = team.maxSquad - team.squadSize
                  return (
                    <div key={team.id} className="card animate-fade-in">
                      {/* Team header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background:team.color}}>
                          {initials(team.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-navy-900">{team.name}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                              <Globe size={9} />Open
                            </span>
                          </div>
                          <p className="text-navy-500 text-xs mt-0.5">{team.city} · {team.squadSize}/{team.maxSquad} players · {team.wins}W {team.losses}L</p>
                        </div>
                        <p className="text-navy-400 text-xs flex-shrink-0">{team.lastActive}</p>
                      </div>

                      {/* Looking for tags */}
                      {team.lookingFor.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="text-navy-400 text-xs self-center">Looking for:</span>
                          {team.lookingFor.map(pos => (
                            <span key={pos} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${POSITION_TAGS[pos] || 'bg-slate-100 text-slate-600'}`}>{pos}</span>
                          ))}
                        </div>
                      )}

                      {/* Spots + CTA */}
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-navy-400">
                          <span className="font-semibold text-navy-700">{spotsLeft}</span> spot{spotsLeft !== 1 ? 's' : ''} remaining
                        </p>
                        {requested ? (
                          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="text-green-700 text-xs font-semibold">Request Sent</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!isPro && role !== 'admin') { setShowPaywall(true); return }
                              if (pendingRequests >= 5) { addToast('Max 5 pending requests at a time.', 'error'); return }
                              setShowRequestModal(team)
                            }}
                            disabled={pendingRequests >= 5 && isPro}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                              pendingRequests >= 5 && isPro
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-brand-500 text-white hover:bg-brand-600'
                            }`}
                          >
                            <UserPlus size={14} />
                            {isPro || role === 'admin' ? 'Request to Join' : 'Join ✦ Pro'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── TOURNAMENTS TAB ── */}
        {teamsTab === 'tournaments' && (
          <>
            {allTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Trophy size={40} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No tournaments yet</p>
              </div>
            ) : allTournaments.map(tr => (
              <TournamentCard key={tr.id} tournament={tr} onClick={() => navigate(`/tournaments/${tr.id}`)} />
            ))}
            {canCreateTournament && (
              <button className="btn-primary w-full gap-2 mt-1" onClick={() => navigate('/create-tournament')}>
                <Plus size={16} />Create tournament
              </button>
            )}
          </>
        )}
      </main>

      {/* Modals & Sheets */}
      {showJoin && (
        <JoinTeamModal
          teams={allTeams}
          onClose={() => setShowJoin(false)}
          onJoin={(team) => addToast(`Joined ${team.name}!`, 'success')}
        />
      )}

      {showRequestModal && (
        <RequestToJoinModal
          team={showRequestModal}
          onClose={() => setShowRequestModal(null)}
          onSend={handleJoinRequest}
        />
      )}

      {showJoinRequests && (
        <JoinRequestsSheet
          requests={localRequests}
          onClose={() => setShowJoinRequests(false)}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {showPaywall && (
        <ProPaywallSheet
          featureName="Browse Open Teams"
          featureDesc="Find open teams in your city and request to join — no join code needed. Available with Pro."
          onClose={() => setShowPaywall(false)}
        />
      )}

      {lockedModal && (
        <RoleLockedModal
          currentRole={role}
          featureName={lockedModal.feature}
          eligibleRoles={lockedModal.eligibleRoles}
          onClose={() => setLockedModal(null)}
        />
      )}
      {showCreateTeam && (
        <CreateTeamSheet onClose={() => setShowCreateTeam(false)} />
      )}
    </div>
  )
}
