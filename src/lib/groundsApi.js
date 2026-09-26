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
  // Embeds the owner's profile just for `upi_id` — that's the one thing a
  // renter needs at booking time that isn't already denormalized onto the
  // ground row itself (owner_name/owner_phone are). Grounds with no linked
  // owner account (e.g. the 85 seeded listings) simply come back with
  // `owner: null`, which callers treat as "no UPI payment available here".
  const { data, error } = await supabase
    .from('grounds')
    .select('*, owner:owner_id(upi_id)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return { ...mapGround(data), ownerUpiId: data.owner?.upi_id || null }
}

/** Saves the signed-in user's own UPI collection ID. Lives on `profiles`,
 * not `grounds` — it's the person's own VPA, and every signed-in user has
 * a profile row regardless of whether they've listed a ground yet. */
export async function saveMyUpiId(userId, upiId) {
  const { error } = await supabase.from('profiles').update({ upi_id: upiId }).eq('id', userId)
  if (error) throw error
}

/** Creates a booking + payment-claim row. `paymentStatus` is 'claimed_paid'
 * when the renter has just completed a UPI payment (no gateway callback to
 * verify it against — see schema_ground_payments.sql), or 'pending' when
 * the ground has no UPI ID on file and payment is being arranged directly
 * with the owner instead. */
export async function createGroundBooking({
  groundId, renterId, bookingDate, slotStart, slotEnd, ballType, players, overs, note, amount, bookingRef, paymentStatus,
}) {
  const { data, error } = await supabase
    .from('ground_bookings')
    .insert({
      ground_id: groundId, renter_id: renterId, booking_date: bookingDate,
      slot_start: slotStart, slot_end: slotEnd, ball_type: ballType,
      players, overs: overs ? Number(overs) : null, note, amount,
      booking_ref: bookingRef, payment_status: paymentStatus,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Bookings against grounds this owner runs, where the renter has claimed
 * payment but the owner hasn't yet confirmed receiving it. */
export async function fetchBookingsToConfirm(ownerId) {
  const { data, error } = await supabase
    .from('ground_bookings')
    .select('*, grounds!inner(name, owner_id), renter:renter_id(name, phone)')
    .eq('grounds.owner_id', ownerId)
    .eq('payment_status', 'claimed_paid')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    groundName: row.grounds?.name,
    renterName: row.renter?.name || 'Player',
    renterPhone: row.renter?.phone || null,
    amount: row.amount,
    slot: [row.booking_date, [row.slot_start, row.slot_end].filter(Boolean).join('–')].filter(Boolean).join(' · '),
    bookingRef: row.booking_ref,
  }))
}

/** Owner has checked their UPI app / bank statement and confirms the money
 * actually landed. */
export async function confirmBookingPayment(bookingId) {
  const { error } = await supabase.from('ground_bookings').update({ payment_status: 'confirmed' }).eq('id', bookingId)
  if (error) throw error
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
