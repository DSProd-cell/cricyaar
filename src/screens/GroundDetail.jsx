import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { MATCHES, teamById, TEAMS } from '../data/mock'
import { fetchGroundById } from '../lib/groundsApi'
import { useStore } from '../store/useStore'
import TopBar from '../components/TopBar'
import { Star, MapPin, Sun, Moon, Car, ShowerHead, Dumbbell, Droplets, Coffee, HeartPulse, Phone, MessageCircle, ChevronRight, Navigation, Crown, Lock, Zap, Calendar, X, Check, CheckCircle, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ ground, day, slot, onClose, onConfirm }) {
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const ref = `CM-${Math.random().toString(36).substr(2,6).toUpperCase()}`

  if (confirmed) return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-modal animate-slide-up px-5 pt-5 pb-10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-1 mb-5"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h2 className="font-extrabold text-navy-900 text-xl mb-1">Booking Requested!</h2>
          <p className="text-navy-500 text-sm mb-3">The ground owner will confirm your slot via WhatsApp or call within 2 hours.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mb-5 w-full">
            <p className="text-xs text-navy-400 mb-0.5">Booking Reference</p>
            <p className="font-bold text-navy-900 font-mono text-lg">{ref}</p>
          </div>
          <div className="text-sm text-navy-600 space-y-1 w-full text-left bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-5">
            <p><span className="text-navy-400">Ground:</span> <strong>{ground.name}</strong></p>
            <p><span className="text-navy-400">Date:</span> <strong>{day.label}</strong></p>
            <p><span className="text-navy-400">Slot:</span> <strong>{slot.label}</strong></p>
          </div>
          <button className="btn-primary w-full" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-bold text-navy-900">Book Slot</h2>
            <p className="text-navy-500 text-xs mt-0.5">{ground.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={14} className="text-navy-500" />
          </button>
        </div>
        <div className="px-5 pb-8 space-y-4">
          {/* Slot info */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-navy-500">Date</span><span className="font-semibold text-navy-900">{day.label}</span></div>
            <div className="flex justify-between"><span className="text-navy-500">Time slot</span><span className="font-semibold text-navy-900">{slot.label}</span></div>
            <div className="flex justify-between"><span className="text-navy-500">Rate</span>
              <span className="font-semibold text-navy-900">
                {ground.rentPerHour ? `₹${ground.rentPerHour.toLocaleString('en-IN')}/hr` : ground.rentPerMatch ? `₹${ground.rentPerMatch.toLocaleString('en-IN')}/match` : 'Price on enquiry'}
              </span>
            </div>
          </div>
          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Note to owner <span className="font-normal text-navy-400">(optional)</span></label>
            <textarea
              className="cm-input resize-none"
              rows={2}
              placeholder="e.g. Need floodlights, 22 players, T20 match"
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 120))}
            />
          </div>
          <button
            className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-colors"
            onClick={() => setConfirmed(true)}
          >
            Confirm Booking Request
          </button>
          <p className="text-navy-400 text-xs text-center">This sends a booking request. Final confirmation comes from the owner.</p>
        </div>
      </div>
    </div>
  )
}

const FACILITY_ICONS = {
  parking:      { icon:Car,       label:'Parking'      },
  changingRoom: { icon:ShowerHead,label:'Changing Room' },
  practiceNets: { icon:Dumbbell,  label:'Practice Nets' },
  washrooms:    { icon:Droplets,  label:'Washrooms'    },
  cafeteria:    { icon:Coffee,    label:'Cafeteria'    },
  firstAid:     { icon:HeartPulse,label:'First Aid'    },
}

const CONDITION_STYLE = {
  Fresh:   'bg-green-100 text-green-700',
  Worn:    'bg-amber-100 text-amber-700',
  Damp:    'bg-blue-100 text-blue-700',
  Dusty:   'bg-orange-100 text-orange-700',
  Unknown: 'bg-gray-100 text-gray-600',
}

