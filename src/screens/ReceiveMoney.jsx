import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Copy, MessageCircle, IndianRupee,
  CheckCircle, QrCode, Phone, Share2,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { isValidUpiId } from '../lib/upi'

const PURPOSES = [
  { id: 'match_fee',  label: 'Match Fee',   emoji: '🏏' },
  { id: 'umpire_fee', label: 'Umpire Fee',  emoji: '⚖️' },
  { id: 'ground_fee', label: 'Ground Rent', emoji: '📍' },
  { id: 'prize',      label: 'Prize Money', emoji: '🏆' },
  { id: 'team_fund',  label: 'Team Fund',   emoji: '👥' },
  { id: 'other',      label: 'Other',       emoji: '💰' },
]

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000]

export default function ReceiveMoney() {
  const navigate = useNavigate()
  const { user, setUser, addToast } = useStore()

  const [myUpiId,    setMyUpiId]    = useState(user?.upiId || '')
  const [editingUpi, setEditingUpi] = useState(!user?.upiId)
  const [amount,  setAmount]  = useState('')
  const [purpose, setPurpose] = useState('match_fee')
  const [note,    setNote]    = useState('')
  const [copied,  setCopied]  = useState(false)
  const [step,    setStep]    = useState(1) // 1=setup, 2=shared

  const purposeObj = PURPOSES.find(p => p.id === purpose) || PURPOSES[0]
  const amt     = parseFloat(amount) || 0
  const canShare = isValidUpiId(myUpiId) && amt > 0

  const saveUpi = () => {
    if (!isValidUpiId(myUpiId)) {
      addToast('Enter a valid UPI ID, e.g. name@okhdfcbank', 'error')
      return
    }
    setUser({ ...user, upiId: myUpiId.trim() })
    setEditingUpi(false)
    addToast('UPI ID saved', 'success')
  }

  const copyUpiId = async () => {
    try { await navigator.clipboard.writeText(myUpiId) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const myName = user?.name?.split(' ')[0] || 'Me'
    const purposeLabel = purposeObj.label
    const lines = [
      `Hi! ${myName} is requesting ₹${amt.toLocaleString('en-IN')} for *${purposeLabel}* via UPI.`,
      '',
      `UPI ID: *${myUpiId}*`,
      `Amount: *₹${amt.toLocaleString('en-IN')}*`,
      note ? `Note: ${note}` : null,
      '',
      'Before paying, please confirm with me directly — call or message back.',
      '',
      '_Sent via CricYaar_',
    ].filter(l => l !== null).join('\n')

    window.location.href = `whatsapp://send?text=${encodeURIComponent(lines)}`
    setStep(2)
  }

  // ── Shared screen ─────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-dvh bg-[var(--cy-bg)] flex flex-col">
        <div className="bg-[var(--cy-surface)] border-b border-[var(--cy-border)] sticky top-0 z-10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setStep(1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--cy-subtle)] text-navy-700">
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-bold text-navy-900 text-base">Request Sent</h1>
          </div>
        </div>

        <div className="flex-1 p-4 pb-8 max-w-lg mx-auto w-full flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-3 pt-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}>
              <MessageCircle size={36} fill="#16a34a" className="text-green-600" />
            </div>
            <h2 className="text-navy-900 font-extrabold text-xl text-center">Request Shared!</h2>
            <p className="text-navy-500 text-sm text-center max-w-xs">
              Your payment request was sent via WhatsApp. Ask the sender to confirm with you before they pay.
            </p>
          </div>

          {/* Receipt */}
          <div className="card w-full p-5 space-y-3 animate-slide-up">
            <p className="font-bold text-navy-900 text-sm border-b border-[var(--cy-border)] pb-2 mb-1">
              {purposeObj.emoji} Request Summary
            </p>
            {[
              { label: 'Your UPI ID', value: myUpiId, mono: true },
              { label: 'Amount', value: `₹${amt.toLocaleString('en-IN')}`, bold: true },
              { label: 'Purpose', value: purposeObj.label },
              note && { label: 'Note', value: note },
            ].filter(Boolean).map(row => (
              <div key={row.label} className="flex justify-between items-center text-sm">
                <span className="text-navy-500">{row.label}</span>
                <span className={`${row.mono ? 'font-mono text-xs' : ''} ${row.bold ? 'font-extrabold' : 'font-semibold'} text-navy-900 text-right max-w-[60%] truncate`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={copyUpiId}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-2 border-[var(--cy-border)] bg-[var(--cy-subtle)] text-navy-700"
            >
              {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
              {copied ? 'UPI ID Copied!' : 'Copy UPI ID'}
            </button>
            <button onClick={() => navigate(-1)} className="btn-primary w-full">Done</button>
            <button onClick={() => setStep(1)} className="text-navy-400 text-sm w-full text-center">
              Request another amount
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Setup screen ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[var(--cy-bg)] flex flex-col">
      <div className="bg-[var(--cy-surface)] border-b border-[var(--cy-border)] sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--cy-subtle)] text-navy-700">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-navy-900 text-base">Receive Money</h1>
            <p className="text-navy-500 text-xs">Request cricket payments via UPI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 max-w-lg mx-auto w-full space-y-4">

        {/* UPI ID setup */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <QrCode size={14} className="text-brand-500" /> Your UPI ID
          </h2>
          {editingUpi ? (
            <>
              <input
                className="otp-input w-full h-auto px-3 py-3 rounded-xl text-sm"
                placeholder="yourname@okhdfcbank"
                value={myUpiId}
                onChange={e => setMyUpiId(e.target.value)}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
              />
              {myUpiId && !isValidUpiId(myUpiId) && (
                <p className="text-red-500 text-xs">Try: name@okhdfcbank</p>
              )}
              <button
                onClick={saveUpi}
                disabled={!isValidUpiId(myUpiId)}
                className="btn-primary w-full py-3 text-sm disabled:opacity-40"
              >
                Save UPI ID
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--cy-subtle)] border border-[var(--cy-border)]">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-navy-900 font-semibold truncate">{myUpiId}</p>
                <p className="text-green-600 text-xs font-semibold mt-0.5">✓ Active UPI ID</p>
              </div>
              <button
                onClick={copyUpiId}
                className="w-8 h-8 rounded-lg bg-[var(--cy-surface)] border border-[var(--cy-border)] flex items-center justify-center text-navy-500 active:scale-95 transition-all flex-shrink-0"
              >
                {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
              <button onClick={() => setEditingUpi(true)} className="text-brand-500 text-xs font-semibold flex-shrink-0">
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <IndianRupee size={14} className="text-brand-500" /> How much to request?
          </h2>
          <div>
            <input
              className="otp-input w-full h-auto px-3 py-3 rounded-xl text-2xl font-black text-center"
              placeholder="0"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_AMOUNTS.map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    amount === String(q)
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-[var(--cy-surface)] border-[var(--cy-border)] text-navy-600'
                  }`}
                >
                  ₹{q.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-500 mb-2 block">Purpose</label>
            <div className="grid grid-cols-3 gap-2">
              {PURPOSES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 ${
                    purpose === p.id
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-[var(--cy-border)] bg-[var(--cy-surface)] text-navy-600'
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="leading-tight text-center">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-500 mb-1.5 block">Note (optional)</label>
            <input
              className="otp-input w-full h-auto px-3 py-3 rounded-xl text-sm"
              placeholder="e.g. Sunday match, blue team"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* How it works */}
        <div className="card p-4 space-y-2.5">
          <h3 className="font-bold text-navy-900 text-sm">How it works</h3>
          {[
            'Add your UPI ID once — it stays saved.',
            'Set the amount & reason for this request.',
            'Tap "Request via WhatsApp" — the message includes your UPI ID, amount & a reminder to call you first.',
            'The payer calls or messages you to confirm, then pays.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-black">{i + 1}</span>
              </div>
              <p className="text-navy-600 text-sm leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={shareViaWhatsApp}
            disabled={!canShare}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
            style={{ background: canShare ? '#25D366' : undefined }}
          >
            <MessageCircle size={18} fill="#fff" />
            {canShare
              ? `Request ₹${amt.toLocaleString('en-IN')} via WhatsApp`
              : 'Request via WhatsApp'}
          </button>

          <button
            onClick={copyUpiId}
            disabled={!isValidUpiId(myUpiId)}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-2 border-[var(--cy-border)] bg-[var(--cy-subtle)] text-navy-700 disabled:opacity-40"
          >
            {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
            {copied ? 'UPI ID Copied!' : 'Copy UPI ID'}
          </button>
        </div>
      </div>
    </div>
  )
}
