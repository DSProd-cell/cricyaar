import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import TopBar from '../components/TopBar'
import { Check, AlertTriangle, X, ArrowRight, Import } from 'lucide-react'

const IMPORT_ITEMS = [
  { status: 'ok',  label: 'Career batting stats (runs, average, strike rate, highest score)' },
  { status: 'ok',  label: 'Career bowling stats (wickets, economy, best figures)' },
  { status: 'ok',  label: 'Match history (all matches on CricHeroes profile)' },
  { status: 'ok',  label: 'Tournament history' },
  { status: 'warn',label: 'Team memberships (may require manual confirmation)' },
  { status: 'no',  label: 'Profile photo (not imported — use CricYaar photo upload)' },
]

export default function CricHeroesImport() {
  const navigate  = useNavigate()
  const { user, addToast } = useStore()
  const [step,     setStep]     = useState(1)
  const [username, setUsername] = useState('')
  const [error,    setError]    = useState('')

  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const role  = user?.role || 'fan'

  // Only non-fan + Pro users can import
  const isEligible = role !== 'fan' && (isPro || role === 'admin')

  const handlePreview = () => {
    if (!username.trim()) { setError('Enter your CricHeroes username to continue.'); return }
    setError('')
    setStep(2)
  }

  const handleRequest = () => {
    setStep(3)
  }

  const handleDone = () => {
    addToast('Import requested! We\'ll notify you when it\'s ready.', 'success')
    navigate('/settings')
  }

  /* ── Paywall ── */
  if (!isEligible) {
    return (
      <div className="min-h-dvh flex flex-col">
        <TopBar title="Import from CricHeroes" showBack />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Import size={28} className="text-amber-500" />
          </div>
          <h2 className="font-extrabold text-navy-900 text-xl mb-2">Pro Feature</h2>
          <p className="text-navy-500 text-sm mb-6 max-w-xs">
            CricHeroes import requires CricYaar Pro. Upgrade to bring your match history and stats across.
          </p>
          <button onClick={() => navigate('/pro')} className="btn-primary px-8">
            Upgrade to Pro · ₹99/mo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Import from CricHeroes" showBack />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s  ? 'bg-brand-500 text-white' :
                step === s ? 'bg-brand-500 text-white ring-4 ring-brand-100' :
                'bg-slate-100 text-navy-400'
              }`}>
                {step > s ? <Check size={13} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 w-8 rounded ${step > s ? 'bg-brand-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
          <span className="text-xs text-navy-400 ml-2 font-medium">
            {step === 1 ? 'Enter username' : step === 2 ? 'Preview' : 'Done!'}
          </span>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Import your CricHeroes history</h1>
            <p className="text-navy-500 text-sm mb-6 leading-relaxed">
              Bring your match stats and history from CricHeroes to CricYaar. Enter your CricHeroes username below.
            </p>

            <label className="block text-xs font-semibold text-navy-600 mb-1.5">CricHeroes username</label>
            <input
              className={`cm-input mb-1 ${error ? 'border-red-400 focus:border-red-500' : ''}`}
              placeholder="e.g. rohit_sharma_99"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
            />
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            {!error && <p className="text-navy-400 text-xs mb-6">Enter your exact CricHeroes username (case-sensitive)</p>}

            <button onClick={handlePreview} className="btn-primary w-full gap-2">
              Preview what will be imported
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Preview import</h1>
            <p className="text-navy-500 text-sm mb-5">
              Here's what will be imported for <span className="font-semibold text-navy-900">@{username}</span>
            </p>

            <div className="card mb-4">
              <div className="space-y-3">
                {IMPORT_ITEMS.map(({ status, label }) => (
                  <div key={label} className="flex items-start gap-3">
                    {status === 'ok'   && <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-green-600" /></div>}
                    {status === 'warn' && <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5"><AlertTriangle size={11} className="text-amber-500" /></div>}
                    {status === 'no'   && <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5"><X size={12} className="text-slate-400" /></div>}
                    <p className={`text-sm leading-snug ${status === 'no' ? 'text-navy-400 line-through' : 'text-navy-700'}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning banner */}
            <div className="flex gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs leading-relaxed">
                Imported stats are merged with your existing CricYaar data. Duplicate matches are detected automatically.
              </p>
            </div>

            <button onClick={handleRequest} className="btn-primary w-full mb-3 gap-2">
              <Import size={16} />
              Request Import
            </button>
            <button onClick={() => setStep(1)} className="btn-secondary w-full">
              ← Back
            </button>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center">
                <Check size={24} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Import requested!</h1>
            <p className="text-navy-500 text-sm leading-relaxed mb-2">
              We've received your request to import data for CricHeroes username{' '}
              <span className="font-bold text-navy-900">@{username}</span>.
            </p>
            <p className="text-navy-500 text-sm leading-relaxed mb-6">
              We'll send you a notification when your data is ready — this can take up to 48 hours.
            </p>
            <button onClick={handleDone} className="btn-primary w-full mb-4">
              Got it
            </button>
            <p className="text-navy-300 text-xs">
              Live CricHeroes sync is coming in a future update. This is a one-time import request.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
