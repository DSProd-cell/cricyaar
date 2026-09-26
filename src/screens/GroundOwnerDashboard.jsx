import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { saveMyUpiId, fetchBookingsToConfirm, confirmBookingPayment } from '../lib/groundsApi'
import { buildUpiLink, isValidUpiId } from '../lib/upi'
import UpiPayment from '../lib/upiPayment'
import TopBar from '../components/TopBar'
import {
  Shield, MapPin, Camera, Banknote, Check, Upload,
  Lock, X, Eye, EyeOff, IndianRupee, ChevronRight,
  AlertCircle, Building2, Phone, MessageCircle, Bell
} from 'lucide-react'

// ── Role guard — renders if user is NOT ground_owner/admin ─────────────────
// Exported so other ground-owner-only screens (e.g. EarningsDashboard) can
// reuse the same gate instead of re-implementing role/verification checks.
export function RoleGuard() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5">
        <Lock size={32} className="text-slate-400" />
      </div>
      <h2 className="font-extrabold text-navy-900 text-xl mb-2">Ground Owner access only</h2>
      <p className="text-navy-500 text-sm leading-relaxed mb-6 max-w-xs">
        This section is only accessible to users with the <strong>Ground Owner</strong> role.
        Switch roles to continue.
      </p>
      <button onClick={() => navigate('/role-select')} className="btn-primary w-full max-w-xs mb-3">
        Change Role
      </button>
      {/* No separate "Go Back" link here — the screen's TopBar already has a
          back arrow, and a second back affordance in the body was a
          duplicate control (audited as part of the v5 nav cleanup). */}
    </div>
  )
}

// ── Aadhaar verification gate ───────────────────────────────────────────────
export function VerificationGate() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-8">
      <div className="w-24 h-24 rounded-3xl bg-cyan-50 border-2 border-cyan-200 flex items-center justify-center mb-6">
        <Shield size={38} className="text-cyan-600" />
      </div>
      <h2 className="font-extrabold text-navy-900 text-xl mb-2">Verify your identity first</h2>
      <p className="text-navy-500 text-sm leading-relaxed mb-4 max-w-xs">
        Before listing your ground or adding bank details, you must verify your identity via Aadhaar or a Government ID.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-7 max-w-xs text-left">
        <p className="text-amber-700 text-xs leading-relaxed">
          <span className="font-bold">Why is this required?</span> Verification protects players and ground owners — only genuine owners can list grounds and receive payouts.
        </p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => navigate('/aadhaar-verify?from=ground_owner')}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}
        >
          <Shield size={16} />
          Verify with Aadhaar
        </button>
        <button
          onClick={() => navigate('/aadhaar-verify?from=ground_owner')}
          className="w-full py-3 rounded-2xl border-2 border-slate-200 bg-[var(--cy-surface)] text-navy-700 font-semibold text-sm hover:border-cyan-300 transition-colors"
        >
          Verify with Government ID
        </button>
      </div>
      <p className="text-navy-300 text-xs mt-5">Your data is encrypted and never shared.</p>
    </div>
  )
}

// ── Helper components ───────────────────────────────────────────────────────
const BADGE_COLORS = {
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
}

function SectionCard({ title, icon, children, badge, badgeColor = 'green' }) {
  return (
    <div className="bg-[var(--cy-surface)] rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <span className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">{icon}</span>
        <p className="font-bold text-navy-900 text-sm flex-1">{title}</p>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BADGE_COLORS[badgeColor] || BADGE_COLORS.green}`}>{badge}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, mono, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy-700 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-navy-900 bg-slate-50 focus:outline-none focus:border-cyan-500 transition-colors ${mono ? 'font-mono tracking-wider uppercase' : ''}`}
      />
    </div>
  )
}

function SaveBtn({ onClick, loading, label, color = '#0891b2', icon }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
      style={{ background: color }}
    >
      {loading
        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
        : <>{icon}<span>{label}</span></>
      }
    </button>
  )
}

// ── Payment Collection — bookings where the renter still owes money ────────
const INITIAL_DUE_PAYMENTS = [
  { id: 'dp1', renter: "Rahul's XI",        phone: '+919876543210', amount: 1600, slot: 'Sun, 25 May · 07:00–09:00', remindersSent: 0 },
  { id: 'dp2', renter: 'Mumbai Warriors',   phone: '+919823456780', amount: 1800, slot: 'Sat, 24 May · 16:00–18:00', remindersSent: 1 },
  { id: 'dp3', renter: 'Delhi Daredevils',  phone: '+919845612378', amount: 1600, slot: 'Sun, 1 Jun · 07:00–09:00',  remindersSent: 0 },
]

