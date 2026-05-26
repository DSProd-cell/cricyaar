import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ChevronLeft, ChevronRight, Trophy, MapPin, Calendar, Users, IndianRupee, Settings, Check, Zap, Shield } from 'lucide-react'

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = ['Details', 'Structure', 'Financials', 'Settings', 'Review']
const FORMATS = ['T20', 'T10', 'T50 (ODI)', 'Custom']
const FORMAT_OVERS = { 'T20': 20, 'T10': 10, 'T50 (ODI)': 50, 'Custom': '' }
const TYPES = ['League', 'Knockout', 'League + Knockout']
const TEAM_OPTIONS = [4, 6, 8, 10, 12, 16]
const SQUAD_OPTIONS = [11, 12, 14, 15]
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh']

const inputCls = 'cm-input'
const labelCls = 'block text-sm font-semibold text-navy-700 mb-1.5'
const errorCls = 'text-red-500 text-xs mt-1'

// ── Reusable toggle ───────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="font-medium text-navy-800 text-sm">{label}</p>
        {desc && <p className="text-navy-400 text-xs mt-0.5">{desc}</p>}
      </div>
      <button
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-brand-500' : 'bg-slate-200'}`}
        onClick={() => onChange(!value)}
        role="switch" aria-checked={value}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

// ── Chip selector ─────────────────────────────────────────────────────────────
function ChipGroup({ options, value, onChange, cols = 3 }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all touch-manipulation ${
            value === opt
              ? 'border-brand-400 bg-brand-50 text-brand-700'
              : 'border-slate-200 bg-white text-navy-600 hover:border-slate-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Step dot indicator ────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border-b border-slate-100">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
            i < current ? 'bg-brand-500 text-white' :
            i === current ? 'bg-brand-500 text-white ring-2 ring-brand-200' :
            'bg-slate-100 text-navy-400'
          }`}>
            {i < current ? <Check size={13} strokeWidth={2.5} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 rounded ${i < current ? 'bg-brand-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// Random short code generator
const genCode = (prefix) => `${prefix}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
const genId    = ()       => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`

export default function CreateTournament() {
  const navigate = useNavigate()
  const { addToast, user, publishTournament, addPublishedTeam } = useStore()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})

  // Form state
  const [form, setForm] = useState({
    // Step 1
    name: '',
    city: '',
    format: 'T20',
    overs: 20,
    // Step 2
    type: 'League + Knockout',
    maxTeams: 8,
    startDate: '',
    endDate: '',
    // Step 3
    entryFee: '',
    prize: '',
    prizeStructure: 'Winner takes all',
    // Step 4
    minSquad: 11,
    acceptFreeAgents: true,
    requireUmpire: false,
    isPublic: true,
  })

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  // ── Validation per step ──────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (step === 0) {
      if (!form.name.trim()) errs.name = 'Tournament name is required'
      if (!form.city.trim()) errs.city = 'City is required'
      if (form.format === 'Custom' && (!form.overs || form.overs < 1)) errs.overs = 'Enter overs per side'
    }
    if (step === 1) {
      if (!form.startDate) errs.startDate = 'Start date is required'
      if (!form.endDate)   errs.endDate   = 'End date is required'
      if (form.startDate && form.endDate && form.endDate <= form.startDate)
        errs.endDate = 'End date must be after start date'
    }
    if (step === 2) {
      if (form.entryFee !== '' && isNaN(Number(form.entryFee))) errs.entryFee = 'Must be a number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validate()) setStep(s => s + 1) }
  const prev = () => setStep(s => s - 1)

  const handlePublish = () => {
    const tournamentId = genId()
    const teamAId      = genId()
    const teamBId      = genId()
    const resolvedOvers = form.format === 'Custom' ? Number(form.overs) : FORMAT_OVERS[form.format]

    // Create 2 default teams for the tournament
    const teamA = {
      id: teamAId,
      name: `${form.name} — Team A`,
      code: genCode('TM'),
      city: form.city,
      color: '#22c55e',
      captain: user?.id || null,
      wins: 0, losses: 0, nr: 0,
      visibility: 'invite_only',
      squad: user?.id ? [user.id] : [],
      tournamentId,
      matchHistory: [],
    }
    const teamB = {
      id: teamBId,
      name: `${form.name} — Team B`,
      code: genCode('TM'),
      city: form.city,
      color: '#3b82f6',
      captain: null,
      wins: 0, losses: 0, nr: 0,
      visibility: 'open',
      squad: [],
      tournamentId,
      matchHistory: [],
    }

    // Create the tournament record
    const newTournament = {
      id: tournamentId,
      name: form.name,
      type: form.type,
      overs: resolvedOvers,
      startDate: form.startDate,
      endDate: form.endDate,
      regDeadline: form.startDate,
      entryFee: form.entryFee ? Number(form.entryFee) : 0,
      prize: form.prize || null,
      prizeStructure: form.prizeStructure,
      status: 'upcoming',
      city: form.city,
      organiser: user?.id || null,
      maxTeams: form.maxTeams,
      minSquad: form.minSquad,
      acceptFreeAgents: form.acceptFreeAgents,
      requireUmpire: form.requireUmpire,
      isPublic: form.isPublic,
      registeredTeams: [teamAId, teamBId],
      approvedTeams: [teamAId, teamBId],
      points: {
        [teamAId]: { p: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: 0 },
        [teamBId]: { p: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: 0 },
      },
      matches: [],
    }

    publishTournament(newTournament)
    addPublishedTeam(teamA)
    addPublishedTeam(teamB)

    addToast(`🏆 "${form.name}" published! 2 teams created.`, 'success')
    navigate('/teams')
  }

  const overs = form.format === 'Custom' ? form.overs : FORMAT_OVERS[form.format]

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="bg-white flex items-center gap-3 px-4 h-14 border-b border-slate-100 sticky top-0 z-20">
        <button onClick={() => step === 0 ? navigate(-1) : prev()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex-shrink-0">
          <ChevronLeft size={20} className="text-navy-700" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-navy-900">Create Tournament</p>
          <p className="text-navy-400 text-xs">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <Trophy size={18} className="text-brand-600" />
        </div>
      </div>

      {/* Step progress */}
      <StepBar current={step} />

      <main className="flex-1 px-4 py-5 max-w-xl mx-auto w-full">

        {/* ── STEP 1: Details ─────────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className={labelCls}>Tournament Name *</label>
              <input
                className={`${inputCls} ${errors.name ? 'border-red-300 focus:border-red-400' : ''}`}
                placeholder="e.g. Mumbai Premier League 2025"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              {errors.name && <p className={errorCls}>{errors.name}</p>}
            </div>

            <div>
              <label className={labelCls}>City *</label>
              <select className={`${inputCls} ${errors.city ? 'border-red-300' : ''}`} value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Select city…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p className={errorCls}>{errors.city}</p>}
            </div>

            <div>
              <label className={labelCls}>Format</label>
              <ChipGroup options={FORMATS} value={form.format} onChange={v => { set('format', v); set('overs', FORMAT_OVERS[v]) }} cols={2} />
            </div>

            {form.format === 'Custom' && (
              <div className="animate-fade-in">
                <label className={labelCls}>Overs per side *</label>
                <input
                  className={`${inputCls} ${errors.overs ? 'border-red-300' : ''}`}
                  type="number" min="1" max="100" placeholder="e.g. 15"
                  value={form.overs}
                  onChange={e => set('overs', e.target.value)}
                />
                {errors.overs && <p className={errorCls}>{errors.overs}</p>}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Structure ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className={labelCls}>Tournament Type</label>
              <ChipGroup options={TYPES} value={form.type} onChange={v => set('type', v)} cols={1} />
            </div>

            <div>
              <label className={labelCls}>Max Teams</label>
              <ChipGroup options={TEAM_OPTIONS} value={form.maxTeams} onChange={v => set('maxTeams', v)} cols={3} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start Date *</label>
                <input
                  className={`${inputCls} ${errors.startDate ? 'border-red-300' : ''}`}
                  type="date"
                  value={form.startDate}
                  onChange={e => set('startDate', e.target.value)}
                />
                {errors.startDate && <p className={errorCls}>{errors.startDate}</p>}
              </div>
              <div>
                <label className={labelCls}>End Date *</label>
                <input
                  className={`${inputCls} ${errors.endDate ? 'border-red-300' : ''}`}
                  type="date"
                  value={form.endDate}
                  onChange={e => set('endDate', e.target.value)}
                />
                {errors.endDate && <p className={errorCls}>{errors.endDate}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Financials ───────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className={labelCls}>Entry Fee per Team (₹)</label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  className={`${inputCls} pl-9 ${errors.entryFee ? 'border-red-300' : ''}`}
                  type="number" min="0" placeholder="0 for free"
                  value={form.entryFee}
                  onChange={e => set('entryFee', e.target.value)}
                />
              </div>
              {errors.entryFee && <p className={errorCls}>{errors.entryFee}</p>}
              <p className="text-navy-400 text-xs mt-1">Leave empty or 0 for a free-to-enter tournament</p>
            </div>

            <div>
              <label className={labelCls}>Prize / Reward</label>
              <input
                className={inputCls}
                placeholder="e.g. ₹50,000 cash + trophy + medals"
                value={form.prize}
                onChange={e => set('prize', e.target.value)}
              />
              <p className="text-navy-400 text-xs mt-1">This is shown publicly to attract teams</p>
            </div>

            <div>
              <label className={labelCls}>Prize Structure</label>
              <ChipGroup
                options={['Winner takes all', 'Top 2 split', 'Top 3 split']}
                value={form.prizeStructure}
                onChange={v => set('prizeStructure', v)}
                cols={1}
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: Settings ─────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-1 animate-fade-in">
            <div className="mb-4">
              <label className={labelCls}>Minimum Squad Size</label>
              <ChipGroup options={SQUAD_OPTIONS} value={form.minSquad} onChange={v => set('minSquad', v)} cols={4} />
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-4">
                <Toggle
                  label="Accept Free Agents"
                  desc="Allow unattached players to register interest"
                  value={form.acceptFreeAgents}
                  onChange={v => set('acceptFreeAgents', v)}
                />
                <Toggle
                  label="Require Official Umpire"
                  desc="Umpires can apply for matches in this tournament"
                  value={form.requireUmpire}
                  onChange={v => set('requireUmpire', v)}
                />
                <Toggle
                  label="Public Registration"
                  desc="Teams can find and join via Open Tournaments page"
                  value={form.isPublic}
                  onChange={v => set('isPublic', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Review & Publish ──────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            {/* Tournament card preview */}
            <div className="bg-gradient-to-br from-brand-50 to-green-50 border border-brand-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={18} className="text-brand-600" />
                <span className="font-extrabold text-navy-900 text-lg">{form.name || 'Untitled Tournament'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge badge-green">{form.format} · {overs} ov</span>
                <span className="badge badge-navy">{form.type}</span>
                <span className="badge badge-blue">{form.maxTeams} teams max</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-navy-600"><MapPin size={13} className="text-navy-400" />{form.city || '—'}</div>
                <div className="flex items-center gap-2 text-navy-600"><Calendar size={13} className="text-navy-400" />{form.startDate || '—'}</div>
                <div className="flex items-center gap-2 text-navy-600"><IndianRupee size={13} className="text-navy-400" />
                  {form.entryFee ? `₹${Number(form.entryFee).toLocaleString('en-IN')} entry` : 'Free entry'}
                </div>
                <div className="flex items-center gap-2 text-navy-600"><Users size={13} className="text-navy-400" />Min {form.minSquad} players</div>
              </div>
              {form.prize && (
                <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <Zap size={13} className="text-amber-500 flex-shrink-0" />
                  <span className="text-amber-800 text-sm font-semibold">{form.prize}</span>
                </div>
              )}
            </div>

            {/* Settings summary */}
            <div className="card space-y-2">
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">Tournament Settings</p>
              {[
                { label: 'Free Agents Welcome', val: form.acceptFreeAgents ? 'Yes' : 'No' },
                { label: 'Official Umpires Required', val: form.requireUmpire ? 'Yes' : 'No' },
                { label: 'Public Registration', val: form.isPublic ? 'Yes (Open Tournaments listing)' : 'Private (invite only)' },
                { label: 'Prize Structure', val: form.prizeStructure },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-navy-500">{row.label}</span>
                  <span className="font-semibold text-navy-900">{row.val}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700">
              After publishing, teams will be able to discover and request to join your tournament. You'll review and approve them from your <strong>Organiser Inbox</strong>.
            </div>
          </div>
        )}

      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-4 safe-pb">
        {step < 4 ? (
          <button className="btn-primary w-full gap-2" onClick={next}>
            Continue
            <ChevronRight size={18} />
          </button>
        ) : (
          <button className="w-full py-4 rounded-2xl bg-brand-500 text-white font-bold text-base hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 shadow-lg" onClick={handlePublish}>
            <Trophy size={20} />
            Publish Tournament
          </button>
        )}
        {step > 0 && step < 4 && (
          <button className="w-full text-center text-navy-400 text-sm mt-3 py-1" onClick={prev}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
