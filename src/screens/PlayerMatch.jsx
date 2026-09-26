import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Trophy, Swords, CheckCircle2, Search, Loader2, ChevronLeft } from 'lucide-react'

// Stat pill component
function Stat({ label, value, color = 'text-navy-700' }) {
  return (
    <div className="text-center">
      <p className={`font-black text-lg leading-none ${color}`}>{value ?? '—'}</p>
      <p className="text-navy-400 text-[10px] mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  )
}

// Single player card
function PlayerCard({ player, onSelect, selected }) {
  const initials = player.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <button
      onClick={() => onSelect(player)}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10'
          : 'border-slate-100 bg-[var(--cy-surface)] hover:border-brand-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${
          selected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-navy-600'
        }`}>
          {player.photo_url
            ? <img src={player.photo_url} alt={player.name} className="w-12 h-12 rounded-xl object-cover" />
            : initials
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-navy-900 text-sm truncate">{player.name}</p>
            {selected && <CheckCircle2 size={18} className="text-brand-500 flex-shrink-0" />}
          </div>
          {(player.team_name || player.city) && (
            <p className="text-navy-500 text-xs mt-0.5 truncate">
              {[player.team_name, player.city].filter(Boolean).join(' · ')}
            </p>
          )}
          {player.seasons_active && (
            <p className="text-navy-400 text-[11px] mt-0.5">Active: {player.seasons_active}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      {(player.matches_played || player.runs_scored || player.wickets_taken) && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2">
          <Stat label="Matches" value={player.matches_played} />
          <Stat label="Runs" value={player.runs_scored} color="text-green-700" />
          <Stat label="Wickets" value={player.wickets_taken} color="text-amber-700" />
          <Stat label="Avg" value={player.batting_avg ? Number(player.batting_avg).toFixed(1) : null} />
        </div>
      )}

      {/* Teams from legacy data */}
      {player.teams && Array.isArray(player.teams) && player.teams.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {player.teams.map((t, i) => (
            <span key={i} className="text-[11px] bg-brand-50 text-brand-600 font-semibold px-2 py-0.5 rounded-full border border-brand-100">
              {typeof t === 'string' ? t : t.name}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

export default function PlayerMatch() {
  const navigate = useNavigate()
  const { user, pendingSignup, setUser } = useStore()
  const searchName = pendingSignup?.fullName || user?.name || ''
  const firstName = pendingSignup?.firstName || user?.name?.split(' ')[0] || ''

  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [importing, setImporting] = useState(false)
  const [query, setQuery]       = useState(searchName)

  const [searched, setSearched] = useState(false)

  const searchPlayers = async (name) => {
    if (!name.trim()) { setPlayers([]); setLoading(false); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const { data, error } = await supabase
        .from('legacy_players')
        .select('*')
        .ilike('name', `%${name.trim()}%`)
        .limit(10)

      setLoading(false)
      if (error || !data) { setPlayers([]); return }
      setPlayers(data)
    } catch {
      setLoading(false)
      setPlayers([])
    }
  }

  useEffect(() => {
    if (searchName.trim()) {
      searchPlayers(searchName)
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    setQuery(e.target.value)
    setSelected(null)
  }

  const handleSearchSubmit = () => searchPlayers(query)

  const handleImport = async () => {
    if (!selected) return
    setImporting(true)

    const updates = {
      legacy_player_id: selected.id,
      name: selected.name || user?.name,
      city: selected.city || user?.city || '',
    }
    await supabase.from('profiles').update(updates).eq('id', user?.id)

    // Import career stats
    await supabase.from('player_stats').upsert({
      user_id: user?.id,
      matches: selected.matches_played || 0,
      runs: selected.runs_scored || 0,
      wickets: selected.wickets_taken || 0,
      batting_avg: selected.batting_avg || 0,
      bowling_avg: selected.bowling_avg || 0,
    }, { onConflict: 'user_id' }).then(() => {})

    // Auto-join teams from legacy data (teams stored as JSON array in legacy record)
    if (selected.teams && Array.isArray(selected.teams) && selected.teams.length > 0) {
      const teamInserts = selected.teams.map(t => ({
        user_id: user?.id,
        team_id: t.id || t,
        role: selected.role || 'player',
        source: 'legacy_import',
      }))
      await supabase.from('team_members').upsert(teamInserts, { onConflict: 'user_id,team_id' }).then(() => {})
    }

    setUser({ ...user, name: selected.name || user?.name, city: selected.city || user?.city })
    setImporting(false)

    // Auto-assign role from legacy data if available, else let user pick
    navigate('/role-onboard', { state: { preSelectedRole: selected.role || null } })
  }

  const handleSkip = () => navigate('/role-onboard')

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 pt-safe pb-3">
        <div className="flex items-center gap-3 pt-3 mb-3">
          <button onClick={() => navigate('/celebration')} className="text-navy-500 hover:text-navy-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          {/* CY Logo */}
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/30">
            <span className="text-white font-black text-xs">CY</span>
          </div>
          <div>
            <h1 className="font-bold text-navy-900 text-lg leading-tight">Is This You?</h1>
            <p className="text-navy-500 text-xs">
              {players.length > 0
                ? `${players.length} player${players.length > 1 ? 's' : ''} found matching "${searchName}"`
                : 'Search your name across our cricket records'
              }
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            className="cm-input pl-9 pr-24 text-sm"
            value={query}
            onChange={handleSearch}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search by name…"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <button
            onClick={handleSearchSubmit}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-500 text-white text-xs font-semibold rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-navy-400">
            <Loader2 size={28} className="animate-spin text-brand-500" />
            <p className="text-sm">Scanning cricket records for {firstName}…</p>
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Trophy size={28} className="text-slate-400" />
            </div>
            {searched ? (
              <>
                <h3 className="font-bold text-navy-900 text-base mb-1">No records found</h3>
                <p className="text-navy-500 text-sm leading-relaxed mb-6">
                  We couldn't find anyone named "{query}" in our archives yet.
                  Your legacy starts today!
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-navy-900 text-base mb-1">Search Your Name</h3>
                <p className="text-navy-500 text-sm leading-relaxed mb-6">
                  Type your name above and tap Search — we'll look through our player records to find your cricket history.
                </p>
              </>
            )}
            <button onClick={handleSkip} className="btn-primary w-full max-w-xs">
              {searched ? 'Start My Cricket Journey →' : 'Skip — Start Fresh →'}
            </button>
          </div>
        ) : (
          <>
            <p className="text-navy-500 text-sm mb-4 text-center">
              Pick your profile to bring your cricket history home
            </p>
            <div className="space-y-3">
              {players.map(p => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  selected={selected?.id === p.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom action */}
      {!loading && players.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--cy-surface)] border-t border-slate-100 p-4 pb-safe space-y-2">
          {selected ? (
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-primary w-full flex items-center justify-center gap-2"
              aria-busy={importing}
            >
              {importing ? (
                <><Loader2 size={16} className="animate-spin" /> Importing your records…</>
              ) : (
                <><Swords size={16} /> That's Me — Import My Records</>
              )}
            </button>
          ) : (
            <button disabled className="btn-primary w-full opacity-40 cursor-not-allowed">
              Select a player above
            </button>
          )}
          <button
            onClick={handleSkip}
            className="w-full py-3 text-navy-500 text-sm font-medium hover:text-navy-700 transition-colors"
          >
            None of these — I'll start fresh
          </button>
        </div>
      )}
    </div>
  )
}