const PITCH_STYLE = {
  Turf:        'bg-green-100 text-green-700',
  Matting:     'bg-purple-100 text-purple-700',
  Cement:      'bg-gray-100 text-gray-700',
  'Red Soil':  'bg-red-100 text-red-700',
  'Astro Turf':'bg-cyan-100 text-cyan-700',
}

// ── Deterministic slot availability from ground ID + day offset ──────────
const SLOT_LABELS = ['Morning (6–9 AM)', 'Afternoon (2–5 PM)', 'Evening (6–9 PM)']
const SLOT_STATUS = ['available', 'booked', 'unavailable']
function slotForDay(groundId, dayOffset, slotIdx) {
  const seed = (groundId.charCodeAt(1) * 7 + dayOffset * 13 + slotIdx * 5) % 10
  return seed < 5 ? 'available' : seed < 8 ? 'booked' : 'unavailable'
}

// ── Fake match history for grounds ───────────────────────────────────────
const GROUND_HISTORY = {
  g1: [
    { teams:'Mumbai Mavericks vs Delhi Dragons', date:'Mar 20', result:'MUM won', format:'T20', matchId:'m1' },
    { teams:'Mumbai Mavericks vs Chennai Chiefs', date:'Mar 15', result:'MUM won', format:'T20', matchId:'m2' },
    { teams:'Bandra Bears vs Andheri Aces', date:'Mar 12', result:'Bandra won', format:'T10', matchId:null },
    { teams:'Colaba Cannons vs Marine Drive XI', date:'Mar 10', result:'Colaba won', format:'T20', matchId:null },
    { teams:'Mumbai Mavericks vs Bengaluru Bulls', date:'Mar 5', result:'MUM won', format:'T20', matchId:'m3' },
  ],
  g4: [
    { teams:'Chinnaswamy XI vs MG Road Warriors', date:'Mar 18', result:'Chinnaswamy won', format:'T20', matchId:null },
    { teams:'Koramangala KC vs Indiranagar XI', date:'Mar 14', result:'Koramangala won', format:'T10', matchId:null },
    { teams:'BTM Blazers vs JP Nagar Jets', date:'Mar 10', result:'BTM won', format:'T20', matchId:null },
  ],
}

