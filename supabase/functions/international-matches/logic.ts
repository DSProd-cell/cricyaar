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
  category: 'international' | 'league'
  competition: string
  matchInfo: string   // e.g. "140th Match", "Final"
  series: string      // e.g. "ICC CWC Challenge League A, 2024"
  innings: { team: string; short: string; number: number; runs: number; wickets: number; overs: number }[]
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
    .replace(/\b(women|woman)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Franchise leagues worth showing next to internationals, matched on the match
// name (which carries the series, e.g. "..., 5th Match, Indian Premier League 2026").
const LEAGUES: [RegExp, string][] = [
  [/indian premier league|\bipl\b/i, 'IPL'],
  [/women'?s premier league|\bwpl\b/i, 'WPL'],
  [/big bash|\bbbl\b/i, 'BBL'],
  [/pakistan super league|\bpsl\b/i, 'PSL'],
  [/\bsa20\b/i, 'SA20'],
  [/the hundred/i, 'The Hundred'],
  [/caribbean premier league|\bcpl\b/i, 'CPL'],
  [/lanka premier league|\blpl\b/i, 'LPL'],
  [/bangladesh premier league|\bbpl\b/i, 'BPL'],
  [/international league t20|\bilt20\b/i, 'ILT20'],
  [/major league cricket|\bmlc\b/i, 'MLC'],
]

/** The league this match belongs to, or null (so a league name only counts when the match is not a national-team game). */
export function leagueOf(m: ProviderMatch): string | null {
  const name = m.name ?? ''
  for (const [re, label] of LEAGUES) if (re.test(name)) return label
  return null
}

/** True when both sides are national teams (so franchise/domestic games are dropped). */
export function isInternational(m: ProviderMatch): boolean {
  const teams = m.teams ?? []
  if (teams.length !== 2) return false
  return teams.every(t => NATIONAL.has(baseTeamName(t)))
}

/** International or a recognised league: what the app shows. */
export function isWanted(m: ProviderMatch): boolean {
  return isInternational(m) || leagueOf(m) !== null
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

  // Match each innings to a team by its label ("<Team> Inning 1"). The provider
  // labels the side batting second with BOTH names ("A,B Inning 1"), so an
  // innings that fits no single team goes to the team that has none yet.
  const byTeam = new Map<string, NonNullable<ProviderMatch['score']>>()
  const leftovers: NonNullable<ProviderMatch['score']> = []
  for (const s of m.score ?? []) {
    const key = teamKey(s.inning.replace(/\s*Inning.*$/i, ''))
    if (names.some(n => teamKey(n) === key)) byTeam.set(key, [...(byTeam.get(key) ?? []), s])
    else leftovers.push(s)
  }
  const missing = names.filter(n => !byTeam.has(teamKey(n)))
  if (missing.length === 1 && leftovers.length) byTeam.set(teamKey(missing[0]), [leftovers[leftovers.length - 1]])

  // Every innings in the provider's order, each attributed to a team (a Test has up to four)
  const shortOf = (name: string) => info.find(x => teamKey(x.name) === teamKey(name))?.shortname ?? name.slice(0, 3).toUpperCase()
  const inningsList = (m.score ?? []).map(sc => {
    const label = sc.inning.replace(/\s*Inning.*$/i, '')
    const owner = names.find(n => teamKey(n) === teamKey(label)) ?? (missing.length === 1 ? missing[0] : label)
    return { team: owner, short: shortOf(owner), number: Number(/Inning\s*(\d+)/i.exec(sc.inning)?.[1] ?? 1), runs: sc.r, wickets: sc.w, overs: sc.o }
  })

  // "A vs B, 140th Match, ICC Cricket World Cup League 2, 2023-27" -> match number + series
  const parts = (m.name ?? '').split(',').map(p => p.trim()).filter(Boolean)
  const league = isInternational(m) ? null : leagueOf(m)
  return {
    id: m.id,
    title: m.name ?? names.join(' vs '),
    format: (m.matchType ?? '').toUpperCase(),
    status: m.status ?? '',
    venue: m.venue ?? '',
    startsAt: m.dateTimeGMT ? `${m.dateTimeGMT.replace(/Z$/, '')}Z` : null,
    state: stateOf(m),
    category: league ? 'league' : 'international',
    competition: league ?? '',
    matchInfo: parts[1] ?? '',
    series: parts.slice(2).join(', '),
    innings: inningsList,
    teams: names.map(name => {
      const i = info.find(x => teamKey(x.name) === teamKey(name))
      const innings = byTeam.get(teamKey(name)) ?? []
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
    .filter(isWanted)
    .map(toInternationalMatch)
    .sort((a, b) => {
      if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state]
      const ta = a.startsAt ? Date.parse(a.startsAt) : 0
      const tb = b.startsAt ? Date.parse(b.startsAt) : 0
      return a.state === 'upcoming' ? ta - tb : tb - ta
    })
    .slice(0, limit)
}

/**
 * How long a cached answer stays fresh, in seconds. The free CricAPI plan allows
 * about 100 calls a day, so refresh often only when something is actually
 * happening: 8 minutes while a match is live, 10 when one starts within 2 hours,
 * otherwise hourly. A full 8-hour IPL double-header day still stays well under 100.
 */
export function ttlFor(matches: InternationalMatch[], now = Date.now()): number {
  if (matches.some(m => m.state === 'live')) return 480
  const startsSoon = matches.some(m => {
    if (m.state !== 'upcoming' || !m.startsAt) return false
    const untilStart = Date.parse(m.startsAt) - now
    return untilStart < 2 * 3600_000 && untilStart > -3600_000
  })
  return startsSoon ? 600 : 3600
}
