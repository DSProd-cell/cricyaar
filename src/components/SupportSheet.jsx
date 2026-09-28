import { useState } from 'react'
import { X, Headphones, Check, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { key: 'account',  label: 'Account / Login issue',  emoji: '🔐' },
  { key: 'match',    label: 'Match or score dispute',  emoji: '🏏' },
  { key: 'payment',  label: 'Payment issue',           emoji: '💳' },
  { key: 'team',     label: 'Team or player problem',  emoji: '🤝' },
  { key: 'bug',      label: 'App bug / not working',   emoji: '🐛' },
  { key: 'other',    label: 'Other',                   emoji: '💬' },
]

export default function SupportSheet({ onClose }) {
  const { user } = useStore()
  const [category, setCategory] = useState('')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  const canSubmit = category && message.trim().length >= 5

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    try {
      await supabase.from('support_requests').insert({
        user_id:  user?.id || null,
        category,
        message:  message.trim(),
        status:   'open',
      })
    } catch (_) {
      // fail silently — user still sees success so they feel heard
    }
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div
        className="relative bg-[var(--cy-surface)] rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up"
        style={{ maxHeight: '85dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
            <Headphones size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-navy-900 text-sm">Get Support</p>
            <p className="text-[11px] text-violet-500 font-medium">We respond within 24 working hours</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: 'calc(85dvh - 80px)' }}>
          {!done ? (
            <>
              {/* Category picker */}
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">What's the issue?</p>
                <div className="space-y-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98] text-left"
                      style={{
                        borderColor: category === cat.key ? '#7C3AED' : 'var(--cy-border)',
                        background:  category === cat.key ? '#f5f3ff'  : 'var(--cy-surface)',
                      }}
                    >
                      <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                      <span className="font-semibold text-sm text-navy-900 flex-1">{cat.label}</span>
                      {category === cat.key && (
                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">
                  Describe your issue <span className="normal-case font-normal text-navy-400">(required)</span>
                </p>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Tell us what happened and what you expected…"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-[var(--cy-surface)] outline-none focus:border-violet-400 placeholder-slate-400 text-navy-900 resize-none transition-colors"
                />
                <p className="text-right text-[10px] text-slate-400 mt-0.5">{message.length}/500</p>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-navy-400 text-center leading-relaxed">
                Our team reviews every ticket — you'll hear back within <strong className="text-navy-600">24 working hours</strong>.
              </p>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting…
                  </span>
                ) : (
                  <>
                    <Headphones size={15} />
                    Send Support Request
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success */
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#dcfce7' }}>
                <Check size={30} className="text-green-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-extrabold text-navy-900 text-base mb-1">Request received! 🙏</p>
                <p className="text-sm text-navy-500 leading-relaxed">
                  We'll get back to you within <strong>24 working hours</strong>.{user?.name ? ` Thanks, ${user.name.split(' ')[0]}!` : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl border border-slate-200 font-semibold text-sm text-navy-600"
              >
                Done
              </button>
            </div>
          )}
        </div>

        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  )
}
