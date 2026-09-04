import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useBackButtonClose } from '../hooks/useBackButtonClose'
import { GROUND_DEMAND_LIST } from '../data/mock'
import { supabase } from '../lib/supabase'
import { toGroundRow, fetchMyGrounds } from '../lib/groundsApi'
import { uploadGroundPhoto } from '../lib/uploads'
import TopBar from '../components/TopBar'
import {
  MapPin, BarChart2, Send, ChevronRight, CheckCircle, Clock,
  Building2, Star, Trophy, Calendar, IndianRupee, Users,
  TrendingUp, Zap, Phone, ArrowRight, Lock, Shield,
  Activity, Eye, Layers, X, Check, Camera, ImagePlus
} from 'lucide-react'

const PITCH_TYPES = ['Turf', 'Matting', 'Cement', 'Red Soil', 'Astro Turf']
const PITCH_CONDITIONS = ['Fresh', 'Worn', 'Damp', 'Dusty', 'Unknown']
const FACILITY_OPTIONS = [
  { key:'parking',      label:'Parking' },
  { key:'changingRoom', label:'Changing Room' },
  { key:'practiceNets', label:'Practice Nets' },
  { key:'washrooms',    label:'Washrooms' },
  { key:'cafeteria',    label:'Cafeteria' },
  { key:'firstAid',     label:'First Aid' },
]

