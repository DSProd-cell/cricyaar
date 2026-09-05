import { supabase } from './supabase'

// The database uses snake_case columns; every existing screen (built against
// the old mock.js shape) expects camelCase. Mapping here means GroundSearch,
// GroundDetail, etc. don't need to change how they read a ground at all.
function mapGround(row) {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    city: row.city,
    state: row.state,
    pitchType: row.pitch_type,
    pitchCondition: row.pitch_condition,
    floodlights: row.floodlights,
    floodlightHours: row.floodlight_hours,
    rentPerHour: row.rent_per_hour,
    rentPerMatch: row.rent_per_match,
    rating: row.rating,
    ratingCount: row.rating_count,
    matchCount: row.match_count,
    facilities: row.facilities || {},
    photos: row.photos || [],
    lat: row.lat,
    lng: row.lng,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    ownerPhoneAlt: row.owner_phone_alt,
    ownerId: row.owner_id,
    status: row.status,
    recentMatches: [], // matches aren't migrated yet (Phase 2 scoped to grounds)
  }
}

export async function fetchApprovedGrounds(city) {
  let query = supabase.from('grounds').select('*').eq('status', 'approved')
  if (city) query = query.eq('city', city)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapGround)
}

/** A ground owner's own listings, any status — pending ones included so
 * they can track review progress. Shaped to match what GroundOwnerHome's
 * cards expect, with honest zeros for stats we don't track yet (bookings,
 * revenue) rather than borrowed mock numbers. */
export async function fetchMyGrounds(ownerId) {
  const { data, error } = await supabase
    .from('grounds')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(row => ({
    ...mapGround(row),
    totalMatches: row.match_count || 0,
    thisMonth: { bookings: 0, matches: 0, revenue: '₹0' },
    lastMonth: { bookings: 0, matches: 0, revenue: '₹0' },
  }))
}

export async function fetchGroundById(id) {
  const { data, error } = await supabase.from('grounds').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapGround(data) : null
}

/** Snake_case payload ready for `.insert()` — the reverse of mapGround. */
export function toGroundRow({ ownerId, name, area, city, state, pitchType, pitchCondition,
  floodlights, floodlightHours, rentPerHour, rentPerMatch, facilities, ownerName, ownerPhone, lat, lng }) {
  return {
    owner_id: ownerId,
    name, area, city, state,
    pitch_type: pitchType,
    pitch_condition: pitchCondition,
    floodlights: !!floodlights,
    floodlight_hours: floodlightHours || null,
    rent_per_hour: rentPerHour || null,
    rent_per_match: rentPerMatch || null,
    facilities: facilities || {},
    owner_name: ownerName || null,
    owner_phone: ownerPhone || null,
    lat: lat ?? null,
    lng: lng ?? null,
    status: 'pending',
  }
}
