import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import {
  MATCHES, UMPIRE_PROFILE, OPEN_MATCHES, UMPIRE_OPEN_TOURNAMENTS,
  UMPIRE_GROUND_VISITS, UMPIRE_MY_REQUESTS, teamById
} from '../data/mock'
import TopBar from '../components/TopBar'
import ProPaywallSheet from '../components/ProPaywallSheet'
import MatchScoreSheet from '../components/MatchScoreSheet'
import {
  Eye, BarChart2, Calendar, Send, Star, MapPin, Clock,
  CheckCircle, Circle, AlertCircle, ChevronRight, Shield,
  Activity, Trophy, Users, ChevronDown, ChevronUp, X,
  Navigation, Home, Bell, BadgeCheck, XCircle, Loader,
  ArrowRight
} from 'lucide-react'

// ── Format helpers ────────────────────────────────────────────────────────────
const FORMAT_COLORS = {
  T20: 'bg-brand-50 text-brand-700',
  T10: 'bg-purple-50 text-purple-700',
}
const STATUS_COLORS = {
  approved: { bg:'bg-green-50',  border:'border-green-200', text:'text-green-700',  icon: BadgeCheck,  label:'Approved' },
  rejected: { bg:'bg-red-50',   border:'border-red-200',   text:'text-red-700',    icon: XCircle,     label:'Rejected' },
  pending:  { bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-700',  icon: Loader,      label:'Pending'  },
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — MY ASSIGNMENTS
// ══════════════════════════════════════════════════════════════════════════════
function MyAssignments({ navigate, addToast }) {
  const upcoming  = UMPIRE_PROFILE.assignments.filter(a => a.status === 'upcoming')
  const completed = UMPIRE_PROFILE.assignments.filter(a => a.status === 'completed')
  const liveMatch = MATCHES.find(m => m.status === 'live')
  const [tossAssignment, setTossAssignment] = useState(null)
  const [scoreMatch, setScoreMatch]         = useState(null)

  const StarRating = ({ n }) => (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11} className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </span>
  )

  return (
    <>
    <div className="space-y-4 animate-slide-up">

      {/* Live match banner — Score Now access */}
      {liveMatch && (
        <button
          onClick={() => setScoreMatch(liveMatch)}
          className="w-full rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg,#78350f,#d97706)' }}
        >
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Circle size={8} fill="#fde68a" className="text-yellow-200 animate-pulse" />
              <span className="text-yellow-200 text-xs font-bold uppercase tracking-wide">You're assigned — Live Now</span>
            </div>
            <p className="text-white font-extrabold text-base mb-1">{liveMatch.name}</p>
            <p className="text-amber-100 text-xs mb-3">
              {teamById(liveMatch.team1)?.name} vs {teamById(liveMatch.team2)?.name}
            </p>
            <div className="flex items-center gap-2 text-amber-100 text-xs border-t border-white/20 pt-2.5">
              <MapPin size={11} />
              <span>Wankhede Cricket Ground, Mumbai</span>
              <span className="ml-auto flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl">
                <Eye size={12} className="text-white" />
                <span className="text-white font-bold">Score Now →</span>
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Upcoming assignments */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Calendar size={15} className="text-amber-500" />
          <p className="font-bold text-navy-900 text-sm flex-1">Upcoming Assignments</p>
          {upcoming.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{upcoming.length} upcoming</span>
          )}
        </div>
        <div className="p-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-6">
              <Clock size={28} className="mx-auto text-navy-300 mb-2" />
              <p className="text-navy-500 text-sm font-medium">No upcoming assignments</p>
              <p className="text-navy-400 text-xs mt-1">Browse Ongoing Matches to raise requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <div key={a.id} className="border border-amber-200 bg-amber-50 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚖️ Assigned</span>
                    <span className="text-[10px] text-navy-400">{a.date}</span>
                  </div>
                  <p className="font-extrabold text-navy-900 text-sm mb-1 leading-tight">{a.teams}</p>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-1">
                    <MapPin size={10} className="text-navy-400" />
                    <span>{a.ground}, {a.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-2.5">
                    <Clock size={10} className="text-navy-400" />
                    <span>Match Day · Arrive 30 min early</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                      <Activity size={10} />Score access
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                      <CheckCircle size={10} />Result sign-off
                    </div>
                  </div>
                  {/* Start Toss button */}
                  <button
                    onClick={() => setTossAssignment(a)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 4px 12px rgba(251,191,36,0.35)' }}
                  >
                    <span>🪙</span>
                    Start Toss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toss Modal */}
      {tossAssignment && (
        <TossModal
          assignment={tossAssignment}
          onClose={() => setTossAssignment(null)}
          addToast={addToast}
        />
      )}

      {/* Match history */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <CheckCircle size={15} className="text-green-500" />
          <p className="font-bold text-navy-900 text-sm flex-1">Match History</p>
          <span className="text-navy-400 text-xs">{completed.length} matches</span>
        </div>
        <div className="divide-y divide-slate-50">
          {completed.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={15} className="text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm leading-tight truncate">{a.teams}</p>
                <p className="text-navy-400 text-xs mt-0.5">{a.date} · {a.ground}</p>
              </div>
              {a.rating != null && (
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">{a.rating}.0</span>
                  <span className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={9} className={i <= a.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                    ))}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    {scoreMatch && <MatchScoreSheet match={scoreMatch} onClose={() => setScoreMatch(null)} />}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — MY STATS
// ══════════════════════════════════════════════════════════════════════════════
function MyStats() {
  const totalMatches  = UMPIRE_PROFILE.matchesUmpired
  const totalGrounds  = UMPIRE_GROUND_VISITS.length
  const nearest       = [...UMPIRE_GROUND_VISITS].sort((a, b) => a.distanceKm - b.distanceKm)[0]
  const avgDistance   = Math.round(UMPIRE_GROUND_VISITS.reduce((s, g) => s + g.distanceKm, 0) / UMPIRE_GROUND_VISITS.length)

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Headline numbers */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg,#78350f,#d97706)' }}
      >
        <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-3">Career Summary</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Matches Umpired', val: totalMatches, icon:'⚖️' },
            { label:'Grounds Visited', val: totalGrounds, icon:'🏟️' },
            { label:'Avg Distance',    val: `${avgDistance} km`, icon:'📍' },
            { label:'Rating',          val: `${UMPIRE_PROFILE.rating} ⭐`, icon:'🌟' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl px-3 py-3 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-white font-extrabold text-xl tabular-nums leading-none">{s.val}</p>
              <p className="text-amber-100 text-[10px] font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearest ground visited */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation size={15} className="text-brand-500" />
          <p className="font-bold text-navy-900 text-sm">Nearest Ground Visited</p>
        </div>
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-3 py-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Home size={16} className="text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-navy-900 text-sm leading-tight">{nearest.groundName}</p>
            <p className="text-navy-500 text-xs mt-0.5">{nearest.city}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-brand-700 text-lg tabular-nums">{nearest.distanceKm} km</p>
            <p className="text-navy-400 text-[10px]">from home</p>
          </div>
        </div>
      </div>

      {/* All grounds visited */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <MapPin size={15} className="text-amber-500" />
          <p className="font-bold text-navy-900 text-sm flex-1">Grounds Visited</p>
          <span className="text-navy-400 text-xs">{totalGrounds} grounds</span>
        </div>
        <div className="divide-y divide-slate-50">
          {[...UMPIRE_GROUND_VISITS].sort((a, b) => a.distanceKm - b.distanceKm).map((g, idx) => (
            <div key={g.groundId} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                idx === 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {idx === 0 ? '🏠' : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm leading-tight truncate">{g.groundName}</p>
                <p className="text-navy-400 text-xs">{g.city} · Last: {g.lastVisited}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-navy-900 text-sm tabular-nums">{g.distanceKm >= 100 ? `${g.distanceKm} km` : `${g.distanceKm} km`}</p>
                <p className="text-navy-400 text-[10px]">{g.matches} match{g.matches !== 1 ? 'es' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <p className="font-bold text-navy-900 text-sm mb-3">Rating Breakdown</p>
        <div className="space-y-2">
          {[5,4,3,2,1].map(star => {
            const count = UMPIRE_PROFILE.ratingBreakdown[star] || 0
            const total = Object.values(UMPIRE_PROFILE.ratingBreakdown).reduce((a,b) => a+b, 0)
            const pct   = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8 flex-shrink-0">
                  <span className="text-xs font-semibold text-navy-700">{star}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width:`${pct}%` }} />
                </div>
                <span className="text-xs text-navy-400 w-4 text-right flex-shrink-0">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 3 — ONGOING MATCHES (Individual + Tournament)
// ══════════════════════════════════════════════════════════════════════════════
function OngoingMatches({ user, addToast, umpireRequests, addUmpireRequest, withdrawUmpireRequest,
                         umpireTournamentRequests, addUmpireTournamentRequest, withdrawUmpireTournamentRequest }) {
  const [subTab, setSubTab] = useState('matches')
  const [showPaywall, setShowPaywall]     = useState(false)
  const [requestModal, setRequestModal]   = useState(null)
  const [expandedTournament, setExpandedTournament] = useState(null)

  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const pendingMatchCount       = umpireRequests.filter(r => r.status === 'pending').length
  const pendingTournamentCount  = umpireTournamentRequests.filter(r => r.status === 'pending').length

  const MAX_MATCH_REQUESTS      = 3
  const MAX_TOURNAMENT_REQUESTS = 2

  const isMatchRequested      = id => umpireRequests.some(r => r.matchId === id)
  const isTournamentRequested = id => umpireTournamentRequests.some(r => r.tournamentId === id)

  const handleMatchRequest = (match) => {
    if (!isPro) { setShowPaywall(true); return }
    if (pendingMatchCount >= MAX_MATCH_REQUESTS) { addToast(`Max ${MAX_MATCH_REQUESTS} pending requests at a time.`, 'error'); return }
    addUmpireRequest(match.id, match.name)
    addToast('Umpire request sent to organiser! 🏏', 'success')
  }

  const handleWithdraw = (matchId) => {
    withdrawUmpireRequest(matchId)
    addToast('Request withdrawn.', 'info')
  }

  const handleTournamentRequest = (tournament, type, dates, note) => {
    if (!isPro) { setShowPaywall(true); return }
    if (type === 'full' && pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS) {
      addToast(`Max ${MAX_TOURNAMENT_REQUESTS} tournament requests at a time.`, 'error'); return
    }
    addUmpireTournamentRequest(tournament.id, tournament.name, type)
    addToast(type === 'full' ? `Full tournament request sent for ${tournament.name}! 🏆` : `Match requests sent!`, 'success')
    setRequestModal(null)
  }

  return (
    <div className="animate-slide-up">
      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl mb-4">
        {[
          { key:'matches',     label:'Individual Matches', count: pendingMatchCount },
          { key:'tournaments', label:'Tournaments',        count: pendingTournamentCount },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === t.key ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold inline-flex items-center justify-center px-1">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Individual Matches ── */}
      {subTab === 'matches' && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
            pendingMatchCount >= MAX_MATCH_REQUESTS ? 'bg-red-50 border border-red-200'
              : pendingMatchCount > 0 ? 'bg-amber-50 border border-amber-200'
              : 'bg-slate-50 border border-slate-200'
          }`}>
            <AlertCircle size={15} className={pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-500' : pendingMatchCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${pendingMatchCount >= MAX_MATCH_REQUESTS ? 'text-red-700' : pendingMatchCount > 0 ? 'text-amber-800' : 'text-navy-600'}`}>
                {pendingMatchCount} / {MAX_MATCH_REQUESTS} pending requests
              </p>
              <p className="text-xs text-navy-400 mt-0.5">Organisers will contact you if selected</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_MATCH_REQUESTS }).map((_, i) => (
                <Circle key={i} size={7} className={i < pendingMatchCount ? 'text-amber-500 fill-amber-500' : 'text-slate-300 fill-slate-300'} />
              ))}
            </div>
          </div>

          {OPEN_MATCHES.map(match => {
            const requested = isMatchRequested(match.id)
            return (
              <div key={match.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[match.format] || 'bg-slate-100 text-slate-600'}`}>
                        {match.format} · {match.overs} ov
                      </span>
                    </div>
                    <p className="font-bold text-navy-900 text-sm leading-tight">{match.teams}</p>
                  </div>
                  {requested && (
                    <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="text-green-700 text-xs font-semibold">Requested</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-navy-500 text-xs">
                    <Calendar size={11} className="text-navy-400" /><span>{match.date}</span>
                    <Clock size={11} className="text-navy-400 ml-1" /><span>{match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-navy-500 text-xs">
                    <MapPin size={11} className="text-navy-400" /><span className="truncate">{match.ground}, {match.city}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-navy-400">By <span className="font-medium text-navy-600">{match.organiser}</span></p>
                  {requested ? (
                    <button onClick={() => handleWithdraw(match.id)} className="text-red-500 text-xs font-semibold">Withdraw</button>
                  ) : (
                    <button
                      onClick={() => handleMatchRequest(match)}
                      disabled={pendingMatchCount >= MAX_MATCH_REQUESTS && isPro}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        pendingMatchCount >= MAX_MATCH_REQUESTS && isPro
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
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
      )}

      {/* ── Tournaments ── */}
      {subTab === 'tournaments' && (
        <div className="space-y-3">
          {UMPIRE_OPEN_TOURNAMENTS.map(tournament => {
            const slotsLeft  = tournament.totalUmpireSlots - tournament.umpireSlotsFilled
            const requested  = isTournamentRequested(tournament.id)
            const isExpanded = expandedTournament === tournament.id

            return (
              <div key={tournament.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLORS[tournament.format] || 'bg-slate-100 text-slate-600'}`}>
                        {tournament.format} · {tournament.overs} ov
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tournament.status === 'live' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {tournament.status === 'live' ? '🔴 Live' : '🟢 Upcoming'}
                      </span>
                    </div>
                    <p className="font-bold text-navy-900 text-sm leading-tight">{tournament.name}</p>
                    <p className="text-navy-500 text-xs mt-0.5">{tournament.city} · By {tournament.organiser}</p>
                  </div>
                  {requested && (
                    <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1 flex-shrink-0">
                      <CheckCircle size={12} className="text-green-600" />
                      <span className="text-green-700 text-xs font-semibold">Sent</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-navy-500">
                  <div className="flex items-center gap-1"><Calendar size={11} />{tournament.startDate} – {tournament.endDate}</div>
                  <span>·</span>
                  <span><span className="font-semibold text-navy-700">{slotsLeft}</span> umpire slot{slotsLeft !== 1 ? 's' : ''} open</span>
                </div>

                <button
                  onClick={() => setExpandedTournament(isExpanded ? null : tournament.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mb-3"
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {isExpanded ? 'Hide' : 'Show'} schedule ({tournament.matches.length} matches)
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

                {!requested ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!isPro) { setShowPaywall(true); return }
                        if (pendingTournamentCount >= MAX_TOURNAMENT_REQUESTS) { addToast('Max 2 tournament requests at a time.', 'error'); return }
                        setRequestModal(tournament)
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
                    >
                      {isPro ? 'Request: Full Tournament' : 'Request ✦ Pro'}
                    </button>
                    <button
                      onClick={() => {
                        if (!isPro) { setShowPaywall(true); return }
                        handleTournamentRequest(tournament, 'specific', [], '')
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 text-navy-700 font-semibold text-xs hover:bg-slate-200 transition-colors flex-shrink-0"
                    >
                      Specific Matches
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { withdrawUmpireTournamentRequest(tournament.id); addToast('Request withdrawn.', 'info') }}
                    className="text-red-500 text-xs font-semibold"
                  >
                    Withdraw request
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Full tournament request modal */}
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

// ══════════════════════════════════════════════════════════════════════════════
// TOSS MODAL — Online Coin Toss
// ══════════════════════════════════════════════════════════════════════════════
function TossModal({ assignment, onClose, addToast }) {
  const [step, setStep]           = useState('caller')   // caller | call | flipping | result | choice | final
  const [caller, setCaller]       = useState(null)        // 0 or 1
  const [call, setCall]           = useState(null)        // 'heads' | 'tails'
  const [tossResult, setTossResult] = useState(null)
  const [winnerIdx, setWinnerIdx] = useState(null)
  const [choice, setChoice]       = useState(null)        // 'bat' | 'field'

  const parts = (assignment.teams || 'Team A vs Team B').split(' vs ')
  const team1 = parts[0]?.trim() || 'Team A'
  const team2 = parts[1]?.trim() || 'Team B'
  const teams = [team1, team2]

  const doFlip = () => {
    setStep('flipping')
    const result = Math.random() > 0.5 ? 'heads' : 'tails'
    setTimeout(() => {
      setTossResult(result)
      const won = call === result ? caller : (caller === 0 ? 1 : 0)
      setWinnerIdx(won)
      setStep('result')
    }, 1800)
  }

  const winnerName = winnerIdx !== null ? teams[winnerIdx] : ''

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              <span className="text-base">🪙</span>
            </div>
            <h2 className="font-extrabold text-navy-900 text-base">Online Toss</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="px-5 py-4 pb-8">
          {/* Match info */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold text-navy-900 text-sm text-center flex-1">{team1}</p>
              <span className="text-xs font-bold text-navy-400 px-2 py-1 bg-white rounded-full border border-slate-200 flex-shrink-0">vs</span>
              <p className="font-extrabold text-navy-900 text-sm text-center flex-1">{team2}</p>
            </div>
          </div>

          {/* Step: caller selection */}
          {step === 'caller' && (
            <div>
              <p className="text-navy-600 font-semibold text-sm text-center mb-4">Which team calls the toss?</p>
              <div className="grid grid-cols-2 gap-3">
                {teams.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setCaller(i); setStep('call') }}
                    className="py-4 px-3 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all active:scale-95 text-center"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: call heads/tails */}
          {step === 'call' && (
            <div>
              <p className="text-navy-600 font-semibold text-sm text-center mb-1">
                <span className="text-brand-600">{teams[caller]}</span> calls...
              </p>
              <p className="text-navy-400 text-xs text-center mb-5">Select heads or tails</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { key:'heads', label:'Heads', emoji:'👑' },
                  { key:'tails', label:'Tails', emoji:'🌀' },
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCall(c.key)}
                    className="py-5 rounded-2xl font-extrabold text-lg border-2 transition-all active:scale-95 flex flex-col items-center gap-1"
                    style={call === c.key
                      ? { borderColor: '#22c55e', background: '#f0fdf4', color: '#15803d' }
                      : { borderColor: '#e2e8f0', background: '#f8fafc', color: '#334155' }
                    }
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-sm font-bold">{c.label}</span>
                  </button>
                ))}
              </div>
              {call && (
                <button onClick={doFlip} className="btn-primary w-full">
                  Flip the Coin!
                </button>
              )}
            </div>
          )}

          {/* Step: flipping */}
          {step === 'flipping' && (
            <div className="text-center py-6">
              <div
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 animate-spin"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 8px 32px rgba(251,191,36,0.4)' }}
              >
                🪙
              </div>
              <p className="font-bold text-navy-700 text-base">Flipping the coin...</p>
              <p className="text-navy-400 text-sm mt-1">Hold tight!</p>
            </div>
          )}

          {/* Step: result → winner chooses */}
          {step === 'result' && (
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3"
                style={tossResult === 'heads'
                  ? { background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 8px 24px rgba(251,191,36,0.4)' }
                  : { background: 'linear-gradient(135deg, #94a3b8, #475569)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }
                }
              >
                {tossResult === 'heads' ? '👑' : '🌀'}
              </div>
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-1">It's...</p>
              <p className="text-2xl font-extrabold text-navy-900 capitalize mb-3">{tossResult}!</p>
              <div className="bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 mb-5">
                <p className="font-extrabold text-brand-700 text-sm">🎉 {winnerName} wins the toss!</p>
              </div>
              <p className="text-navy-600 font-semibold text-sm mb-4">What does {winnerName} choose?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key:'bat',   emoji:'🏏', label:'Bat First'   },
                  { key:'field', emoji:'🧤', label:'Field First' },
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => { setChoice(c.key); setStep('final') }}
                    className="py-4 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all active:scale-95 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: final summary */}
          {step === 'final' && (
            <div className="text-center py-2">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
              >
                ✅
              </div>
              <p className="font-extrabold text-navy-900 text-lg mb-2">Toss Complete!</p>
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5">
                <p className="font-bold text-green-800 text-base leading-relaxed">
                  {winnerName} won the toss<br />
                  <span className="text-green-600">and elected to {choice === 'bat' ? '🏏 bat' : '🧤 field'} first.</span>
                </p>
              </div>
              <p className="text-navy-400 text-xs mb-5">Both teams have been notified via the app</p>
              <button
                onClick={() => {
                  addToast(`Toss done! ${winnerName} will ${choice} first.`, 'success')
                  onClose()
                }}
                className="btn-primary w-full"
              >
                Start Match →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Full tournament date-picker modal ─────────────────────────────────────────
function TournamentRequestModal({ tournament, onClose, onSend }) {
  const [selectedDates, setSelectedDates] = useState(tournament.upcomingMatchDates.map(() => true))
  const [note, setNote] = useState('')
  const toggleDate = i => setSelectedDates(prev => prev.map((v, idx) => idx === i ? !v : v))
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
          <div className="grid grid-cols-2 gap-2 mb-4">
            {tournament.upcomingMatchDates.map((date, i) => (
              <button
                key={i}
                onClick={() => toggleDate(i)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  selectedDates[i] ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-navy-500'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedDates[i] ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                  {selectedDates[i] && <CheckCircle size={10} className="text-white" />}
                </div>
                {date}
              </button>
            ))}
          </div>
          <textarea
            className="cm-input resize-none mb-1"
            rows={2}
            placeholder="e.g. Available all days. BCCI Level 2 certified."
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 150))}
          />
          <p className="text-navy-400 text-xs text-right mb-4">{note.length}/150</p>
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 mb-4">
            <p className="text-xs text-navy-500">{confirmed.length} date{confirmed.length !== 1 ? 's' : ''} selected: <span className="font-semibold text-navy-700">{confirmed.join(', ') || 'None'}</span></p>
          </div>
          <button
            onClick={() => onSend(tournament, 'full', confirmed, note)}
            disabled={confirmed.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send Full Tournament Request
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 4 — MY REQUESTS
// ══════════════════════════════════════════════════════════════════════════════
function MyRequests({ umpireRequests, umpireTournamentRequests, addToast }) {
  // Merge store requests + pre-seeded mock requests
  const [seenIds, setSeenIds]   = useState([])
  const [requests, setRequests] = useState(UMPIRE_MY_REQUESTS)

  // Fire notifications for any unseen approved/rejected on first render
  useEffect(() => {
    const unseen = requests.filter(r => !r.seen && r.status !== 'pending')
    if (unseen.length > 0) {
      setTimeout(() => {
        unseen.forEach(r => {
          if (r.status === 'approved') addToast(`✅ Request approved: "${r.name}"`, 'success')
          if (r.status === 'rejected') addToast(`Request rejected: "${r.name}". ${r.reason || ''}`, 'error')
        })
        setRequests(prev => prev.map(r => ({ ...r, seen: true })))
      }, 500)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Merge in store's live requests
  const storeMatchRequests = umpireRequests.map(r => ({
    id: r.matchId,
    type: 'match',
    name: r.matchName,
    organiser: 'Organiser',
    date: 'Pending',
    city: '—',
    sentOn: 'Just now',
    status: r.status,
    seen: true,
  }))
  const storeTournamentRequests = umpireTournamentRequests.map(r => ({
    id: r.tournamentId,
    type: 'tournament',
    name: r.tournamentName,
    organiser: 'Organiser',
    date: 'Pending',
    city: '—',
    sentOn: 'Just now',
    status: r.status,
    seen: true,
  }))

  const allRequests = [...storeMatchRequests, ...storeTournamentRequests, ...requests]
  const approved = allRequests.filter(r => r.status === 'approved')
  const rejected = allRequests.filter(r => r.status === 'rejected')
  const pending  = allRequests.filter(r => r.status === 'pending')

  const RequestCard = ({ r }) => {
    const s = STATUS_COLORS[r.status]
    const Icon = s.icon
    return (
      <div className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
        <div className="flex items-start gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${r.status === 'approved' ? 'bg-green-100' : r.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <Icon size={14} className={s.text} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.type === 'tournament' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                {r.type === 'tournament' ? '🏆' : '🏏'} {r.type === 'tournament' ? 'Tournament' : 'Match'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
                {s.label}
              </span>
            </div>
            <p className="font-bold text-navy-900 text-sm leading-tight">{r.name}</p>
            <p className="text-navy-500 text-xs mt-0.5">{r.date} · {r.city}</p>
            {r.reason && (
              <p className="text-red-600 text-xs mt-1 font-medium">Reason: {r.reason}</p>
            )}
            <p className="text-navy-400 text-[10px] mt-1">Sent {r.sentOn}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:'Approved', val: approved.length, color:'#16a34a', bg:'#dcfce7', icon:'✅' },
          { label:'Pending',  val: pending.length,  color:'#d97706', bg:'#fef3c7', icon:'⏳' },
          { label:'Rejected', val: rejected.length, color:'#dc2626', bg:'#fee2e2', icon:'❌' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="font-extrabold text-xl tabular-nums leading-none" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notification info */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <Bell size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs leading-relaxed">
          You'll receive an <strong>in-app notification</strong> whenever a request is approved or rejected by the organiser or captain.
        </p>
      </div>

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Approved ({approved.length})</p>
          <div className="space-y-2">{approved.map(r => <RequestCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Awaiting Response ({pending.length})</p>
          <div className="space-y-2">{pending.map(r => <RequestCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Not Selected ({rejected.length})</p>
          <div className="space-y-2">{rejected.map(r => <RequestCard key={r.id} r={r} />)}</div>
        </div>
      )}

      {allRequests.length === 0 && (
        <div className="text-center py-12">
          <Send size={32} className="mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500 font-semibold">No requests yet</p>
          <p className="text-navy-400 text-sm mt-1">Browse Ongoing Matches to raise your first request</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════
export default function UmpireHome() {
  const navigate = useNavigate()
  const { user, addToast,
          umpireRequests, addUmpireRequest, withdrawUmpireRequest,
          umpireTournamentRequests, addUmpireTournamentRequest, withdrawUmpireTournamentRequest,
        } = useStore()

  const [activeTab, setActiveTab] = useState('assignments')

  const upcomingCount   = UMPIRE_PROFILE.assignments.filter(a => a.status === 'upcoming').length
  const pendingRequests = (umpireRequests?.length || 0) + (umpireTournamentRequests?.length || 0)
  const unseenUpdates   = UMPIRE_MY_REQUESTS.filter(r => !r.seen && r.status !== 'pending').length

  const TABS = [
    { key:'assignments', label:'My Assignments',  badge: upcomingCount   > 0 ? upcomingCount   : null },
    { key:'stats',       label:'My Stats',         badge: null },
    { key:'matches',     label:'Ongoing Matches',  badge: null },
    { key:'requests',    label:'My Requests',      badge: unseenUpdates   > 0 ? unseenUpdates   : null, badgeColor:'bg-red-500' },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-44">

        {/* Greeting */}
        <div className="mb-4 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Umpire'} 👋
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background:'#fef3c7', color:'#d97706' }}>
              ⚖️ Umpire
            </span>
            <span className="text-navy-400 text-xs">·</span>
            <span className="text-navy-500 text-xs">⭐ {UMPIRE_PROFILE.rating} · {UMPIRE_PROFILE.matchesUmpired} matches umpired</span>
          </div>
        </div>

        {/* Tab bar — scrollable on small screens */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl mb-4 animate-fade-in overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              {tab.label}
              {tab.badge != null && (
                <span className={`min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold inline-flex items-center justify-center px-1 ${tab.badgeColor || 'bg-amber-500'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'assignments' && <MyAssignments navigate={navigate} addToast={addToast} />}
        {activeTab === 'stats'       && <MyStats />}
        {activeTab === 'matches'     && (
          <OngoingMatches
            user={user}
            addToast={addToast}
            umpireRequests={umpireRequests}
            addUmpireRequest={addUmpireRequest}
            withdrawUmpireRequest={withdrawUmpireRequest}
            umpireTournamentRequests={umpireTournamentRequests}
            addUmpireTournamentRequest={addUmpireTournamentRequest}
            withdrawUmpireTournamentRequest={withdrawUmpireTournamentRequest}
          />
        )}
        {activeTab === 'requests' && (
          <MyRequests
            umpireRequests={umpireRequests}
            umpireTournamentRequests={umpireTournamentRequests}
            addToast={addToast}
          />
        )}

      </main>
    </div>
  )
}
