import { useEffect, useState } from 'react'
import { Circle, Globe, X, MapPin, Calendar, Trophy, Hash } from 'lucide-react'
import { fetchInternationalMatches } from '../lib/internationalApi'

const REFRESH_MS = 5 * 60 * 1000
const VIOLET = '#7C3AED'

function whenLabel(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function ordinal(n) {
  const suffix = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
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

function StateBadge({ state }) {
  if (state === 'live') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>
        <Circle size={7} fill="currentColor" className="animate-pulse" /> Live
      </span>
    )
  }
  return (
    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--cy-muted)' }}>
      {state === 'upcoming' ? 'Upcoming' : 'Result'}
    </span>
  )
}

function Tags({ m }) {
  return (
    <span className="flex items-center gap-1.5">
      {m.competition && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: VIOLET, color: '#fff' }}>{m.competition}</span>
      )}
      {m.format && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }}>{m.format}</span>
      )}
    </span>
  )
}

function MatchCard({ m, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(m)}
      aria-label={`${m.title}. Open match info`}
      className="flex-shrink-0 w-[272px] rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
      style={{ background: 'var(--cy-surface)', border: '1px solid var(--cy-border)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <StateBadge state={m.state} />
        <Tags m={m} />
      </div>

      <div className="space-y-2">
        {m.teams.map(t => <TeamRow key={t.name} team={t} />)}
      </div>

      <p className="text-[12px] mt-2.5 leading-snug line-clamp-2" style={{ color: 'var(--cy-muted)' }}>
        {m.state === 'upcoming' ? whenLabel(m.startsAt) : m.status}
      </p>
      {m.venue && <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--cy-muted)' }}>{m.venue}</p>}
      <p className="text-[11px] font-bold mt-2" style={{ color: VIOLET }}>Match info →</p>
    </button>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--cy-muted)' }} />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--cy-muted)' }}>{label}</p>
        <p className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--cy-text)' }}>{value}</p>
      </div>
    </div>
  )
}

function MatchInfoSheet({ m, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const divider = { borderTop: '1px solid var(--cy-border)' }
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose} role="dialog" aria-modal="true" aria-label={m.title}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative rounded-t-3xl w-full max-w-lg mx-auto max-h-[88dvh] overflow-y-auto animate-slide-up"
        style={{ background: 'var(--cy-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 px-5 pt-3 pb-3" style={{ background: 'var(--cy-surface)', borderBottom: '1px solid var(--cy-border)' }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--cy-border)' }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <StateBadge state={m.state} />
              <Tags m={m} />
            </div>
            <button
              onClick={onClose} aria-label="Close"
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--cy-subtle)' }}
            >
              <X size={16} style={{ color: 'var(--cy-text)' }} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Teams and the score each side is on */}
          <div className="py-4 space-y-3">
            {m.teams.map(t => (
              <div key={t.name} className="flex items-center gap-3">
                {t.logo
                  ? <img src={t.logo} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  : <span className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
                      style={{ background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }}>{t.short}</span>}
                <p className="flex-1 min-w-0 text-[17px] font-extrabold leading-tight" style={{ color: 'var(--cy-text)' }}>{t.name}</p>
                <p className="text-[20px] font-extrabold tabular-nums" style={{ color: 'var(--cy-text)' }}>{t.score ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* Result / live status */}
          {(m.state !== 'upcoming' && m.status) && (
            <p className="rounded-xl px-4 py-3 text-[14px] font-bold leading-snug" style={{ background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }}>
              {m.status}
            </p>
          )}

          {/* Innings, in batting order */}
          {m.innings?.length > 0 && (
            <div className="mt-4" style={divider}>
              <p className="text-[11px] font-bold uppercase tracking-wide pt-3 pb-1" style={{ color: 'var(--cy-muted)' }}>Innings</p>
              {m.innings.map((inn, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5" style={i ? divider : undefined}>
                  <span className="text-[13px] font-semibold flex-1 min-w-0 truncate" style={{ color: 'var(--cy-text)' }}>
                    {inn.team} <span style={{ color: 'var(--cy-muted)', fontWeight: 500 }}>· {ordinal(inn.number)} innings</span>
                  </span>
                  <span className="text-[15px] font-extrabold tabular-nums" style={{ color: 'var(--cy-text)' }}>{inn.runs}/{inn.wickets}</span>
                  <span className="text-[12px] tabular-nums w-16 text-right" style={{ color: 'var(--cy-muted)' }}>{inn.overs} ov</span>
                </div>
              ))}
            </div>
          )}

          {/* About the match */}
          <div className="mt-4" style={divider}>
            <InfoRow icon={Calendar} label={m.state === 'upcoming' ? 'Starts' : 'Date'} value={whenLabel(m.startsAt)} />
            <InfoRow icon={MapPin} label="Venue" value={m.venue} />
            <InfoRow icon={Hash} label="Match" value={m.matchInfo} />
            <InfoRow icon={Trophy} label="Series" value={m.series || m.competition} />
          </div>

          <p className="text-[11px] mt-3 text-center" style={{ color: 'var(--cy-muted)' }}>
            Scores refresh every few minutes while a match is live.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Horizontal strip of live / upcoming / recent matches. Renders nothing when there are none. */
export default function InternationalMatches() {
  const [matches, setMatches] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'international' | 'league'
  const [open, setOpen] = useState(null)

  useEffect(() => {
    let alive = true
    const load = () => fetchInternationalMatches().then(m => { if (alive) setMatches(m) })
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => { alive = false; clearInterval(t) }
  }, [])

  if (matches.length === 0) return null

  const hasBoth = matches.some(m => m.category === 'league') && matches.some(m => m.category !== 'league')
  const shown = !hasBoth || filter === 'all'
    ? matches
    : matches.filter(m => (filter === 'league') === (m.category === 'league'))
  const chips = [['all', 'All'], ['international', 'International'], ['league', 'IPL & leagues']]
  // Keep the open sheet in step with the latest refresh of the same match
  const openMatch = open ? (matches.find(m => m.id === open.id) ?? open) : null

  return (
    <section className="mb-5" aria-label="Live cricket">
      <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
        <Globe size={14} style={{ color: 'var(--cy-muted)' }} />
        <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--cy-text)' }}>Live Cricket</h3>
      </div>
      {hasBoth && (
        <div className="flex gap-2 mb-2.5">
          {chips.map(([key, label]) => (
            <button
              key={key} type="button" onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-full text-[12px] font-bold border-2 transition-colors"
              style={filter === key
                ? { background: VIOLET, borderColor: VIOLET, color: '#fff' }
                : { background: 'transparent', borderColor: 'var(--cy-border)', color: 'var(--cy-text)' }}
            >{label}</button>
          ))}
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {shown.map(m => <MatchCard key={m.id} m={m} onOpen={setOpen} />)}
      </div>
      {openMatch && <MatchInfoSheet m={openMatch} onClose={() => setOpen(null)} />}
    </section>
  )
}
