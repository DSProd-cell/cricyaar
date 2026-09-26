import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, MessageCircle, Phone, CheckCircle,
  IndianRupee, Send, AlertTriangle, AlertCircle, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import UpiPayment from '../lib/upiPayment'
import { isValidUpiId } from '../lib/upi'

const PURPOSES = [
  { id: 'match_fee',   label: 'Match Fee',   emoji: '🏏' },
  { id: 'umpire_fee',  label: 'Umpire Fee',  emoji: '⚖️' },
  { id: 'ground_fee',  label: 'Ground Rent', emoji: '📍' },
  { id: 'prize',       label: 'Prize Money', emoji: '🏆' },
  { id: 'team_fund',   label: 'Team Fund',   emoji: '👥' },
  { id: 'other',       label: 'Other',       emoji: '💰' },
]

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000]
const MAX_AMOUNT = 100000

// ── Validators ────────────────────────────────────────────────────────────────
function validateName(v) {
  if (!v.trim()) return 'Name is required'
  if (v.trim().length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) return 'Name should only contain letters'
  return ''
}

function validatePhone(v) {
  const digits = v.replace(/\D/g, '')
  if (!digits) return 'Phone number is required'
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number'
  if (!/^[6-9]/.test(digits)) return 'Mobile number must start with 6, 7, 8 or 9'
  return ''
}

function validateUpi(v) {
  if (!v) return ''  // UPI is optional when phone is valid
  if (!/^[\w.\-+]+@[a-zA-Z]{2,}$/.test(v.trim())) {
    return 'Invalid UPI ID — try format: name@okhdfcbank'
  }
  return ''
}

