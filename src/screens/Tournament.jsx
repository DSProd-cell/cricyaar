import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { tournamentById, teamById, MATCHES, TOURNAMENT_FREE_AGENT_POOL } from '../data/mock'
import { useStore } from '../store/useStore'
import TopBar from '../components/TopBar'
import { Trophy, Calendar, Users, Copy, ChevronRight, Download, UserCheck, CheckCircle } from 'lucide-react'

const POSITION_COLORS = { Batsman:'bg-blue-50 text-blue-700', Bowler:'bg-green-50 text-green-700', 'All-rounder':'bg-purple-50 text-purple-700', Wicketkeeper:'bg-amber-50 text-amber-700' }

export default function Tournament() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const tr       = tournamentById(id)
  const [tab, setTab] = useState('Overview')
  const [invitedAgents, setInvitedAgents] = useState([])

  const role = user?.role || 'fan'
  const isOrganiser = role === 'organiser' || role === 'admin'
  const freeAgents = TOURNAMENT_FREE_AGENT_POOL.filter(fa => fa.tournamentId === 'ot1') // demo: show for tr1
  const TABS = ['Overview','Teams','Fixtures','Points Table','Bracket', ...(isOrganiser ? ['Free Agents'] : [])]

  if (!tr) return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Tournament" showBack />
      <div className="flex-1 flex items-center justify-center text-navy-400">Tournament not found.</div>
    </div>
  )

  const matches = MATCHES.filter(m => m.tournament === id)
  const statusStyle = { active:'badge-green', completed:'badge-navy', upcoming:'badge-blue' }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title={tr.name} showBack />
      {/* Tab bar */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar bg-white sticky top-14 z-10">
        {TABS.map(t => (
          <button key={t} className={`tab-item flex-shrink-0 ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div className="space-y-4 animate-fade-in">
            <div className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-extrabold text-navy-900 text-xl">{tr.name}</h2>
                  <p className="text-navy-500 text-sm mt-0.5">{tr.type} · {tr.overs} overs per side</p>
                </div>
                <span className={`badge ${statusStyle[tr.status]}`}>{tr.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-navy-400 text-xs">Start</p><p className="font-semibold text-navy-900">{tr.startDate}</p></div>
                <div><p className="text-navy-400 text-xs">End</p><p className="font-semibold text-navy-900">{tr.endDate}</p></div>
                <div><p className="text-navy-400 text-xs">Teams</p><p className="font-semibold text-navy-900">{tr.approvedTeams.length} approved</p></div>
                <div><p className="text-navy-400 text-xs">Entry fee</p><p className="font-semibold text-navy-900">₹{tr.entryFee?.toLocaleString('en-IN') || 'Free'}</p></div>
              </div>
              {tr.prize && <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl"><p className="text-amber-700 font-semibold text-sm">🏆 {tr.prize}</p></div>}
            </div>
            {/* Registration link */}
            <div className="card">
              <p className="text-xs font-semibold text-navy-500 mb-2">REGISTRATION LINK</p>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <p className="text-navy-600 text-sm flex-1 truncate font-mono">cricyaar.app/join/{id}</p>
                <button className="flex-shrink-0 text-brand-600 hover:text-brand-700" onClick={() => navigator.clipboard?.writeText(`cricyaar.app/join/${id}`)}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
            {tr.winner && (
              <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                <p className="font-bold text-amber-800 text-center text-lg">🏆 {teamById(tr.winner)?.name} won the tournament!</p>
                {tr.potm && <p className="text-amber-700 text-center text-sm mt-1">Player of the Tournament: {tr.potm}</p>}
              </div>
            )}
          </div>
        )}

        {/* TEAMS */}
        {tab === 'Teams' && (
          <div className="animate-fade-in">
            {tr.registeredTeams.map(tid => {
              const team = teamById(tid)
              const approved = tr.approvedTeams.includes(tid)
              return team ? (
                <div key={tid} className="card mb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm" style={{background:team.color}}>
                    {team.name.split(' ').map(w=>w[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-navy-900">{team.name}</p>
                    <p className="text-navy-500 text-xs">{team.city} · {team.squad.length} players</p>
                  </div>
                  {approved
                    ? <span className="badge badge-green">Approved</span>
                    : <div className="flex gap-1">
                        <button className="badge badge-red cursor-pointer hover:opacity-80">Reject</button>
                        <button className="badge badge-green cursor-pointer hover:opacity-80">Approve</button>
                      </div>
                  }
                </div>
              ) : null
            })}
          </div>
        )}

        {/* FIXTURES */}
        {tab === 'Fixtures' && (
          <div className="animate-fade-in">
            {matches.length === 0 ? (
              <div className="text-center py-12 text-navy-400"><Calendar size={36} className="mx-auto mb-2" /><p>No fixtures yet</p></div>
            ) : matches.map(m => {
              const t1 = teamById(m.team1), t2 = teamById(m.team2)
              return (
                <button key={m.id} onClick={() => navigate('/my-cricket')} className="card card-hover w-full text-left mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-navy-500 text-xs">{m.date} · {m.time}</p>
                    <span className={`badge ${m.status==='live'?'badge-live':m.status==='upcoming'?'badge-blue':'badge-navy'}`}>{m.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-navy-900 text-sm">{t1?.name}</p>
                    <span className="text-navy-400 text-xs font-medium">vs</span>
                    <p className="font-semibold text-navy-900 text-sm">{t2?.name}</p>
                  </div>
                  {m.result && <p className="text-brand-600 text-xs font-medium mt-2 text-center">{teamById(m.result.winner)?.name} won by {m.result.margin}</p>}
                </button>
              )
            })}
          </div>
        )}

        {/* POINTS TABLE */}
        {tab === 'Points Table' && (
          <div className="animate-fade-in">
            <button className="btn-secondary w-full gap-2 mb-4" onClick={() => {}}>
              <Download size={16} />
              Download Points Table PDF
            </button>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-navy-500 text-xs font-semibold">#</th>
                    <th className="text-left px-4 py-3 text-navy-500 text-xs font-semibold">Team</th>
                    <th className="text-center px-2 py-3 text-navy-500 text-xs font-semibold">P</th>
                    <th className="text-center px-2 py-3 text-navy-500 text-xs font-semibold">W</th>
                    <th className="text-center px-2 py-3 text-navy-500 text-xs font-semibold">L</th>
                    <th className="text-center px-2 py-3 text-navy-500 text-xs font-semibold">NRR</th>
                    <th className="text-center px-2 py-3 text-navy-900 text-xs font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tr.points)
                    .sort((a,b) => b[1].pts - a[1].pts || b[1].nrr - a[1].nrr)
                    .map(([tid, pt], i) => {
                      const team = teamById(tid)
                      return (
                        <tr key={tid} className={`border-b border-slate-50 ${i < 2 ? 'bg-green-50/50' : ''}`}>
                          <td className="px-4 py-3 text-navy-500 font-semibold text-xs">{i+1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{background:team?.color||'#22c55e'}}>
                                {team?.name?.[0]}
                              </div>
                              <span className="font-semibold text-navy-900 text-xs">{team?.name}</span>
                            </div>
                          </td>
                          <td className="text-center px-2 py-3 text-navy-600 tabular-nums">{pt.p}</td>
                          <td className="text-center px-2 py-3 text-brand-600 font-bold tabular-nums">{pt.w}</td>
                          <td className="text-center px-2 py-3 text-red-500 tabular-nums">{pt.l}</td>
                          <td className="text-center px-2 py-3 text-navy-500 tabular-nums text-xs">{pt.nrr > 0 ? '+' : ''}{pt.nrr}</td>
                          <td className="text-center px-2 py-3 font-extrabold text-navy-900 tabular-nums">{pt.pts}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BRACKET */}
        {tab === 'Bracket' && (
          <div className="animate-fade-in text-center py-12">
            <Trophy size={40} className="mx-auto text-navy-300 mb-3" />
            <p className="font-semibold text-navy-500">Knockout bracket</p>
            <p className="text-navy-400 text-sm mt-1">Available after league stage completes</p>
          </div>
        )}

        {/* FREE AGENTS (Organiser only) */}
        {tab === 'Free Agents' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 mb-4">
              <UserCheck size={15} className="text-purple-600 flex-shrink-0" />
              <p className="text-purple-700 text-sm font-medium">
                <span className="font-bold">{freeAgents.filter(fa => !invitedAgents.includes(fa.id)).length}</span> players expressed interest as free agents
              </p>
            </div>

            {freeAgents.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck size={36} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No free agents yet</p>
                <p className="text-navy-400 text-sm mt-1">Players can register interest from the Open Tournaments page</p>
              </div>
            ) : (
              <div className="space-y-3">
                {freeAgents.map(fa => (
                  <div key={fa.id} className="card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-extrabold text-sm flex-shrink-0">
                        {fa.playerName.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-navy-900 text-sm">{fa.playerName}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${POSITION_COLORS[fa.position] || 'bg-slate-100 text-slate-600'}`}>{fa.position}</span>
                        </div>
                        <p className="text-navy-500 text-xs mt-0.5">@{fa.username}</p>
                        {fa.note && <p className="text-navy-600 text-xs mt-1 italic">"{fa.note}"</p>}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mb-3">
                      <div className="text-center">
                        <p className="font-extrabold text-navy-900 text-sm tabular-nums">{fa.runs}</p>
                        <p className="text-navy-400 text-[10px]">Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-navy-900 text-sm tabular-nums">{fa.wickets}</p>
                        <p className="text-navy-400 text-[10px]">Wickets</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-navy-400 text-[10px] mb-1">Available dates</p>
                        <div className="flex flex-wrap gap-1">
                          {fa.availableDates.map((d, i) => (
                            <span key={i} className="text-[10px] font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Invite action */}
                    {invitedAgents.includes(fa.id) ? (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-green-700 text-sm font-semibold">Invite sent to team captain</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setInvitedAgents(prev => [...prev, fa.id]); }}
                        className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserCheck size={15} />Invite to Team
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
