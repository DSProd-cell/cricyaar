import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Search, ArrowLeft, CheckCircle2, ChevronRight, X, Trophy, Lock, Phone, PencilLine } from 'lucide-react'

const MIN_QUERY = 3 // the search function refuses anything shorter

const ROLES = ['Batter', 'Bowler', 'All-rounder', 'Wicketkeeper']
const EMPTY_FORM = { role: '', club: '', matches: '', runs: '', wickets: '', mom: '' }
const toInt = (v) => (v === '' ? 0 : parseInt(v, 10) || 0)

// Returns an error message, or '' when the entered numbers make sense
function validateManual(f) {
  const matches = toInt(f.matches), runs = toInt(f.runs), wickets = toInt(f.wickets), mom = toInt(f.mom)
  if (!f.role) return 'Choose your playing role.'
  if (matches + runs + wickets + mom === 0) return 'Enter at least the matches you have played.'
  if (matches === 0) return 'Matches played must be at least 1 if you have runs, wickets or awards.'
  if (matches > 5000 || wickets > 5000 || runs > 100000) return 'Those numbers look too high. Please check them.'
  if (mom > matches) return 'Man of the Match awards cannot be more than matches played.'
  return ''
}

const normalizePhone = (p) => (p || '').replace(/\D/g, '').slice(-10)

// True if the record name shares at least one word (3+ chars) with the user's own name
function nameMatches(recordName, userName) {
  if (!userName) return true // no name set → allow free search
  const userWords = userName.toLowerCase().split(/\s+/).filter(w => w.length >= 3)
  const recWords  = (recordName || '').toLowerCase().split(/\s+/)
  return userWords.some(uw => recWords.some(rw => rw.startsWith(uw) || uw.startsWith(rw)))
}

const VIOLET = '#7C3AED'
const chip = { background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }

function ResultCard({ record, selected, onSelect }) {
  const isSel = selected?.id === record.id
  const teams = Array.isArray(record.teams) ? record.teams : []
  return (
    <button
      onClick={() => onSelect(isSel ? null : record)}
      className="w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98]"
      style={{
        borderColor: isSel ? VIOLET : 'var(--cy-border)',
        background:  isSel ? 'rgba(124,58,237,0.14)' : 'var(--cy-surface)',
        boxShadow: isSel ? '0 2px 12px rgba(124,58,237,0.25)' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {record.photo_url ? (
        <img src={record.photo_url} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-[15px]"
          style={{ background: 'rgba(124,58,237,0.16)', color: 'var(--cy-text)' }}
        >
          {record.name.charAt(0)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] truncate" style={{ color: 'var(--cy-text)' }}>{record.name}</p>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--cy-muted)' }}>
          {[record.role, record.team_name, record.city].filter(Boolean).join(' · ')}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {record.runs_scored > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={chip}>{record.runs_scored} Runs</span>
          )}
          {record.wickets_taken > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={chip}>{record.wickets_taken} Wkts</span>
          )}
          {record.matches_played > 0 && (
            <span className="text-[11px] font-semibold" style={{ color: 'var(--cy-muted)' }}>{record.matches_played} matches</span>
          )}
          {teams.length > 1 && (
            <span className="text-[11px] font-semibold" style={{ color: 'var(--cy-muted)' }}>· {teams.length} teams</span>
          )}
        </div>
      </div>

      {isSel
        ? <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: VIOLET }} />
        : <ChevronRight size={16} className="flex-shrink-0" style={{ color: 'var(--cy-muted)' }} />
      }
    </button>
  )
}

