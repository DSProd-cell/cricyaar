import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { ORGANISER_INBOX_DATA } from '../data/mock'
import TopBar from '../components/TopBar'
import { UserCheck, Trophy, Star, Check, X, Clock, CheckCircle, XCircle, Inbox, Calendar } from 'lucide-react'

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star size={11} className="text-amber-400 fill-amber-400" />
      <span className="text-xs font-semibold text-navy-700">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function OrganiserInbox() {
  const { organiserInboxUnread, clearOrganiserInbox, addToast } = useStore()
  const [tab, setTab] = useState('umpire') // 'umpire' | 'teams' | 'tournament_umpires'

  // Local state for inbox items (assign / decline / accept / reject)
  const [umpireItems, setUmpireItems] = useState(
    ORGANISER_INBOX_DATA.umpireRequests.map(r => ({ ...r }))
  )
  const [teamItems, setTeamItems] = useState(
    ORGANISER_INBOX_DATA.tournamentRequests.map(r => ({ ...r }))
  )
  const [tournamentUmpireItems, setTournamentUmpireItems] = useState(
    ORGANISER_INBOX_DATA.tournamentUmpireRequests.map(r => ({ ...r }))
  )

  // Clear unread on mount (one-time)
  useEffect(() => { clearOrganiserInbox() }, [])

  const handleUmpireAction = (id, action) => {
    setUmpireItems(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
    if (action === 'assigned')  addToast('Umpire assigned to match!', 'success')
    if (action === 'declined') addToast('Umpire request declined.', 'info')
  }

  const handleTeamAction = (id, action) => {
    setTeamItems(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
    if (action === 'accepted') addToast('Team accepted into tournament!', 'success')
    if (action === 'rejected') addToast('Team request rejected.', 'info')
  }

  const handleTournamentUmpireAction = (id, action) => {
    setTournamentUmpireItems(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
    if (action === 'assigned') addToast('Umpire assigned to tournament! 🏆', 'success')
    if (action === 'declined') addToast('Tournament umpire request declined.', 'info')
  }

  const umpirePending          = umpireItems.filter(r => r.status === 'pending').length
  const teamPending            = teamItems.filter(r => r.status === 'pending').length
  const tournamentUmpirePending = tournamentUmpireItems.filter(r => r.status === 'pending').length
  const allDone = tab === 'umpire' ? umpirePending === 0
    : tab === 'teams' ? teamPending === 0
    : tournamentUmpirePending === 0

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Organiser Inbox" showBack />
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-24">

        {/* Tab switcher */}
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-5 animate-fade-in">
          <button
            onClick={() => setTab('umpire')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab==='umpire' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
          >
            <UserCheck size={13} />Umpires
            {umpirePending > 0 && <span className="min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">{umpirePending}</span>}
          </button>
          <button
            onClick={() => setTab('teams')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab==='teams' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
          >
            <Trophy size={13} />Teams
            {teamPending > 0 && <span className="min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">{teamPending}</span>}
          </button>
          <button
            onClick={() => setTab('tournament_umpires')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab==='tournament_umpires' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
          >
            <Calendar size={13} />Tourney Umpires
            {tournamentUmpirePending > 0 && <span className="min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">{tournamentUmpirePending}</span>}
          </button>
        </div>

        {/* All done empty state */}
        {allDone && (
          <div className="card text-center py-10 animate-fade-in">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} className="text-green-500" />
            </div>
            <p className="font-bold text-navy-900 mb-1">All caught up!</p>
            <p className="text-navy-400 text-sm">No pending {tab === 'umpire' ? 'umpire' : 'team'} requests right now.</p>
          </div>
        )}

        {/* Umpire Requests */}
        {tab === 'umpire' && (
          <div className="space-y-3 animate-slide-up">
            {umpireItems.map(req => (
              <div key={req.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <span className="font-extrabold text-brand-600 text-sm">
                        {req.umpireName.split(' ').map(w => w[0]).join('').slice(0,2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-navy-900 text-sm">{req.umpireName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={req.rating} />
                        <span className="text-navy-400 text-xs">·</span>
                        <span className="text-navy-500 text-xs">{req.matches} matches</span>
                        <span className="text-navy-400 text-xs">·</span>
                        <span className="text-navy-500 text-xs">{req.city}</span>
                      </div>
                    </div>
                  </div>
                  {/* Status badge */}
                  {req.status !== 'pending' && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      req.status === 'assigned' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {req.status === 'assigned'
                        ? <><CheckCircle size={11} /> Assigned</>
                        : <><XCircle size={11} /> Declined</>
                      }
                    </span>
                  )}
                  {req.status === 'pending' && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
                      <Clock size={11} /> Pending
                    </span>
                  )}
                </div>

                {/* Match info */}
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-xs text-navy-500 mb-0.5">Requesting for</p>
                  <p className="font-semibold text-navy-900 text-sm">{req.matchName}</p>
                  <p className="text-navy-400 text-xs">{req.date}</p>
                </div>

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUmpireAction(req.id, 'assigned')}
                      className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-brand-600 transition-colors"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      Assign
                    </button>
                    <button
                      onClick={() => handleUmpireAction(req.id, 'declined')}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-navy-600 font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tournament Umpire Requests */}
        {tab === 'tournament_umpires' && (
          <div className="space-y-3 animate-slide-up">
            {tournamentUmpireItems.map(req => (
              <div key={req.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <span className="font-extrabold text-amber-600 text-sm">
                        {req.umpireName.split(' ').map(w => w[0]).join('').slice(0,2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-navy-900 text-sm">{req.umpireName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={req.rating} />
                        <span className="text-navy-400 text-xs">·</span>
                        <span className="text-navy-500 text-xs">{req.matches} matches</span>
                        <span className="text-navy-400 text-xs">·</span>
                        <span className="text-navy-500 text-xs">{req.city}</span>
                      </div>
                    </div>
                  </div>
                  {req.status !== 'pending' && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${req.status==='assigned' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {req.status==='assigned' ? <><CheckCircle size={11}/> Assigned</> : <><XCircle size={11}/> Declined</>}
                    </span>
                  )}
                  {req.status === 'pending' && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
                      <Clock size={11}/> Pending
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-2">
                  <p className="text-xs text-navy-500 mb-0.5">Requesting for</p>
                  <p className="font-semibold text-navy-900 text-sm">{req.tournamentName}</p>
                  <p className="text-navy-400 text-xs mt-0.5">{req.certifications}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-navy-500 mb-1.5">Available dates:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {req.availableDates.map((d, i) => (
                      <span key={i} className="text-xs font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{d}</span>
                    ))}
                  </div>
                </div>
                {req.note && <p className="text-xs text-navy-500 italic mb-3">"{req.note}"</p>}
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTournamentUmpireAction(req.id, 'assigned')}
                      className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-brand-600 transition-colors"
                    >
                      <Check size={14} strokeWidth={2.5} />Assign to Tournament
                    </button>
                    <button
                      onClick={() => handleTournamentUmpireAction(req.id, 'declined')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-navy-600 font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <X size={14} />Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Team Requests */}
        {tab === 'teams' && (
          <div className="space-y-3 animate-slide-up">
            {teamItems.map(req => (
              <div key={req.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Trophy size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900 text-sm">{req.teamName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-navy-500 text-xs">Cap: {req.captainName}</span>
                        <span className="text-navy-400 text-xs">·</span>
                        <span className="text-navy-500 text-xs">{req.city}</span>
                        <span className="text-navy-400 text-xs">·</span>
                        <span className="text-navy-500 text-xs font-medium">{req.record}</span>
                      </div>
                    </div>
                  </div>
                  {/* Status badge */}
                  {req.status !== 'pending' && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      req.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {req.status === 'accepted'
                        ? <><CheckCircle size={11} /> Accepted</>
                        : <><XCircle size={11} /> Rejected</>
                      }
                    </span>
                  )}
                  {req.status === 'pending' && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
                      <Clock size={11} /> Pending
                    </span>
                  )}
                </div>

                {/* Tournament info */}
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-xs text-navy-500 mb-0.5">Requesting to join</p>
                  <p className="font-semibold text-navy-900 text-sm">{req.tournamentName}</p>
                  <p className="text-navy-400 text-xs">Received {req.requested}</p>
                </div>

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTeamAction(req.id, 'accepted')}
                      className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-brand-600 transition-colors"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleTeamAction(req.id, 'rejected')}
                      className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors flex items-center gap-1.5"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
