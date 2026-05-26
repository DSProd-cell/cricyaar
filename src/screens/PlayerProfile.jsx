import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PLAYERS, MATCHES, TEAMS, teamById, initials } from '../data/mock'
import { avg, sr, eco } from '../utils/cricket'
import TopBar from '../components/TopBar'
import { BarChart2, Activity, Star, Edit, Users, Trophy } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TABS = ['Overview','Batting','Bowling','Fielding','Matches']

export default function PlayerProfile() {
  const { user } = useStore()
  const navigate = useNavigate()
  const { playerId } = useParams()
  // If /profile/:id, show that player; else show logged-in user
  const player   = (playerId ? PLAYERS.find(p => p.id === playerId) : PLAYERS.find(p => p.id === (user?.id || 'p1'))) || PLAYERS[0]
  const isOwnProfile = !playerId || player.id === user?.id
  const [tab, setTab] = useState('Overview')
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
    <div className="min-h-dvh flex flex-col">
      <TopBar title={isOwnProfile ? 'My Profile' : player.name.split(' ')[0] + "'s Profile"} showBack />

      {/* Profile header */}
      <div className="bg-white px-4 pt-4 pb-0 border-b border-slate-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
            {initials(player.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-navy-900 text-xl">{player.name}</h1>
            <p className="text-navy-500 text-sm">@{player.username} · {player.city}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {player.roles.map(r => <span key={r} className="badge badge-green text-[10px]">{r.replace('_',' ')}</span>)}
            </div>
          </div>
          {isOwnProfile && (
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0">
              <Edit size={16} className="text-navy-500" />
            </button>
          )}
        </div>

        {/* Teams this player is in */}
        {playerTeams.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {playerTeams.map(t => (
              <button key={t.id} onClick={() => navigate('/teams')}
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
      </main>
    </div>
  )
}
