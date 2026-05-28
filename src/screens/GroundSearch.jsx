import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GROUNDS } from '../data/mock'
import TopBar from '../components/TopBar'
import AIGroundAssistant from '../components/AIGroundAssistant'
import { Search, Star, MapPin, Sun, Droplets, Plus, Sparkles } from 'lucide-react'

const PITCH_TYPES = ['All','Turf','Matting','Cement','Red Soil','Astro Turf']
const CITIES = ['All','Mumbai','Delhi','Chennai','Bengaluru','Chandigarh','Hyderabad']

function GroundCard({ ground, onClick }) {
  const condColors = { Fresh:'text-green-600 bg-green-50', Worn:'text-amber-600 bg-amber-50', Damp:'text-blue-600 bg-blue-50', Unknown:'text-gray-500 bg-gray-50' }
  const condIcons  = { Fresh:Sun, Worn:Sun, Damp:Droplets, Unknown:MapPin }
  const CondIcon   = condIcons[ground.pitchCondition] || MapPin

  return (
    <button onClick={onClick} className="card card-hover w-full text-left mb-3 animate-fade-in">
      {/* Placeholder photo */}
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center mb-3 overflow-hidden">
        <div className="text-center">
          <MapPin size={28} className="text-brand-400 mx-auto mb-1" />
          <p className="text-brand-500 font-semibold text-xs">{ground.city}</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-navy-900 text-base leading-tight">{ground.name}</h3>
          <p className="text-navy-500 text-xs mt-0.5">{ground.area}, {ground.city}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 text-amber-500">
          <Star size={13} fill="currentColor" />
          <span className="font-semibold text-sm text-navy-900">{ground.rating}</span>
          <span className="text-navy-400 text-xs">({ground.ratingCount})</span>
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
          {ground.rentPerHour && <span className="font-semibold text-navy-900">₹{ground.rentPerHour}<span className="text-navy-400 font-normal">/hr</span></span>}
          {ground.rentPerHour && ground.rentPerMatch && <span className="text-navy-400 mx-1">·</span>}
          {ground.rentPerMatch && <span className="font-semibold text-navy-900">₹{ground.rentPerMatch}<span className="text-navy-400 font-normal">/match</span></span>}
          {!ground.rentPerHour && !ground.rentPerMatch && <span className="text-navy-400">Price on enquiry</span>}
        </div>
        <span className="text-navy-400 text-xs">{ground.matchCount} matches</span>
      </div>
    </button>
  )
}

export default function GroundSearch() {
  const navigate = useNavigate()
  const [search,  setSearch]  = useState('')
  const [pitch,   setPitch]   = useState('All')
  const [city,    setCity]    = useState('All')
  const [floods,  setFloods]  = useState('Any')
  const [showAI,  setShowAI]  = useState(false)

  const filtered = useMemo(() => {
    return GROUNDS.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.area.toLowerCase().includes(search.toLowerCase()) && !g.city.toLowerCase().includes(search.toLowerCase())) return false
      if (pitch !== 'All' && g.pitchType !== pitch) return false
      if (city  !== 'All' && g.city !== city)        return false
      if (floods === 'Yes' && !g.floodlights)         return false
      if (floods === 'No'  &&  g.floodlights)         return false
      return true
    })
  }, [search, pitch, city, floods])

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Find a Ground" showBack />

      {/* Search */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100 sticky top-14 z-10">
        <div className="relative mb-3">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="cm-input pl-10 h-11"
            placeholder="Search grounds, areas, cities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PITCH_TYPES.map(p => (
            <button key={p} className={`filter-chip flex-shrink-0 ${pitch===p?'active':''}`} onClick={() => setPitch(p)}>{p === 'All' ? 'All Pitches' : p}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
          {CITIES.map(c => (
            <button key={c} className={`filter-chip flex-shrink-0 ${city===c?'active':''}`} onClick={() => setCity(c)}>{c === 'All' ? 'All Cities' : c}</button>
          ))}
          <button className={`filter-chip flex-shrink-0 ${floods==='Yes'?'active':''}`} onClick={() => setFloods(f => f==='Yes'?'Any':'Yes')}>
            🌟 Floodlights
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        <p className="text-navy-500 text-sm mb-3 font-medium">{filtered.length} ground{filtered.length !== 1 ? 's' : ''} found</p>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={40} className="mx-auto text-navy-300 mb-3" />
            <p className="font-semibold text-navy-500">No grounds found</p>
            <p className="text-navy-400 text-sm mt-1">Try different filters or search nearby city</p>
          </div>
        ) : filtered.map(g => (
          <GroundCard key={g.id} ground={g} onClick={() => navigate(`/grounds/${g.id}`)} />
        ))}
      </main>

      {/* List my ground FAB — left side on mobile to avoid conflict with global right FABs */}
      <button
        onClick={() => {}}
        className="fixed bottom-20 left-4 md:bottom-4 md:left-auto md:right-4 flex items-center gap-2 bg-brand-500 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 z-10"
        aria-label="List my ground"
      >
        <Plus size={16} />
        List my ground
      </button>

      {/* AI Ground Assistant FAB — left side on mobile */}
      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-36 left-4 md:bottom-16 md:left-auto md:right-4 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 z-10 flex items-center justify-center"
        aria-label="Ask AI about grounds"
      >
        <Sparkles size={22} />
      </button>

      {/* AI Bottom Sheet */}
      <AIGroundAssistant visible={showAI} onClose={() => setShowAI(false)} />
    </div>
  )
}
