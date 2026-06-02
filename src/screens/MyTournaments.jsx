import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOURNAMENTS, MATCHES, teamById, groundById } from '../data/mock'
import TopBar from '../components/TopBar'
import MatchScoreSheet from '../components/MatchScoreSheet'
import FollowButton from '../components/FollowButton'
import {
  Trophy, Calendar, Users, MapPin, Clock,
  Circle, CheckCircle, Activity, ChevronRight
} from 'lucide-react'

const TABS = ['My Tournaments', 'All Matches']

// ─── Tournament Card ──────────────────────────────────────────────────────────
function TournamentCard({ t }) {
  const navigate = useNavigate()
  const matchCount = MATCHES.filter(m => m.tournament === t.id).length
  const liveCount  = MATCHES.filter(m => m.tournament === t.id && m.status === 'live').length

  return (
    <button
      onClick={() => navigate(`/tournaments/${t.id}`)}
      className="card w-full text-left animate-fade-in active:scale-[0.98] transition-transform"
    >
      {/* Status + name */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              t.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {t.status === 'active' ? '🟢 Active' : '✅ Completed'}
            </span>
            {liveCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                <Circle size={5} fill="currentColor" className="animate-pulse" />
                {liveCount} live
              </span>
            )}
            <span className="text-[10px] text-navy-400 font-medium">{t.overs} overs · {t.type}</span>
          </div>
          <h3 className="font-extrabold text-navy-900 text-base leading-tight">{t.name}</h3>
        </div>
        <ChevronRight size={16} className="text-navy-300 flex-shrink-0 mt-1" />
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-navy-500">
        <span className="flex items-center gap-1">
          <Users size={11} className="text-navy-400" />
          {t.approvedTeams?.length || 0} / {t.maxTeams} teams
        </span>
        <span className="flex items-center gap-1">
          <Activity size={11} className="text-navy-400" />
          {matchCount} matches
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} className="text-navy-400" />
          {new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          {' – '}
          {new Date(t.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      </div>

      {/* Prize + Follow */}
      <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 text-xs">
        <Trophy size={12} className="text-amber-500 flex-shrink-0" />
        <span className="text-amber-800 font-semibold flex-1">{t.prize}</span>
        <span className="text-navy-400 mr-2">₹{(t.entryFee || 0).toLocaleString('en-IN')}</span>
        <FollowButton type="tournament" item={t} label="Follow" size="sm" />
      </div>
    </button>
  )
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchRow({ match, onScorecard }) {
  const t1  = teamById(match.team1)
  const t2  = teamById(match.team2)
  const g   = groundById(match.ground)
  const inn = match.innings?.[0]
  const inn2 = match.innings?.[1]
  const tournament = TOURNAMENTS.find(t => t.id === match.tournament)

  return (
    <button
      onClick={() => (match.status !== 'upcoming') && onScorecard(match)}
      className="card w-full text-left mb-3 animate-fade-in active:scale-[0.98] transition-transform"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-navy-900 text-sm truncate">{match.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {g && (
              <span className="flex items-center gap-1 text-navy-400 text-xs">
                <MapPin size={10} />
                {g.name}
              </span>
            )}
            {tournament && (
              <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md">
                {tournament.name.split(' ').slice(0, 3).join(' ')}
              </span>
            )}
          </div>
        </div>
        {match.status === 'live' && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600 flex-shrink-0">
            <Circle size={5} fill="currentColor" className="animate-pulse" />
            Live
          </span>
        )}
        {match.status === 'upcoming' && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
            Upcoming
          </span>
        )}
        {match.status === 'completed' && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">
            <CheckCircle size={10} />
            Done
          </span>
        )}
      </div>

      {/* Scores */}
      <div className="space-y-1.5 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: t1?.color || '#22c55e' }}>
              {t1?.name?.[0] || '?'}
            </div>
            <span className="font-semibold text-navy-900 text-sm">{t1?.name}</span>
          </div>
          {inn ? (
            <span className="font-bold text-navy-900 tabular-nums text-sm">
              {inn.runs}/{inn.wkts}
              <span className="text-navy-400 font-normal text-xs ml-1">({inn.overs} ov)</span>
            </span>
          ) : (
            <span className="text-navy-400 text-xs">Yet to bat</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: t2?.color || '#3b82f6' }}>
              {t2?.name?.[0] || '?'}
            </div>
            <span className="font-semibold text-navy-900 text-sm">{t2?.name}</span>
          </div>
          {inn2 && inn2.runs > 0 ? (
            <span className="font-bold text-navy-900 tabular-nums text-sm">
              {inn2.runs}/{inn2.wkts}
              <span className="text-navy-400 font-normal text-xs ml-1">({inn2.overs} ov)</span>
            </span>
          ) : match.status !== 'upcoming' && inn ? (
            <span className="text-navy-400 text-xs">Yet to bat</span>
          ) : (
            <span className="flex items-center gap-1 text-navy-400 text-xs">
              <Clock size={10} />
              {match.date} · {match.time}
            </span>
          )}
        </div>
      </div>

      {/* Result or tap hint */}
      {match.result && (
        <p className="text-brand-600 font-semibold text-xs border-t border-slate-100 pt-2">
          🏆 {teamById(match.result.winner)?.name} won by {match.result.margin}
        </p>
      )}
      {/* Follow + scorecard hint */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
        <FollowButton type="match" item={match} label="Follow" size="sm" />
        {match.status !== 'upcoming' && !match.result && (
          <p className="text-navy-400 text-[10px]">Tap for scorecard →</p>
        )}
      </div>
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyTournaments() {
  const [tab, setTab] = useState(0)               // 0 = My Tournaments, 1 = All Matches
  const [matchTab, setMatchTab] = useState('All') // All | Live | Upcoming | Past
  const [scoreMatch, setScoreMatch] = useState(null)

  // For demo: show all tournaments (in production filter by user.id === organiser)
  const myTournaments = TOURNAMENTS

  const allMatches = MATCHES.filter(m =>
    myTournaments.some(t => t.id === m.tournament)
  )

  const filteredMatches = matchTab === 'All'      ? allMatches
    : matchTab === 'Live'     ? allMatches.filter(m => m.status === 'live')
    : matchTab === 'Upcoming' ? allMatches.filter(m => m.status === 'upcoming')
    : allMatches.filter(m => m.status === 'completed')

  const liveCount     = allMatches.filter(m => m.status === 'live').length
  const upcomingCount = allMatches.filter(m => m.status === 'upcoming').length

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar title="My Tournaments" showBack />

      {/* Primary tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-[57px] z-10 flex px-4">
        {TABS.map((label, idx) => (
          <button
            key={idx}
            onClick={() => setTab(idx)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === idx
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-navy-400 hover:text-navy-600'
            }`}
          >
            {label}
            {idx === 1 && liveCount > 0 && (
              <span className="ml-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] inline-flex items-center justify-center font-bold">
                {liveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-24">

        {/* ── TAB 0: MY TOURNAMENTS ── */}
        {tab === 0 && (
          <div className="px-4 py-4 space-y-3">
            {myTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Trophy size={40} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No tournaments yet</p>
                <p className="text-navy-400 text-sm mt-1">Create your first tournament to get started</p>
              </div>
            ) : (
              myTournaments.map(t => <TournamentCard key={t.id} t={t} />)
            )}
          </div>
        )}

        {/* ── TAB 1: ALL MATCHES ── */}
        {tab === 1 && (
          <>
            {/* Sub-filter tabs */}
            <div className="bg-white border-b border-slate-100 sticky top-[105px] z-10 flex px-4 gap-1 overflow-x-auto no-scrollbar">
              {['All', 'Live', 'Upcoming', 'Past'].map(label => (
                <button
                  key={label}
                  onClick={() => setMatchTab(label)}
                  className={`py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    matchTab === label
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-navy-400'
                  }`}
                >
                  {label}
                  {label === 'Live' && liveCount > 0 && (
                    <span className="ml-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] inline-flex items-center justify-center font-bold">
                      {liveCount}
                    </span>
                  )}
                  {label === 'Upcoming' && upcomingCount > 0 && (
                    <span className="ml-1 w-3.5 h-3.5 bg-blue-500 rounded-full text-white text-[8px] inline-flex items-center justify-center font-bold">
                      {upcomingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-4 py-4">
              {filteredMatches.length === 0 ? (
                <div className="text-center py-16">
                  <Activity size={40} className="mx-auto text-navy-300 mb-3" />
                  <p className="font-semibold text-navy-500">No {matchTab.toLowerCase()} matches</p>
                </div>
              ) : (
                filteredMatches.map(m => (
                  <MatchRow key={m.id} match={m} onScorecard={setScoreMatch} />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {scoreMatch && (
        <MatchScoreSheet match={scoreMatch} onClose={() => setScoreMatch(null)} />
      )}
    </div>
  )
}
