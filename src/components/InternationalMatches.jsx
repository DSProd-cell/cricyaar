import { useEffect, useState } from 'react'
import { Circle, Globe } from 'lucide-react'
import { fetchInternationalMatches } from '../lib/internationalApi'

const REFRESH_MS = 5 * 60 * 1000

function whenLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function TeamRow({ team }) {
  return (
    <div className="flex items-center gap-2.5">
      {team.logo
        ? <img src={team.logo} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
        : <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }}>{team.short}</span>}
      <span className="flex-1 min-w-0 truncate text-[14px] font-semibold" style={{ color: 'var(--cy-text)' }}>{team.name}</span>
      {team.score && <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--cy-text)' }}>{team.score}</span>}
    </div>
  )
}

function MatchCard({ m }) {
  return (
    <div
      className="flex-shrink-0 w-[272px] rounded-2xl p-3.5"
      style={{ background: 'var(--cy-surface)', border: '1px solid var(--cy-border)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        {m.state === 'live' ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>
            <Circle size={7} fill="currentColor" className="animate-pulse" /> Live
          </span>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--cy-muted)' }}>
            {m.state === 'upcoming' ? 'Upcoming' : 'Result'}
          </span>
        )}
        {m.format && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }}>
            {m.format}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {m.teams.map(t => <TeamRow key={t.name} team={t} />)}
      </div>

      <p className="text-[12px] mt-2.5 leading-snug line-clamp-2" style={{ color: 'var(--cy-muted)' }}>
        {m.state === 'upcoming' ? whenLabel(m.startsAt) : m.status}
      </p>
      {m.venue && <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--cy-muted)' }}>{m.venue}</p>}
    </div>
  )
}

/** Horizontal strip of international matches. Renders nothing when there are none. */
export default function InternationalMatches() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    let alive = true
    const load = () => fetchInternationalMatches().then(m => { if (alive) setMatches(m) })
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => { alive = false; clearInterval(t) }
  }, [])

  if (matches.length === 0) return null

  return (
    <section className="mb-5" aria-label="International matches">
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
        <Globe size={14} style={{ color: 'var(--cy-muted)' }} />
        <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--cy-text)' }}>International</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {matches.map(m => <MatchCard key={m.id} m={m} />)}
      </div>
    </section>
  )
}
