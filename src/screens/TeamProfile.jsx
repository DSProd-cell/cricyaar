import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { TEAMS, PLAYERS, MATCHES, TOURNAMENTS, teamById, initials } from '../data/mock'
import { avg, sr, eco } from '../utils/cricket'
import TopBar from '../components/TopBar'
import { useState } from 'react'
import {
  Trophy, Users, MapPin, ChevronRight, Crown, Activity,
  Star, Calendar, Circle, Copy, Check, Lock, Shield
} from 'lucide-react'

const POSITION_COLORS = {
  Batsman:       'bg-blue-50 text-blue-700',
  Bowler:        'bg-green-50 text-green-700',
  'All-rounder': 'bg-purple-50 text-purple-700',
  Wicketkeeper:  'bg-amber-50 text-amber-700',
}

function inferPosition(player) {
  const { batting, bowling } = player
  const isWK = player.fielding.stumpings > 0
  const isBatter = batting.runs > 500
  const isBowler = bowling.wkts > 20
  if (isWK && isBatter) return 'Wicketkeeper'
  if (isBatter && isBowler) return 'All-rounder'
  if (isBowler) return 'Bowler'
  return 'Batsman'
}

export default function TeamProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('Squad')

  const isPro = user?.subscription === 'pro_active'

  // Find team (mock static + published in store — for simplicity use static)
  const team = TEAMS.find(t => t.id === id)

  if (!team) return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Team" showBack />
      <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center px-6">
        <Users size={40} className="text-navy-300" />
        <p className="font-semibold text-navy-500">Team not found</p>
        <button className="btn-secondary text-sm" onClick={() => navigate('/teams')}>Go to Teams</button>
      </div>
    </div>
  )

  const squadPlayers = team.squad.map(pid => PLAYERS.find(p => p.id === pid)).filter(Boolean)
  const captain = PLAYERS.find(p => p.id === team.captain)
  const teamMatches = MATCHES.filter(m => m.team1 === team.id || m.team2 === team.id)
  const teamTournaments = TOURNAMENTS.filter(tr =>
    tr.approvedTeams?.includes(team.id) || tr.teams?.includes(team.id)
  )
  const totalMatches = team.wins + team.losses + team.nr
  const winPct = totalMatches > 0 ? Math.round((team.wins / totalMatches) * 100) : 0

  const handleCopy = () => {
    navigator.clipboard?.writeText(team.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar title="Team Profile" showBack />

      {/* ── Team Header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            {/* Team logo */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0 shadow-sm"
              style={{ background: team.color }}
            >
              {initials(team.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-navy-900 text-xl leading-tight">{team.name}</h1>
              <div className="flex items-center gap-1.5 mt-1 text-navy-500 text-sm">
                <MapPin size={12} className="text-navy-400" />
                <span>{team.city}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-navy-600 hover:border-brand-400 transition-all"
                >
                  {copied
                    ? <><Check size={10} className="text-brand-500" />Copied!</>
                    : <><Copy size={10} />{team.code}</>
                  }
                </button>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  team.visibility === 'open' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {team.visibility === 'open' ? '🌐 Open' : '🔒 Invite Only'}
                </span>
              </div>
            </div>
          </div>

          {/* Win/Loss stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Matches', val: totalMatches },
              { label: 'Won', val: team.wins, color: '#16a34a' },
              { label: 'Lost', val: team.losses, color: '#dc2626' },
              { label: 'Win %', val: `${winPct}%`, color: winPct >= 50 ? '#16a34a' : '#dc2626' },
            ].map(s => (
              <div key={s.label} className="stat-tile text-center py-3">
                <p className="font-extrabold text-navy-900 text-lg tabular-nums leading-none" style={s.color ? { color: s.color } : {}}>
                  {s.val}
                </p>
                <p className="text-navy-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Captain badge */}
          {captain && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <Star size={13} fill="#f59e0b" className="text-amber-400" />
              <span className="text-amber-800 text-xs font-semibold">Captain: {captain.name}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {['Squad', 'Matches', 'Tournaments'].map(t => (
            <button
              key={t}
              className={`tab-item ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-28">

        {/* ── SQUAD TAB ── */}
        {activeTab === 'Squad' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
              {squadPlayers.length} Players
            </p>
            {squadPlayers.map(player => {
              const position = inferPosition(player)
              const isCap = player.id === team.captain
              return (
                <button
                  key={player.id}
                  onClick={() => navigate(`/profile/${player.id}`)}
                  className="card card-hover w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-extrabold text-sm flex-shrink-0">
                      {initials(player.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-navy-900 text-sm">{player.name}</p>
                        {isCap && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">⭐ Captain</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${POSITION_COLORS[position] || 'bg-slate-100 text-slate-600'}`}>
                        {position}
                      </span>
                    </div>

                    {/* Key stats — Pro gated */}
                    {isPro ? (
                      <div className="text-right flex-shrink-0">
                        <p className="text-navy-900 font-bold text-sm tabular-nums">
                          {player.batting.runs > 0 ? `${player.batting.runs} runs` : `${player.bowling.wkts} wkts`}
                        </p>
                        <p className="text-navy-400 text-xs">
                          {player.batting.runs > 0
                            ? `Avg ${avg(player.batting.runs, player.batting.dismissed)}`
                            : `Eco ${eco(player.bowling.runs, player.bowling.overs)}`
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                        <Lock size={12} />
                        <span className="text-[10px] font-semibold">Pro</span>
                      </div>
                    )}
                    <ChevronRight size={14} className="text-navy-300 flex-shrink-0" />
                  </div>
                </button>
              )
            })}

            {/* Pro gate for detailed squad stats */}
            {!isPro && (
              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  background: 'linear-gradient(135deg, #1c1209, #2d1a00)',
                  border: '1.5px solid #d97706',
                }}
              >
                <Crown size={20} className="text-amber-400 fill-amber-300 mx-auto mb-2" />
                <p className="text-amber-200 font-bold text-sm mb-1">Player stats locked</p>
                <p className="text-amber-700 text-xs mb-3">Upgrade to Pro to see each player's career stats within this team.</p>
                <button
                  onClick={() => navigate('/pro-payment')}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  Upgrade to Pro — ₹99/mo
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MATCHES TAB ── */}
        {activeTab === 'Matches' && (
          <div className="space-y-3 animate-fade-in">
            {teamMatches.length === 0 ? (
              <div className="text-center py-16">
                <Activity size={36} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No matches recorded yet</p>
              </div>
            ) : teamMatches.map(m => {
              const t1 = TEAMS.find(t => t.id === m.team1)
              const t2 = TEAMS.find(t => t.id === m.team2)
              const isWinner = m.result?.winner === team.id
              const isLive = m.status === 'live'
              const inn = m.innings?.[0]
              return (
                <button
                  key={m.id}
                  onClick={() => navigate(`/score/${m.id}`)}
                  className="card card-hover w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-navy-900 text-sm truncate flex-1">{m.name}</p>
                    <span className={`badge flex-shrink-0 ${isLive ? 'badge-red' : m.status === 'upcoming' ? 'badge-blue' : 'badge-navy'}`}>
                      {isLive ? 'Live' : m.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-navy-500">
                    <span>{t1?.name} vs {t2?.name}</span>
                    <span>{m.date}</span>
                  </div>
                  {m.result && (
                    <p className={`text-xs font-semibold mt-1.5 ${isWinner ? 'text-brand-600' : 'text-red-500'}`}>
                      {isWinner ? '✅ Won' : '❌ Lost'}
                      {m.result.margin && ` · ${m.result.margin}`}
                    </p>
                  )}
                  {isPro && inn && (
                    <div className="flex items-center gap-1.5 mt-2 text-brand-500 text-xs font-semibold">
                      <Activity size={11} />
                      View Scorecard
                    </div>
                  )}
                  {!isPro && m.status === 'completed' && (
                    <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs">
                      <Lock size={10} />
                      Scorecard — Pro only
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* ── TOURNAMENTS TAB ── */}
        {activeTab === 'Tournaments' && (
          <div className="space-y-3 animate-fade-in">
            {teamTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Trophy size={36} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">Not registered in any tournaments yet</p>
                <button
                  onClick={() => navigate('/open-tournaments')}
                  className="btn-primary text-sm mt-4 px-5"
                >
                  Browse Tournaments
                </button>
              </div>
            ) : teamTournaments.map(tr => (
              <button
                key={tr.id}
                onClick={() => navigate(`/tournaments/${tr.id}`)}
                className="card card-hover w-full text-left"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-navy-900">{tr.name}</p>
                  <span className={`badge flex-shrink-0 ${tr.status === 'active' ? 'badge-green' : tr.status === 'upcoming' ? 'badge-blue' : 'badge-navy'}`}>
                    {tr.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-navy-500">
                  <span>{tr.type} · {tr.overs} overs</span>
                  <span>·</span>
                  <div className="flex items-center gap-1"><Calendar size={11} />{tr.startDate}</div>
                </div>
                {tr.prize && <p className="text-brand-600 text-xs font-medium mt-1.5">🏆 {tr.prize}</p>}
                <ChevronRight size={13} className="absolute top-4 right-4 text-navy-300" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
