import { supabase } from './supabase'

function mapMatch(row) {
  return {
    id: row.id,
    scorerId: row.scorer_id,
    team1Name: row.team1_name,
    team2Name: row.team2_name,
    ground: row.ground,
    city: row.city,
    overs: row.overs,
    tossWinnerName: row.toss_winner_name,
    tossChoice: row.toss_choice,
    status: row.status,
    inningsIdx: row.current_innings_idx,
    innings: row.innings || [],
    result: row.result,
    specialOutcome: row.special_outcome,
    updatedAt: row.updated_at,
  }
}

/** Called once when an umpire starts scoring — creates the DB row that
 * every subsequent ball updates. Returns the new match's id. */
export async function createLiveMatch({ scorerId, team1Name, team2Name, ground, city, overs, tossWinnerName, tossChoice, innings }) {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      scorer_id: scorerId,
      team1_name: team1Name,
      team2_name: team2Name,
      ground: ground || null,
      city: city || null,
      overs,
      toss_winner_name: tossWinnerName || null,
      toss_choice: tossChoice || null,
      innings,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

/** Pushed on every ball — keeps the DB row (and every subscribed viewer) in sync. */
export async function updateMatchInnings(matchId, { innings, inningsIdx, status, result, specialOutcome }) {
  const patch = { innings, updated_at: new Date().toISOString() }
  if (inningsIdx !== undefined) patch.current_innings_idx = inningsIdx
  if (status !== undefined) patch.status = status
  if (result !== undefined) patch.result = result
  if (specialOutcome !== undefined) patch.special_outcome = specialOutcome
  const { error } = await supabase.from('matches').update(patch).eq('id', matchId)
  if (error) throw error
}

export async function fetchLiveMatches() {
  const { data, error } = await supabase.from('matches').select('*').eq('status', 'live').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapMatch)
}

export async function fetchMatchById(id) {
  const { data, error } = await supabase.from('matches').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapMatch(data) : null
}

/** Subscribes to live updates for one match. Returns an unsubscribe function. */
export function subscribeToMatch(id, onUpdate) {
  const channel = supabase
    .channel(`match-${id}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
      onUpdate(mapMatch(payload.new))
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}
