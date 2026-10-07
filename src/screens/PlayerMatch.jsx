import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { uploadAvatar } from '../lib/uploads'
import { ArrowLeft, Trophy, Swords, CheckCircle2, Search, Loader2, Phone, Camera, ChevronDown, ChevronUp } from 'lucide-react'

// Strip everything non-digit, then take the last 10 digits (handles +91, 0, etc.)
function normalizePhone(p) {
  return (p || '').replace(/\D/g, '').slice(-10)
}

function Stat({ label, value, color = 'text-navy-700' }) {
  return (
    <div className="text-center">
      <p className={`font-black text-lg leading-none ${color}`}>{value ?? '—'}</p>
      <p className="text-navy-400 text-[10px] mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  )
}

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

      {(player.matches_played || player.runs_scored || player.wickets_taken) && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2">
          <Stat label="Matches" value={player.matches_played} />
          <Stat label="Runs" value={player.runs_scored} color="text-green-700" />
          <Stat label="Wickets" value={player.wickets_taken} color="text-amber-700" />
          <Stat label="Avg" value={player.batting_avg ? Number(player.batting_avg).toFixed(1) : null} />
        </div>
      )}

      {player.teams && Array.isArray(player.teams) && player.teams.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {player.teams.slice(0, 4).map((t, i) => (
            <span key={i} className="text-[11px] bg-brand-50 text-brand-600 font-semibold px-2 py-0.5 rounded-full border border-brand-100">
              {typeof t === 'string' ? t : t.name}
            </span>
          ))}
          {player.teams.length > 4 && (
            <span className="text-[11px] text-navy-400 font-semibold px-1 py-0.5">+{player.teams.length - 4} more</span>
          )}
        </div>
      )}
    </button>
  )
}

