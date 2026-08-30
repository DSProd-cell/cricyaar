import { useState } from 'react'
import { useStore } from '../store/useStore'
import { OPEN_MATCHES, UMPIRE_OPEN_TOURNAMENTS } from '../data/mock'
import TopBar from '../components/TopBar'
import ProPaywallSheet from '../components/ProPaywallSheet'
import { Calendar, MapPin, Clock, CheckCircle, Circle, AlertCircle, Trophy, Users, ChevronDown, ChevronUp, X } from 'lucide-react'

const MAX_MATCH_REQUESTS = 3
const MAX_TOURNAMENT_REQUESTS = 2

const FORMAT_COLORS = {
  T20: 'bg-brand-50 text-brand-700',
  T10: 'bg-purple-50 text-purple-700',
  ODI: 'bg-amber-50 text-amber-700',
}

function TournamentRequestModal({ tournament, onClose, onSend }) {
  const [selectedDates, setSelectedDates] = useState(tournament.upcomingMatchDates.map(() => true))
  const [note, setNote] = useState('')
  const toggleDate = (i) => setSelectedDates(prev => prev.map((v, idx) => idx === i ? !v : v))
  const confirmed = tournament.upcomingMatchDates.filter((_, i) => selectedDates[i])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-modal animate-slide-up max-h-[88dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-bold text-navy-900">Request: Full Tournament</h2>
            <p className="text-navy-500 text-xs mt-0.5">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={14} className="text-navy-500" /></button>
        </div>
        <div className="px-5 pb-8">
          <p className="text-sm font-semibold text-navy-700 mb-2">Confirm your availability</p>
          <p className="text-navy-400 text-xs mb-3">Tick the dates you can officiate:</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {tournament.upcomingMatchDates.map((date, i) => (
              <button
                key={i}
                onClick={() => toggleDate(i)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  selectedDates[i]
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-navy-500'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedDates[i] ? 'border-brand-500 bg-brand-500' : 'border-slate-300'}`}>
                  {selectedDates[i] && <CheckCircle size={10} className="text-white" />}
                </div>
                {date}
              </button>
            ))}
          </div>
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">Add a note <span className="text-navy-400 font-normal">(optional)</span></label>
          <textarea
            className="cm-input resize-none mb-1"
            rows={2}
            placeholder="e.g. Available all days. BCCI Level 2 certified."
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 150))}
          />
          <p className="text-navy-400 text-xs text-right mb-4">{note.length}/150</p>
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-4">
            <p className="text-xs text-navy-500">{confirmed.length} date{confirmed.length !== 1 ? 's' : ''} confirmed: <span className="font-semibold text-navy-700">{confirmed.join(', ') || 'None selected'}</span></p>
          </div>
          <button
            onClick={() => { onSend(tournament, 'full', confirmed, note); onClose() }}
            disabled={confirmed.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send Full Tournament Request
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BrowseOpenMatches() {
  const { user, umpireRequests, addUmpireRequest, withdrawUmpireRequest,
          umpireTournamentRequests, addUmpireTournamentRequest, withdrawUmpireTournamentRequest, addToast } = useStore()
  const [tab, setTab] = useState('matches')
  const [showPaywall, setShowPaywall] = useState(false)
  const [requestModal, setRequestModal] = useState(null)
  const [expandedTournament, setExpandedTournament] = useState(null)

  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const pendingMatchCount = umpireRequests.filter(r => r.status === 'pending').length
  const pendingTournamentCount = umpireTournamentRequests.filter(r => r.status === 'pending').length

  const handleMatchRequest = (match) => {
    if (!isPro) { setShowPaywall(true); return }
    if (pendingMatchCount >= MAX_MATCH_REQUESTS) { addToast(`Max ${MAX_MATCH_REQUESTS} pending requests at a time.`, 'error'); return }
    addUmpireRequest(match.id, match.name)
    addToast('Umpire request sent!', 'success')
  }

  const handleWithdraw = (matchId) => {
    withdrawUmpireRequest(matchId)
    addToast('Request withdrawn.', 'info')
  }

  const isMatchRequested = (matchId) => umpireRequests.some(r => r.matchId === matchId)
  const isTournamentRequested = (tournamentId) => umpireTournamentRequests.some(r => r.tournamentId === tournamentId)

  const handleTournamentRequest = (tournament, type, dates, note) => {
    if (!isPro) { setShowPaywall(true); return }
    if (type === 'full' && pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS) {
      addToast(`Max ${MAX_TOURNAMENT_REQUESTS} full tournament requests at a time.`, 'error'); return
    }
    addUmpireTournamentRequest(tournament.id, tournament.name, type)
    addToast(type === 'full' ? `Full tournament request sent for ${tournament.name}!` : `Match requests sent for ${tournament.name}!`, 'success')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Browse as Umpire" />

      {/* Tab switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mx-4 mt-3 mb-0 animate-fade-in gap-1">
        <button
          onClick={() => setTab('matches')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab==='matches' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
        >
          <Calendar size={15} />Open Matches
          {pendingMatchCount > 0 && <span className="min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">{pendingMatchCount}</span>}
        </button>
        <button
          onClick={() => setTab('tournaments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab==='tournaments' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}
        >
          <Trophy size={15} />Tournaments
          {pendingTournamentCount > 0 && <span className="min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">{pendingTournamentCount}</span>}
        </button>
      </div>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">

        {/* ── OPEN MATCHES TAB ── */}
        {tab === 'matches' && (
          <>
            {/* Request limit indicator */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 animate-fade-in ${
              pendingMatchCount >= MAX_MATCH_REQUESTS ? 'bg-red-50 border border-red-200'
                : pendingMatchCount > 0 ? 'bg-amber-50 border border-amber-200'
                : 'bg-slate-50 border border-slate-200'
            }`}>
              <AlertCircle size={16} className={pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-500' : pendingMatchCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-700' : pendingMatchCount > 0 ? 'text-amber-800' : 'text-navy-600'}`}>
                  {pendingMatchCount} / {MAX_MATCH_REQUESTS} pending requests
                </p>
                <p className={`text-xs mt-0.5 ${pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-600' : 'text-navy-400'}`}>
                  {pendingMatchCount >= MAX_MATCH_REQUESTS ? 'Withdraw a request before sending a new one' : 'Organisers will contact you if selected'}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {Array.from({ length: MAX_MATCH_REQUESTS }).map((_, i) => (
                  <Circle key={i} size={8} className={i < pendingMatchCount ? 'text-brand-500 fill-brand-500' : 'text-slate-300 fill-slate-300'} />
                ))}
              </div>
            </div>

            <div className="space-y-3 animate-slide-up">
              {OPEN_MATCHES.map(match => {
                const requested = isMatchRequested(match.id)
                return (
                  <div key={match.id} className="card">
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[match.format] || 'bg-slate-100 text-slate-600'}`}>{match.format} · {match.overs} ov</span>
                        </div>
                        <p className="font-bold text-navy-900 text-sm leading-tight">{match.teams}</p>
                      </div>
                      {requested && (
                        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                          <CheckCircle size={13} className="text-green-600" />
                          <span className="text-green-700 text-xs font-semibold">Requested</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-navy-500 text-xs">
                        <Calendar size={12} className="flex-shrink-0 text-navy-400" /><span>{match.date}</span>
                        <Clock size={12} className="flex-shrink-0 text-navy-400 ml-1" /><span>{match.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-navy-500 text-xs">
                        <MapPin size={12} className="flex-shrink-0 text-navy-400" /><span className="truncate">{match.ground}, {match.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-navy-400">By <span className="font-medium text-navy-600">{match.organiser}</span></p>
                      {requested ? (
                        <button onClick={() => handleWithdraw(match.id)} className="text-red-500 text-xs font-semibold hover:text-red-700 transition-colors">Withdraw</button>
                      ) : (
                        <button
                          onClick={() => handleMatchRequest(match)}
                          disabled={pendingMatchCount >= MAX_MATCH_REQUESTS && isPro}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            pendingMatchCount >= MAX_MATCH_REQUESTS && isPro ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600'
                          }`}
                        >
                          {isPro ? 'Request to Umpire' : 'Request ✦ Pro'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── TOURNAMENTS TAB ── */}
        {tab === 'tournaments' && (
          <>
            {/* Request limit indicator */}
            {pendingTournamentCount > 0 && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 animate-fade-in ${pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                <AlertCircle size={16} className={pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS ? 'text-red-500' : 'text-amber-500'} />
                <p className={`text-sm font-semibold flex-1 ${pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS ? 'text-red-700' : 'text-amber-800'}`}>
                  {pendingTournamentCount}/{MAX_TOURNAMENT_REQUESTS} full-tournament requests pending
                </p>
              </div>
            )}

            <div className="space-y-3 animate-slide-up">
              {UMPIRE_OPEN_TOURNAMENTS.map(tournament => {
                const slotsLeft = tournament.totalUmpireSlots - tournament.umpireSlotsFilled
                const requested = isTournamentRequested(tournament.id)
                const isExpanded = expandedTournament === tournament.id
                return (
                  <div key={tournament.id} className="card">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[tournament.format] || 'bg-slate-100 text-slate-600'}`}>{tournament.format} · {tournament.overs} ov</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tournament.status==='live' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                            {tournament.status === 'live' ? '🔴 Live' : '🟢 Upcoming'}
                          </span>
                        </div>
                        <p className="font-bold text-navy-900 text-sm leading-tight">{tournament.name}</p>
                        <p className="text-navy-500 text-xs mt-0.5">{tournament.city} · by {tournament.organiser}</p>
                      </div>
                      {requested && (
                        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                          <CheckCircle size={13} className="text-green-600" />
                          <span className="text-green-700 text-xs font-semibold">Requested</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-navy-500">
                      <div className="flex items-center gap-1"><Calendar size={11} />{tournament.startDate} – {tournament.endDate}</div>
                      <span>·</span>
                      <span><span className="font-semibold text-navy-700">{slotsLeft}</span> umpire slot{slotsLeft!==1?'s':''} open</span>
                    </div>

                    {/* Matches preview */}
                    <button
                      onClick={() => setExpandedTournament(isExpanded ? null : tournament.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors mb-3"
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {isExpanded ? 'Hide' : 'Show'} match schedule ({tournament.matches.length} upcoming)
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-2">
                        {tournament.matches.map(m => (
                          <div key={m.id} className="flex items-center gap-2 text-xs">
                            <span className="text-navy-400 font-medium w-12 flex-shrink-0">{m.date}</span>
                            <span className="text-navy-700 font-semibold flex-1 truncate">{m.teams}</span>
                            <span className="text-navy-400 truncate">{m.ground}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    {!requested && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!isPro) { setShowPaywall(true); return }
                            if (pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS) { addToast('Max 2 full tournament requests at a time.', 'error'); return }
                            setRequestModal(tournament)
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors"
                        >
                          {isPro ? 'Request: Full Tournament' : 'Request ✦ Pro'}
                        </button>
                        <button
                          onClick={() => {
                            if (!isPro) { setShowPaywall(true); return }
                            handleTournamentRequest(tournament, 'specific', [], '')
                          }}
                          className="px-3 py-2.5 rounded-xl bg-slate-100 text-navy-700 font-semibold text-sm hover:bg-slate-200 transition-colors flex-shrink-0 text-xs"
                        >
                          Specific Matches
                        </button>
                      </div>
                    )}
                    {requested && (
                      <button
                        onClick={() => { withdrawUmpireTournamentRequest(tournament.id); addToast('Request withdrawn.', 'info') }}
                        className="text-red-500 text-xs font-semibold hover:text-red-700 transition-colors"
                      >
                        Withdraw request
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      {requestModal && (
        <TournamentRequestModal
          tournament={requestModal}
          onClose={() => setRequestModal(null)}
          onSend={handleTournamentRequest}
        />
      )}

      {showPaywall && (
        <ProPaywallSheet
          featureName="Umpire requests"
          featureDesc="Request to umpire matches and tournaments. Pro members can have up to 3 match requests and 2 full-tournament requests active."
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  )
}
