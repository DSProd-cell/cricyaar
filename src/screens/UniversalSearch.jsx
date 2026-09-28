import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { fetchApprovedGrounds } from '../lib/groundsApi'
import TopBar from '../components/TopBar'
import {
  Search, X, SlidersHorizontal, MapPin, Star,
  User, Landmark, Trophy, Activity, ChevronRight
} from 'lucide-react'

// ── Filter definitions ───────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'ground',   label: 'Ground',  emoji: '🏟️' },
  { key: 'player',   label: 'Player',  emoji: '🏏' },
  { key: 'umpire',   label: 'Umpire',  emoji: '⚖️' },
  { key: 'team',     label: 'Team',    emoji: '🤝' },
]

const GROUND_FILTERS = ['All', 'Turf', 'Matting', 'Cement', 'Astro Turf', 'Indoor', 'Outdoor']
const PLAYER_FILTERS = ['All', 'Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper', 'Right-hand', 'Left-hand']
const UMPIRE_FILTERS = ['All', 'Available', 'Experienced']
const TEAM_FILTERS   = ['All', 'Openings', 'T10', 'T20', 'Test']

const SUB_FILTERS = {
  ground: GROUND_FILTERS,
  player: PLAYER_FILTERS,
  umpire: UMPIRE_FILTERS,
  team:   TEAM_FILTERS,
}

