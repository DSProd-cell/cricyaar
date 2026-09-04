import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Circle } from 'lucide-react'
import { fetchMatchById, subscribeToMatch } from '../lib/matchesApi'

function fmtOvers(legalBalls) { return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}` }

function InningsCard({ inn, match }) {
  if (!inn) return null
  const teamName = inn.battingTeamId === 'team1' ? match.team1Name : match.team2Name
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-navy-900 text-sm">{teamName}</h3>
        {!inn.completed && <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
          <Circle size={6} fill="currentColor" className="animate-pulse" />Batting
        </span>}
      </div>
      <p className="text-3xl font-extrabold text-navy-900 tabular-nums">
        {inn.runs}/{inn.wkts} <span className="text-base font-semibold text-navy-400">({fmtOvers(inn.legalBalls)})</span>
      </p>
      {inn.thisOverBalls?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {inn.thisOverBalls.map((sym, i) => (
            <span key={i} className="w-6 h-6 rounded-full bg-slate-100 text-navy-700 text-[10px] font-bold flex items-center justify-center">{sym}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LiveMatch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchMatchById(id).then(m => { if (!cancelled) { setMatch(m); setLoading(false) } })
    const unsubscribe = subscribeToMatch(id, (updated) => setMatch(prev => ({ ...prev, ...updated })))
    return () => { cancelled = true; unsubscribe() }
  }, [id])

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100" aria-label="Go back">
          <ChevronLeft size={18} className="text-navy-600" />
        </button>
        <div className="min-w-0">
          <h1 className="font-extrabold text-navy-900 text-base truncate">
            {match ? `${match.team1Name} vs ${match.team2Name}` : 'Live match'}
          </h1>
          {match?.ground && <p className="text-navy-400 text-xs truncate">{match.ground}{match.city ? `, ${match.city}` : ''}</p>}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {loading && <p className="text-navy-400 text-sm text-center py-10">Loading live score…</p>}
        {!loading && !match && <p className="text-navy-400 text-sm text-center py-10">Match not found.</p>}
        {match && (
          <>
            {match.status === 'completed' && match.result && (
              <div className="card bg-brand-50 border border-brand-100">
                <p className="text-brand-700 font-semibold text-sm text-center">
                  {match.result.margin === 'Tie' ? 'Match tied' : `Won by ${match.result.margin}`}
                </p>
              </div>
            )}
            <InningsCard inn={match.innings?.[0]} match={match} />
            <InningsCard inn={match.innings?.[1]} match={match} />
            <p className="text-navy-300 text-[11px] text-center pt-2">Updates live · overs {match.overs}</p>
          </>
        )}
      </main>
    </div>
  )
}
