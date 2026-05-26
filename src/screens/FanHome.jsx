import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CITY_LIVE_DATA, ALL_CITIES } from '../data/mock'
import { MapPin, Settings, Search, X, RefreshCw, Circle, ArrowRight } from 'lucide-react'

function CityPickerModal({ currentCity, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = ALL_CITIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative mt-auto bg-white rounded-t-3xl px-5 pt-4 pb-10 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-900 text-lg">Choose your city</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-600" />
          </button>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            className="cm-input pl-9"
            placeholder="Search city…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filtered.map(city => (
            <button
              key={city}
              onClick={() => { onSelect(city); onClose() }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                city === currentCity
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'hover:bg-slate-50 text-navy-700'
              }`}
            >
              <MapPin size={15} className={city === currentCity ? 'text-brand-500' : 'text-slate-400'} />
              {city}
              {city === currentCity && <span className="ml-auto text-xs text-brand-500 font-medium">Current</span>}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-navy-400 py-6 text-sm">No cities found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FanHome() {
  const navigate = useNavigate()
  const { user, setRole } = useStore()
  const [city, setCity] = useState(user?.city || 'Mumbai')
  const [showPicker, setShowPicker] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [ticking, setTicking] = useState(false)

  const data = CITY_LIVE_DATA[city] || { live: [], today: 0 }

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setTicking(true)
      setTimeout(() => {
        setLastRefresh(new Date())
        setTicking(false)
      }, 400)
    }, 60000)
    return () => clearInterval(t)
  }, [])

  const handleCitySelect = (c) => {
    setCity(c)
    setLastRefresh(new Date())
  }

  const refreshTime = lastRefresh.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      {/* Custom top bar */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">CY</span>
          </div>
          <span className="font-extrabold text-navy-900 text-lg">CricYaar</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            <MapPin size={13} className="text-brand-600" />
            <span className="text-brand-700 font-semibold text-sm">{city}</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            aria-label="Settings"
          >
            <Settings size={17} className="text-navy-600" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 space-y-4 pb-24">

        {/* Section 1 — Live now */}
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-3xl font-extrabold text-navy-900 tabular-nums leading-none">
                {data.live.length}
              </h2>
              <p className="text-navy-500 text-sm mt-1">
                {data.live.length === 1 ? 'match' : 'matches'} live right now in <span className="font-semibold text-navy-700">{city}</span>
              </p>
            </div>
            <button
              onClick={() => { setTicking(true); setTimeout(() => { setLastRefresh(new Date()); setTicking(false); }, 400) }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={15} className={`text-navy-500 transition-transform ${ticking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {data.live.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-navy-400 text-sm">No matches happening in {city} right now.</p>
              <p className="text-navy-300 text-xs mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.live.map((row, i) => (
                <div
                  key={i}
                  className="bg-navy-900 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Circle size={6} fill="#ef4444" className="text-red-500 animate-pulse flex-shrink-0" />
                    <span className="text-red-400 font-semibold text-xs uppercase tracking-wide">Live</span>
                    <span className="text-navy-500 text-xs ml-auto">Ov {row.overs}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-semibold truncate flex-1">{row.teamA}</span>
                    <span className="text-brand-400 font-extrabold tabular-nums">{row.scoreA}</span>
                    <span className="text-navy-500 text-xs">vs</span>
                    <span className="text-white font-semibold truncate flex-1 text-right">{row.teamB}</span>
                    <span className="text-navy-400 text-xs tabular-nums text-right">{row.scoreB}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-navy-400 text-right mt-1.5 flex items-center justify-end gap-1">
                <span>Updated {refreshTime}</span>
              </p>
            </div>
          )}
        </div>

        {/* Section 2 — Today */}
        <div className="card animate-slide-up">
          <h2 className="text-3xl font-extrabold text-navy-900 tabular-nums leading-none">{data.today}</h2>
          <p className="text-navy-500 text-sm mt-1">
            {data.today === 1 ? 'match' : 'matches'} scheduled today in <span className="font-semibold text-navy-700">{city}</span>
          </p>
        </div>

      </main>

      {/* Persistent bottom banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-navy-700 font-semibold text-sm">Want to play, score, or organise?</p>
            <p className="text-navy-400 text-xs mt-0.5">Change your role in Settings.</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm flex-shrink-0 hover:bg-brand-600 transition-colors"
          >
            Change Role
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* City picker modal */}
      {showPicker && (
        <CityPickerModal
          currentCity={city}
          onSelect={handleCitySelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