export default function GroundDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user, addToast } = useStore()
  const [ground, setGround] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchGroundById(id)
      .then(g => { if (!cancelled) setGround(g) })
      .catch(() => { if (!cancelled) setGround(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])
  const [userRating, setUserRating] = useState(0)
  const [bookingTarget, setBookingTarget] = useState(null) // { day, slot }

  // ── v3: Tier 2 access logic ───────────────────────────────────────────────
  const role      = user?.role || 'fan'
  const isPro     = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isCaptain = TEAMS.some(t => t.captain === user?.id)

  // Who can see Tier 2?
  const canTier2    = role === 'admin' || ((role === 'organiser' || isCaptain) && isPro)
  // Who sees the blurred paywall instead?
  const tier2Paywall = !canTier2 && (role === 'organiser' || isCaptain) && !isPro
  // All others (player who's not captain, umpire, fan) — no Tier 2 card shown at all

  // Generate 30-day slots
  const today     = new Date()
  const slots     = Array.from({ length: 30 }, (_, i) => {
    const d    = new Date(today)
    d.setDate(today.getDate() + i)
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })
    return { label, slots: SLOT_LABELS.map((sl, si) => ({ label: sl, status: slotForDay(id, i, si) })) }
  })

  const matchHistory = GROUND_HISTORY[id] || [
    { teams:'Team A vs Team B', date:'Mar 18', result:'Team A won', format:'T20' },
    { teams:'Team C vs Team D', date:'Mar 12', result:'Team C won', format:'T10' },
    { teams:'Team E vs Team F', date:'Mar 6',  result:'Team F won', format:'T20' },
  ]

  if (loading) return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <TopBar title="Ground" showBack />
      <div className="flex-1 flex items-center justify-center text-navy-400">Loading ground…</div>
    </div>
  )

  if (!ground) return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <TopBar title="Ground" showBack />
      <div className="flex-1 flex items-center justify-center text-navy-400">Ground not found.</div>
    </div>
  )

  const recentMatches = ground.recentMatches?.map(id => MATCHES.find(m => m.id === id)).filter(Boolean) || []

  const isMaskedPhone = ground.ownerPhone?.includes('X')

  const handleWhatsApp = () => {
    if (isMaskedPhone) { addToast('Full contact number coming soon — book via app for now.', 'info'); return }
    const phone = ground.ownerPhone?.replace(/\D/g, '') || '919999999999'
    const msg   = encodeURIComponent(`Hi, I'm interested in booking ${ground.name} via CricYaar. Is tomorrow available?`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const handleCall = () => {
    if (isMaskedPhone) { addToast('Full contact number coming soon — book via app for now.', 'info'); return }
    window.location.href = `tel:${ground.ownerPhone || '+919999999999'}`
  }

  const handleDirections = () => {
    const url = ground.lat && ground.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${ground.lat},${ground.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${ground.name}, ${ground.area}, ${ground.city}`)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <TopBar title={ground.name} showBack />
      <main className="flex-1 max-w-2xl mx-auto w-full min-w-0">
        {/* Photo carousel */}
        <div className="relative w-full h-48 bg-gradient-to-br from-brand-100 to-brand-50 overflow-hidden">
          {ground.photos?.length > 0 ? (
            <img src={ground.photos[photoIdx]} alt={ground.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <MapPin size={36} className="text-brand-400 mb-2" />
              <p className="text-brand-500 font-semibold">{ground.area}, {ground.city}</p>
            </div>
          )}
          {/* dot indicators */}
          {ground.photos?.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {ground.photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)} className={`w-1.5 h-1.5 rounded-full ${i===photoIdx?'bg-white':'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Name & Rating */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-extrabold text-navy-900 text-xl leading-tight">{ground.name}</h1>
              <p className="text-navy-500 text-sm mt-0.5">{ground.area}, {ground.city}, {ground.state}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              {ground.ratingCount > 0 ? (
                <>
                  <Star size={14} fill="#f59e0b" className="text-amber-400" />
                  <span className="font-bold text-navy-900">{ground.rating}</span>
                  <span className="text-navy-400 text-xs">({ground.ratingCount})</span>
                </>
              ) : (
                <span className="text-amber-600 font-semibold text-sm">New listing</span>
              )}
            </div>
          </div>

          {/* Key badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`badge text-sm py-1 px-3 ${PITCH_STYLE[ground.pitchType] || 'badge-navy'}`}>{ground.pitchType} Pitch</span>
            <span className={`badge text-sm py-1 px-3 font-bold ${CONDITION_STYLE[ground.pitchCondition]}`}>
              {ground.pitchCondition} Condition
            </span>
            {ground.floodlights ? (
              <span className="badge badge-amber text-sm py-1 px-3"><Moon size={11} /> Floodlights</span>
            ) : (
              <span className="badge badge-navy text-sm py-1 px-3 opacity-60">No Floodlights</span>
            )}
          </div>

          {/* Rent */}
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-2 text-sm">Pricing</h3>
            <div className="flex gap-4">
              {ground.rentPerHour && (
                <div>
                  <p className="text-navy-400 text-xs">Per hour</p>
                  <p className="font-bold text-navy-900 text-lg">₹{ground.rentPerHour.toLocaleString('en-IN')}</p>
                </div>
              )}
              {ground.rentPerMatch && (
                <div>
                  <p className="text-navy-400 text-xs">Per match</p>
                  <p className="font-bold text-navy-900 text-lg">₹{ground.rentPerMatch.toLocaleString('en-IN')}</p>
                </div>
              )}
              {!ground.rentPerHour && !ground.rentPerMatch && <p className="text-navy-500 text-sm">Price on enquiry via WhatsApp</p>}
            </div>
            {ground.floodlights && ground.floodlightHours && (
              <p className="text-navy-500 text-xs mt-2">Floodlights: {ground.floodlightHours}</p>
            )}
          </div>

          {/* Facilities */}
          <div className="card">
            <h3 className="font-semibold text-navy-900 mb-3 text-sm">Facilities</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(FACILITY_ICONS).map(([key, { icon: Icon, label }]) => {
                const avail = ground.facilities[key]
                return (
                  <div key={key} className={`facility-icon ${avail ? 'text-navy-700' : 'text-navy-400'}`}>
                    <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${avail ? 'bg-brand-50' : 'bg-slate-100'}`}>
                      <Icon size={18} className={avail ? 'text-brand-600' : 'text-navy-300'} />
                      <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ${avail ? 'bg-brand-500' : 'bg-slate-400'}`}>
                        {avail
                          ? <Check size={9} className="text-white" strokeWidth={3.5} />
                          : <X size={9} className="text-white" strokeWidth={3.5} />
                        }
                      </span>
                    </div>
                    <span className={`text-center leading-tight ${avail ? 'font-semibold' : ''}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats + Total matches badge */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-tile">
              <div className="flex items-center justify-center gap-1">
                <Zap size={18} className="text-amber-500" />
                <p className="text-3xl font-extrabold text-navy-900 tabular-nums">{ground.matchCount}</p>
              </div>
              <p className="text-navy-500 text-xs mt-0.5">Matches on CricYaar</p>
            </div>
            <div className="stat-tile">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star size={20} fill="currentColor" />
                <span className="text-3xl font-extrabold text-navy-900 tabular-nums">{ground.ratingCount > 0 ? ground.rating : '—'}</span>
              </div>
              <p className="text-navy-500 text-xs mt-0.5">{ground.ratingCount > 0 ? `${ground.ratingCount} ratings` : 'No ratings yet'}</p>
            </div>
          </div>

          {/* Rate this ground */}
          <div className="card">
            <h3 className="font-semibold text-navy-900 text-sm mb-2">Rate this ground</h3>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setUserRating(n)} className="w-9 h-9 flex items-center justify-center transition-transform hover:scale-110">
                  <Star size={24} fill={n <= userRating ? '#f59e0b' : 'none'} className={n <= userRating ? 'text-amber-400' : 'text-slate-300'} />
                </button>
              ))}
              {userRating > 0 && <span className="ml-2 text-brand-600 text-sm font-medium self-center">Thanks for rating!</span>}
            </div>
          </div>

          {/* Recent matches */}
          {recentMatches.length > 0 && (
            <div>
              <h3 className="font-semibold text-navy-900 text-sm mb-2">Recent matches here</h3>
              {recentMatches.map(m => (
                <div key={m.id} className="card mb-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-navy-900 text-sm">{teamById(m.team1)?.name} vs {teamById(m.team2)?.name}</p>
                    <span className="text-navy-400 text-xs">{m.date}</span>
                  </div>
                  {m.result && <p className="text-brand-600 text-xs font-medium mt-0.5">{teamById(m.result.winner)?.name} won</p>}
                </div>
              ))}
            </div>
          )}

          {/* ── Booking CTAs — in-app payment (Razorpay) ── */}
          <div className="space-y-2">
            <button
              className="btn-primary w-full gap-2"
              onClick={() => navigate(`/ground-booking/${id}`)}
            >
              <CheckCircle size={18} />
              Book via App — Secure Payment
            </button>
            <button className="btn-secondary w-full gap-2" onClick={handleWhatsApp}>
              <MessageCircle size={18} />
              WhatsApp Enquiry Only
            </button>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs pt-1">
              <Lock size={11} />
              <span>All payments via Razorpay · 256-bit encryption</span>
            </div>
          </div>

          {/* ── TIER 2 ── */}
          {canTier2 && (
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Owner &amp; Booking Details</p>

              {/* Owner card */}
              <div className="card flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {ground.ownerName?.split(' ').map(n=>n[0]).join('') || 'OW'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900">{ground.ownerName || 'Ground Owner'}</p>
                  <p className="text-navy-400 text-xs">{ground.ownerPhone}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleWhatsApp}
                    className="w-9 h-9 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors"
                    aria-label="WhatsApp owner">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={handleCall}
                    className="w-9 h-9 bg-brand-500 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors"
                    aria-label="Call owner">
                    <Phone size={16} />
                  </button>
                </div>
              </div>

              {/* Get Directions */}
              <button
                onClick={handleDirections}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Navigation size={15} className="text-white" />
                  </div>
                  <span className="font-semibold text-blue-800 text-sm">Get Directions</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                  <span>Google Maps</span>
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* 30-day slot calendar */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={15} className="text-navy-500" />
                  <h3 className="font-semibold text-navy-900 text-sm">Slot Availability</h3>
                  <div className="flex items-center gap-2 ml-auto text-[11px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/> Booked</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block"/> N/A</span>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
                  <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                    {slots.slice(0, 14).map((day, di) => (
                      <div key={di} className="flex flex-col items-center gap-1 min-w-[56px]">
                        <p className="text-navy-500 text-[10px] font-medium text-center leading-tight">{day.label}</p>
                        <div className="flex flex-col gap-0.5">
                          {day.slots.map((sl, si) => (
                            sl.status === 'available' ? (
                              <button
                                key={si}
                                title={sl.label}
                                onClick={() => setBookingTarget({ day, slot: sl })}
                                className="w-full h-5 rounded flex items-center justify-center text-[9px] font-semibold px-1 bg-green-100 text-green-700 hover:bg-green-200 transition-colors touch-manipulation"
                              >
                                Open
                              </button>
                            ) : (
                              <div
                                key={si}
                                title={sl.label}
                                className={`w-full h-5 rounded flex items-center justify-center text-[9px] font-semibold px-1 ${
                                  sl.status === 'booked' ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {sl.status === 'booked' ? 'Full' : 'N/A'}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-navy-400 text-xs mt-2 text-center">Showing next 14 days · Contact owner to book</p>
                </div>
              </div>

              {/* Match history */}
              <div>
                <h3 className="font-semibold text-navy-900 text-sm mb-2 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  Match History at this Ground
                </h3>
                <div className="space-y-2">
                  {matchHistory.map((m, i) => (
                    <div
                      key={i}
                      className={`card py-2.5 px-3 ${m.matchId ? 'cursor-pointer hover:bg-brand-50 transition-colors' : ''}`}
                      onClick={() => m.matchId && navigate(`/score/${m.matchId}`)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-navy-900 text-sm truncate">{m.teams}</p>
                          <p className="text-navy-400 text-xs mt-0.5">{m.date} · {m.format}</p>
                          {m.matchId && (
                            <div className="flex items-center gap-1 mt-1.5 text-brand-600 text-xs font-semibold">
                              <ChevronRight size={11} />
                              View Scorecard
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-brand-600 text-xs font-semibold">{m.result}</span>
                          {!m.matchId && (
                            <p className="text-slate-400 text-[10px] mt-0.5">No scorecard</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tier 2 paywall — for Captain/Organiser without Pro */}
          {tier2Paywall && (
            <div className="border-t border-slate-100 pt-5 pb-6">
              <div className="relative rounded-2xl overflow-hidden">
                {/* Blurred preview */}
                <div className="blur-sm opacity-50 pointer-events-none select-none space-y-3 mb-0">
                  <div className="card flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-20 bg-slate-100 rounded-xl" />
                </div>
                {/* Paywall overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-6 text-center">
                  <Crown size={28} className="text-amber-500 fill-amber-400 mb-2" />
                  <p className="font-bold text-navy-900 text-sm mb-1">CricYaar Pro</p>
                  <p className="text-navy-500 text-xs mb-4 leading-relaxed max-w-xs">
                    See owner details, slot availability, Google Maps directions, and full match history. ₹99/month.
                  </p>
                  <button onClick={() => navigate('/pro')} className="btn-primary px-6 py-2.5 text-sm">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pb-6" />
        </div>
      </main>

      {/* Booking modal */}
      {bookingTarget && (
        <BookingModal
          ground={ground}
          day={bookingTarget.day}
          slot={bookingTarget.slot}
          onClose={() => setBookingTarget(null)}
          onConfirm={() => setBookingTarget(null)}
        />
      )}
    </div>
  )
}