export default function FetchPastRecord() {
  const navigate = useNavigate()
  const { user } = useStore()

  // Pre-fill search with the user's first name so only relevant matches appear
  const firstName = user?.name?.split(' ')[0] || ''
  const [query, setQuery]         = useState(firstName)
  const [results, setResults]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [mobile, setMobile]       = useState('')
  const [claimError, setClaimError] = useState('')
  const [claiming, setClaiming]   = useState(false)
  const inputRef = useRef(null)

  // Self-entered stats ("add it yourself" when no record matches)
  const [hasRecords, setHasRecords] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [manualError, setManualError] = useState('')
  const [savingManual, setSavingManual] = useState(false)
  const [manualSaved, setManualSaved]   = useState(false)

  // Records already on this profile (claimed or self-entered): the self-entry
  // form is for people with nothing yet, so it never adds on top of them.
  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles')
      .select('legacy_player_id, legacy_matches, legacy_runs, legacy_wickets, legacy_mom')
      .eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        setHasRecords(!!data.legacy_player_id || (data.legacy_matches || 0) + (data.legacy_runs || 0) + (data.legacy_wickets || 0) + (data.legacy_mom || 0) > 0)
      })
  }, [user?.id])

  // Search real player records. The database function only returns records
  // nobody has claimed yet, so a claimed record disappears for everyone else.
  useEffect(() => {
    const q = query.trim()
    setSearchError('')
    if (q.length < MIN_QUERY) { setResults([]); setSearching(false); return }
    setSearching(true)
    let cancelled = false
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_legacy_players', { q })
      if (cancelled) return
      setSearching(false)
      if (error) { setResults([]); setSearchError('Could not search right now. Please try again.'); return }
      // Only records that share a name word with the signed-in user's own name
      setResults((data || []).filter(r => nameMatches(r.name, user?.name)))
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, user?.name])

  // A different record or a new search clears the confirmation step
  useEffect(() => { setMobile(''); setClaimError('') }, [selected?.id])

  const handleClaim = async () => {
    if (!selected || !user?.id) return
    setClaimError('')

    const entered = normalizePhone(mobile)
    if (entered.length < 10) { setClaimError('Please enter your 10-digit mobile number.'); return }
    if (entered !== normalizePhone(user?.phone)) { setClaimError('Wrong mobile number entered. Please try again.'); return }

    setClaiming(true)
    const { error } = await supabase.rpc('claim_legacy_player', { p_id: selected.id })
    setClaiming(false)
    if (error) { setClaimError(error.message || 'Could not claim this record. Please try again.'); return }

    navigate('/yarein-welcome', {
      state: {
        record: {
          id: selected.id,
          name: selected.name,
          role: selected.role,
          club: selected.team_name || selected.city || '',
          matches: selected.matches_played || 0,
          runs: selected.runs_scored || 0,
          wickets: selected.wickets_taken || 0,
          mom: 0,
        },
      },
    })
  }

  const setField = (key, value) => { setForm(f => ({ ...f, [key]: value })); setManualError('') }

  const handleSaveManual = async () => {
    const problem = validateManual(form)
    if (problem) { setManualError(problem); return }
    setSavingManual(true)
    setManualError('')

    const numbers = {
      legacy_matches: toInt(form.matches), legacy_runs: toInt(form.runs),
      legacy_wickets: toInt(form.wickets), legacy_mom: toInt(form.mom),
    }
    // Only fills an empty profile: the filters make this a no-op (no row comes
    // back) if records appeared since the screen loaded, so nothing is doubled.
    const { data, error } = await supabase.from('profiles').update(numbers)
      .eq('id', user.id).eq('legacy_matches', 0).eq('legacy_runs', 0)
      .eq('legacy_wickets', 0).eq('legacy_mom', 0).is('legacy_player_id', null)
      .select('id')
    if (error) { setSavingManual(false); setManualError('Could not save right now. Please try again.'); return }
    if (!data?.length) { setSavingManual(false); setHasRecords(true); setShowManual(false); return }

    // Role, club and where the numbers came from; the numbers above are
    // already safe if this part cannot be saved.
    const details = { playing_role: form.role, club_name: form.club.trim() || null, legacy_source: 'self' }
    const { error: detailsError } = await supabase.from('profiles').update(details).eq('id', user.id)

    useStore.getState().setUser({
      ...useStore.getState().user,
      legacyMatches: numbers.legacy_matches, legacyRuns: numbers.legacy_runs,
      legacyWickets: numbers.legacy_wickets, legacyMom: numbers.legacy_mom,
      ...(detailsError ? {} : { playingRole: form.role, clubName: form.club.trim() }),
    })
    setSavingManual(false)
    setHasRecords(true)
    setManualSaved(true)
  }

  const tooShort = query.trim().length > 0 && query.trim().length < MIN_QUERY

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--cy-bg)' }}>

      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', paddingBottom: 28 }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-5">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            aria-label="Back"
          >
            <ArrowLeft size={17} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-white text-[18px] leading-tight">Fetch Past Records</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.88)' }}>Find your cricket history on CricYaar</p>
          </div>
          <button onClick={() => navigate('/')} style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 8px' }}>
            Skip
          </button>
        </div>

        {/* Stats teaser */}
        <div className="flex justify-center gap-4 px-6">
          {[['🏏','Runs & Stats'],['🎯','Wickets'],['⭐','MoM Awards']].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search card */}
      <div className="px-4 -mt-4">
        <div className="rounded-2xl shadow-lg p-4" style={{ background: 'var(--cy-surface)', border: '1px solid var(--cy-border)' }}>
          {user?.name && (
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5 px-1" style={{ color: 'var(--cy-text)' }}>
              🔒 Showing records matching your name — {user.name}
            </p>
          )}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cy-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
              placeholder="Search by your name…"
              autoFocus
              className="w-full pl-9 pr-9 py-3 rounded-xl text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--cy-input-bg)',
                color: 'var(--cy-text)',
                border: '1.5px solid',
                borderColor: query ? VIOLET : 'var(--cy-border)',
              }}
            />
            {query && !searching && (
              <button onClick={() => { setQuery(''); setSelected(null) }} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear">
                <X size={14} style={{ color: 'var(--cy-muted)' }} />
              </button>
            )}
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
            )}
          </div>
          {tooShort && (
            <p className="text-[12px] mt-2 px-1" style={{ color: 'var(--cy-muted)' }}>Type at least {MIN_QUERY} letters to search.</p>
          )}
        </div>
      </div>

      <div className={`flex-1 px-4 pt-4 flex flex-col gap-3 ${selected ? 'pb-72' : 'pb-6'}`}>

        {/* Empty state */}
        {!query.trim() && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(124,58,237,0.16)' }}>
              <Trophy size={28} style={{ color: VIOLET }} />
            </div>
            <p className="font-bold text-[15px]" style={{ color: 'var(--cy-text)' }}>Find your cricket records</p>
            <p className="text-[13px] mt-1.5 leading-relaxed px-6" style={{ color: 'var(--cy-muted)' }}>
              Only records matching your name will appear.<br />
              Search by your name.
            </p>
          </div>
        )}

        {searchError && (
          <p className="text-center text-[13px] font-medium py-4" style={{ color: '#ef4444' }} role="alert">{searchError}</p>
        )}

        {/* Results count */}
        {results.length > 0 && (
          <p className="text-[12px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--cy-muted)' }}>
            {results.length} record{results.length !== 1 ? 's' : ''} found
          </p>
        )}

        {results.map(r => (
          <ResultCard key={r.id} record={r} selected={selected} onSelect={setSelected} />
        ))}

        {/* No results → let the player add their own numbers */}
        {query.trim().length >= MIN_QUERY && !searching && !searchError && results.length === 0 && !manualSaved && (
          <div className="py-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-semibold text-[14px]" style={{ color: 'var(--cy-text)' }}>No records found for "{query}"</p>
              <p className="text-[12px] mt-1 px-6 leading-relaxed" style={{ color: 'var(--cy-muted)' }}>
                Records are matched to your name. Try your first or last name.
              </p>
            </div>

            {hasRecords ? (
              <p className="text-center text-[12px] mt-5 px-4" style={{ color: 'var(--cy-muted)' }}>
                Your profile already has past records, so there is nothing more to add here.
              </p>
            ) : !showManual ? (
              <button
                onClick={() => setShowManual(true)}
                className="w-full mt-5 flex items-center gap-3 p-4 rounded-2xl border-2 text-left active:scale-[0.98] transition-all"
                style={{ background: 'var(--cy-surface)', borderColor: VIOLET }}
              >
                <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.16)' }}>
                  <PencilLine size={20} style={{ color: VIOLET }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[14px]" style={{ color: 'var(--cy-text)' }}>Add your stats yourself</span>
                  <span className="block text-[12px] mt-0.5" style={{ color: 'var(--cy-muted)' }}>Enter your role, club and score so far</span>
                </span>
                <ChevronRight size={16} style={{ color: 'var(--cy-muted)' }} />
              </button>
            ) : (
              <div className="mt-5 rounded-2xl p-4" style={{ background: 'var(--cy-surface)', border: '1px solid var(--cy-border)' }}>
                <p className="font-bold text-[15px]" style={{ color: 'var(--cy-text)' }}>Add your stats</p>
                <p className="text-[12px] mt-1 mb-4 leading-relaxed" style={{ color: 'var(--cy-muted)' }}>
                  These are entered by you and shown as self-reported on your profile. Be honest, your teammates will see them.
                </p>

                <p className="text-[12px] font-bold mb-2" style={{ color: 'var(--cy-text)' }}>Playing role</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ROLES.map(r => (
                    <button
                      key={r} type="button" onClick={() => setField('role', r)}
                      className="px-3.5 py-2 rounded-full text-[13px] font-bold border-2 transition-colors"
                      style={form.role === r
                        ? { background: VIOLET, borderColor: VIOLET, color: '#fff' }
                        : { background: 'transparent', borderColor: 'var(--cy-border)', color: 'var(--cy-text)' }}
                    >{r}</button>
                  ))}
                </div>

                <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--cy-text)' }}>Club or team <span style={{ color: 'var(--cy-muted)', fontWeight: 500 }}>(optional)</span></label>
                <input
                  type="text" value={form.club} maxLength={60}
                  onChange={e => setField('club', e.target.value)}
                  placeholder="e.g. Indiranagar Cricket Club"
                  className="w-full px-3.5 py-3 rounded-xl text-[14px] outline-none mb-4"
                  style={{ background: 'var(--cy-input-bg)', color: 'var(--cy-text)', border: '1.5px solid var(--cy-border)' }}
                />

                <div className="grid grid-cols-2 gap-3 mb-1">
                  {[['matches', 'Matches played'], ['runs', 'Runs scored'], ['wickets', 'Wickets taken'], ['mom', 'Man of the Match']].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--cy-text)' }}>{label}</label>
                      <input
                        type="text" inputMode="numeric" value={form[key]} placeholder="0"
                        onChange={e => setField(key, e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3.5 py-3 rounded-xl text-[15px] font-semibold outline-none tabular-nums"
                        style={{ background: 'var(--cy-input-bg)', color: 'var(--cy-text)', border: '1.5px solid var(--cy-border)' }}
                      />
                    </div>
                  ))}
                </div>

                {manualError && <p className="text-[12px] font-medium mt-3" style={{ color: '#ef4444' }} role="alert">{manualError}</p>}

                <button
                  onClick={handleSaveManual}
                  disabled={savingManual}
                  className="w-full mt-4 py-4 rounded-2xl font-bold text-white text-[15px] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}
                >
                  {savingManual ? 'Saving…' : 'Save my stats'}
                </button>
                <button onClick={() => { setShowManual(false); setManualError('') }} className="w-full mt-2 py-2.5 text-[13px] font-semibold" style={{ color: 'var(--cy-muted)' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Saved */}
        {manualSaved && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.18)' }}>
              <CheckCircle2 size={30} style={{ color: '#22c55e' }} />
            </div>
            <p className="font-bold text-[16px]" style={{ color: 'var(--cy-text)' }}>Your stats are saved</p>
            <p className="text-[13px] mt-1.5 px-4 leading-relaxed" style={{ color: 'var(--cy-muted)' }}>
              {toInt(form.matches)} matches · {toInt(form.runs)} runs · {toInt(form.wickets)} wickets.<br />
              They now show on your profile as self-reported.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-white text-[15px] active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Confirm + claim — sticky at bottom once a record is picked */}
      {selected && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3"
          style={{ background: 'var(--cy-surface)', borderTop: '1px solid var(--cy-border)', boxShadow: '0 -4px 24px rgba(0,0,0,0.18)' }}
        >
          <div className="flex items-center gap-2 mb-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(124,58,237,0.16)' }}>
            <CheckCircle2 size={15} className="flex-shrink-0" style={{ color: VIOLET }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: 'var(--cy-text)' }}>{selected.name}</p>
              <p className="text-[11px] truncate" style={{ color: 'var(--cy-muted)' }}>
                {selected.matches_played || 0} matches{selected.team_name ? ` · ${selected.team_name}` : ''}
              </p>
            </div>
          </div>

          <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--cy-text)' }}>
            Confirm your mobile number
          </label>
          <div className="relative mb-2">
            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cy-muted)' }} />
            <input
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={e => { setMobile(e.target.value.replace(/[^\d+ ]/g, '')); setClaimError('') }}
              placeholder="10-digit number you signed in with"
              maxLength={14}
              className="w-full pl-9 pr-3 py-3 rounded-xl text-[14px] outline-none"
              style={{ background: 'var(--cy-input-bg)', color: 'var(--cy-text)', border: '1.5px solid var(--cy-border)' }}
            />
          </div>
          {claimError && <p className="text-[12px] font-medium mb-2" style={{ color: '#ef4444' }} role="alert">{claimError}</p>}

          <button
            onClick={handleClaim}
            disabled={claiming || normalizePhone(mobile).length < 10}
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}
          >
            {claiming
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Claiming…</span>
              : <span className="flex items-center justify-center gap-2"><Lock size={15} /> Lock &amp; Claim My Records</span>
            }
          </button>
        </div>
      )}
    </div>
  )
}
