import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, Radio, CheckCircle2, ChevronRight } from 'lucide-react'

// Mock match records — in prod these come from Supabase
const MOCK_RECORDS = [
  { id: 1, name: 'Debasish Patro', role: 'Batsman', club: 'Eden Gardens Cricket Club', matches: 4, runs: 247, wickets: 0, mom: 2, lastMatch: 'Aug 12, 2024' },
  { id: 2, name: 'Debasish Roy', role: 'All-rounder', club: 'Kolkata District League', matches: 2, runs: 88, wickets: 3, mom: 0, lastMatch: 'Jul 5, 2024' },
  { id: 3, name: 'Debasish Singh', role: 'Umpire', club: 'Punjab Warriors T20', matches: 6, runs: 0, wickets: 0, mom: 0, lastMatch: 'Sep 1, 2024' },
]

function ScannerFrame({ active }) {
  return (
    <div style={{
      position: 'relative',
      border: `1.5px solid ${active ? '#7C3AED' : 'rgba(124,58,237,0.35)'}`,
      borderRadius: 14,
      height: 72,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border-color 0.3s',
      background: 'rgba(124,58,237,0.04)',
    }}>
      {/* Corner brackets */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{
          position:'absolute', [v]: 6, [h]: 6,
          width: 14, height: 14,
          borderTop: v === 'top' ? '2px solid #A78BFA' : 'none',
          borderBottom: v === 'bottom' ? '2px solid #A78BFA' : 'none',
          borderLeft: h === 'left' ? '2px solid #A78BFA' : 'none',
          borderRight: h === 'right' ? '2px solid #A78BFA' : 'none',
          borderTopLeftRadius: v==='top'&&h==='left' ? 4 : 0,
          borderTopRightRadius: v==='top'&&h==='right' ? 4 : 0,
          borderBottomLeftRadius: v==='bottom'&&h==='left' ? 4 : 0,
          borderBottomRightRadius: v==='bottom'&&h==='right' ? 4 : 0,
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
          color: active ? '#A78BFA' : 'rgba(167,139,250,0.5)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          transition: 'color 0.3s',
        }}>
          <Radio size={11} style={{ animation: active ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
          {active ? 'SCAN ACTIVE' : 'SCAN READY'}
        </div>
        {!active && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 3 }}>
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
      `}</style>
    </div>
  )
}

function ResultCard({ record, selected, onSelect }) {
  const isSelected = selected?.id === record.id
  return (
    <button
      onClick={() => onSelect(isSelected ? null : record)}
      style={{
        width: '100%', textAlign: 'left',
        background: isSelected ? 'rgba(124,58,237,0.14)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isSelected ? 'rgba(124,58,237,0.6)' : 'rgba(124,58,237,0.2)'}`,
        borderRadius: 12, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'all 0.2s', cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {/* AR dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: isSelected ? '#7C3AED' : '#5B21B6',
        boxShadow: isSelected ? '0 0 8px rgba(124,58,237,0.8)' : 'none',
        transition: 'all 0.2s',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
          {record.name}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
          {record.role} · {record.club}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {record.runs > 0 && (
            <span style={{ color: '#A78BFA', fontSize: 10, fontWeight: 700 }}>{record.runs}R</span>
          )}
          {record.wickets > 0 && (
            <span style={{ color: '#A78BFA', fontSize: 10, fontWeight: 700 }}>{record.wickets}W</span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{record.matches} matches</span>
          {record.mom > 0 && (
            <span style={{ color: '#FFD700', fontSize: 10, fontWeight: 700 }}>⭐ {record.mom} MoM</span>
          )}
        </div>
      </div>
      {isSelected ? (
        <CheckCircle2 size={18} color="#7C3AED" style={{ flexShrink: 0 }} />
      ) : (
        <ChevronRight size={15} color="rgba(167,139,250,0.5)" style={{ flexShrink: 0 }} />
      )}
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
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0a0118 0%, #120520 55%, #07021a 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 0',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={17} color="#fff" />
        </button>
        <div>
          <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
            Fetch Past Record
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
            Find your cricket history
          </p>
        </div>
      </div>

      <div style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Scanner frame */}
        <ScannerFrame active={query.length > 0} />

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="rgba(167,139,250,0.6)"
            style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by player name or club…"
            autoFocus
            style={{
              width: '100%', padding: '12px 12px 12px 38px',
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(124,58,237,0.35)',
              borderRadius: 12, color: '#fff', fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.8)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.35)' }}
          />
          {searching && (
            <div style={{
              position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid rgba(124,58,237,0.3)',
              borderTopColor: '#7C3AED',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
          <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }`}</style>
        </div>

        {/* Empty state */}
        {!query && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏏</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600 }}>
              Search your name to find matches you've played
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 6 }}>
              Runs, wickets, Man of the Match — it's all there
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{
              color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              {results.length} record{results.length !== 1 ? 's' : ''} found
            </p>
            {results.map(r => (
              <ResultCard key={r.id} record={r} selected={selected} onSelect={setSelected} />
            ))}
          </div>
        )}

        {/* No results */}
        {query && !searching && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600 }}>
              No records found for "{query}"
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4 }}>
              Try your club name or a different spelling
            </p>
          </div>
        )}
      </div>

      {/* CTA — only when something is selected */}
      {selected && (
        <div style={{ padding: '0 16px 36px' }}>
          <div style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CheckCircle2 size={15} color="#7C3AED" />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
              Selected: <span style={{ color: '#A78BFA', fontWeight: 700 }}>{selected.name}</span>
              {' · '}{selected.matches} matches · {selected.club}
            </p>
          </div>
          <button
            onClick={handleClaim}
            style={{
              width: '100%', padding: '15px',
              background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
              border: 'none', borderRadius: 14,
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(124,58,237,0.5)',
            }}
          >
            🔐 Lock & Claim Records
          </button>
        </div>
      )}
    </div>
  )
}
