import { useState } from 'react'
import { useStore } from '../store/useStore'
import { OPEN_TOURNAMENTS_LIST, TEAMS } from '../data/mock'
import TopBar from '../components/TopBar'
import ProPaywallSheet from '../components/ProPaywallSheet'
import { Trophy, Calendar, MapPin, Users, IndianRupee, CheckCircle, AlertCircle, Circle, Gift, UserCheck, X, Check, ChevronRight, Crown, ArrowRight } from 'lucide-react'

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

// ─── Team Join Modal (Captain flow) ──────────────────────────────────────────
function TeamJoinModal({ tournament, team, onClose, onSend }) {
  const [note, setNote] = useState('')
  const [agreed, setAgreed] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-modal animate-slide-up max-h-[88dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-navy-900">Join as a Team</h2>
            <p className="text-navy-500 text-xs mt-0.5">{tournament.name} · {tournament.city}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={14} className="text-navy-500" /></button>
        </div>
        <div className="px-5 py-4 pb-8">
          {/* Team info card */}
          <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
              <span className="font-extrabold text-white text-base">{team?.name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy-900 text-sm truncate">{team?.name}</p>
              <p className="text-navy-400 text-xs">{team?.squad?.length || 11} players · You are the Captain</p>
            </div>
            <Crown size={16} className="text-amber-500 fill-amber-400 flex-shrink-0" />
          </div>

          {/* Message to organiser */}
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">
            Message to organiser <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <textarea
            className="cm-input resize-none mb-1"
            rows={3}
            placeholder="Tell the organiser about your team — achievements, experience, availability…"
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 200))}
          />
          <p className="text-navy-400 text-xs text-right mb-4">{note.length}/200</p>

          {/* Eligibility checkbox */}
          <button
            onClick={() => setAgreed(v => !v)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 mb-5 text-sm font-medium text-left transition-all ${agreed ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-slate-200 text-navy-600 hover:border-slate-300'}`}>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${agreed ? 'border-brand-500 bg-brand-500' : 'border-slate-300'}`}>
              {agreed && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            Our team meets all tournament eligibility criteria
          </button>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-5 text-xs text-blue-700">
            The organiser will review your request within 48 hours. You'll be notified once accepted.
          </div>

          <button
            onClick={() => { onSend(tournament, note); onClose() }}
            disabled={!agreed}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Send Team Join Request 🏆
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Player Choice Modal — how do you want to join? ───────────────────────────
function PlayerChoiceModal({ tournament, onFreeAgent, onAsTeam, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
          <Users size={22} className="text-brand-500" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg mb-1">How do you want to join?</h3>
        <p className="text-navy-500 text-sm mb-5 truncate">{tournament.name}</p>

        <div className="space-y-3 mb-4">
          {/* As a Team */}
          <button onClick={onAsTeam}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-brand-200 bg-brand-50 hover:bg-brand-100 active:scale-[0.98] transition-all text-left">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trophy size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-brand-800 text-sm">As a Team</p>
              <p className="text-brand-600 text-xs">Join with your team — switch to Captain role</p>
            </div>
            <ChevronRight size={16} className="text-brand-400 flex-shrink-0" />
          </button>

          {/* As a Free Agent */}
          <button onClick={onFreeAgent}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 active:scale-[0.98] transition-all text-left">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy-800 text-sm">As a Free Agent</p>
              <p className="text-navy-500 text-xs">Join individually, get invited to a team</p>
            </div>
            <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
          </button>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-xl border border-slate-200 text-navy-500 text-sm font-semibold">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Switch to Captain Sheet ──────────────────────────────────────────────────
function SwitchToCaptainSheet({ tournament, onSwitch, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up px-6 pt-5 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)' }}>
          <Crown size={28} className="text-amber-500 fill-amber-400" />
        </div>
        <h3 className="font-bold text-navy-900 text-lg text-center mb-2">Switch to Captain Role</h3>
        <p className="text-navy-500 text-sm text-center leading-relaxed mb-5">
          To join <strong className="text-navy-800">{tournament.name}</strong> as a team, switch to <strong className="text-navy-800">Captain</strong> role.
          You can switch back to Player from Settings anytime.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 mb-6">
          <p className="font-bold text-amber-900 text-sm mb-2">As Captain you can:</p>
          <ul className="space-y-1 text-xs text-amber-800">
            <li className="flex items-center gap-2"><ArrowRight size={11} className="flex-shrink-0"/>Request to join tournaments with your team</li>
            <li className="flex items-center gap-2"><ArrowRight size={11} className="flex-shrink-0"/>Manage squad, bookings and match scheduling</li>
            <li className="flex items-center gap-2"><ArrowRight size={11} className="flex-shrink-0"/>Appear as a verified Captain profile</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 font-semibold text-sm text-navy-600">
            Stay as Player
          </button>
          <button onClick={onSwitch}
            className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
            Switch to Captain 👑
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OpenTournaments() {
  const { user, tournamentRequests, addTournamentRequest,
          freeAgentRequests, addFreeAgentRequest, addToast, setRole } = useStore()
  const [showPaywall, setShowPaywall]         = useState(false)
  const [freeAgentModal, setFreeAgentModal]   = useState(null)
  const [teamJoinModal, setTeamJoinModal]     = useState(null)   // captain flow
  const [playerChoiceModal, setPlayerChoiceModal] = useState(null) // player: how to join?
  const [switchRoleSheet, setSwitchRoleSheet] = useState(null)   // player → captain switch

  const role    = user?.role || 'fan'
  const isPro   = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isPlayer  = role === 'player'
  const isCaptain = role === 'captain'
  const isCaptainOrOrganiser = isCaptain || role === 'organiser' || role === 'admin' || TEAMS.some(t => t.captain === user?.id)

  const pendingTeamCount = tournamentRequests.filter(r => r.status === 'pending').length
  const pendingFACount   = freeAgentRequests.filter(r => r.status === 'submitted').length

  // Demo: use first team the user is associated with
  const myTeam = TEAMS[0]

  const handleTeamRequest = (tournament, _note) => {
    if (!isPro) { setShowPaywall(true); return }
    if (pendingTeamCount >= MAX_TEAM_REQUESTS) { addToast(`Max ${MAX_TEAM_REQUESTS} pending join requests at a time.`, 'error'); return }
    const alreadySent = tournamentRequests.some(r => r.tournamentId === tournament.id)
    if (alreadySent) return
    addTournamentRequest(tournament.id, tournament.name, myTeam.id, myTeam.name)
    addToast(`Join request sent for ${tournament.name}! 🏆`, 'success')
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
            <p className="text-purple-700 text-sm font-medium">Browsing as <span className="font-bold">Individual Player</span> — join as free agent or switch to Captain to join as a team</p>
          </div>
        )}
        {isCaptain && (
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 mb-4 animate-fade-in">
            <Crown size={15} className="text-amber-500 fill-amber-400 flex-shrink-0" />
            <p className="text-brand-700 text-sm font-medium">Browsing as <span className="font-bold">Captain</span> — request to join tournaments with <span className="font-bold">{myTeam.name}</span></p>
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
                  {isCaptain ? (
                    // Captain: team join CTA
                    !teamRequested ? (
                      <button
                        onClick={() => {
                          if (!isPro) { setShowPaywall(true); return }
                          if (pendingTeamCount >= MAX_TEAM_REQUESTS) { addToast('Max 5 pending requests at a time.', 'error'); return }
                          setTeamJoinModal(t)
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                      >
                        {isPro ? 'Request to Join' : 'Join ✦ Pro'}
                      </button>
                    ) : (
                      <span className="text-xs text-navy-400 italic flex-shrink-0">Awaiting review</span>
                    )
                  ) : isPlayer ? (
                    // Player: choice CTA (team or free agent)
                    !faRequested ? (
                      t.acceptingFreeAgents ? (
                        <button
                          onClick={() => {
                            if (!isPro) { setShowPaywall(true); return }
                            setPlayerChoiceModal(t)
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
                    // Organiser/Admin: direct team request
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

      {/* Captain: Team Join Modal */}
      {teamJoinModal && (
        <TeamJoinModal
          tournament={teamJoinModal}
          team={myTeam}
          onClose={() => setTeamJoinModal(null)}
          onSend={handleTeamRequest}
        />
      )}

      {/* Player: How do you want to join? */}
      {playerChoiceModal && (
        <PlayerChoiceModal
          tournament={playerChoiceModal}
          onFreeAgent={() => { setFreeAgentModal(playerChoiceModal); setPlayerChoiceModal(null) }}
          onAsTeam={() => { setSwitchRoleSheet(playerChoiceModal); setPlayerChoiceModal(null) }}
          onClose={() => setPlayerChoiceModal(null)}
        />
      )}

      {/* Player → Captain role switch sheet */}
      {switchRoleSheet && (
        <SwitchToCaptainSheet
          tournament={switchRoleSheet}
          onSwitch={() => {
            setRole('captain')
            addToast('Switched to Captain! You can now join as a team. 👑', 'success')
            setTeamJoinModal(switchRoleSheet)
            setSwitchRoleSheet(null)
          }}
          onClose={() => setSwitchRoleSheet(null)}
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
