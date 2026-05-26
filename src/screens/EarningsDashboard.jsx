import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, TrendingUp, TrendingDown, IndianRupee, Clock, CheckCircle, XCircle, BarChart3, Settings } from 'lucide-react'

const MONTHS = ['Dec','Jan','Feb','Mar','Apr','May']
const OCCUPANCY = [42, 58, 71, 65, 83, 76]
const BOOKINGS = [
  { date: 'Sun, 25 May', time: '07:00–09:00', team: "Rahul's XI", duration: '2h', amount: 1600, status: 'completed' },
  { date: 'Sat, 24 May', time: '16:00–18:00', team: "Mumbai Warriors", duration: '2h', amount: 1800, status: 'completed' },
  { date: 'Sun, 1 Jun', time: '07:00–09:00', team: "Delhi Daredevils", duration: '2h', amount: 1600, status: 'upcoming' },
  { date: 'Sat, 17 May', time: '10:00–12:00', team: "Bangalore Boys", duration: '2h', amount: 1400, status: 'cancelled' },
  { date: 'Sun, 11 May', time: '18:00–20:00', team: "Kings XI Punjab", duration: '2h', amount: 2200, status: 'completed' },
  { date: 'Sat, 10 May', time: '06:00–08:00', team: "Chennai Super", duration: '2h', amount: 1600, status: 'pending_payout' },
]

const statusCfg = {
  completed:     { label: 'Completed',      bg: 'bg-green-100',  text: 'text-green-700' },
  upcoming:      { label: 'Upcoming',       bg: 'bg-blue-100',   text: 'text-blue-700' },
  cancelled:     { label: 'Cancelled',      bg: 'bg-red-100',    text: 'text-red-700' },
  pending_payout:{ label: 'Pending Payout', bg: 'bg-amber-100',  text: 'text-amber-700' },
}

export default function EarningsDashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter)
  const maxOcc = Math.max(...OCCUPANCY)

  return (
    <div className="min-h-dvh bg-navy-50 flex flex-col">
      <div className="bg-white border-b border-navy-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 text-navy-700">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-navy-900 text-base">Earnings Dashboard</h1>
            <p className="text-navy-500 text-xs">Bengaluru Turf Ground</p>
          </div>
          <button className="ml-auto w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 text-navy-700">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Today's Earnings", value: '₹1,600', sub: '1 booking', icon: IndianRupee, color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: 'This Month', value: '₹7,200', sub: '+18% vs last month', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'All Time', value: '₹42,800', sub: '27 bookings', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Pending Payout', value: '₹1,520', sub: 'Transfer in 24h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((m, i) => (
            <div key={i} className="card p-4">
              <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center mb-2`}>
                <m.icon size={18} className={m.color} />
              </div>
              <p className="text-xs text-navy-500 mb-0.5">{m.label}</p>
              <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-xs text-navy-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Occupancy chart */}
        <div className="card p-4">
          <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-500" />Slot Occupancy — Last 6 Months
          </h3>
          <div className="flex items-end gap-2 h-28">
            {MONTHS.map((m, i) => {
              const pct = OCCUPANCY[i]
              const barH = Math.round((pct / 100) * 100)
              const color = pct > 60 ? 'bg-brand-500' : pct >= 30 ? 'bg-amber-400' : 'bg-navy-300'
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-navy-600">{pct}%</span>
                  <div className="w-full rounded-t-lg" style={{ height: barH, background: '' }}>
                    <div className={`w-full rounded-t-lg ${color} transition-all`} style={{ height: `${barH}%`, minHeight: 4 }} />
                  </div>
                  <span className="text-[10px] text-navy-400">{m}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-navy-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500" />{'> 60% good'}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400" />30–60%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-navy-300" />{'< 30%'}</span>
          </div>
        </div>

        {/* Booking history */}
        <div className="card p-4">
          <h3 className="font-bold text-navy-900 mb-3">Booking History</h3>
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
            {[['all','All'],['completed','Completed'],['upcoming','Upcoming'],['cancelled','Cancelled'],['pending_payout','Pending']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === v ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-navy-200 text-navy-600'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="divide-y divide-navy-100">
            {filtered.map((b, i) => {
              const s = statusCfg[b.status]
              return (
                <div key={i} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">{b.team}</p>
                    <p className="text-xs text-navy-400">{b.date} · {b.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-navy-900 text-sm">₹{b.amount.toLocaleString('en-IN')}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${s.bg} ${s.text}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-navy-400 text-sm">No bookings with this status</div>
            )}
          </div>
        </div>

        <button className="btn-primary w-full flex items-center justify-center gap-2">
          <Settings size={16} />Payout Settings
        </button>
      </div>
    </div>
  )
}
