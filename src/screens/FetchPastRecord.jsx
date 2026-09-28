import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, Radio, CheckCircle2, ChevronRight, X } from 'lucide-react'

// Mock match records — in prod these come from Supabase
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

function ScannerFrame({ active }) {
  return (
    <div style={{
      position: 'relative',
      border: `1.5px solid ${active ? '#7C3AED' : 'rgba(124,58,237,0.4)'}`,
      borderRadius: 14,
      height: 64,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border-color 0.3s',
      background: 'rgba(124,58,237,0.06)',
    }}>
      {/* Corner brackets */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{
          position:'absolute', [v]: 6, [h]: 6,
          width: 14, height: 14,
          borderTop: v === 'top' ? '2px solid #7C3AED' : 'none',
          borderBottom: v === 'bottom' ? '2px solid #7C3AED' : 'none',
          borderLeft: h === 'left' ? '2px solid #7C3AED' : 'none',
          borderRight: h === 'right' ? '2px solid #7C3AED' : 'none',
          borderTopLeftRadius: v==='top'&&h==='left' ? 4 : 0,
          borderTopRightRadius: v==='top'&&h==='right' ? 4 : 0,
          borderBottomLeftRadius: v==='bottom'&&h==='left' ? 4 : 0,
          borderBottomRightRadius: v==='bottom'&&h==='right' ? 4 : 0,
          opacity: active ? 1 : 0.5,
        }} />
      ))}

      {/* Scan line */}
      {active && (
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)',
          animation: 'scanLine 1.6s ease-in-out infinite',
        }} />
      )}

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
          color: active ? '#7C3AED' : 'rgba(124,58,237,0.6)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          transition: 'color 0.3s',
        }}>
          <Radio size={11} style={{ animation: active ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
          {active ? 'SCAN ACTIVE' : 'SCAN READY'}
        </div>
        {!active && (
          <p style={{ color: 'var(--cy-muted)', fontSize: 9, marginTop: 3 }}>
            Start typing to activate
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 0; opacity: 1 }
          50%  { top: calc(100% - 2px); opacity: 1 }
          100% { top: 0; opacity: 1 }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }
      `}</style>
    </div>
  )
}

function ResultCard({ record, selected, onSelect }) {
  const isSelected = selected?.id === record.id
  return (
    <button
      onClick={() => onSelect(isSelected ? null : record)}
      className="w-full text-left transition-all active:scale-[0.98]"
      style={{
        background: isSelected ? 'rgba(124,58,237,0.1)' : 'var(--cy-surface)',
        border: `1.5px solid ${isSelected ? '#7C3AED' : 'var(--cy-border)'}`,
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: isSelected ? '#7C3AED' : '#a78bfa',
        boxShadow: isSelected ? '0 0 8px rgba(124,58,237,0.6)' : 'none',
        transition: 'all 0.2s',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="font-bold text-[13px] text-navy-900 truncate">{record.name}</p>
        <p className="text-[10px] text-navy-500 mt-0.5 truncate">{record.role} · {record.club}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {record.runs > 0 && <span style={{ color: '#7C3AED', fontSize: 10, fontWeight: 700 }}>{record.runs}R</span>}
          {record.wickets > 0 && <span style={{ color: '#7C3AED', fontSize: 10, fontWeight: 700 }}>{record.wickets}W</span>}
          <span className="text-[10px] text-navy-400">{record.matches} matches</span>
          {record.mom > 0 && <span style={{ color: '#d97706', fontSize: 10, fontWeight: 700 }}>⭐ {record.mom} MoM</span>}
        </div>
      </div>
      {isSelected
        ? <CheckCircle2 size={18} color="#7C3AED" style={{ flexShrink: 0 }} />
        : <ChevronRight size={15} className="text-navy-300 flex-shrink-0" />
      }
    </button>
  )
}

export default function FetchPastRecord() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearching(false); return }
    setSearching(true)
    const t = setTimeout(() => {
      const q = query.toLowerCase()
      setResults(MOCK_RECORDS.filter(r =>
        r.name.toLowerCase().includes(q) || r.club.toLowerCase().includes(q)
      ))
      setSearching(false)
    }, 600)
    return () => clearTimeout(t)
  }, [query])

  const handleClaim = () => {
    if (!selected) return
    navigate('/yarein-welcome', { state: { record: selected } })
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--cy-bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--cy-surface)] border border-[var(--cy-border)]"
        >
          <ArrowLeft size={17} className="text-navy-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-navy-900 text-[17px] leading-tight">Fetch Past Records</h1>
          <p className="text-[11px] text-navy-400 mt-0.5">Find your cricket history on CricYaar</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-[12px] font-semibold text-violet-500 px-2 py-1"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 px-4 pt-3 pb-8 flex flex-col gap-4">

        {/* Scanner frame */}
        <ScannerFrame active={query.length > 0} />

        {/* Search input */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by player name or club…"
            autoFocus
            className="w-full pl-9 pr-9 py-3 rounded-2xl text-[14px] text-navy-900 placeholder-slate-400 outline-none bg-[var(--cy-surface)] border border-[var(--cy-border)] focus:border-violet-400 transition-colors"
          />
          {query && !searching && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-navy-400" />
            </button>
          )}
          {searching && (
            <div style={{
              position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid rgba(124,58,237,0.2)',
              borderTopColor: '#7C3AED',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
        </div>

        {/* Empty state */}
        {!query && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🏏</div>
            <p className="font-semibold text-navy-600 text-[13px]">Search your name to find matches you've played</p>
            <p className="text-navy-400 text-[11px] mt-2">Runs, wickets, Man of the Match — it's all there</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">
              {results.length} record{results.length !== 1 ? 's' : ''} found
            </p>
            {results.map(r => (
              <ResultCard key={r.id} record={r} selected={selected} onSelect={setSelected} />
            ))}
          </div>
        )}

        {/* No results */}
        {query && !searching && results.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-semibold text-navy-600 text-[13px]">No records found for "{query}"</p>
            <p className="text-navy-400 text-[11px] mt-1">Try your club name or a different spelling</p>
          </div>
        )}
      </div>

      {/* Selected CTA */}
      {selected && (
        <div className="px-4 pb-10 pt-2 border-t border-[var(--cy-border)] bg-[var(--cy-surface)]">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-violet-600 flex-shrink-0" />
            <p className="text-[11px] text-navy-600">
              Selected: <span className="font-bold text-violet-600">{selected.name}</span>
              {' · '}{selected.matches} matches · {selected.club}
            </p>
          </div>
          <button
            onClick={handleClaim}
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}
          >
            🔐 Lock & Claim Records
          </button>
        </div>
      )}
    </div>
  )
}