export default function PlayerMatch() {
  const navigate = useNavigate()
  const { user, pendingSignup, setUser } = useStore()
  const searchName = pendingSignup?.fullName || user?.name || ''
  const firstName  = pendingSignup?.firstName || user?.name?.split(' ')[0] || ''

  const [players, setPlayers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [searchedFor, setSearchedFor] = useState('')
  const [query, setQuery]         = useState(searchName)
  const [searched, setSearched]   = useState(false)

  // ── Mobile verification ──────────────────────────────────────────────────
  const [showVerify, setShowVerify]   = useState(false)
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifying, setVerifying]     = useState(false)

  // ── Manual profile input ─────────────────────────────────────────────────
  const [showManual, setShowManual]         = useState(false)
  const [manualMatches, setManualMatches]   = useState('')
  const [manualRuns, setManualRuns]         = useState('')
  const [manualWickets, setManualWickets]   = useState('')
  const [manualPhoto, setManualPhoto]       = useState(null)
  const [manualPhotoPreview, setManualPhotoPreview] = useState(null)
  const [savingManual, setSavingManual]     = useState(false)
  const [manualSaved, setManualSaved]       = useState(false)
  const photoInputRef = useRef(null)

  const searchPlayers = async (name) => {
    if (!name.trim()) { setPlayers([]); setLoading(false); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    setSearchedFor(name.trim())
    try {
      const { data, error } = await supabase.rpc('search_legacy_players', { q: name.trim() })
      setLoading(false)
      if (error || !data) { setPlayers([]); return }
      setPlayers(data)
    } catch {
      setLoading(false)
      setPlayers([])
    }
  }

  useEffect(() => {
    if (searchName.trim()) searchPlayers(searchName)
    else setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => { setQuery(e.target.value); setSelected(null) }
  const handleSearchSubmit = () => searchPlayers(query)
  const handleSkip = () => navigate('/role-onboard')

  // ── Claim after successful phone verification ────────────────────────────
  const doImport = async () => {
    setImporting(true)
    setImportError('')
    const { data, error } = await supabase.rpc('claim_legacy_player', { p_id: selected.id })
    if (error) {
      setImporting(false)
      setImportError(error.message || 'Could not link this record. Please try again.')
      return
    }
    setUser({
      ...user,
      name:   data?.name      || user?.name,
      city:   data?.city      || user?.city,
      avatar: data?.photo_url || user?.avatar,
    })
    setImporting(false)
    navigate('/role-onboard', { state: { preSelectedRole: null } })
  }

  // ── Phone verification logic ─────────────────────────────────────────────
  const handleVerifyPhone = async () => {
    setVerifyError('')
    setVerifying(true)

    const entered     = normalizePhone(verifyPhone)
    const registered  = normalizePhone(user?.phone)

    if (!entered || entered.length < 10) {
      setVerifyError('Please enter a valid 10-digit mobile number.')
      setVerifying(false)
      return
    }

    if (entered !== registered) {
      setVerifyError('Wrong mobile number entered. Please try again.')
      setVerifying(false)
      return
    }

    // Phone matched — proceed with claim
    setShowVerify(false)
    setVerifying(false)
    await doImport()
  }

  // ── Manual profile update ────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setManualPhoto(file)
    setManualPhotoPreview(URL.createObjectURL(file))
  }

  const handleSaveManual = async () => {
    if (!user?.id) return
    setSavingManual(true)

    try {
      // Upload photo if provided
      let avatarUrl = user?.avatar
      if (manualPhoto) {
        avatarUrl = await uploadAvatar(user.id, manualPhoto)
      }

      // Update profile photo
      if (avatarUrl !== user?.avatar) {
        await supabase.from('profiles').update({ avatar: avatarUrl }).eq('id', user.id)
        setUser({ ...user, avatar: avatarUrl })
      }

      // Upsert player stats
      const statsUpdate = {
        user_id:    user.id,
        matches:    parseInt(manualMatches) || 0,
        runs:       parseInt(manualRuns)    || 0,
        wickets:    parseInt(manualWickets) || 0,
        updated_at: new Date().toISOString(),
      }
      await supabase.from('player_stats').upsert(statsUpdate, { onConflict: 'user_id' })

      setManualSaved(true)
    } catch {
      // silently fail — user can retry
    } finally {
      setSavingManual(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 pt-safe pb-3">
        <div className="flex items-center gap-3 pt-3 mb-3">
          <button onClick={() => navigate('/celebration')} className="text-navy-500 hover:text-navy-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/30">
            <span className="text-white font-black text-xs">CY</span>
          </div>
          <div>
            <h1 className="font-bold text-navy-900 text-lg leading-tight">Is This You?</h1>
            <p className="text-navy-500 text-xs">
              {players.length > 0
                ? `${players.length} player${players.length > 1 ? 's' : ''} found matching "${searchedFor}"`
                : 'Search your name across our cricket records'
              }
            </p>
          </div>
        </div>

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
      <div className="flex-1 p-4 pb-40">
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

        {/* ── Manual profile input ──────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setShowManual(v => !v)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="font-bold text-navy-900 text-sm">Update your profile details</p>
              <p className="text-navy-500 text-xs mt-0.5">
                Add your stats manually — we'll update your profile right away
              </p>
            </div>
            {showManual
              ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
              : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
            }
          </button>

          {showManual && (
            <div className="px-4 pb-5 border-t border-slate-100 pt-4 space-y-4">
              {manualSaved ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle2 size={32} className="text-green-500" />
                  <p className="font-bold text-navy-900 text-sm">All set!</p>
                  <p className="text-navy-500 text-xs leading-relaxed">
                    We'll update it inside your profile, and you can continue from here.
                  </p>
                  <button onClick={handleSkip} className="btn-primary mt-2 px-6">
                    Continue →
                  </button>
                </div>
              ) : (
                <>
                  {/* Photo upload */}
                  <div>
                    <p className="text-xs font-semibold text-navy-600 mb-2">Profile Photo</p>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {manualPhotoPreview
                          ? <img src={manualPhotoPreview} alt="Preview" className="w-14 h-14 object-cover" />
                          : <Camera size={20} className="text-slate-400" />
                        }
                      </div>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-brand-300 text-brand-600 text-xs font-semibold text-center"
                      >
                        {manualPhoto ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>

                  {/* Stats fields */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-navy-600 block mb-1.5">Matches Played</label>
                      <input
                        type="number"
                        min="0"
                        value={manualMatches}
                        onChange={e => setManualMatches(e.target.value)}
                        placeholder="0"
                        className="cm-input text-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-navy-600 block mb-1.5">Total Runs</label>
                      <input
                        type="number"
                        min="0"
                        value={manualRuns}
                        onChange={e => setManualRuns(e.target.value)}
                        placeholder="0"
                        className="cm-input text-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-navy-600 block mb-1.5">Wickets</label>
                      <input
                        type="number"
                        min="0"
                        value={manualWickets}
                        onChange={e => setManualWickets(e.target.value)}
                        placeholder="0"
                        className="cm-input text-sm text-center"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveManual}
                    disabled={savingManual || (!manualMatches && !manualRuns && !manualWickets && !manualPhoto)}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {savingManual
                      ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      : '✓ Save & Update My Profile'
                    }
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom action bar ───────────────────────────────────────────── */}
      {!loading && players.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--cy-surface)] border-t border-slate-100 p-4 pb-safe space-y-2">
          {importError && <p className="text-red-500 text-xs text-center" role="alert">{importError}</p>}
          {selected ? (
            <button
              onClick={() => { setVerifyPhone(''); setVerifyError(''); setShowVerify(true) }}
              disabled={importing}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {importing
                ? <><Loader2 size={16} className="animate-spin" /> Importing your records…</>
                : <><Swords size={16} /> That's Me — Import My Records</>
              }
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

      {/* ── Mobile verification overlay ─────────────────────────────────── */}
      {showVerify && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => e.target === e.currentTarget && setShowVerify(false)}
        >
          <div className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl">
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Phone size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="font-bold text-navy-900 text-[15px]">Verify your identity</p>
                <p className="text-navy-500 text-xs mt-0.5">Confirm it's really you</p>
              </div>
            </div>

            <p className="text-navy-600 text-sm mb-4 leading-relaxed">
              Please enter the mobile number linked with this profile.
            </p>

            <div className="relative mb-4">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-500 text-sm font-semibold pointer-events-none">
                +91
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={verifyPhone}
                onChange={e => { setVerifyPhone(e.target.value.replace(/\D/g, '')); setVerifyError('') }}
                placeholder="Enter 10-digit number"
                className="cm-input pl-12 text-sm tracking-wider"
                autoFocus
              />
            </div>

            {verifyError && (
              <p className="text-red-500 text-xs mb-3 font-medium" role="alert">{verifyError}</p>
            )}

            <button
              onClick={handleVerifyPhone}
              disabled={verifying || verifyPhone.length < 10}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {verifying
                ? <><Loader2 size={15} className="animate-spin" /> Verifying…</>
                : 'Verify & Import Records'
              }
            </button>

            <button
              onClick={() => setShowVerify(false)}
              className="w-full py-3 text-navy-400 text-sm font-medium mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
