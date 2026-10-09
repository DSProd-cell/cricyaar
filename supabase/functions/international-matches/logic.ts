// Pure, unit-tested helpers for the international-matches function: deciding
// which provider matches are international, and reshaping them for the app.
// Nothing here touches the network, so it runs the same under Deno and Node.

export interface ProviderMatch {
  id: string
  name?: string
  matchType?: string
  status?: string
  venue?: string
  dateTimeGMT?: string
  teams?: string[]
  teamInfo?: { name: string; shortname?: string; img?: string }[]
  score?: { r: number; w: number; o: number; inning: string }[]
  matchStarted?: boolean
  matchEnded?: boolean
}

export interface InternationalMatch {
  id: string
  title: string
  format: string
  status: string
  venue: string
  startsAt: string | null
  state: 'live' | 'upcoming' | 'completed'
  teams: { name: string; short: string; logo: string | null; score: string | null }[]
}

// Full ICC members plus the associates that regularly play televised
// internationals. Women's sides are matched by their "<Country> Women" name.
export const NATIONAL_TEAMS = [
  'India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan',
  'Sri Lanka', 'Bangladesh', 'West Indies', 'Afghanistan', 'Ireland', 'Zimbabwe',
  'Netherlands', 'Scotland', 'Nepal', 'United Arab Emirates', 'Oman', 'Namibia',
  'Canada', 'United States of America', 'USA', 'Papua New Guinea', 'Italy',
  'Hong Kong', 'Kenya', 'Uganda', 'Jersey', 'Singapore', 'Malaysia', 'Bermuda',
]

const NATIONAL = new Set(NATIONAL_TEAMS.map(t => t.toLowerCase()))

function baseTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(women|woman|w|u19|under[- ]19|a|emerging)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when both sides are national teams (so franchise/domestic games are dropped). */
export function isInternational(m: ProviderMatch): boolean {
  const teams = m.teams ?? []
  if (teams.length !== 2) return false
  return teams.every(t => NATIONAL.has(baseTeamName(t)))
}

function formatScore(s?: { r: number; w: number; o: number }): string | null {
  if (!s) return null
  return `${s.r}/${s.w} (${s.o})`
}

function teamKey(name: string): string {
  return name.replace(/\s*\[.*\]\s*$/, '').trim().toLowerCase()
}

function stateOf(m: ProviderMatch): InternationalMatch['state'] {
  if (m.matchEnded) return 'completed'
  if (m.matchStarted) return 'live'
  return 'upcoming'
}

/** Reshape one provider match for the app. */
export function toInternationalMatch(m: ProviderMatch): InternationalMatch {
  const names = m.teams ?? []
  const info = m.teamInfo ?? []
  return {
    id: m.id,
    title: m.name ?? names.join(' vs '),
    format: (m.matchType ?? '').toUpperCase(),
    status: m.status ?? '',
    venue: m.venue ?? '',
    startsAt: m.dateTimeGMT ? `${m.dateTimeGMT.replace(/Z$/, '')}Z` : null,
    state: stateOf(m),
    teams: names.map(name => {
      const i = info.find(x => teamKey(x.name) === teamKey(name))
      // Provider innings are labelled "<Team> Inning 1"; sum nothing, show the latest innings
      const innings = (m.score ?? []).filter(s => teamKey(s.inning.replace(/\s*Inning.*$/i, '')) === teamKey(name))
      return {
        name,
        short: i?.shortname ?? name.slice(0, 3).toUpperCase(),
        logo: i?.img ?? null,
        score: formatScore(innings[innings.length - 1]),
      }
    }),
  }
}

/** Live first, then upcoming (soonest first), then completed (latest first). */
export function pickInternational(matches: ProviderMatch[], limit = 12): InternationalMatch[] {
  const rank = { live: 0, upcoming: 1, completed: 2 } as const
  return matches
    .filter(isInternational)
    .map(toInternationalMatch)
    .sort((a, b) => {
      if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state]
      const ta = a.startsAt ? Date.parse(a.startsAt) : 0
      const tb = b.startsAt ? Date.parse(b.startsAt) : 0
      return a.state === 'upcoming' ? ta - tb : tb - ta
    })
    .slice(0, limit)
}