function validateAmount(v) {
  const n = parseFloat(v)
  if (!v || isNaN(n)) return 'Amount is required'
  if (n < 1) return 'Minimum amount is ₹1'
  if (n > MAX_AMOUNT) return `Maximum amount is ₹${MAX_AMOUNT.toLocaleString('en-IN')}`
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Enter a valid amount'
  return ''
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
      <p className="text-red-500 text-xs">{msg}</p>
    </div>
  )
}

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
  const [amount,  setAmount]  = useState(prefill.amount ? String(prefill.amount) : '')
  const [purpose, setPurpose] = useState(prefill.purpose || 'match_fee')
  const [note,    setNote]    = useState('')

  // Track touched state for each field (show errors only after user has touched)
  const [touched, setTouched] = useState({})
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }))

  const [step,            setStep]            = useState(1)
  const [contactDone,     setContactDone]     = useState(false)
  const [hasContactedVia, setHasContactedVia] = useState(null)
  const [paying,          setPaying]          = useState(false)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)

  const purposeObj = PURPOSES.find(p => p.id === purpose) || PURPOSES[0]
  const amt = parseFloat(amount) || 0
  const phoneDigits = recipientPhone.replace(/\D/g, '')

  // Recipient KYC status: null | 'checking' | 'verified' | 'unverified'
  const [recipientKycStatus, setRecipientKycStatus] = useState(null)

  useEffect(() => {
    if (phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits)) {
      setRecipientKycStatus('checking')
      const t = setTimeout(() => {
        // Mock: last digit even = verified on CricYaar
        const last = parseInt(phoneDigits.slice(-1), 10)
        setRecipientKycStatus(last % 2 === 0 ? 'verified' : 'unverified')
      }, 700)
      return () => clearTimeout(t)
    } else {
      setRecipientKycStatus(null)
    }
  }, [phoneDigits]) // eslint-disable-line react-hooks/exhaustive-deps

  // Live errors (only display when field is touched)
  const nameErr  = validateName(recipientName)
  const phoneErr = validatePhone(recipientPhone)
  const upiErr   = validateUpi(recipientUpi)
  const amtErr   = validateAmount(amount)

  // Phone input: strip non-digits, limit to 10
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setRecipientPhone(digits)
  }

  const canProceed = (
    !nameErr &&
    !phoneErr &&
    !upiErr &&
    !amtErr &&
    recipientName.trim() &&
    phoneDigits.length === 10
  )

  const handleContinue = () => {
    // Touch all fields to show any errors
    setTouched({ name: true, phone: true, upi: true, amount: true })
    if (!canProceed) return
    setStep(2)
  }

  const openWhatsApp = () => {
    const fullPhone = phoneDigits.startsWith('91') ? phoneDigits : '91' + phoneDigits
    const msg = encodeURIComponent(
      `Hi ${recipientName.split(' ')[0]}, I'm about to send you ₹${amt.toLocaleString('en-IN')} for ${purposeObj.label} via UPI.\n\nPlease confirm your UPI ID: ${recipientUpi || '(tell me your UPI ID)'}\n\nSent via CricYaar`
    )
    window.location.href = `whatsapp://send?phone=${fullPhone}&text=${msg}`
    setHasContactedVia('whatsapp')
    setTimeout(() => setContactDone(true), 1800)
  }

  const openCall = () => {
    window.location.href = `tel:${phoneDigits}`
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

  // ── Success screen ──────────────────────────────────────────────────────────
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
          {[
            { label: 'To', value: recipientName },
            { label: 'Amount', value: `₹${amt.toLocaleString('en-IN')}`, bold: true },
            { label: 'Phone', value: recipientPhone },
            recipientUpi && { label: 'UPI ID', value: recipientUpi, mono: true },
            { label: 'Purpose', value: `${purposeObj.emoji} ${purposeObj.label}` },
            note && { label: 'Note', value: note },
          ].filter(Boolean).map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-navy-500">{r.label}</span>
              <span className={`text-right max-w-[60%] ${r.mono ? 'font-mono text-xs' : ''} ${r.bold ? 'font-extrabold text-navy-900' : 'font-semibold text-navy-900'}`}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="btn-primary w-full max-w-sm">Done</button>
        <button
          onClick={() => { setStep(1); setContactDone(false); setHasContactedVia(null); setAwaitingConfirm(false); setPaying(false); setTouched({}) }}
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

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`cm-input ${touched.name && nameErr ? 'border-red-400 focus:ring-red-300' : ''}`}
                  placeholder="e.g. Rohit Sharma"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  onBlur={() => touch('name')}
                  autoComplete="name"
                />
                {touched.name && <FieldError msg={nameErr} />}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-navy-500 text-sm font-semibold">🇮🇳 +91</span>
                    <div className="w-px h-4 bg-navy-200 ml-1" />
                  </div>
                  <input
                    className={`cm-input pl-20 ${touched.phone && phoneErr ? 'border-red-400 focus:ring-red-300' : ''}`}
                    placeholder="98765 43210"
                    type="tel"
                    inputMode="numeric"
                    value={recipientPhone}
                    onChange={handlePhoneChange}
                    onBlur={() => touch('phone')}
                    maxLength={10}
                  />
                  {phoneDigits.length === 10 && !phoneErr && (
                    <CheckCircle size={15} className="text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {touched.phone && <FieldError msg={phoneErr} />}
                {!touched.phone && !recipientKycStatus && (
                  <p className="text-navy-400 text-[11px] mt-1">10-digit Indian mobile number (starts with 6–9)</p>
                )}
                {recipientKycStatus === 'checking' && (
                  <p className="text-navy-400 text-[11px] mt-1.5 flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-navy-300 border-t-navy-500 rounded-full animate-spin inline-block flex-shrink-0" />
                    Checking recipient KYC status…
                  </p>
                )}
                {recipientKycStatus === 'verified' && (
                  <p className="text-green-600 text-[11px] mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="flex-shrink-0" /> KYC Verified on CricYaar
                  </p>
                )}
                {recipientKycStatus === 'unverified' && (
                  <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <ShieldOff size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-xs leading-relaxed">
                      <strong>KYC not verified</strong> — this recipient hasn't completed identity verification on CricYaar.
                    </p>
                  </div>
                )}
              </div>

              {/* UPI */}
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">
                  UPI ID <span className="text-navy-400 font-normal">(optional but needed to pay)</span>
                </label>
                <input
                  className={`cm-input font-mono text-sm ${touched.upi && upiErr ? 'border-red-400 focus:ring-red-300' : recipientUpi && !upiErr ? 'border-green-400' : ''}`}
                  placeholder="name@okhdfcbank"
                  value={recipientUpi}
                  onChange={e => setRecipientUpi(e.target.value.trim())}
                  onBlur={() => touch('upi')}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                />
                {touched.upi && upiErr
                  ? <FieldError msg={upiErr} />
                  : recipientUpi && !upiErr && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle size={11} /> Valid UPI ID
                    </p>
                  )
                }
                {!touched.upi && !recipientUpi && (
                  <p className="text-navy-400 text-[11px] mt-1">Format: name@okhdfcbank · name@ybl · name@paytm</p>
                )}
              </div>
            </div>

            {/* Amount + purpose */}
            <div className="card p-4 space-y-3">
              <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
                <IndianRupee size={14} className="text-brand-500" /> Amount & purpose
              </h2>
              <div>
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500 font-bold text-lg">₹</span>
                  <input
                    className={`cm-input pl-8 text-2xl font-black text-center ${touched.amount && amtErr ? 'border-red-400 focus:ring-red-300' : ''}`}
                    placeholder="0"
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    onBlur={() => touch('amount')}
                    min={1}
                    max={MAX_AMOUNT}
                  />
                </div>
                {touched.amount && <FieldError msg={amtErr} />}
                {!touched.amount && (
                  <p className="text-navy-400 text-[11px] mt-1">Min ₹1 · Max ₹{MAX_AMOUNT.toLocaleString('en-IN')}</p>
                )}
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_AMOUNTS.map(q => (
                    <button
                      key={q}
                      onClick={() => { setAmount(String(q)); touch('amount') }}
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
                <label className="text-xs font-semibold text-navy-500 mb-1.5 block">
                  Note <span className="text-navy-400 font-normal">(optional)</span>
                </label>
                <input
                  className="cm-input"
                  placeholder="e.g. Semi-final match fee"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  maxLength={100}
                />
                {note && (
                  <p className="text-navy-400 text-[10px] mt-1 text-right">{note.length}/100</p>
                )}
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
              onClick={handleContinue}
              disabled={!recipientName.trim() || phoneDigits.length < 10 || !amount}
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
                  <p className="text-navy-500 text-xs">+91 {recipientPhone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-navy-900 tabular-nums">
                    ₹{amt.toLocaleString('en-IN')}
                  </p>
                  <p className="text-navy-500 text-xs">{purposeObj.emoji} {purposeObj.label}</p>
                </div>
              </div>
              {recipientUpi ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200">
                  <CheckCircle size={13} className="text-green-600 flex-shrink-0" />
                  <span className="text-navy-500 text-xs">UPI:</span>
                  <span className="text-navy-900 text-xs font-mono font-semibold flex-1 truncate">{recipientUpi}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
                  <span className="text-amber-800 text-xs">No UPI ID — ask the recipient to share it before you pay</span>
                </div>
              )}
            </div>

            {/* Risk Alert — recipient KYC unverified */}
            {recipientKycStatus === 'unverified' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-300">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-red-800 font-extrabold text-sm mb-1">⚠️ Risk Alert</p>
                  <p className="text-red-700 text-xs leading-relaxed">
                    <strong>{recipientName.split(' ')[0]}</strong> hasn't completed KYC verification on CricYaar. Payments to unverified users carry higher risk — confirm you personally know this person before transferring.
                  </p>
                  <p className="text-red-500 text-[10px] mt-1.5 font-semibold">You can still proceed, but verify details carefully.</p>
                </div>
              </div>
            )}

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

            {!recipientUpi && contactDone && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-200">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs leading-relaxed">
                  You need a UPI ID to pay. Go back and add the recipient's UPI ID.
                </p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={!contactDone || paying || !recipientUpi}
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
