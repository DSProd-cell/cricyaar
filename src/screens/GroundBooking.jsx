import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Calendar, Clock, CloudRain, Sun, Cloud, CheckCircle, Copy, MapPin, AlertCircle, Timer } from 'lucide-react'
import { useStore } from '../store/useStore'

const SLOTS = [
  { id: 's1', start: '06:00', end: '08:00', price: 800, available: true },
  { id: 's2', start: '08:00', end: '10:00', price: 800, available: false },
  { id: 's3', start: '10:00', end: '12:00', price: 700, available: true },
  { id: 's4', start: '14:00', end: '16:00', price: 700, available: true },
  { id: 's5', start: '16:00', end: '18:00', price: 900, available: false },
  { id: 's6', start: '18:00', end: '20:00', price: 1100, available: true },
  { id: 's7', start: '20:00', end: '22:00', price: 1200, available: true },
]

const CALENDAR_DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i + 1)
  return { date: d, available: i !== 3 && i !== 7 }
})

function WeatherBanner({ prob }) {
  if (prob < 20) return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
      <Sun size={16} className="text-green-600 flex-shrink-0" />
      <div>
        <p className="text-green-800 font-semibold text-sm">Great conditions forecast</p>
        <p className="text-green-600 text-xs">Rain probability: {prob}%</p>
      </div>
      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Play Safe</span>
    </div>
  )
  if (prob <= 50) return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
      <Cloud size={16} className="text-amber-600 flex-shrink-0" />
      <div>
        <p className="text-amber-800 font-semibold text-sm">Some risk of rain — monitor the forecast</p>
        <p className="text-amber-600 text-xs">Rain probability: {prob}%</p>
      </div>
      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Some Risk</span>
    </div>
  )
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
      <CloudRain size={16} className="text-red-600 flex-shrink-0" />
      <div>
        <p className="text-red-800 font-semibold text-sm">Rain likely — consider a backup plan</p>
        <p className="text-red-600 text-xs">Rain probability: {prob}%</p>
      </div>
      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Rain Likely</span>
    </div>
  )
}

