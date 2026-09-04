import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { fetchApprovedGrounds } from '../lib/groundsApi'
import TopBar from '../components/TopBar'
import { Search, Star, MapPin, Sun, Droplets, Plus, SlidersHorizontal, X, Check } from 'lucide-react'

const PITCH_TYPES = ['Turf', 'Matting', 'Cement', 'Red Soil', 'Astro Turf']
const LIVE_CITY = 'Bengaluru'

// ─── Filter Bottom-Sheet ──────────────────────────────────────────────────────
function FilterSheet({ pitchFilters, floodlights, onApply, onClose }) {
  const [localPitch, setLocalPitch] = useState([...pitchFilters])
  const [localFlood, setLocalFlood] = useState(floodlights)

  const togglePitch = (p) =>
    setLocalPitch(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const handleApply = () => {
    onApply({ pitchFilters: localPitch, floodlights: localFlood })
    onClose()
  }

  const handleReset = () => {
    setLocalPitch([])
    setLocalFlood(false)
  }

  const activeCount = localPitch.length + (localFlood ? 1 : 0)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative mt-auto bg-white rounded-t-3xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-base">Filters</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-600" />
          </button>
        </div>

        {/* Header label */}
        <div className="px-5 pt-3">
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider">Pitch Type</p>
        </div>

        {/* Pitch type options */}
        <div className="px-5 py-3 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {PITCH_TYPES.map(p => (
              <button
                key={p}
                onClick={() => togglePitch(p)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                style={{
                  background: localPitch.includes(p) ? '#eff6ff' : '#f8fafc',
                  borderColor: localPitch.includes(p) ? '#3b82f6' : '#e2e8f0',
                }}
              >
                <span className={`text-sm font-semibold ${localPitch.includes(p) ? 'text-brand-700' : 'text-navy-700'}`}>{p}</span>
                {localPitch.includes(p) && (
                  <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Floodlights toggle */}
        <div className="px-5 pt-1 pb-3 border-t border-slate-100">
          <button
            onClick={() => setLocalFlood(f => !f)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
            style={{
              background: localFlood ? '#fffbeb' : '#f8fafc',
              borderColor: localFlood ? '#f59e0b' : '#e2e8f0',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Sun size={15} className={localFlood ? 'text-amber-500' : 'text-slate-400'} />
              <span className={`text-sm font-semibold ${localFlood ? 'text-amber-700' : 'text-navy-700'}`}>Floodlights only</span>
            </div>
            {localFlood && (
              <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-5 pb-8 pt-2">
          <button
            onClick={handleReset}
            disabled={activeCount === 0}
            className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-sm text-navy-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Reset all
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors"
          >
            {activeCount > 0 ? `Apply (${activeCount})` : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Ground Card ──────────────────────────────────────────────────────────────
function GroundCard({ ground, onClick }) {
  const condColors = { Fresh:'text-green-600 bg-green-50', Worn:'text-amber-600 bg-amber-50', Damp:'text-blue-600 bg-blue-50', Dusty:'text-orange-600 bg-orange-50', Unknown:'text-gray-500 bg-gray-50' }
  const condIcons  = { Fresh:Sun, Worn:Sun, Damp:Droplets, Dusty:Sun, Unknown:MapPin }
  const CondIcon   = condIcons[ground.pitchCondition] || MapPin

  return (
    <button onClick={onClick} className="card card-hover w-full text-left mb-3 animate-fade-in overflow-hidden">
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center mb-3 overflow-hidden">
        {ground.photos?.length > 0 ? (
          <img src={ground.photos[0]} alt={ground.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <MapPin size={28} className="text-brand-400 mx-auto mb-1" />
            <p className="text-brand-500 font-semibold text-xs">{ground.city}</p>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-navy-900 text-base leading-tight truncate">{ground.name}</h3>
          <p className="text-navy-500 text-xs mt-0.5 truncate">{ground.area}, {ground.city}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 text-amber-500">
          {ground.ratingCount > 0 ? (
            <>
              <Star size={13} fill="currentColor" />
              <span className="font-semibold text-sm text-navy-900">{ground.rating}</span>
              <span className="text-navy-400 text-xs">({ground.ratingCount})</span>
            </>
          ) : (
            <span className="badge badge-navy text-[10px]">New</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="badge badge-green">{ground.pitchType}</span>
        <span className={`badge ${condColors[ground.pitchCondition] || 'badge-navy'}`}>
          <CondIcon size={10} />
          {ground.pitchCondition}
        </span>
        {ground.floodlights && <span className="badge badge-amber">Floodlights</span>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          {ground.rentPerHour  && <span className="font-semibold text-navy-900">₹{ground.rentPerHour}<span className="text-navy-400 font-normal">/hr</span></span>}
          {ground.rentPerHour  && ground.rentPerMatch && <span className="text-navy-400 mx-1">·</span>}
          {ground.rentPerMatch && <span className="font-semibold text-navy-900">₹{ground.rentPerMatch}<span className="text-navy-400 font-normal">/match</span></span>}
          {!ground.rentPerHour && !ground.rentPerMatch && <span className="text-navy-400">Price on enquiry</span>}
        </div>
        <span className="text-navy-400 text-xs">{ground.matchCount} matches</span>
      </div>
    </button>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GroundSearch() {
  const navigate   = useNavigate()
  const { user }   = useStore()
  const isGroundOwner = user?.role === 'ground_owner'

  const [search,      setSearch]      = useState('')
  const [pitchFilters, setPitchFilters] = useState([])
  const [floodlights,  setFloodlights]  = useState(false)
  const [showFilter,   setShowFilter]   = useState(false)
  const [grounds,      setGrounds]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [loadError,    setLoadError]    = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchApprovedGrounds(LIVE_CITY)
      .then(rows => { if (!cancelled) { setGrounds(rows); setLoadError('') } })
      .catch(err => { if (!cancelled) setLoadError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const activeFilterCount = pitchFilters.length + (floodlights ? 1 : 0)

  const filtered = useMemo(() => {
    return grounds.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())
        && !g.area.toLowerCase().includes(search.toLowerCase())) return false
      if (pitchFilters.length > 0 && !pitchFilters.includes(g.pitchType)) return false
      if (floodlights && !g.floodlights)                                    return false
      return true
    })
  }, [grounds, search, pitchFilters, floodlights])

  const handleApplyFilters = ({ pitchFilters: pf, floodlights: fl }) => {
    setPitchFilters(pf)
    setFloodlights(fl)
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <TopBar title="Find a Ground" />

      {/* Sticky search + filter row */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-10 px-4 py-3 flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="cm-input pl-10 h-11"
            placeholder="Search grounds, areas…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilter(true)}
          className={`relative flex-shrink-0 flex items-center gap-1.5 h-11 px-3.5 rounded-xl border font-semibold text-sm transition-colors ${
            activeFilterCount > 0
              ? 'bg-brand-50 border-brand-400 text-brand-700'
              : 'bg-slate-50 border-slate-200 text-navy-600 hover:border-brand-300'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* List my ground — only for ground_owner */}
        {isGroundOwner && (
          <button
            onClick={() => navigate('/ground-owner')}
            className="flex-shrink-0 flex items-center gap-1.5 bg-brand-500 text-white font-semibold text-xs px-3 h-11 rounded-xl shadow-sm hover:bg-brand-600 transition-colors active:scale-95"
            aria-label="List my ground"
          >
            <Plus size={14} />
            <span>List</span>
          </button>
        )}
      </div>

      {/* Active filter chips summary */}
      {activeFilterCount > 0 && (
        <div className="bg-white px-4 pb-2 flex flex-wrap gap-1.5 border-b border-slate-100">
          {pitchFilters.map(p => (
            <span
              key={p}
              className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2.5 py-0.5 font-medium"
            >
              {p}
              <button onClick={() => setPitchFilters(prev => prev.filter(x => x !== p))} className="ml-0.5">
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          {floodlights && (
            <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
              Floodlights
              <button onClick={() => setFloodlights(false)} className="ml-0.5">
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          )}
          <button
            onClick={() => { setPitchFilters([]); setFloodlights(false) }}
            className="text-xs text-navy-400 underline underline-offset-2 font-medium ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Ground cards */}
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-28">
        <div className="flex items-center gap-1.5 text-brand-600 text-xs font-medium mb-3">
          <MapPin size={12} />
          <span>Live in Bengaluru only — other cities coming soon</span>
        </div>
        {loading ? (
          <div className="text-center py-16 text-navy-400 text-sm">Loading grounds…</div>
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="font-semibold text-red-500">Couldn't load grounds</p>
            <p className="text-navy-400 text-sm mt-1">{loadError}</p>
          </div>
        ) : (
          <>
            <p className="text-navy-500 text-sm mb-3 font-medium">
              {filtered.length} ground{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <MapPin size={40} className="mx-auto text-navy-300 mb-3" />
                <p className="font-semibold text-navy-500">No grounds found</p>
                <p className="text-navy-400 text-sm mt-1">Try different filters or search nearby city</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setPitchFilters([]); setFloodlights(false) }}
                    className="mt-3 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 font-semibold text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map(g => (
                <GroundCard key={g.id} ground={g} onClick={() => navigate(`/grounds/${g.id}`)} />
              ))
            )}
          </>
        )}
      </main>

      {/* Filter bottom-sheet */}
      {showFilter && (
        <FilterSheet
          pitchFilters={pitchFilters}
          floodlights={floodlights}
          onApply={handleApplyFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  )
}
