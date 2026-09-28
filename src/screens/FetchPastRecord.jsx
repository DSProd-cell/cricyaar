import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Search, ArrowLeft, CheckCircle2, ChevronRight, X, Trophy, Lock } from 'lucide-react'

const MOCK_RECORDS = [
  { id: 1, name: 'Debasish Patro',    role: 'Batsman',     club: 'Eden Gardens Cricket Club',    matches: 4,  runs: 247, wickets: 0,  mom: 2, lastMatch: 'Aug 12, 2024' },
  { id: 2, name: 'Debasish Roy',      role: 'All-rounder', club: 'Kolkata District League',       matches: 2,  runs: 88,  wickets: 3,  mom: 0, lastMatch: 'Jul 5, 2024'  },
  { id: 3, name: 'Debasish Singh',    role: 'Umpire',      club: 'Punjab Warriors T20',           matches: 6,  runs: 0,   wickets: 0,  mom: 0, lastMatch: 'Sep 1, 2024'  },
  { id: 4, name: 'Swapnil Patil',     role: 'Batsman',     club: 'Bengaluru Strikers CC',         matches: 18, runs: 612, wickets: 4,  mom: 5, lastMatch: 'Sep 14, 2024' },
  { id: 5, name: 'Swapnil Kulkarni',  role: 'All-rounder', club: 'Whitefield Warriors',           matches: 11, runs: 344, wickets: 12, mom: 3, lastMatch: 'Aug 28, 2024' },
  { id: 6, name: 'Swapnil Deshmukh', role: 'Bowler',       club: 'Koramangala XI',                matches: 9,  runs: 41,  wickets: 19, mom: 2, lastMatch: 'Sep 3, 2024'  },
  { id: 7, name: 'Siddhant Maruti',   role: 'All-rounder', club: 'Indiranagar Cricket Club',      matches: 14, runs: 489, wickets: 21, mom: 4, lastMatch: 'Sep 20, 2024' },
  { id: 8, name: 'Siddhant M.',       role: 'Batsman',     club: 'Bengaluru Premier League T20',  matches: 7,  runs: 276, wickets: 2,  mom: 1, lastMatch: 'Aug 18, 2024' },
]

// Returns true if record name shares at least one word (≥3 chars) with the user's name
function nameMatches(recordName, userName) {
  if (!userName) return true // no name set → allow free search
  const userWords = userName.toLowerCase().split(/\s+/).filter(w => w.length >= 3)
  const recWords  = recordName.toLowerCase().split(/\s+/)
  return userWords.some(uw => recWords.some(rw => rw.startsWith(uw) || uw.startsWith(rw)))
}

function ResultCard({ record, selected, onSelect }) {
  const isSel = selected?.id === record.id
  return (
    <button
      onClick={() => onSelect(isSel ? null : record)}
      className="w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2 bg-white transition-all active:scale-[0.98]"
      style={{
        borderColor: isSel ? '#7C3AED' : '#e2e8f0',
        background:  isSel ? '#f5f3ff' : '#fff',
        boxShadow: isSel ? '0 2px 12px rgba(124,58,237,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-[15px]"
        style={{ background: isSel ? '#ede9fe' : '#f1f5f9', color: isSel ? '#7C3AED' : '#64748b' }}
      >
        {record.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] text-slate-800 truncate">{record.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{record.role} · {record.club}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {record.runs > 0 && (
            <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{record.runs} Runs</span>
          )}
          {record.wickets > 0 && (
            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{record.wickets} Wkts</span>
          )}
          <span className="text-[10px] text-slate-400">{record.matches} matches</span>
          {record.mom > 0 && (
            <span className="text-[10px] font-bold text-amber-600">⭐ {record.mom} MoM</span>
          )}
        </div>
      </div>

      {isSel
        ? <CheckCircle2 size={20} className="text-violet-600 flex-shrink-0" />
        : <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
      }
    </button>
  )
}

