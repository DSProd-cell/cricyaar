import { useState } from 'react'
import { useStore } from '../store/useStore'
import { OPEN_TOURNAMENTS_LIST, TEAMS } from '../data/mock'
import TopBar from '../components/TopBar'
import ProPaywallSheet from '../components/ProPaywallSheet'
import { Trophy, Calendar, MapPin, Users, IndianRupee, CheckCircle, AlertCircle, Circle, Gift, UserCheck, X, Check } from 'lucide-react'

const MAX_TEAM_REQUESTS = 5
const MAX_FREE_AGENT_REQUESTS = 5
const FORMAT_COLORS = { T20:'bg-brand-50 text-brand-700', T10:'bg-purple-50 text-purple-700' }
const POSITIONS = ['Batsman','Bowler','All-rounder','Wicketkeeper']

function FreeAgentModal({ tournament, onClose, onSend }) {
  const [positions, setPositions] = useState([])
  const [note, setNote] = useState('')

  const togglePos = (pos) => {
    setPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-modal animate-slide-up max-h-[85dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-bold text-navy-900">Join as a Free Agent</h2>
            <p className="text-navy-500 text-xs mt-0.5">{tournament.name} · {tournament.city}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={14} className="text-navy-500" /></button>
        </div>
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-navy-700">Your playing position(s) *</label>
            <span className="text-xs text-navy-400">Select all that apply</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {POSITIONS.map(pos => {
              const selected = positions.includes(pos)
              return (
                <button
                  key={pos}
                  onClick={() => togglePos(pos)}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    selected
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-navy-600 hover:border-slate-300'
                  }`}
                >
                  {selected && <CheckCircle size={14} className="text-brand-500 flex-shrink-0" />}
                  {pos}
                </button>
              )
            })}
          </div>
          {positions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 px-1">
              <span className="text-xs text-navy-400">Selected:</span>
              {positions.map(p => (
                <span key={p} className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
          )}
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">Add a note <span className="text-navy-400 font-normal">(optional)</span></label>
          <textarea
            className="cm-input resize-none mb-1"
            rows={3}
            placeholder="e.g. Right-arm medium pace, available all weekends, 15 wickets this season…"
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 150))}
          />
          <p className="text-navy-400 text-xs text-right mb-5">{note.length}/150</p>
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 mb-4 text-xs text-purple-700">
            The organiser may invite you to a registered team. You can accept or decline their offer.
          </div>
          <button
            onClick={() => { onSend(tournament, positions.join(', '), note); onClose() }}
            disabled={positions.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Register Interest as Free Agent
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OpenTournaments() {
  const { user, tournamentRequests, addTournamentRequest,
          freeAgentRequests, addFreeAgentRequest, addToast } = useStore()
  const [showPaywall, setShowPaywall] = useState(false)
  const [freeAgentModal, setFreeAgentModal] = useState(null)

  const role = user?.role || 'fan'
  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isPlayer = role === 'player'
  const isCaptainOrOrganiser = role === 'organiser' || role === 'admin' || TEAMS.some(t => t.captain === user?.id)

  const pendingTeamCount = tournamentRequests.filter(r => r.status === 'pending').length
  const pendingFACount   = freeAgentRequests.filter(r => r.status === 'submitted').length

  // Demo: use first team the user is associated with
  const myTeam = TEAMS[0]

  const handleTeamRequest = (tournament) => {
    if (!isPro) { setShowPaywall(true); return }
    if (pendingTeamCount >= MAX_TEAM_REQUESTS) { addToast(`Max ${MAX_TEAM_REQUESTS} pending join requests at a time.`, 'error'); return }
    const alreadySent = tournamentRequests.some(r => r.tournamentId === tournament.id)
    if (alreadySent) return
    addTournamentRequest(tournament.id, tournament.name, myTeam.id, myTeam.name)
    addToast(`Join request sent for ${tournament.name}!`, 'success')
  }

  const handleFreeAgentRequest = (tournament, position, note) => {
    if (!isPro) { setShowPaywall(true); return }
    if (pendingFACount >= MAX_FREE_AGENT_REQUESTS) { addToast(`Max ${MAX_FREE_AGENT_REQUESTS} free agent requests at a time.`, 'error'); return }
    const alreadySent = freeAgentRequests.some(r => r.tournamentId === tournament.id)
    if (alreadySent) return
    addFreeAgentRequest(tournament.id, tournament.name, position, note)
    addToast(`Interest registered for ${tournament.name}! 🏏`, 'success')
  }

  const isTeamRequested = (tournamentId) => tournamentRequests.some(r => r.tournamentId === tournamentId)
  const isFARequested   = (tournamentId) => freeAgentRequests.some(r => r.tournamentId === tournamentId)

  const pendingCount = isPlayer ? pendingFACount : pendingTeamCount
  const maxRequests  = isPlayer ? MAX_FREE_AGENT_REQUESTS : MAX_TEAM_REQUESTS

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title={isPlayer ? 'Browse Tournaments' : 'Join Tournaments'} showBack />
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">

        {/* Mode indicator */}
        {isPlayer && (
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 mb-4 animate-fade-in">
            <UserCheck size={15} className="text-purple-600 flex-shrink-0" />
            <p className="text-purple-700 text-sm font-medium">Browsing as <span className="font-bold">Free Agent</span> — register interest and wait for a team invite</p>
          </div>
        )}

        {/* Request limit indicator */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 animate-fade-in ${
          pendingCount >= maxRequests ? 'bg-red-50 border border-red-200'
            : pendingCount > 0 ? 'bg-amber-50 border border-amber-200'
            : 'bg-slate-50 border border-slate-200'
        }`}>
          <AlertCircle size={16} className={pendingCount >= maxRequests ? 'text-red-500' : pendingCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${pendingCount >= maxRequests ? 'text-red-700' : pendingCount > 0 ? 'text-amber-800' : 'text-navy-600'}`}>
              {pendingCount} / {maxRequests} pending requests
            </p>
            <p className="text-xs text-navy-400 mt-0.5">
              {isPlayer ? 'Organisers review free agent requests' : 'Organisers review within 48 hours'}
            </p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Circle key={i} size={7} className={i < pendingCount ? 'text-brand-500 fill-brand-500' : 'text-slate-300 fill-slate-300'} />
            ))}
          </div>
        </div>

        {/* Requesting as (team only) */}
        {!isPlayer && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-xs text-navy-400">Requesting as</span>
            <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-200">{myTeam.name}</span>
          </div>
        )}

        {/* Tournament cards */}
        <div className="space-y-3 animate-slide-up">
          {OPEN_TOURNAMENTS_LIST.map(t => {
            const teamRequested = isTeamRequested(t.id)
            const faRequested   = isFARequested(t.id)
            const spotsLeft     = t.spotsTotal - t.spotsTaken
            const almostFull    = spotsLeft <= 2
            const showFABadge   = t.acceptingFreeAgents && isPlayer
            return (
              <div key={t.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[t.format] || 'bg-slate-100 text-slate-600'}`}>{t.format} · {t.overs} ov</span>
                      {almostFull && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{spotsLeft} spot{spotsLeft!==1?'s':''} left!</span>}
                      {showFABadge && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">Free Agents Welcome</span>}
                    </div>
                    <p className="font-bold text-navy-900 text-sm leading-tight">{t.name}</p>
                  </div>
                  {(teamRequested || faRequested) && (
                    <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                      <CheckCircle size={13} className="text-green-600" />
                      <span className="text-green-700 text-xs font-semibold">Requested</span>
                    </div>
                  )}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 mb-3">
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs"><MapPin size={11} className="text-navy-400 flex-shrink-0" /><span>{t.city}</span></div>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs"><Calendar size={11} className="text-navy-400 flex-shrink-0" /><span>Starts {t.startDate}</span></div>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs"><Users size={11} className="text-navy-400 flex-shrink-0" /><span>{t.spotsTaken}/{t.spotsTotal} teams</span></div>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs"><IndianRupee size={11} className="text-navy-400 flex-shrink-0" /><span>₹{t.entryFee.toLocaleString('en-IN')} entry</span></div>
                </div>

                {/* Prize */}
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 mb-3">
                  <Gift size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="text-amber-800 text-xs font-semibold">{t.prize}</span>
                </div>

                {/* Organiser + action */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-navy-400 truncate">By <span className="font-medium text-navy-600">{t.organiser}</span></p>
                  {isPlayer ? (
                    // Player: free agent CTA
                    !faRequested ? (
                      t.acceptingFreeAgents ? (
                        <button
                          onClick={() => {
                            if (!isPro) { setShowPaywall(true); return }
                            if (pendingFACount >= MAX_FREE_AGENT_REQUESTS) { addToast('Max 5 free agent requests at a time.', 'error'); return }
                            setFreeAgentModal(t)
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                        >
                          {isPro ? 'Register Interest' : 'Register ✦ Pro'}
                        </button>
                      ) : (
                        <span className="text-xs text-navy-400 italic">Not accepting free agents</span>
                      )
                    ) : (
                      <span className="text-xs text-navy-400 italic flex-shrink-0">Interest registered</span>
                    )
                  ) : (
                    // Captain/Organiser: team join CTA
                    !teamRequested ? (
                      <button
                        onClick={() => handleTeamRequest(t)}
                        disabled={pendingTeamCount >= MAX_TEAM_REQUESTS && isPro}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-colors ${
                          pendingTeamCount >= MAX_TEAM_REQUESTS && isPro ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600'
                        }`}
                      >
                        {isPro ? 'Request to Join' : 'Join ✦ Pro'}
                      </button>
                    ) : (
                      <span className="text-xs text-navy-400 italic flex-shrink-0">Awaiting review</span>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {freeAgentModal && (
        <FreeAgentModal
          tournament={freeAgentModal}
          onClose={() => setFreeAgentModal(null)}
          onSend={handleFreeAgentRequest}
        />
      )}

      {showPaywall && (
        <ProPaywallSheet
          featureName={isPlayer ? 'Free agent requests' : 'Tournament join requests'}
          featureDesc={isPlayer
            ? 'Register as a free agent in tournaments and get invited to teams. Available with Pro.'
            : 'Request to join open tournaments as a captain. Pro members can have up to 5 active requests.'}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  )
}