// ── Result card components ───────────────────────────────────────────────────
function GroundCard({ ground, onTap }) {
  const photos = ground.photos || []
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 bg-[var(--cy-surface)] border border-[var(--cy-border)] rounded-2xl p-3 active:scale-[0.98] transition-transform text-left"
    >
      {photos[0] ? (
        <img src={photos[0]} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt={ground.name} />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-2xl">🏟️</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] text-navy-900 truncate">{ground.name}</p>
        <p className="text-[11px] text-navy-500 mt-0.5">{ground.area} · {ground.pitchType}</p>
        <div className="flex items-center gap-2 mt-1">
          {ground.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-semibold">
              <Star size={10} fill="currentColor" /> {ground.rating.toFixed(1)}
            </span>
          )}
          {ground.rentPerHour && (
            <span className="text-[11px] text-navy-500">₹{ground.rentPerHour}/hr</span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl px-3 py-1.5 text-[11px] font-bold">
        Book
      </div>
    </button>
  )
}

function ProfileCard({ profile, onTap }) {
  const isUmpire = profile.role === 'umpire'
  const accentColor = isUmpire ? '#f59e0b' : '#10b981'
  const accentBg    = isUmpire ? '#fef3c7' : '#d1fae5'
  const accentBorder = isUmpire ? '#fcd34d' : '#6ee7b7'
  const label       = isUmpire ? 'Invite' : 'Invite'
  const emoji       = isUmpire ? '⚖️' : '🏏'

  const sub = [
    profile.playing_role || profile.batting_style,
    profile.bowling_style !== 'none' ? profile.bowling_style : null,
    profile.city,
  ].filter(Boolean).join(' · ')

  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 bg-[var(--cy-surface)] border border-[var(--cy-border)] rounded-2xl p-3 active:scale-[0.98] transition-transform text-left"
    >
      {profile.avatar_url ? (
        <img src={profile.avatar_url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt={profile.name} />
      ) : (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: accentBg }}>
          {emoji}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] text-navy-900 truncate">{profile.name || 'Cricketer'}</p>
        {sub ? <p className="text-[11px] text-navy-500 mt-0.5 truncate">{sub}</p> : null}
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={9} className="text-navy-400" />
          <span className="text-[11px] text-navy-400">{profile.city || 'Bengaluru'}</span>
        </div>
      </div>
      <div className="flex-shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold border"
        style={{ background: accentBg, color: accentColor, borderColor: accentBorder }}>
        {label}
      </div>
    </button>
  )
}

function EmptyState({ category, query }) {
  const msgs = {
    ground: ['No grounds found', 'Try removing filters or searching a different area'],
    player: ['No players found', 'Players in your city will appear here'],
    umpire: ['No umpires found', 'Umpires in your city will appear here'],
    team:   ['No teams found', 'Teams in your city will appear here'],
  }
  const [title, sub] = msgs[category] || ['Nothing found', 'Try a different search']
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-3">🔍</div>
      <p className="font-bold text-navy-800 text-base">{title}</p>
      <p className="text-sm text-navy-400 mt-1">{sub}</p>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function UniversalSearch() {
  const navigate   = useNavigate()
  const { user }   = useStore()
  const city       = user?.city || 'Bengaluru'

  const [query,      setQuery]      = useState('')
  const [category,   setCategory]   = useState('ground')
  const [subFilter,  setSubFilter]  = useState('All')
  const [results,    setResults]    = useState([])
  const [loading,    setLoading]    = useState(false)

  // Reset sub-filter when category changes
  useEffect(() => { setSubFilter('All') }, [category])

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      if (category === 'ground') {
        const grounds = await fetchApprovedGrounds(city)
        let filtered = grounds
        if (query) {
          const q = query.toLowerCase()
          filtered = filtered.filter(g =>
            g.name?.toLowerCase().includes(q) ||
            g.area?.toLowerCase().includes(q) ||
            g.pitchType?.toLowerCase().includes(q)
          )
        }
        if (subFilter !== 'All') {
          filtered = filtered.filter(g => {
            if (subFilter === 'Indoor')  return g.facilities?.indoor
            if (subFilter === 'Outdoor') return !g.facilities?.indoor
            return g.pitchType?.toLowerCase().includes(subFilter.toLowerCase())
          })
        }
        setResults(filtered)

      } else if (category === 'player' || category === 'umpire') {
        const role = category === 'player' ? 'player' : 'umpire'
        let q = supabase
          .from('profiles')
          .select('id, name, city, role, avatar_url, playing_role, batting_style, bowling_style, bio')
          .eq('role', role)
          .eq('city', city)
          .limit(40)

        if (query) q = q.ilike('name', `%${query}%`)

        const { data, error } = await q
        if (error) throw error
        let rows = data || []

        if (subFilter !== 'All' && category === 'player') {
          const sf = subFilter.toLowerCase()
          rows = rows.filter(p =>
            p.playing_role?.toLowerCase().includes(sf) ||
            p.batting_style?.toLowerCase().includes(sf) ||
            p.bowling_style?.toLowerCase().includes(sf)
          )
        }
        setResults(rows)

      } else {
        // team — query team_members joined to teams when table exists, else show placeholder
        try {
          const { data } = await supabase
            .from('teams')
            .select('id, name, city, captain_id, sport, format')
            .eq('city', city)
            .limit(30)
          setResults(data || [])
        } catch (_) {
          setResults([])
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    }
    setLoading(false)
  }, [category, query, subFilter, city])

  useEffect(() => {
    const t = setTimeout(fetchResults, 300)
    return () => clearTimeout(t)
  }, [fetchResults])

  const subFilters = SUB_FILTERS[category] || []

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--cy-bg)]">
      <TopBar title="Search" />

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 bg-[var(--cy-surface)] border border-[var(--cy-border)] rounded-2xl px-4 py-3 shadow-sm">
          <Search size={16} className="text-navy-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${category}s in ${city}…`}
            className="flex-1 bg-transparent text-sm text-navy-900 placeholder-slate-400 outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="flex-shrink-0">
              <X size={15} className="text-navy-400" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border transition-all"
              style={
                category === cat.key
                  ? { background: '#7C3AED', color: '#fff', borderColor: '#7C3AED' }
                  : { background: 'var(--cy-surface)', color: 'var(--cy-muted)', borderColor: 'var(--cy-border)' }
              }
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-filter chips */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {subFilters.map(sf => (
            <button
              key={sf}
              onClick={() => setSubFilter(sf)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
              style={
                subFilter === sf
                  ? { background: '#ede9ff', color: '#7C3AED', borderColor: '#c4b5fd' }
                  : { background: 'var(--cy-surface)', color: 'var(--cy-muted)', borderColor: 'var(--cy-border)' }
              }
            >
              {sf}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 pb-24 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState category={category} query={query} />
        ) : (
          <>
            <p className="text-[11px] text-navy-400 font-semibold">
              {results.length} {category}{results.length !== 1 ? 's' : ''} found in {city}
            </p>
            {category === 'ground' && results.map(g => (
              <GroundCard
                key={g.id}
                ground={g}
                onTap={() => navigate(`/grounds/${g.id}`)}
              />
            ))}
            {(category === 'player' || category === 'umpire') && results.map(p => (
              <ProfileCard
                key={p.id}
                profile={p}
                onTap={() => navigate(`/profile/${p.id}`)}
              />
            ))}
            {category === 'team' && results.map(t => (
              <button
                key={t.id}
                className="w-full flex items-center gap-3 bg-[var(--cy-surface)] border border-[var(--cy-border)] rounded-2xl p-3 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">🤝</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-navy-900 truncate">{t.name || 'Team'}</p>
                  <p className="text-[11px] text-navy-500 mt-0.5">{t.format || ''} · {t.city}</p>
                </div>
                <div className="flex-shrink-0 bg-red-50 text-red-500 border border-red-200 rounded-xl px-3 py-1.5 text-[11px] font-bold">
                  Request
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
