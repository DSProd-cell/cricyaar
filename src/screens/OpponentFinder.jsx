import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Users, Calendar, MapPin, ChevronRight, CheckCircle, X, MessageSquare } from 'lucide-react'
import { useStore } from '../store/useStore'

const OPEN_CHALLENGES = [
  { id: 'c1', captain: 'Rahul Sharma', team: 'Mumbai Strikers', record: '12W 4L', date: 'Sun, 1 Jun', time: '07:00', area: 'Andheri, Mumbai', overs: 20, ball: 'Leather', players: 11, note: 'Turf confirmed — looking for competitive teams only.', applied: false },
  { id: 'c2', captain: 'Arun Kumar', team: 'Delhi Daredevils XI', record: '8W 6L', date: 'Sat, 7 Jun', time: '06:00', area: 'Rohini, Delhi', overs: 15, ball: 'Tennis', players: 9, note: '', applied: false },
  { id: 'c3', captain: 'Suresh Babu', team: 'Chennai Super Boys', record: '20W 2L', date: 'Sun, 8 Jun', time: '07:30', area: 'Velachery, Chennai', overs: 10, ball: 'Rubber', players: 8, note: 'Morning match. Serious teams only.', applied: false },
  { id: 'c4', captain: 'Vikram Singh', team: 'Pune Warriors', record: '5W 9L', date: 'Mon, 9 Jun', time: '16:00', area: 'Kothrud, Pune', overs: 20, ball: 'Leather', players: 11, note: '', applied: false },
]

const MY_CHALLENGES = [
  { id: 'mc1', date: 'Sat, 31 May', area: 'Koramangala, Bengaluru', overs: 20, ball: 'Leather', players: 11, status: 'active', applications: 3 },
]

export default function OpponentFinder() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()
  const [tab, setTab] = useState('browse')
  const [applied, setApplied] = useState({})
  const [showPostForm, setShowPostForm] = useState(false)
  const [applyMsg, setApplyMsg] = useState({})
  const [showApply, setShowApply] = useState(null)

  const isPro = user?.subscription === 'pro_active'
  const isCapOrOrg = ['captain','organiser','admin'].includes(user?.role)

  const [form, setForm] = useState({
    date: '', time: '', ground: '', overs: '20', ball: 'Leather', players: '11', note: ''
  })

  const handlePost = () => {
    addToast('Challenge posted! Other captains in your city can now apply.')
    setShowPostForm(false)
  }

  const handleApply = (id) => {
    setApplied(a => ({ ...a, [id]: true }))
    setShowApply(null)
    addToast('Application sent! The captain will review your request.')
  }

  return (
    <div className="min-h-dvh bg-navy-50 flex flex-col">
      <div className="bg-white border-b border-navy-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 text-navy-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-navy-900 text-base">Find Opponent</h1>
          {isPro && isCapOrOrg && (
            <button onClick={() => setShowPostForm(true)} className="ml-auto flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
              <Plus size={14} />Post Challenge
            </button>
          )}
        </div>
        <div className="flex px-4 pb-2 gap-1">
          {['browse','mine'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? 'bg-brand-500 text-white' : 'text-navy-600 hover:bg-navy-100'}`}>
              {t === 'browse' ? 'Open Challenges' : 'My Challenges'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
        {tab === 'browse' && (
          <>
            {OPEN_CHALLENGES.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Users size={40} className="text-navy-300" />
                <p className="text-navy-500 font-semibold">No open challenges in your city</p>
                <p className="text-navy-400 text-sm text-center">Post one to get started!</p>
              </div>
            ) : OPEN_CHALLENGES.map(c => (
              <div key={c.id} className="card p-4 animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-navy-900 text-sm">{c.team}</p>
                    <p className="text-navy-500 text-xs">by {c.captain} · {c.record}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">{c.overs}ov</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-navy-600 mb-2">
                  <span className="flex items-center gap-1"><Calendar size={11} />{c.date} · {c.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />{c.area}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{c.players} vs {c.players} · {c.ball} ball</span>
                </div>
                {c.note && <p className="text-xs text-navy-500 italic mb-3">"{c.note}"</p>}
                {applied[c.id] ? (
                  <div className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-green-700 text-sm font-semibold">Application Sent</span>
                  </div>
                ) : (
                  <button onClick={() => isPro && isCapOrOrg ? setShowApply(c.id) : navigate('/pro')}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isPro && isCapOrOrg ? 'bg-brand-500 text-white' : 'bg-navy-100 text-navy-500'}`}>
                    {isPro && isCapOrOrg ? 'Apply to Play' : '🔒 Pro Required to Apply'}
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {tab === 'mine' && (
          <>
            {MY_CHALLENGES.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Plus size={40} className="text-navy-300" />
                <p className="text-navy-500 font-semibold">No challenges posted yet</p>
                <button onClick={() => setShowPostForm(true)} className="btn-primary text-sm px-6">Post Your First Challenge</button>
              </div>
            ) : MY_CHALLENGES.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-navy-900 text-sm">{c.date} · {c.area}</p>
                    <p className="text-navy-500 text-xs">{c.overs} ov · {c.ball} ball · {c.players} vs {c.players}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'}`}>
                    {c.status === 'active' ? 'Active' : 'Expired'}
                  </span>
                </div>
                <button className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-navy-50 border border-navy-200 text-sm">
                  <span className="text-navy-700 font-semibold">Applications ({c.applications})</span>
                  <ChevronRight size={14} className="text-navy-400" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={() => setShowApply(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-900">Apply to Play</h3>
              <button onClick={() => setShowApply(null)} className="w-8 h-8 rounded-xl bg-navy-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <textarea
              value={applyMsg[showApply] || ''}
              onChange={e => setApplyMsg(m => ({ ...m, [showApply]: e.target.value.slice(0,100) }))}
              rows={3} placeholder="Optional message (e.g. We're available. Confirm by evening?)"
              className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm text-navy-900 focus:outline-none focus:border-brand-500 resize-none mb-4"
            />
            <button onClick={() => handleApply(showApply)} className="btn-primary w-full">Send Application</button>
          </div>
        </div>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowPostForm(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-900">Post a Challenge</h3>
              <button onClick={() => setShowPostForm(false)} className="w-8 h-8 rounded-xl bg-navy-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                  className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Start Time *</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))}
                  className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Ground *</label>
                <input type="text" value={form.ground} onChange={e => setForm(f => ({...f, ground: e.target.value}))} placeholder="Search CricYaar grounds or enter free text"
                  className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Ball Type *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Leather','Tennis','Rubber','Other'].map(b => (
                    <button key={b} onClick={() => setForm(f => ({...f, ball: b}))}
                      className={`py-2 rounded-xl text-xs font-semibold border ${form.ball === b ? 'bg-brand-500 border-brand-500 text-white' : 'border-navy-200 text-navy-700'}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Players per Side</label>
                <div className="grid grid-cols-4 gap-2">
                  {['6','8','10','11'].map(p => (
                    <button key={p} onClick={() => setForm(f => ({...f, players: p}))}
                      className={`py-2 rounded-xl text-xs font-semibold border ${form.players === p ? 'bg-brand-500 border-brand-500 text-white' : 'border-navy-200 text-navy-700'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Note <span className="text-navy-400 font-normal">(optional)</span></label>
                <textarea value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value.slice(0,150)}))} rows={2}
                  className="w-full border border-navy-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 resize-none" />
              </div>
              <button onClick={handlePost} className="btn-primary w-full mt-2">Post Challenge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