// ── Add Ground sheet ─────────────────────────────────────────────────────────
function AddGroundSheet({ user, onClose, onSubmitted }) {
  useBackButtonClose(onClose)
  const [name, setName]   = useState('')
  const [area, setArea]   = useState('')
  const [pitchType, setPitchType] = useState('Turf')
  const [pitchCondition, setPitchCondition] = useState('Fresh')
  const [floodlights, setFloodlights] = useState(false)
  const [floodlightHours, setFloodlightHours] = useState('')
  const [rentPerHour, setRentPerHour] = useState('')
  const [rentPerMatch, setRentPerMatch] = useState('')
  const [facilities, setFacilities] = useState({})
  const [ownerName, setOwnerName]   = useState(user?.name || '')
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '')
  const [photoUrl, setPhotoUrl]     = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const photoRef = useRef(null)

  const toggleFacility = (key) => setFacilities(f => ({ ...f, [key]: !f[key] }))

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    setError('')
    try {
      const url = await uploadGroundPhoto(user.id, file)
      setPhotoUrl(url)
    } catch (err) {
      setError(`Couldn't upload photo: ${err.message}`)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const canSubmit = name.trim() && area.trim() && ownerPhone.trim() && !submitting && !uploadingPhoto

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    const row = toGroundRow({
      ownerId: user.id,
      name: name.trim(),
      area: area.trim(),
      city: 'Bengaluru',
      state: 'Karnataka',
      pitchType,
      pitchCondition,
      floodlights,
      floodlightHours: floodlights ? floodlightHours.trim() : null,
      rentPerHour: rentPerHour ? Number(rentPerHour) : null,
      rentPerMatch: rentPerMatch ? Number(rentPerMatch) : null,
      facilities,
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
    })
    if (photoUrl) row.photos = [photoUrl]
    const { error: insertError } = await supabase.from('grounds').insert(row)
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onSubmitted()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-extrabold text-navy-900 text-lg">List Your Ground</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <p className="text-navy-400 text-xs -mt-1">
            We're live in Bengaluru only right now — your ground will show there once approved.
          </p>

          <div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Ground" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-navy-400">
                  {uploadingPhoto ? <Camera size={22} className="animate-pulse" /> : <ImagePlus size={22} />}
                  <span className="text-xs font-semibold">{uploadingPhoto ? 'Uploading…' : 'Add a photo'}</span>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">Ground name</label>
            <input className="cm-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Green Park Cricket Ground" maxLength={80} />
          </div>

          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1.5">Area</label>
            <input className="cm-input" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Sarjapur Road" maxLength={80} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">Pitch type</label>
              <select className="cm-select w-full" value={pitchType} onChange={e => setPitchType(e.target.value)}>
                {PITCH_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">Outfield</label>
              <select className="cm-select w-full" value={pitchCondition} onChange={e => setPitchCondition(e.target.value)}>
                {PITCH_CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={() => setFloodlights(f => !f)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
              style={{ background: floodlights ? '#fffbeb' : '#f8fafc', borderColor: floodlights ? '#f59e0b' : '#e2e8f0' }}
            >
              <span className={`text-sm font-semibold ${floodlights ? 'text-amber-700' : 'text-navy-700'}`}>Has floodlights</span>
              {floodlights && (
                <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
            {floodlights && (
              <input
                className="cm-input mt-2"
                value={floodlightHours}
                onChange={e => setFloodlightHours(e.target.value)}
                placeholder="e.g. 6 PM – 11 PM"
                maxLength={40}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">Rent / hour <span className="font-normal text-navy-400">(optional)</span></label>
              <input className="cm-input" type="number" inputMode="numeric" value={rentPerHour} onChange={e => setRentPerHour(e.target.value)} placeholder="₹" />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">Rent / match <span className="font-normal text-navy-400">(optional)</span></label>
              <input className="cm-input" type="number" inputMode="numeric" value={rentPerMatch} onChange={e => setRentPerMatch(e.target.value)} placeholder="₹" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-navy-700 mb-2">Facilities</label>
            <div className="grid grid-cols-2 gap-2">
              {FACILITY_OPTIONS.map(f => {
                const sel = !!facilities[f.key]
                return (
                  <button
                    key={f.key}
                    onClick={() => toggleFacility(f.key)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors"
                    style={{ background: sel ? '#f0fdf4' : '#f8fafc', borderColor: sel ? '#22c55e' : '#e2e8f0' }}
                  >
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'bg-brand-500 border-brand-500' : 'border-slate-300'}`}>
                      {sel && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-navy-700 text-xs font-medium">{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">Your name</label>
              <input className="cm-input" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Full name" maxLength={60} />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">Contact number</label>
              <input className="cm-input" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="+91…" maxLength={20} />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
        </div>

        <div className="px-5 pb-8 pt-2 flex-shrink-0 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}
          >
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
          <p className="text-center text-navy-400 text-xs mt-2.5">We review new grounds before they go live — usually within a day.</p>
        </div>
      </div>
    </div>
  )
}

const PITCH_COLORS = {
  Turf:       { bg:'#dcfce7', color:'#16a34a' },
  Matting:    { bg:'#ede9fe', color:'#7c3aed' },
  Cement:     { bg:'#f1f5f9', color:'#475569' },
  'Red Soil': { bg:'#fee2e2', color:'#dc2626' },
  'Astro Turf':{ bg:'#cffafe', color:'#0891b2' },
}

// ── Ground card on home ──────────────────────────────────────────────────────
function GroundCard({ ground, onPress }) {
  const pitch = PITCH_COLORS[ground.pitchType] || { bg:'#f1f5f9', color:'#475569' }
  return (
    <button
      onClick={onPress}
      className="w-full text-left bg-white rounded-2xl shadow-card overflow-hidden active:scale-[0.98] transition-transform"
    >
      {/* Top color bar */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#0891b2,#06b6d4)' }} />

      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: pitch.bg, color: pitch.color }}
              >
                {ground.pitchType}
              </span>
              {ground.floodlights && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">⚡ Floodlit</span>
              )}
              {ground.status === 'pending' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  ● Under Review
                </span>
              ) : ground.status === 'rejected' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  ● Not Approved
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  ● Live
                </span>
              )}
            </div>
            <p className="font-extrabold text-navy-900 text-sm leading-tight">{ground.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-navy-400" />
              <p className="text-navy-500 text-xs">{ground.area}, {ground.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 bg-amber-50 px-2 py-1 rounded-xl">
            <Star size={11} className="text-amber-500 fill-amber-400" />
            <span className="text-amber-800 text-xs font-bold">{ground.rating}</span>
            <span className="text-amber-400 text-[10px]">({ground.ratingCount})</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label:'All-time', val: ground.totalMatches, icon: Trophy, color:'#0891b2' },
            { label:'This Month', val: ground.thisMonth.bookings, icon: Calendar, color:'#7c3aed' },
            { label:'Revenue', val: ground.thisMonth.revenue, icon: IndianRupee, color:'#16a34a' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl px-2 py-2 text-center">
              <p className="font-extrabold text-navy-900 text-sm tabular-nums leading-tight">{s.val}</p>
              <p className="text-navy-400 text-[9px] font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent matches */}
        {ground.recentMatches.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Recent Matches</p>
            {ground.recentMatches.slice(0, 2).map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  m.status === 'live' ? 'bg-red-500 animate-pulse' :
                  m.status === 'upcoming' ? 'bg-amber-400' : 'bg-green-500'
                }`} />
                <p className="text-navy-700 text-xs font-medium flex-1 truncate">{m.name}</p>
                <p className="text-navy-400 text-[10px] flex-shrink-0">{m.date}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-xs text-navy-400">Tap to manage</span>
          <div className="flex items-center gap-1 text-cyan-600">
            <span className="text-xs font-semibold">View Details</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </button>
  )
}

// ── My Stats section ─────────────────────────────────────────────────────────
function MyStats({ grounds }) {
  const totalMatches  = grounds.reduce((s, g) => s + g.totalMatches, 0)
  const thisMonthMatches = grounds.reduce((s, g) => s + g.thisMonth.matches, 0)
  const avgRating     = grounds.length > 0 ? (grounds.reduce((s, g) => s + g.rating, 0) / grounds.length).toFixed(1) : '—'

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg,#164e63,#0891b2)' }}
      >
        <BarChart2 size={16} className="text-cyan-200" />
        <p className="font-extrabold text-white text-sm">My Stats</p>
        <span className="ml-auto text-cyan-200 text-xs font-medium">{grounds.length} ground{grounds.length > 1 ? 's' : ''}</span>
      </div>

      {/* Aggregates */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        {[
          { label:'Total Grounds',      val: grounds.length,     icon:'🏟️' },
          { label:'All-time Matches',   val: totalMatches,       icon:'🏏' },
          { label:'Avg Rating',         val: avgRating,          icon:'⭐' },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 text-center">
            <p className="text-xl mb-0.5">{s.icon}</p>
            <p className="font-extrabold text-navy-900 text-lg tabular-nums leading-tight">{s.val}</p>
            <p className="text-navy-400 text-[9px] font-medium leading-tight mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-ground breakdown */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-2.5">Per-Ground Breakdown</p>
        <div className="space-y-3">
          {grounds.map(g => (
            <div key={g.id} className="bg-slate-50 rounded-xl px-3 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-navy-900 text-sm leading-tight truncate flex-1 mr-2">{g.name}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-700">{g.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label:'All Matches', val: g.totalMatches },
                  { label:'This Month',  val: g.thisMonth.matches },
                  { label:'Revenue/mo',  val: g.thisMonth.revenue },
                  { label:'Bookings',    val: g.thisMonth.bookings },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-extrabold text-navy-900 text-sm tabular-nums">{s.val}</p>
                    <p className="text-navy-400 text-[9px] font-medium leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Ground Demand card ───────────────────────────────────────────────────────
function DemandCard({ item, onSend }) {
  const isTournament = item.type === 'tournament'

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Type badge + title */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isTournament
              ? 'bg-brand-50 text-brand-700'
              : 'bg-purple-50 text-purple-700'
          }`}>
            {isTournament ? '🏆 Tournament' : '🏏 Match'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {item.format} · {item.overs} ov
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            Seeking Ground
          </span>
        </div>
        <p className="font-extrabold text-navy-900 text-sm leading-tight">{item.name}</p>
        <p className="text-navy-500 text-xs mt-0.5">By {item.organiser}</p>
      </div>

      {/* Details grid */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-y-2 gap-x-3">
        <div className="flex items-start gap-1.5">
          <Calendar size={11} className="text-navy-400 mt-0.5 flex-shrink-0" />
          <p className="text-navy-600 text-xs">
            {isTournament ? item.dateRange : `${item.date} · ${item.time}`}
          </p>
        </div>
        <div className="flex items-start gap-1.5">
          <MapPin size={11} className="text-navy-400 mt-0.5 flex-shrink-0" />
          <p className="text-navy-600 text-xs">{item.city}</p>
        </div>
        {isTournament && (
          <>
            <div className="flex items-start gap-1.5">
              <Users size={11} className="text-navy-400 mt-0.5 flex-shrink-0" />
              <p className="text-navy-600 text-xs">{item.teams} teams · {item.matchesNeeded} matches</p>
            </div>
          </>
        )}
        <div className="flex items-start gap-1.5 col-span-2">
          <IndianRupee size={11} className="text-navy-400 mt-0.5 flex-shrink-0" />
          <p className="text-navy-600 text-xs">Budget: <span className="font-semibold text-green-700">{item.budget}</span></p>
        </div>
      </div>

      {/* Requirement */}
      <div className="mx-4 mb-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <p className="text-navy-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Ground Requirement</p>
        <p className="text-navy-700 text-xs leading-relaxed">{item.requirement}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <a
          href={`tel:${item.organiserPhone}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-navy-700 text-xs font-semibold flex-shrink-0 transition-colors hover:bg-slate-100 active:scale-95"
        >
          <Phone size={12} className="text-navy-500" />
          Call
        </a>
        <button
          onClick={() => onSend(item)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)' }}
        >
          <Send size={13} />
          Send Ground Offer
        </button>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function GroundOwnerHome() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()

  const [activeTab, setActiveTab] = useState('grounds') // 'grounds' | 'stats' | 'demand'
  const [sentOffers, setSentOffers] = useState([])
  const [showAddGround, setShowAddGround] = useState(false)
  const [grounds, setGrounds] = useState([])
  const [groundsLoading, setGroundsLoading] = useState(true)

  const isVerified = user?.groundOwnerVerified

  const loadMyGrounds = () => {
    if (!user?.id) return
    setGroundsLoading(true)
    fetchMyGrounds(user.id)
      .then(setGrounds)
      .catch(() => setGrounds([]))
      .finally(() => setGroundsLoading(false))
  }

  useEffect(loadMyGrounds, [user?.id])

  const handleSendOffer = (item) => {
    if (sentOffers.includes(item.id)) {
      addToast('Offer already sent!', 'info')
      return
    }
    setSentOffers(prev => [...prev, item.id])
    addToast(`Ground offer sent for "${item.name}"! 🏟️`, 'success')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar isHome />

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-28">

        {/* Greeting */}
        <div className="mb-4 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Ground Owner'} 👋
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background:'#cffafe', color:'#0891b2' }}>
              📍 Ground Owner
            </span>
            {isVerified
              ? <span className="flex items-center gap-1 text-xs text-teal-600 font-semibold"><CheckCircle size={11} />Verified</span>
              : <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold"><Clock size={11} />Verification pending</span>
            }
          </div>
        </div>

        {/* Verification banner (only if not verified) */}
        {!isVerified && (
          <button
            onClick={() => navigate('/aadhaar-verify')}
            className="w-full mb-4 rounded-2xl p-4 text-left animate-slide-up border-2 border-dashed border-cyan-300 bg-cyan-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-cyan-900 text-sm">Complete verification to go live</p>
                <p className="text-cyan-600 text-xs mt-0.5 leading-relaxed">Verify via Aadhaar to list your ground and receive bookings.</p>
              </div>
              <ChevronRight size={16} className="text-cyan-500 flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl mb-4 animate-fade-in">
          {[
            { key:'grounds', label:'My Grounds', icon: Building2 },
            { key:'stats',   label:'My Stats',   icon: BarChart2 },
            { key:'demand',  label:'Send Request', icon: Send },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              <tab.icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.key === 'demand' ? 'Requests' : tab.label.split(' ')[1] || tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── MY GROUNDS TAB ── */}
        {activeTab === 'grounds' && (
          <div className="space-y-3 animate-slide-up">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">
                {groundsLoading ? 'Loading…' : `${grounds.length} Ground${grounds.length !== 1 ? 's' : ''} Listed`}
              </p>
              <button
                onClick={() => setShowAddGround(true)}
                className="text-xs font-semibold text-cyan-600 flex items-center gap-1"
              >
                + Add Ground
              </button>
            </div>

            {!groundsLoading && grounds.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl shadow-card">
                <Building2 size={28} className="mx-auto text-navy-300 mb-2" />
                <p className="font-semibold text-navy-600 text-sm">No grounds listed yet</p>
                <p className="text-navy-400 text-xs mt-1">Tap "+ Add Ground" to list your first one.</p>
              </div>
            )}

            {grounds.map(g => (
              <GroundCard
                key={g.id}
                ground={g}
                onPress={() => navigate(`/grounds/${g.id}`)}
              />
            ))}

            {/* Upgrade ground listing CTA */}
            <button
              onClick={() => setShowAddGround(true)}
              className="w-full rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50 px-4 py-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-cyan-900 text-sm">Add Another Ground</p>
                <p className="text-cyan-600 text-xs mt-0.5">Photos, pricing, slot availability</p>
              </div>
              <ChevronRight size={14} className="text-cyan-400" />
            </button>
          </div>
        )}

        {/* ── MY STATS TAB ── */}
        {activeTab === 'stats' && (
          <div className="animate-slide-up">
            <MyStats grounds={grounds} />

            {/* Trend comparison */}
            <div className="mt-3 bg-white rounded-2xl shadow-card p-4">
              <p className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-brand-500" />
                Month-on-Month Trend
              </p>
              {grounds.map(g => {
                const diff = g.thisMonth.bookings - g.lastMonth.bookings
                const up   = diff >= 0
                return (
                  <div key={g.id} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 text-xs truncate">{g.name}</p>
                      <p className="text-navy-400 text-[10px]">{g.thisMonth.bookings} bookings this month</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {up ? '▲' : '▼'} {Math.abs(diff)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SEND REQUEST / GROUND DEMAND TAB ── */}
        {activeTab === 'demand' && (
          <div className="animate-slide-up">
            {/* Info banner */}
            <div className="flex items-start gap-2.5 bg-cyan-50 border border-cyan-200 rounded-2xl px-4 py-3 mb-4">
              <Zap size={14} className="text-cyan-600 flex-shrink-0 mt-0.5" />
              <p className="text-cyan-800 text-xs leading-relaxed">
                Tournaments and teams below are <strong>actively looking for a ground</strong> in your city. Send them an offer to fill your empty slots and earn more!
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Tournaments', 'Matches'].map(f => (
                <span key={f} className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-navy-600 cursor-pointer hover:border-cyan-400 hover:text-cyan-700 transition-colors">
                  {f}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {GROUND_DEMAND_LIST.map(item => (
                <DemandCard
                  key={item.id}
                  item={item}
                  onSend={handleSendOffer}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {showAddGround && (
        <AddGroundSheet
          user={user}
          onClose={() => setShowAddGround(false)}
          onSubmitted={() => {
            setShowAddGround(false)
            addToast('Ground submitted! We\'ll review it and let you know.', 'success')
            loadMyGrounds()
          }}
        />
      )}
    </div>
  )
}
