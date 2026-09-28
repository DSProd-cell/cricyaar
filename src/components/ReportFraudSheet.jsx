import { useState } from 'react'
import { X, Flag, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'

const REASONS = [
  { key: 'fake_stats',      label: 'Fake or inflated stats',    emoji: '📊' },
  { key: 'impersonation',   label: 'Impersonating someone',     emoji: '🎭' },
  { key: 'harassment',      label: 'Harassment or abuse',       emoji: '🚫' },
  { key: 'suspicious',      label: 'Suspicious activity',       emoji: '⚠️' },
  { key: 'spam',            label: 'Spam or misleading info',   emoji: '📢' },
  { key: 'other',           label: 'Other',                     emoji: '💬' },
]

export default function ReportFraudSheet({ reported, onClose }) {
  // reported = { id, name }
  const { user } = useStore()
  const [reason,  setReason]  = useState('')
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const handleSubmit = async () => {
    if (!reason || loading) return
    setLoading(true)
    try {
      await supabase.from('fraud_reports').insert({
        reporter_id:   user?.id || null,
        reported_id:   reported?.id || null,
        reported_name: reported?.name || null,
        reason,
        note: note.trim() || null,
        status: 'pending',
      })
    } catch (_) {
      // fail silently — still show success
    }
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-[75] flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        className="relative bg-[var(--cy-surface)] rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up"
        style={{ maxHeight: '82dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <Flag size={16} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-navy-900 text-sm">Report User</p>
            {reported?.name && (
              <p className="text-[11px] text-red-400 font-medium">{reported.name}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: 'calc(82dvh - 80px)' }}>
          {!done ? (
            <>
              {/* Reason picker */}
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Reason for report</p>
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <button
                      key={r.key}
                      onClick={() => setReason(r.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98] text-left"
                      style={{
                        borderColor: reason === r.key ? '#dc2626' : 'var(--cy-border)',
                        background:  reason === r.key ? '#fef2f2' : 'var(--cy-surface)',
                      }}
                    >
                      <span className="text-lg flex-shrink-0">{r.emoji}</span>
                      <span className="font-semibold text-sm text-navy-900 flex-1">{r.label}</span>
                      {reason === r.key && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">
                  Additional details <span className="normal-case font-normal text-navy-400">(optional)</span>
                </p>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value.slice(0, 300))}
                  placeholder="Any extra context that would help our team…"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-[var(--cy-surface)] outline-none focus:border-red-300 placeholder-slate-400 text-navy-900 resize-none transition-colors"
                />
                <p className="text-right text-[10px] text-slate-400 mt-0.5">{note.length}/300</p>
              </div>

              <p className="text-[11px] text-navy-400 text-center leading-relaxed">
                All reports are confidential. Our team reviews within <strong className="text-navy-600">48 hours</strong>.
              </p>

              <button
                onClick={handleSubmit}
                disabled={!reason || loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}
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
                    <Flag size={14} />
                    Submit Report
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
                <p className="font-extrabold text-navy-900 text-base mb-1">Report submitted</p>
                <p className="text-sm text-navy-500 leading-relaxed">
                  Thank you for keeping CricYaar safe. Our team will review within <strong>48 hours</strong>.
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