// ── Bookings to confirm — real bookings where the renter has claimed a UPI
// payment and the owner needs to check their own UPI app and confirm ──────
function BookingsToConfirm({ user, addToast }) {
  const [bookings, setBookings] = useState(null) // null = loading
  const [confirmingId, setConfirmingId] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    fetchBookingsToConfirm(user.id)
      .then(setBookings)
      .catch(err => { console.error('Failed to load bookings to confirm', err); setBookings([]) })
  }, [user?.id])

  const handleConfirm = async (booking) => {
    setConfirmingId(booking.id)
    try {
      await confirmBookingPayment(booking.id)
      setBookings(b => b.filter(x => x.id !== booking.id))
      addToast('Payment confirmed', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to confirm payment', 'error')
    } finally {
      setConfirmingId(null)
    }
  }

  if (bookings === null) return null // don't flash an empty state while loading
  if (bookings.length === 0) return null // nothing awaiting confirmation — no need to take up space

  return (
    <SectionCard title="Bookings to Confirm" icon={<Check size={15} className="text-green-600" />} badge={`${bookings.length} new`}>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="border border-slate-100 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-bold text-navy-900 text-sm truncate">{b.renterName}</p>
                <p className="text-navy-400 text-xs mt-0.5">{b.slot || b.groundName}</p>
                <p className="text-navy-300 text-[10px] mt-0.5">Ref: {b.bookingRef}</p>
              </div>
              <p className="font-extrabold text-green-600 text-sm flex-shrink-0">₹{Number(b.amount).toLocaleString('en-IN')}</p>
            </div>
            <p className="text-navy-500 text-xs mb-2">Renter says they've paid via UPI — check your UPI app or bank statement, then confirm.</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(b)}
                disabled={confirmingId === b.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 text-white text-xs font-bold disabled:opacity-60"
              >
                <Check size={13} />
                {confirmingId === b.id ? 'Confirming…' : 'Payment Received'}
              </button>
              {b.renterPhone && (
                <button
                  onClick={() => window.location.href = `tel:${b.renterPhone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                >
                  <Phone size={13} />
                  Call
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function PaymentCollection({ user, setUser, addToast, groundName }) {
  const [dues, setDues] = useState(INITIAL_DUE_PAYMENTS)
  const [upiId, setUpiId] = useState(user?.upiId || '')
  const [savingUpi, setSavingUpi] = useState(false)
  const [testingUpi, setTestingUpi] = useState(false)
  const savedUpiId = user?.upiId || null

  const handleSaveUpi = async () => {
    if (!isValidUpiId(upiId)) {
      addToast('Enter a valid UPI ID, e.g. name@okhdfcbank', 'error'); return
    }
    setSavingUpi(true)
    try {
      await saveMyUpiId(user.id, upiId.trim())
      setUser({ ...user, upiId: upiId.trim() })
      addToast('UPI ID saved — you can now collect payments directly', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to save UPI ID', 'error')
    } finally {
      setSavingUpi(false)
    }
  }

  const handleCollectUpi = async (due) => {
    if (!savedUpiId) { addToast('Add and save your UPI ID above first', 'error'); return }
    try {
      const result = await UpiPayment.pay({
        vpa: savedUpiId,
        payeeName: user?.name || groundName || 'CricYaar Ground',
        amount: String(due.amount),
        note: `Ground booking - ${due.renter}`,
      })
      if (result.status === 'SUCCESS') addToast('UPI app confirmed the payment went through', 'success')
      else if (result.status === 'FAILURE') addToast('UPI app reported the payment failed', 'error')
      // SUBMITTED/CANCELLED/UNKNOWN: no confirmed status either way — this
      // is the manual dues list, so there's no booking row to mark paid
      // automatically the way there is for real in-app bookings.
    } catch (err) {
      addToast(err.message || 'Could not open a UPI app', 'error')
    }
  }

  // Lets a ground owner verify their own UPI ID actually works end-to-end —
  // sends ₹1 to themselves via the same native plugin used for real
  // payments, so a SUCCESS here means the detection path genuinely works on
  // this device, not just that the link was well-formed.
  const handleTestPayment = async () => {
    if (!savedUpiId) { addToast('Save your UPI ID first', 'error'); return }
    setTestingUpi(true)
    try {
      const result = await UpiPayment.pay({
        vpa: savedUpiId,
        payeeName: user?.name || 'CricYaar Test',
        amount: '1',
        note: 'CricYaar UPI test payment',
      })
      if (result.status === 'SUCCESS') addToast('✅ Test payment confirmed — detection is working!', 'success')
      else if (result.status === 'FAILURE') addToast('UPI app reported the test payment failed', 'error')
      else if (result.status === 'CANCELLED') addToast('Test payment cancelled', 'info')
      else addToast(`No confirmed status from the UPI app (${result.status}). It may still have gone through — check your UPI app.`, 'info')
    } catch (err) {
      addToast(err.message || 'Could not open a UPI app', 'error')
    } finally {
      setTestingUpi(false)
    }
  }

  const handleRemind = (due) => {
    const upiLine = savedUpiId
      ? `\n\nPay directly via UPI: ${buildUpiLink({ payeeVpa: savedUpiId, payeeName: user?.name || groundName || 'CricYaar Ground', amount: due.amount, note: `Ground booking - ${due.renter}` })}`
      : ''
    const message = `Hi ${due.renter}, this is a reminder that ₹${due.amount.toLocaleString('en-IN')} is pending for your ground booking (${due.slot}).${upiLine}\n\n— CricYaar`
    const waNumber = due.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setDues(d => d.map(x => x.id === due.id ? { ...x, remindersSent: x.remindersSent + 1 } : x))
    addToast('Reminder message opened in WhatsApp', 'success')
  }

  const handleCall = (due) => {
    window.location.href = `tel:${due.phone}`
  }

  const totalDue = dues.reduce((sum, d) => sum + d.amount, 0)

  return (
    <SectionCard title="Payment Collection" icon={<Bell size={15} className="text-red-500" />} badge={dues.length > 0 ? `₹${totalDue.toLocaleString('en-IN')} due` : null} badgeColor="amber">
      {/* UPI ID setup — collection happens over UPI, not bank transfer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
        <label className="text-xs font-semibold text-navy-700 mb-1.5 block">Your UPI ID (for collecting payments)</label>
        <div className="flex gap-2">
          <input
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            placeholder="e.g. yourname@okhdfcbank"
            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy-900 bg-[var(--cy-surface)] focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            onClick={handleSaveUpi}
            disabled={savingUpi}
            className="flex-shrink-0 px-3 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold disabled:opacity-60"
          >
            {savingUpi ? 'Saving…' : 'Save'}
          </button>
        </div>
        {savedUpiId && (
          <>
            <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1"><Check size={11} />Collecting to {savedUpiId}</p>
            <button
              onClick={handleTestPayment}
              disabled={testingUpi}
              className="mt-2 w-full py-2 rounded-lg border border-slate-300 text-navy-700 text-xs font-semibold disabled:opacity-60"
            >
              {testingUpi ? 'Opening UPI app…' : 'Send ₹1 test payment to myself'}
            </button>
            <p className="text-navy-400 text-[10px] mt-1 leading-relaxed">
              Verifies this device can detect a real payment — opens your UPI app for ₹1 to your own ID above. Only works on a real phone with a UPI app installed, not on this preview.
            </p>
          </>
        )}
      </div>

      {/* Manually-tracked dues — for bookings arranged outside the app
          (cash/WhatsApp bookings, older bookings, etc). Real in-app bookings
          appear above in "Bookings to Confirm" instead, the moment the
          renter claims payment. */}
      {dues.length === 0 ? (
        <p className="text-navy-400 text-sm text-center py-4">All payments collected. Nothing pending 🎉</p>
      ) : (
        <div className="space-y-3">
          {dues.map(due => (
            <div key={due.id} className="border border-slate-100 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <p className="font-bold text-navy-900 text-sm truncate">{due.renter}</p>
                  <p className="text-navy-400 text-xs mt-0.5">{due.slot}</p>
                </div>
                <p className="font-extrabold text-red-600 text-sm flex-shrink-0">₹{due.amount.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => handleCollectUpi(due)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-xs font-bold mb-2 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
              >
                <IndianRupee size={13} />
                Collect ₹{due.amount.toLocaleString('en-IN')} via UPI
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRemind(due)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                >
                  <MessageCircle size={13} />
                  {due.remindersSent > 0 ? `Remind again (${due.remindersSent} sent)` : 'Send Reminder'}
                </button>
                <button
                  onClick={() => handleCall(due)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <Phone size={13} />
                  Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

// ── Verified dashboard ──────────────────────────────────────────────────────
function VerifiedDashboard({ user, setUser, addToast }) {
  const navigate = useNavigate()
  const { hash } = useLocation()

  // Deep-link support — EarningsDashboard's "Payout Settings" button links
  // here as /ground-owner#bank-details.
  useEffect(() => {
    if (hash !== '#bank-details') return
    const el = document.getElementById('bank-details')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  // Ground Info
  const [groundName, setGroundName] = useState('My Cricket Ground')
  const [address, setAddress]       = useState('Andheri West, Mumbai, Maharashtra')
  const [savingInfo, setSavingInfo] = useState(false)

  // Photos
  const [photos, setPhotos] = useState([])

  // Pricing
  const [hourlyRate, setHourlyRate]     = useState('500')
  const [dailyRate, setDailyRate]       = useState('3500')
  const [savingPricing, setSavingPricing] = useState(false)

  // Bank details
  const [bankHolder, setBankHolder]   = useState(user?.name || '')
  const [accountNo, setAccountNo]     = useState('')
  const [ifsc, setIfsc]               = useState('')
  const [bankName, setBankName]       = useState('')
  const [showAccNo, setShowAccNo]     = useState(false)
  const [savingBank, setSavingBank]   = useState(false)

  const handleSaveInfo = async () => {
    setSavingInfo(true)
    await new Promise(r => setTimeout(r, 800))
    setSavingInfo(false)
    addToast('Ground info updated!', 'success')
  }

  const handleAddPhoto = () => {
    if (photos.length >= 6) { addToast('Max 6 photos allowed', 'error'); return }
    setPhotos(p => [...p, { id: Date.now() }])
    addToast('Photo added (demo mode)', 'info')
  }

  const handleSavePricing = async () => {
    if (!hourlyRate && !dailyRate) { addToast('Enter at least one rate', 'error'); return }
    setSavingPricing(true)
    await new Promise(r => setTimeout(r, 800))
    setSavingPricing(false)
    addToast('Pricing updated!', 'success')
  }

  const handleSaveBank = async () => {
    if (!bankHolder || !accountNo || !ifsc || !bankName) {
      addToast('Please fill all bank details', 'error'); return
    }
    setSavingBank(true)
    await new Promise(r => setTimeout(r, 1000))
    setSavingBank(false)
    addToast('Bank details saved securely 🔒', 'success')
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">

      {/* Verified owner header card */}
      <div className="bg-gradient-to-r from-cyan-700 to-cyan-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Shield size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-extrabold text-white text-base truncate">{groundName}</p>
            <span className="flex-shrink-0 bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Verified Owner</span>
          </div>
          <p className="text-cyan-100 text-xs mt-0.5 truncate">{address}</p>
        </div>
        <span className="flex-shrink-0 bg-green-400/30 text-green-100 text-[10px] font-bold px-2 py-1 rounded-full border border-green-300/40">Live</span>
      </div>

      {/* ── 1. Ground Details ─────────────────────────────────────────────── */}
      <SectionCard title="Ground Details" icon={<MapPin size={15} className="text-cyan-600" />}>
        <div className="space-y-3">
          <Field label="Ground Name" value={groundName} onChange={setGroundName} placeholder="e.g. Andheri Sports Arena" />
          <Field label="Full Address" value={address} onChange={setAddress} placeholder="Area, City, State" />

          {/* Mock map pin */}
          <div>
            <label className="text-xs font-semibold text-navy-700 mb-1.5 block">Exact Location</label>
            <button
              onClick={() => addToast('Google Maps picker would open here', 'info')}
              className="w-full h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50 transition-colors flex flex-col items-center justify-center gap-1.5"
            >
              <MapPin size={22} className="text-cyan-500" />
              <p className="text-navy-600 text-xs font-semibold">Tap to pin location on map</p>
              <p className="text-navy-400 text-[10px]">Google Maps · GPS auto-detect</p>
            </button>
          </div>

          <SaveBtn onClick={handleSaveInfo} loading={savingInfo} label="Save Ground Details" icon={<Check size={14} />} />
        </div>
      </SectionCard>

      {/* ── 2. Ground Photos ──────────────────────────────────────────────── */}
      <SectionCard title="Ground Photos" icon={<Camera size={15} className="text-purple-600" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {photos.map(ph => (
              <div key={ph.id} className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl relative border border-slate-200 flex items-center justify-center">
                <Camera size={20} className="text-slate-400" />
                <button
                  onClick={() => setPhotos(p => p.filter(x => x.id !== ph.id))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <X size={10} className="text-white" strokeWidth={3} />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                onClick={handleAddPhoto}
                className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Upload size={18} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">Add Photo</span>
              </button>
            )}
          </div>
          <p className="text-navy-400 text-xs leading-relaxed">
            Upload up to <strong>6 photos</strong> — pitch, gallery, floodlights. Clear photos attract more bookings.
          </p>
        </div>
      </SectionCard>

      {/* ── 3. Pricing ────────────────────────────────────────────────────── */}
      <SectionCard title="Pricing" icon={<IndianRupee size={15} className="text-green-600" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-navy-700 mb-1.5 block flex items-center gap-1">
                Per Hour
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  placeholder="500"
                  min="0"
                  className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-3 text-sm font-bold text-navy-900 bg-slate-50 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-700 mb-1.5 block">Per Day</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={e => setDailyRate(e.target.value)}
                  placeholder="3500"
                  min="0"
                  className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-3 text-sm font-bold text-navy-900 bg-slate-50 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>
          <SaveBtn onClick={handleSavePricing} loading={savingPricing} label="Save Pricing" color="#16a34a" icon={<Check size={14} />} />
        </div>
      </SectionCard>

      {/* ── 4. Payment Collection ─────────────────────────────────────────── */}
      <BookingsToConfirm user={user} addToast={addToast} />
      <PaymentCollection user={user} setUser={setUser} addToast={addToast} groundName={groundName} />

      {/* ── 5. Bank Account Details ───────────────────────────────────────── */}
      <div id="bank-details" />
      <SectionCard title="Bank Account Details" icon={<Banknote size={15} className="text-blue-600" />} badge="Secured">
        <div className="space-y-3">
          {/* Security note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
            <Lock size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 text-xs leading-relaxed">
              Bank details are <strong>end-to-end encrypted</strong> and visible only to you. Payouts processed via <strong>Razorpay Route</strong> — 95% to you, 5% platform fee.
            </p>
          </div>

          <Field label="Account Holder Name" value={bankHolder} onChange={setBankHolder} placeholder="As per bank records" />

          {/* Account number with show/hide */}
          <div>
            <label className="text-xs font-semibold text-navy-700 mb-1.5 block">Account Number</label>
            <div className="relative">
              <input
                type={showAccNo ? 'text' : 'password'}
                value={accountNo}
                onChange={e => setAccountNo(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter account number"
                className="w-full border border-slate-200 rounded-xl px-3 pr-10 py-3 text-sm font-mono text-navy-900 bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowAccNo(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
              >
                {showAccNo ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Field label="IFSC Code" value={ifsc} onChange={v => setIfsc(v.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="e.g. HDFC0001234" mono />
          <Field label="Bank Name" value={bankName} onChange={setBankName} placeholder="e.g. HDFC Bank" />

          <SaveBtn
            onClick={handleSaveBank}
            loading={savingBank}
            label="Save Bank Details Securely"
            color="#1d4ed8"
            icon={<Lock size={14} />}
          />

          <p className="text-navy-400 text-[10px] text-center leading-relaxed">
            Only Ground Owners can view or update bank details. Admins cannot access this information.
          </p>
        </div>
      </SectionCard>

    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function GroundOwnerDashboard() {
  const { user, setUser, addToast } = useStore()

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar title="My Ground" showBack />

      {/* Role gate — not a ground_owner or admin */}
      {user?.role !== 'ground_owner' && user?.role !== 'admin' ? (
        <RoleGuard />
      ) : !user?.groundOwnerVerified ? (
        /* Aadhaar verification gate */
        <VerificationGate />
      ) : (
        /* Full dashboard — only shown after verification */
        <VerifiedDashboard user={user} setUser={setUser} addToast={addToast} />
      )}
    </div>
  )
}
