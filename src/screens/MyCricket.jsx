import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MATCHES, teamById, groundById } from '../data/mock'
import TopBar from '../components/TopBar'
import MatchScoreSheet from '../components/MatchScoreSheet'
import FollowButton from '../components/FollowButton'
import { Activity, Circle, MapPin, Clock } from 'lucide-react'

const TABS = ['Live','Upcoming','Past']

function MatchCard({ match, onClick }) {
  const t1 = teamById(match.team1), t2 = teamById(match.team2)
  const g  = groundById(match.ground)
  const inn = match.innings?.[0]
  const inn2 = match.innings?.[1]

  return (
    <button onClick={onClick} className="card card-hover w-full text-left mb-3 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-semibold text-navy-900 text-sm">{match.name}</p>
          <div className="flex items-center gap-1.5 mt-1 text-navy-500 text-xs">
            <MapPin size={11} />
            <span>{g?.name || 'TBD'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <FollowButton type="match" item={match} label="Follow" size="sm" />
          {match.status === 'live' && <span className="badge badge-live flex items-center gap-1"><Circle size={6} fill="currentColor" />Live</span>}
          {match.status === 'upcoming' && <span className="badge badge-blue">Upcoming</span>}
          {match.status === 'completed' && <span className="badge badge-navy">Completed</span>}
        </div>
      </div>

      {/* Scorecard mini */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:t1?.color||'#22c55e'}}>
              {t1?.name?.[0]||'?'}
            </div>
            <span className="font-semibold text-navy-900 text-sm">{t1?.name}</span>
          </div>
          {inn && <span className="font-bold text-navy-900 tabular-nums">{inn.runs}/{inn.wkts} <span className="text-navy-400 font-normal text-xs">({inn.overs} ov)</span></span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:t2?.color||'#3b82f6'}}>
              {t2?.name?.[0]||'?'}
            </div>
            <span className="font-semibold text-navy-900 text-sm">{t2?.name}</span>
          </div>
          {inn2 && inn2.runs > 0
            ? <span className="font-bold text-navy-900 tabular-nums">{inn2.runs}/{inn2.wkts} <span className="text-navy-400 font-normal text-xs">({inn2.overs} ov)</span></span>
            : match.status !== 'upcoming' && inn && <span className="text-navy-400 text-sm">Yet to bat</span>}
        </div>
      </div>

      {match.result && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-brand-600 font-semibold text-sm">{teamById(match.result.winner)?.name} won by {match.result.margin}</p>
        </div>
      )}

      {match.status === 'upcoming' && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-navy-500 text-xs">
          <Clock size={11} />
          <span>{match.date} at {match.time} · {match.overs} overs per side</span>
        </div>
      )}
    </button>
  )
}

export default function MyCricket() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Live')
  const [scoreMatch, setScoreMatch] = useState(null)

  const filtered = MATCHES.filter(m =>
    tab === 'Live'     ? m.status === 'live'      :
    tab === 'Upcoming' ? m.status === 'upcoming'  :
    m.status === 'completed'
  )

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="My Cricket" showBack />
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} className={`tab-item ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t}
            {t === 'Live' && MATCHES.filter(m=>m.status==='live').length > 0 && (
              <span className="ml-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] inline-flex items-center justify-center font-bold">
                {MATCHES.filter(m=>m.status==='live').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-44">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Activity size={40} className="mx-auto text-navy-300 mb-3" />
            <p className="font-semibold text-navy-500">No {tab.toLowerCase()} matches</p>
          </div>
        ) : filtered.map(m => (
          <MatchCard key={m.id} match={m} onClick={() =>
            m.status === 'upcoming' ? navigate(`/match/${m.id}`) : setScoreMatch(m)
          } />
        ))}
      </main>

      {scoreMatch && <MatchScoreSheet match={scoreMatch} onClose={() => setScoreMatch(null)} />}
    </div>
  )
}