export default function GroundBooking() {
  const navigate = useNavigate()
  const { addGroundBooking, addToast, user } = useStore()
  const [step, setStep] = useState(1)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [ballType, setBallType] = useState('Leather')
  const [players, setPlayers] = useState('11')
  const [overs, setOvers] = useState('20')
  const [note, setNote] = useState('')
  const [payMethod, setPayMethod] = useState('razorpay')
  const [paying, setPaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(598)
  const [bookingRef] = useState('CY-' + Math.random().toString(36).substring(2,10).toUpperCase())
  const groundName = 'Bengaluru Turf Ground'
  const groundCode = 'GND-CY-48X9'
  const rainProb = 15

  const fmt = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  const handlePayment = async () => {
    setPaying(true)
    await new Promise(r => setTimeout(r, 1800))
    addGroundBooking({
      groundName, slot: selectedSlot, day: selectedDay?.date?.toDateString(),
      ballType, players, overs, note, bookingRef, status: 'confirmed'
    })
    setStep(4)
    setPaying(false)
  }

  const isPro = user?.subscription === 'pro_active'

  if (!isPro) return (
    <div className="min-h-dvh bg-navy-50 flex flex-col items-center justify-center p-6 gap-4">
      <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
        <AlertCircle size={24} className="text-amber-500" />
      </div>
      <h2 className="text-navy-900 font-extrabold text-xl text-center">Pro Required</h2>
      <p className="text-navy-500 text-sm text-center">Ground booking is a Pro feature. Upgrade to book grounds with in-app payment.</p>
      <button onClick={() => navigate('/pro')} className="btn-primary w-full max-w-xs">Upgrade to Pro</button>
      <button onClick={() => navigate(-1)} className="text-navy-500 text-sm">Go back</button>
    </div>
  )

  return (
    <div className="min-h-dvh bg-navy-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-navy-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => step > 1 && step < 4 ? setStep(s => s-1) : navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 text-navy-700">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-navy-900 text-base">
              {step === 4 ? 'Booking Confirmed' : 'Book Ground'}
            </h1>
            <p className="text-navy-500 text-xs">{groundName}</p>
          </div>
          {step < 4 && (
            <div className="ml-auto flex gap-1.5">
              {[1,2,3].map(s => (
                <div key={s} className={`h-1.5 w-6 rounded-full transition-colors ${step >= s ? 'bg-brand-500' : 'bg-navy-200'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">

        {/* Step 1 — Slot Selection */}
        {step === 1 && (
          <div className="p-4 space-y-4 animate-fade-in">
            <div className="card p-4">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><Calendar size={16} className="text-brand-500" />Select Date</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CALENDAR_DAYS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => d.available && setSelectedDay(d)}
                    disabled={!d.available}
                    className={`flex-shrink-0 flex flex-col items-center w-14 py-2 rounded-xl border transition-all ${
                      selectedDay === d ? 'bg-brand-500 border-brand-500 text-white' :
                      d.available ? 'bg-white border-navy-200 text-navy-700 hover:border-brand-400' :
                      'bg-navy-100 border-navy-200 text-navy-400 opacity-50'
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase">{d.date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    <span className="text-lg font-black leading-tight">{d.date.getDate()}</span>
                    <span className="text-[10px]">{d.date.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    {!d.available && <span className="text-[9px] mt-0.5">Full</span>}
                  </button>
                ))}
              </div>
            </div>

            {selectedDay && (
              <div className="card p-4 animate-fade-in">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><Clock size={16} className="text-brand-500" />Available Slots — {fmt(selectedDay.date)}</h3>
                <div className="space-y-2">
                  {SLOTS.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      disabled={!slot.available}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedSlot === slot ? 'bg-brand-50 border-brand-500' :
                        slot.available ? 'bg-white border-navy-200 hover:border-brand-300' :
                        'bg-navy-100 border-navy-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={14} className={selectedSlot === slot ? 'text-brand-500' : 'text-navy-400'} />
                        <span className={`font-semibold text-sm ${!slot.available ? 'text-navy-400' : 'text-navy-900'}`}>
                          {slot.start} – {slot.end}
                        </span>
                        {!slot.available && <span className="text-xs text-navy-400">Booked</span>}
                      </div>
                      <span className={`font-bold text-sm ${selectedSlot === slot ? 'text-brand-600' : 'text-navy-700'}`}>
                        ₹{slot.price.toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Booking Details */}
        {step === 2 && (
          <div className="p-4 space-y-4 animate-fade-in">
            <div className="card p-4 space-y-3">
              <h3 className="font-bold text-navy-900 mb-1">Booking Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-navy-50 rounded-xl p-3">
                  <p className="text-navy-400 text-xs mb-0.5">Ground</p>
                  <p className="font-semibold text-navy-900 text-xs">{groundName}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-3">
                  <p className="text-navy-400 text-xs mb-0.5">Date</p>
                  <p className="font-semibold text-navy-900 text-xs">{selectedDay && fmt(selectedDay.date)}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-3">
                  <p className="text-navy-400 text-xs mb-0.5">Time</p>
                  <p className="font-semibold text-navy-900 text-xs">{selectedSlot?.start} – {selectedSlot?.end}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-3">
                  <p className="text-navy-400 text-xs mb-0.5">Total Cost</p>
                  <p className="font-black text-brand-600 text-base">₹{selectedSlot?.price?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Ball Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Leather','Tennis','Rubber','Other'].map(b => (
                    <button key={b} onClick={() => setBallType(b)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${ballType === b ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-navy-200 text-navy-700'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Players per Side</label>
                <div className="grid grid-cols-4 gap-2">
                  {['6','8','10','11'].map(p => (
                    <button key={p} onClick={() => setPlayers(p)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${players === p ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-navy-200 text-navy-700'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Overs per Innings</label>
                <input type="number" value={overs} onChange={e => setOvers(e.target.value)} min="1" max="50"
                  className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-900 focus:outline-none focus:border-brand-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Note to Ground Owner <span className="text-navy-400 font-normal">(optional)</span></label>
                <textarea value={note} onChange={e => setNote(e.target.value.slice(0,150))} rows={2} placeholder="e.g. Turf confirmed, looking for serious teams"
                  className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm text-navy-900 focus:outline-none focus:border-brand-500 resize-none" />
                <p className="text-right text-xs text-navy-400 mt-0.5">{note.length}/150</p>
              </div>
            </div>

            <WeatherBanner prob={rainProb} />

            <div className="card p-4">
              <h4 className="font-semibold text-navy-900 text-sm mb-2">Cancellation Policy</h4>
              <div className="space-y-1.5 text-xs text-navy-600">
                <div className="flex justify-between"><span>Cancel 48+ hours before</span><span className="font-semibold text-green-600">100% refund</span></div>
                <div className="flex justify-between"><span>Cancel 24–47 hours before</span><span className="font-semibold text-amber-600">50% refund</span></div>
                <div className="flex justify-between"><span>Cancel less than 24 hours</span><span className="font-semibold text-red-600">No refund</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <div className="p-4 space-y-4 animate-fade-in">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-navy-900">Payment</h3>
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                  <Timer size={12} />
                  <span>Slot held: 9:58</span>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-navy-600"><span>Ground rent</span><span>₹{selectedSlot?.price?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-navy-600"><span>Platform fee (5%)</span><span>₹{Math.round(selectedSlot?.price * 0.05)}</span></div>
                <div className="border-t border-navy-200 pt-2 flex justify-between font-black text-navy-900 text-base">
                  <span>Total</span><span>₹{((selectedSlot?.price || 0) + Math.round((selectedSlot?.price || 0) * 0.05)).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="space-y-2">
                {['razorpay','upi'].map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${payMethod === m ? 'border-brand-500 bg-brand-50' : 'border-navy-200 bg-white'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${payMethod === m ? 'border-brand-500' : 'border-navy-300'}`}>
                      {payMethod === m && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                    </div>
                    <span className="font-semibold text-sm text-navy-900">
                      {m === 'razorpay' ? 'Pay with Razorpay' : 'Pay with UPI'}
                    </span>
                    <span className="ml-auto text-xs text-navy-400">{m === 'razorpay' ? 'Card / Net Banking / Wallet' : 'GPay / PhonePe / Paytm'}</span>
                  </button>
                ))}
              </div>
            </div>
            <WeatherBanner prob={rainProb} />
            <div className="card p-4 text-xs text-navy-500 leading-relaxed">
              By paying, you agree to CricYaar's cancellation policy. Razorpay Route: 95% of the amount goes directly to the ground owner's bank account.
            </div>
          </div>
        )}

        {/* Step 4 — Confirmed */}
        {step === 4 && (
          <div className="p-4 space-y-4 animate-fade-in">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600 fill-green-100" />
              </div>
              <h2 className="text-xl font-extrabold text-navy-900 mb-1">Booking Confirmed!</h2>
              <p className="text-navy-500 text-sm mb-4">WhatsApp confirmation sent to your phone</p>
              <div className="bg-navy-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-navy-400 mb-1">Booking Reference</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-black text-navy-900 text-lg tracking-wider">{bookingRef}</span>
                  <button onClick={() => { navigator.clipboard?.writeText(bookingRef); addToast('Copied!') }}
                    className="w-8 h-8 rounded-lg bg-white border border-navy-200 flex items-center justify-center">
                    <Copy size={14} className="text-navy-500" />
                  </button>
                </div>
              </div>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-brand-700 font-semibold mb-0.5">Show on Arrival</p>
                <p className="font-black text-brand-800 text-xl tracking-widest">{groundCode}</p>
                <p className="text-xs text-brand-600 mt-1">Show this code to the ground owner to check in</p>
              </div>
              <div className="text-left space-y-2 text-sm text-navy-700 border-t border-navy-200 pt-4">
                <div className="flex justify-between"><span className="text-navy-500">Ground</span><span className="font-semibold">{groundName}</span></div>
                <div className="flex justify-between"><span className="text-navy-500">Date</span><span className="font-semibold">{selectedDay && fmt(selectedDay.date)}</span></div>
                <div className="flex justify-between"><span className="text-navy-500">Time</span><span className="font-semibold">{selectedSlot?.start} – {selectedSlot?.end}</span></div>
                <div className="flex justify-between"><span className="text-navy-500">Amount Paid</span><span className="font-black text-green-600">₹{((selectedSlot?.price || 0) + Math.round((selectedSlot?.price || 0) * 0.05)).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
            <WeatherBanner prob={rainProb} />
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-navy-200 text-navy-700 font-semibold text-sm bg-white">
                <Calendar size={16} />Add to Calendar
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm">
                Share with Team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {step < 4 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-navy-200 p-4 z-20">
          <button
            onClick={() => {
              if (step === 1) { if (selectedDay && selectedSlot) setStep(2) }
              else if (step === 2) setStep(3)
              else if (step === 3) handlePayment()
            }}
            disabled={
              (step === 1 && (!selectedDay || !selectedSlot)) ||
              paying
            }
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {paying ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing Payment…</>
            ) : step === 3 ? `Pay ₹${((selectedSlot?.price || 0) + Math.round((selectedSlot?.price || 0) * 0.05)).toLocaleString('en-IN')} via ${payMethod === 'razorpay' ? 'Razorpay' : 'UPI'}` :
            step === 1 ? 'Continue to Details' : 'Proceed to Payment'}
          </button>
        </div>
      )}
      {step === 4 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-navy-200 p-4 z-20">
          <button onClick={() => navigate('/')} className="btn-primary w-full">Back to Home</button>
        </div>
      )}
    </div>
  )
}
