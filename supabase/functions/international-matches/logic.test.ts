// Run with:  node --test supabase/functions/international-matches/logic.test.ts
// (also runs under `deno test`)
import test from 'node:test'
import assert from 'node:assert/strict'
import { isInternational, toInternationalMatch, pickInternational, type ProviderMatch } from './logic.ts'

const live: ProviderMatch = {
  id: 'm1', name: 'India vs Australia, 2nd T20I', matchType: 't20', status: 'India need 41 runs',
  venue: 'Wankhede, Mumbai', dateTimeGMT: '2026-10-09T14:00:00', matchStarted: true, matchEnded: false,
  teams: ['India', 'Australia'],
  teamInfo: [{ name: 'India', shortname: 'IND', img: 'https://x/ind.png' }, { name: 'Australia', shortname: 'AUS', img: 'https://x/aus.png' }],
  score: [{ r: 168, w: 6, o: 20, inning: 'Australia Inning 1' }, { r: 128, w: 3, o: 14.2, inning: 'India Inning 1' }],
}
const ipl: ProviderMatch = { id: 'm2', name: 'CSK vs MI', matchType: 't20', teams: ['Chennai Super Kings', 'Mumbai Indians'], matchStarted: true }
const women: ProviderMatch = { id: 'm3', name: 'India Women vs England Women', matchType: 'odi', teams: ['India Women', 'England Women'], matchStarted: false, dateTimeGMT: '2026-10-12T09:00:00' }
const done: ProviderMatch = { id: 'm4', name: 'Pakistan vs Sri Lanka', matchType: 'odi', teams: ['Pakistan', 'Sri Lanka'], matchStarted: true, matchEnded: true, dateTimeGMT: '2026-10-05T09:00:00' }
const noTeams: ProviderMatch = { id: 'm5', name: 'TBC', teams: [] }

test('keeps national sides, drops franchise and malformed matches', () => {
  assert.equal(isInternational(live), true)
  assert.equal(isInternational(women), true)
  assert.equal(isInternational(ipl), false)
  assert.equal(isInternational(noTeams), false)
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

test('orders live, then upcoming, then completed, and drops non-international', () => {
  const out = pickInternational([done, ipl, women, live, noTeams])
  assert.deepEqual(out.map(m => m.id), ['m1', 'm3', 'm4'])
})

test('respects the limit', () => {
  assert.equal(pickInternational([live, women, done], 2).length, 2)
})
