// Run with:  node --test supabase/functions/international-matches/logic.test.ts
// (also runs under `deno test`)
import test from 'node:test'
import assert from 'node:assert/strict'
import { isInternational, isWanted, leagueOf, toInternationalMatch, pickInternational, ttlFor, type ProviderMatch } from './logic.ts'

const live: ProviderMatch = {
  id: 'm1', name: 'India vs Australia, 2nd T20I', matchType: 't20', status: 'India need 41 runs',
  venue: 'Wankhede, Mumbai', dateTimeGMT: '2026-10-09T14:00:00', matchStarted: true, matchEnded: false,
  teams: ['India', 'Australia'],
  teamInfo: [{ name: 'India', shortname: 'IND', img: 'https://x/ind.png' }, { name: 'Australia', shortname: 'AUS', img: 'https://x/aus.png' }],
  score: [{ r: 168, w: 6, o: 20, inning: 'Australia Inning 1' }, { r: 128, w: 3, o: 14.2, inning: 'India Inning 1' }],
}
const ipl: ProviderMatch = { id: 'm2', name: 'Chennai Super Kings vs Mumbai Indians, 5th Match, Indian Premier League 2026', matchType: 't20', teams: ['Chennai Super Kings', 'Mumbai Indians'], matchStarted: true, dateTimeGMT: '2026-10-09T14:00:00' }
const domestic: ProviderMatch = { id: 'm6', name: 'Karnataka vs Mumbai, Ranji Trophy', matchType: 'test', teams: ['Karnataka', 'Mumbai'], matchStarted: true }
const aTeam: ProviderMatch = { id: 'm7', name: 'New Zealand A vs India A, 1st Unofficial Test', matchType: 'test', teams: ['New Zealand A', 'India A'], matchStarted: true, matchEnded: true }
// Real CricAPI shape: the side batting second is labelled with BOTH team names
const chase: ProviderMatch = {
  id: 'm8', name: 'Afghanistan vs Zimbabwe, Final', matchType: 'odi', teams: ['Afghanistan', 'Zimbabwe'],
  matchStarted: true, matchEnded: true, dateTimeGMT: '2026-10-01T09:00:00',
  score: [{ r: 169, w: 10, o: 43.3, inning: 'zimbabwe Inning 1' }, { r: 170, w: 3, o: 34.3, inning: 'Afghanistan,Zimbabwe Inning 1' }],
}
const women: ProviderMatch = { id: 'm3', name: 'India Women vs England Women', matchType: 'odi', teams: ['India Women', 'England Women'], matchStarted: false, dateTimeGMT: '2026-10-12T09:00:00' }
const done: ProviderMatch = { id: 'm4', name: 'Pakistan vs Sri Lanka', matchType: 'odi', teams: ['Pakistan', 'Sri Lanka'], matchStarted: true, matchEnded: true, dateTimeGMT: '2026-10-05T09:00:00' }
const noTeams: ProviderMatch = { id: 'm5', name: 'TBC', teams: [] }

test('keeps national sides, drops A-teams, domestic and malformed matches', () => {
  assert.equal(isInternational(live), true)
  assert.equal(isInternational(women), true)
  assert.equal(isInternational(ipl), false)
  assert.equal(isInternational(aTeam), false)
  assert.equal(isInternational(noTeams), false)
  assert.equal(isWanted(domestic), false)
})

test('recognises IPL and other leagues from the series name', () => {
  assert.equal(leagueOf(ipl), 'IPL')
  assert.equal(leagueOf({ id: 'x', name: 'Sydney Sixers vs Perth Scorchers, Big Bash League 2026' }), 'BBL')
  assert.equal(leagueOf(live), null)
  const m = toInternationalMatch(ipl)
  assert.equal(m.category, 'league')
  assert.equal(m.competition, 'IPL')
  assert.equal(toInternationalMatch(live).category, 'international')
})

test("gives the chasing side its score despite the provider's combined label", () => {
  const m = toInternationalMatch(chase)
  assert.equal(m.teams[0].score, '170/3 (34.3)') // Afghanistan, labelled "Afghanistan,Zimbabwe"
  assert.equal(m.teams[1].score, '169/10 (43.3)')
})

test('maps a live match with per-team scores, logos and state', () => {
  const m = toInternationalMatch(live)
  assert.equal(m.state, 'live')
  assert.equal(m.format, 'T20')
  assert.equal(m.startsAt, '2026-10-09T14:00:00Z')
  assert.deepEqual(m.teams.map(t => t.short), ['IND', 'AUS'])
  assert.equal(m.teams[0].score, '128/3 (14.2)')
  assert.equal(m.teams[1].score, '168/6 (20)')
  assert.equal(m.teams[0].logo, 'https://x/ind.png')
})

test('an upcoming match has no scores and falls back to a short name', () => {
  const m = toInternationalMatch(women)
  assert.equal(m.state, 'upcoming')
  assert.equal(m.teams[0].score, null)
  assert.equal(m.teams[0].short, 'IND')
})

test('orders live, then upcoming, then completed, and drops unwanted matches', () => {
  const out = pickInternational([done, domestic, aTeam, women, live, noTeams])
  assert.deepEqual(out.map(m => m.id), ['m1', 'm3', 'm4'])
})

test('a live IPL match sorts with the live internationals', () => {
  const out = pickInternational([done, women, ipl, live])
  assert.deepEqual(out.map(m => m.state), ['live', 'live', 'upcoming', 'completed'])
  assert.ok(out.some(m => m.competition === 'IPL'))
})

test('respects the limit', () => {
  assert.equal(pickInternational([live, women, done], 2).length, 2)
})

test('cache window: short while live, longer when quiet, so the free plan lasts all day', () => {
  const now = Date.parse('2026-10-09T15:00:00Z')
  const liveNow = pickInternational([live])
  const soon = pickInternational([{ ...women, dateTimeGMT: '2026-10-09T16:30:00' }])
  const later = pickInternational([{ ...women, dateTimeGMT: '2026-10-12T09:00:00' }])
  assert.equal(ttlFor(liveNow, now), 480)
  assert.equal(ttlFor(soon, now), 600)
  assert.equal(ttlFor(later, now), 3600)
  assert.equal(ttlFor([], now), 3600)
  // worst case: 8 live hours at 8 min + 16 quiet hours hourly
  assert.ok((8 * 3600 / 480) + (16 * 3600 / 3600) < 100)
})

test('exposes every innings with its owner, plus the match number and series', () => {
  const m = toInternationalMatch({
    id: 'm9', name: 'India vs Australia, 3rd Test, Border-Gavaskar Trophy, 2026', matchType: 'test',
    teams: ['India', 'Australia'], matchStarted: true,
    score: [
      { r: 312, w: 10, o: 98.2, inning: 'India Inning 1' },
      { r: 280, w: 10, o: 90, inning: 'Australia Inning 1' },
      { r: 141, w: 3, o: 40, inning: 'India Inning 2' },
    ],
  })
  assert.equal(m.matchInfo, '3rd Test')
  assert.equal(m.series, 'Border-Gavaskar Trophy, 2026')
  assert.deepEqual(m.innings.map(i => `${i.short}#${i.number} ${i.runs}/${i.wickets}`), ['IND#1 312/10', 'AUS#1 280/10', 'IND#2 141/3'])
})

test("the provider's combined chase label still gives the innings to the right team", () => {
  const m = toInternationalMatch(chase)
  assert.deepEqual(m.innings.map(i => i.team), ['Zimbabwe', 'Afghanistan'])
})