export default function FetchPastRecord() {
  const navigate = useNavigate()
  const { user } = useStore()

  // Pre-fill search with user's first name so only relevant matches appear
  const firstName = user?.name?.split(' ')[0] || ''
  const [query, setQuery]         = useState(firstName)
  const [results, setResults]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [searching, setSearching] = useState(false)
  const [claimedIds, setClaimedIds] = useState(new Set())
  const [claiming, setClaiming]   = useState(false)
  const inputRef = useRef(null)

  // Load already-claimed record IDs from Supabase
  useEffect(() => {
    supabase
      .from('claimed_records')
      .select('record_id')
      .then(({ data }) => {
        if (data?.length) setClaimedIds(new Set(data.map(r => r.record_id)))
      })
  }, [])

  // Filter records: must match user's name AND not already claimed
  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearching(false); return }
    setSearching(true)
    const t = setTimeout(() => {
      const q = query.toLowerCase()
      const matched = MOCK_RECORDS.filter(r => {
        // Must match the search query
        const queryMatch = r.name.toLowerCase().includes(q) || r.club.toLowerCase().includes(q)
        if (!queryMatch) return false
        // Must share a name word with the logged-in user's name
        if (!nameMatches(r.name, user?.name)) return false
        // Must not already be claimed by someone else
        if (claimedIds.has(r.id)) return false
        return true
      })
      setResults(matched)
      setSearching(false)
    }, 400)
    return () => clearTimeout(t)
  }, [query, claimedIds, user?.name])

  const handleClaim = async () => {
    if (!selected || !user?.id) return
    setClaiming(true)
    // Mark as claimed in Supabase so nobody else can claim it
    const { error } = await supabase
      .from('claimed_records')
      .insert({ record_id: selected.id, claimed_by: user.id })
    setClaiming(false)
    if (error && error.code !== '23505') {
      // 23505 = unique_violation — already claimed by someone else between load and claim
      // treat as a race: just block silently
      return
    }
    navigate('/yarein-welcome', { state: { record: selected } })
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#f8fafc' }}>

      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', paddingBottom: 28 }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-5">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={17} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-white text-[18px] leading-tight">Fetch Past Records</h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Find your cricket history on CricYaar</p>
          </div>
          <button onClick={() => navigate('/')} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, padding: '4px 8px' }}>
            Skip
          </button>
        </div>

        {/* Stats teaser */}
        <div className="flex justify-center gap-4 px-6">
          {[['🏏','Runs & Stats'],['🎯','Wickets'],['⭐','MoM Awards']].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search card */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4" style={{ border: '1px solid #e2e8f0' }}>
          {/* Name-match notice */}
          {user?.name && (
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-2.5 px-1">
              🔒 Showing records matching your name — {user.name}
            </p>
          )}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by your name or club…"
              autoFocus
              className="w-full pl-9 pr-9 py-3 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-colors"
              style={{ background: '#f8fafc', border: '1.5px solid', borderColor: query ? '#7C3AED' : '#e2e8f0' }}
            />
            {query && !searching && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-slate-400" />
              </button>
            )}
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 flex flex-col gap-3">

        {/* Empty state */}
        {!query && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-violet-600" />
            </div>
            <p className="font-bold text-slate-700 text-[14px]">Find your cricket records</p>
            <p className="text-slate-500 text-[12px] mt-1.5 leading-relaxed px-6">
              Only records matching your name will appear.<br />
              Search by your name or club.
            </p>
          </div>
        )}

        {/* Results count */}
        {results.length > 0 && (
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
            {results.length} record{results.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Result cards */}
        {results.map(r => (
          <ResultCard key={r.id} record={r} selected={selected} onSelect={setSelected} />
        ))}

        {/* No results */}
        {query && !searching && results.length === 0 && (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-semibold text-slate-700 text-[13px]">No records found for "{query}"</p>
            <p className="text-slate-400 text-[11px] mt-1 px-6 leading-relaxed">
              Records are matched to your name. Try searching your first name, last name, or club.
            </p>
          </div>
        )}
      </div>

      {/* Selected CTA — sticky at bottom */}
      {selected && (
        <div className="px-4 pb-10 pt-3 bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-3 bg-violet-50 rounded-xl px-3 py-2.5">
            <CheckCircle2 size={14} className="text-violet-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-violet-700 truncate">{selected.name}</p>
              <p className="text-[10px] text-violet-500 truncate">{selected.matches} matches · {selected.club}</p>
            </div>
          </div>
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] active:scale-[0.98] transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}
          >
            {claiming
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Claiming…</span>
              : '🔐 Lock & Claim My Records'
            }
          </button>
        </div>
      )}
    </div>
  )
}
