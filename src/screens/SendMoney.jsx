import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, MessageCircle, Phone, CheckCircle,
  IndianRupee, Send, AlertTriangle, Copy,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import UpiPayment from '../lib/upiPayment'
import { isValidUpiId } from '../lib/upi'
import TopBar from '../components/TopBar'

const PURPOSES = [
  { id: 'match_fee',   label: 'Match Fee',   emoji: '🏏' },
  { id: 'umpire_fee',  label: 'Umpire Fee',  emoji: '⚖️' },
  { id: 'ground_fee',  label: 'Ground Rent', emoji: '📍' },
  { id: 'prize',       label: 'Prize Money', emoji: '🏆' },
  { id: 'team_fund',   label: 'Team Fund',   emoji: '👥' },
  { id: 'other',       label: 'Other',       emoji: '💰' },
]

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000]

function StepDot({ active }) {
  return <div className={`w-2 h-2 rounded-full transition-colors ${active ? 'bg-brand-500' : 'bg-navy-200'}`} />
}

export default function SendMoney() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, addToast } = useStore()

  const prefill = location.state || {}

  const [recipientName,  setRecipientName]  = useState(prefill.name  || '')
  const [recipientPhone, setRecipientPhone] = useState(prefill.phone || '')
  const [recipientUpi,   setRecipientUpi]   = useState(prefill.upiId || '')
  const [amount,  setAmount]  = useState(prefill.amount  ? String(prefill.amount) : '')
  const [purpose, setPurpose] = useState(prefill.purpose || 'match_fee')
  const [note,    setNote]    = useState('')

  const [step,             setStep]             = useState(1)
  const [contactDone,      setContactDone]      = useState(false)
  const [hasContactedVia,  setHasContactedVia]  = useState(null)
  const [paying,           setPaying]           = useState(false)
  const [awaitingConfirm,  setAwaitingConfirm]  = useState(false)

  const purposeObj = PURPOSES.find(p => p.id === purpose) || PURPOSES[0]
  const amt = parseFloat(amount) || 0
  const phoneClean = recipientPhone.replace(/\D/g, '')

  const canProceed = (
    recipientName.trim() &&
    amt > 0 &&
    (isValidUpiId(recipientUpi) || phoneClean.length >= 10)
  )

  const openWhatsApp = () => {
    const fullPhone = phoneClean.startsWith('91') ? phoneClean : '91' + phoneClean
    const msg = encodeURIComponent(
      `Hi ${recipientName.split(' ')[0]}, I'm about to send you ₹${amt.toLocaleString('en-IN')} for ${purposeObj.label} via UPI.\n\nPlease confirm your UPI ID: ${recipientUpi || '(tell me your UPI ID)'}\n\nSent via CricYaar`
    )
    window.location.href = `whatsapp://send?phone=${fullPhone}&text=${msg}`
    setHasContactedVia('whatsapp')
    setTimeout(() => setContactDone(true), 1800)
  }

  const openCall = () => {
    window.location.href = `tel:${phoneClean}`
    setHasContactedVia('call')
    setTimeout(() => setContactDone(true), 1800)
  }

  const handlePay = async () => {
    if (!isValidUpiId(recipientUpi)) {
      addToast('Enter a valid UPI ID before paying', 'error')
      return
    }
    setPaying(true)
    try {
      const result = await UpiPayment.pay({
        vpa: recipientUpi.trim(),
        payeeName: recipientName,
        amount: String(amt),
        note: `${purposeObj.label}${note ? ' — ' + note : ''}`,
        refId: 'CY-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      })
      if (result.status === 'SUCCESS') {
        setStep(3)
      } else if (result.status === 'FAILURE') {
        addToast('Payment failed or declined in your UPI app', 'error')
        setPaying(false)
      } else {
        setPaying(false)
        setAwaitingConfirm(true)
      }
    } catch (err) {
      setPaying(false)
      addToast(err.message || 'Could not open a UPI app', 'error')
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-dvh bg-[var(--cy-bg)] flex flex-col items-center justify-center px-5 gap-5">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={44} className="text-green-600" strokeWidth={2} />
        </div>
        <div className="text-center">
          <h2 className="text-navy-900 font-extrabold text-2xl mb-1">Payment Sent!</h2>
          <p className="text-navy-500 text-sm">
            ₹{amt.toLocaleString('en-IN')} → <strong>{recipientName}</strong>
          </p>
          <p className="text-navy-400 text-xs mt-1">{purposeObj.emoji} {purposeObj.label}</p>
        </div>
        <div className="w-full max-w-sm card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-navy-500">To</span>
            <span className="font-semibold text-navy-900">{recipientName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-navy-500">Amount</span>
            <span className="font-bold text-navy-900">₹{amt.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-navy-500">UPI ID</span>
            <span className="font-mono text-navy-700 text-xs">{recipientUpi}</span>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="btn-primary w-full max-w-sm">Done</button>
        <button
          onClick={() => { setStep(1); setContactDone(false); setHasContactedVia(null); setAwaitingConfirm(false); setPaying(false) }}
          className="text-navy-500 text-sm"
        >
          Send another payment
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--cy-bg)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--cy-surface)] border-b border-[var(--cy-border)] sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => step === 2 ? setStep(1) : navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--cy-subtle)] text-navy-700"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-navy-900 text-base">Send Money</h1>
            <p className="text-navy-500 text-xs">
              {step === 1 ? 'Enter payment details' : 'Confirm before paying'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <StepDot active={step >= 1} />
            <StepDot active={step >= 2} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 max-w-lg mx-auto w-full">

        {/* ── Step 1: Form ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">

            {/* Recipient */}
            <div className="card p-4 space-y-3">
              <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
                <Send size={14} className="text-brand-500" /> Who are you paying?
              </h2>
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">Name *</label>
                <input
                  className="otp-input w-full h-auto px-3 py-3 rounded-xl text-sm"
                  placeholder="e.g. Rohit Sharma"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">Phone number *</label>
                <input
                  className="otp-input w-full h-auto px-3 py-3 rounded-xl text-sm"
                  placeholder="10-digit mobile number"
                  type="tel"
                  inputMode="numeric"
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">UPI ID</label>
                <input
                  className="otp-input w-full h-auto px-3 py-3 rounded-xl text-sm"
                  placeholder="name@okhdfcbank"
                  value={recipientUpi}
                  onChange={e => setRecipientUpi(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                {recipientUpi && !isValidUpiId(recipientUpi) && (
                  <p className="text-red-500 text-xs mt-1.5">Format: name@okhdfcbank</p>
                )}
              </div>
            </div>

            {/* Amount + purpose */}
            <div className="card p-4 space-y-3">
              <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
                <IndianRupee size={14} className="text-brand-500" /> Amount & purpose
              </h2>
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">Amount (₹) *</label>
                <input
                  className="otp-input w-full h-auto px-3 py-3 rounded-xl text-2xl font-black text-center"
                  placeholder="0"
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                {/* Quick amounts */}
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
                  placeholder="e.g. Semi-final match fee"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Safety tip */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs leading-relaxed">
                Next, you'll be asked to WhatsApp or call the recipient before paying — this protects you from wrong transfers.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="btn-primary w-full py-4 text-base font-bold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Contact gate + payment ───────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">

            {/* Summary card */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 font-black text-lg">
                    {recipientName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-navy-900 truncate">{recipientName}</p>
                  <p className="text-navy-500 text-xs">{recipientPhone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-navy-900 tabular-nums">
                    ₹{amt.toLocaleString('en-IN')}
                  </p>
                  <p className="text-navy-500 text-xs">{purposeObj.emoji} {purposeObj.label}</p>
                </div>
              </div>
              {recipientUpi && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--cy-subtle)] border border-[var(--cy-border)]">
                  <span className="text-navy-500 text-xs">UPI:</span>
                  <span className="text-navy-900 text-xs font-mono font-semibold flex-1 truncate">{recipientUpi}</span>
                </div>
              )}
            </div>

            {/* Contact gate */}
            <div className="card p-5 space-y-4">
              <div>
                <h2 className="font-extrabold text-navy-900 text-base mb-1">
                  Talk first, then pay 🤝
                </h2>
                <p className="text-navy-500 text-sm leading-relaxed">
                  Reach {recipientName.split(' ')[0]} now — confirm the amount & UPI ID before transferring. Prevents wrong payments.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <button
                  onClick={openWhatsApp}
                  className={`flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    hasContactedVia === 'whatsapp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-[var(--cy-border)] bg-[var(--cy-surface)]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
                    <MessageCircle size={20} fill="#fff" className="text-white" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-extrabold ${hasContactedVia === 'whatsapp' ? 'text-green-700' : 'text-navy-800'}`}>
                      {hasContactedVia === 'whatsapp' ? 'Sent ✓' : 'WhatsApp'}
                    </p>
                    <p className="text-[10px] text-navy-400 mt-0.5">Message them</p>
                  </div>
                </button>

                {/* Call */}
                <button
                  onClick={openCall}
                  className={`flex flex-col items-center gap-2.5 py-5 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    hasContactedVia === 'call'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-[var(--cy-border)] bg-[var(--cy-surface)]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center">
                    <Phone size={20} fill="#fff" className="text-white" />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-extrabold ${hasContactedVia === 'call' ? 'text-blue-700' : 'text-navy-800'}`}>
                      {hasContactedVia === 'call' ? 'Called ✓' : 'Call'}
                    </p>
                    <p className="text-[10px] text-navy-400 mt-0.5">Voice call</p>
                  </div>
                </button>
              </div>

              {/* Confirm checkbox */}
              <button
                onClick={() => setContactDone(v => !v)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                  contactDone
                    ? 'border-green-500 bg-green-50'
                    : 'border-[var(--cy-border)] bg-[var(--cy-subtle)]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  contactDone ? 'bg-green-500 border-green-500' : 'border-navy-300 bg-[var(--cy-surface)]'
                }`}>
                  {contactDone && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <span className={`text-sm font-semibold leading-snug ${contactDone ? 'text-green-700' : 'text-navy-600'}`}>
                  I've confirmed with {recipientName.split(' ')[0]} — amount & UPI are correct
                </span>
              </button>
            </div>

            {/* Awaiting manual confirm after UNKNOWN UPI result */}
            {awaitingConfirm && (
              <div className="card p-4 space-y-3 border-2 border-amber-300">
                <p className="text-navy-700 text-sm font-semibold text-center">
                  Your UPI app didn't confirm the status. Did the payment go through?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-all"
                  >
                    Yes, paid ✓
                  </button>
                  <button
                    onClick={() => setAwaitingConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--cy-subtle)] border border-[var(--cy-border)] text-navy-700 font-bold text-sm active:scale-95 transition-all"
                  >
                    No, retry
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={!contactDone || paying}
              className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {paying ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <IndianRupee size={18} />
                  Pay ₹{amt.toLocaleString('en-IN')} via UPI
                </>
              )}
            </button>
            <p className="text-center text-xs text-navy-400 -mt-2">
              Opens GPay, PhonePe, or your default UPI app
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
