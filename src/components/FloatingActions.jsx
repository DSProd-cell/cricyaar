import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import {
  Sparkles, Plus, X, LogOut, RefreshCw, Headphones, User,
  Send, Bot, Check, Ticket, Phone, MessageSquare, Loader
} from 'lucide-react'

const SKIP_PATHS = ['/welcome', '/login', '/otp', '/usp']

// ─── Quick-action items (+ menu) ─────────────────────────────────────────────
const FAB_ITEMS = [
  { icon: User,       label: 'My Profile',  color: '#22c55e', bg: '#dcfce7', key: 'profile' },
  { icon: RefreshCw,  label: 'Change Role', color: '#6366f1', bg: '#eef2ff', key: 'role' },
  { icon: Headphones, label: 'Quick Support', color: '#f59e0b', bg: '#fef3c7', key: 'support' },
  { icon: LogOut,     label: 'Log Out',     color: '#ef4444', bg: '#fee2e2', key: 'logout' },
]

// ─── AI intents ───────────────────────────────────────────────────────────────
const INTENTS = [
  { match:['change role','switch role','different role','new role','become player','become organiser','become umpire','become fan','become ground'],
    answer:"To **change your role**, follow these steps:\n\n1️⃣ Tap **Settings** (gear icon)\n2️⃣ Scroll to **Role** section\n3️⃣ Tap **Change Role** → pick your new role\n4️⃣ Confirm — no OTP needed!\n\nYour data stays safe.",
    actions:[{label:'Open Settings',path:'/settings'}] },
  { match:['pro','upgrade','premium','subscription','paid plan','unlock','become pro','how to pay','how to subscribe'],
    answer:"To **upgrade to Pro** (₹99/month):\n\n1️⃣ Tap **Upgrade to Pro** below\n2️⃣ Pay via UPI, Card, or Net Banking\n3️⃣ Pro activates instantly!\n\n✅ Unlocks: Live scoring, squad management, tournaments, ground booking & more.",
    actions:[{label:'Upgrade to Pro — ₹99/mo',path:'/pro-payment'}] },
  { match:['create team','new team','make a team','start a team'],
    answer:"To **create a team** (Pro feature):\n\n1️⃣ Go to **Teams** in bottom nav\n2️⃣ Tap **Create Team**\n3️⃣ Add name, city & colour\n4️⃣ Add players to your squad\n\nNeeds **Pro subscription**.",
    actions:[{label:'Go to Teams',path:'/teams'},{label:'Upgrade to Pro',path:'/pro-payment'}] },
  { match:['join team','team code','find a team','request to join'],
    answer:"To **join a team**:\n\n**Option A — Team Code:**\n1️⃣ Teams → **Join with code**\n2️⃣ Enter the 7-char code from your captain\n\n**Option B — Browse open teams:**\n1️⃣ Teams → **Find a Team**\n2️⃣ Filter by city & position\n3️⃣ Tap **Request to Join**\n\nNeeds **Pro**.",
    actions:[{label:'Go to Teams',path:'/teams'}] },
  { match:['join tournament','find tournament','open tournament','tournament list'],
    answer:"To **join an open tournament**:\n\n1️⃣ Tap **Open Tournaments** (Teams nav)\n2️⃣ Browse by city\n3️⃣ Tap **Register Team** or **Join as Free Agent**\n4️⃣ Wait for organiser approval\n\nNeeds **Pro**.",
    actions:[{label:'Open Tournaments',path:'/open-tournaments'}] },
  { match:['score match','live scoring','score ball','scoring','start scoring'],
    answer:"To **score a match live**:\n\n1️⃣ Go to **My Cricket** (bottom nav)\n2️⃣ Open or create a match\n3️⃣ Tap **Start Scoring** — enter each ball\n4️⃣ Scorecard updates live!\n\n**Pro** feature.",
    actions:[{label:'My Cricket',path:'/my-cricket'}] },
  { match:['watch live','live score','live match','see score'],
    answer:"To **watch live scores**:\n\n1️⃣ Tap **My Cricket** in bottom nav\n2️⃣ Live matches show in real time\n3️⃣ Tap to open full scorecard\n\n**Free** for all users! 🏏",
    actions:[{label:'My Cricket',path:'/my-cricket'}] },
  { match:['book ground','ground booking','slot booking','book a ground'],
    answer:"To **book a cricket ground**:\n\n1️⃣ Tap **Find Grounds**\n2️⃣ Pick a ground → **Book via App**\n3️⃣ Select date & time slot\n4️⃣ Pay securely via Razorpay ✅\n\n**Pro** feature.",
    actions:[{label:'Find Grounds',path:'/grounds'}] },
  { match:['find ground','search ground','cricket ground'],
    answer:"To **find a cricket ground**:\n\n1️⃣ Tap **Search** in bottom nav\n2️⃣ Browse by city, pitch type & facilities\n3️⃣ Tap any ground to see details & pricing\n4️⃣ Book directly from the app!",
    actions:[{label:'Find Grounds',path:'/grounds'}] },
  { match:['stats','my stats','batting stats','bowling stats','career'],
    answer:"To **view your cricket stats**:\n\n1️⃣ Tap **Profile** (person icon)\n2️⃣ Browse: Overview, Batting, Bowling, Fielding\n3️⃣ See recent innings chart & career averages\n\nPro users get deeper career history.",
    actions:[{label:'My Profile',path:'/profile'}] },
  { match:['support','help','contact','problem','issue','complaint','not working','bug','error'],
    answer:"I'm sorry you're having trouble! Let me raise a support ticket for you. Please fill in your details below 👇",
    actions:[], showSupportForm:true },
  { match:['what can i do','features','what is cricyaar','how does it work','get started'],
    answer:"Welcome to **CricYaar** 🏏\n\n🆓 **Free:** Live scores, browse grounds & teams\n\n👑 **Pro (₹99/mo):**\n• Live match scoring\n• Create & manage teams\n• Join & run tournaments\n• Book grounds\n• Import CricHeroes stats\n\nWhat would you like to do?",
    actions:[{label:'Upgrade to Pro',path:'/pro-payment'},{label:'Browse Grounds',path:'/grounds'}] },
]

function getResponse(query) {
  const q = query.toLowerCase().trim()
  for (const intent of INTENTS) {
    if (intent.match.some(kw => q.includes(kw))) {
      return { answer: intent.answer, actions: intent.actions || [], showSupportForm: intent.showSupportForm || false }
    }
  }
  return {
    answer: "I'm not sure about that yet! 🤔 Try asking:\n• **How to change my role?**\n• **How to upgrade to Pro?**\n• **How to create a team?**\n• **How to book a ground?**\n\nOr raise a **support ticket** if something's broken.",
    actions: [{ label: 'Contact Support', triggerSupport: true }],
    showSupportForm: false,
  }
}

function RichText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <span className="leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold">{part}</strong>
          : part.split('\n').map((line, j, arr) => (
              <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
            ))
      )}
    </span>
  )
}

function SupportForm({ onSubmit, submitted, ticketId }) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [query, setQuery] = useState('')

  if (submitted) return (
    <div className="mt-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
        <Check size={16} className="text-green-600" strokeWidth={2.5} />
      </div>
      <div>
        <p className="font-bold text-green-800 text-sm">Ticket Created!</p>
        <p className="text-green-700 text-xs font-mono font-bold mt-0.5">#{ticketId}</p>
        <p className="text-green-700 text-xs mt-1 leading-relaxed">Our team will reach back within <strong>48 hours</strong>.</p>
      </div>
    </div>
  )

  const canSubmit = name.trim() && phone.trim().length >= 10 && query.trim()

  return (
    <div className="mt-2 rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
      <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
        <p className="text-indigo-700 font-bold text-xs uppercase tracking-wider">Support Ticket</p>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name *"
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 placeholder-slate-400 text-navy-900" />
        <input type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit mobile *"
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 placeholder-slate-400 text-navy-900" />
        <textarea rows={3} value={query} onChange={e => setQuery(e.target.value.slice(0,300))} placeholder="Describe your issue *"
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 placeholder-slate-400 text-navy-900 resize-none" />
        <button onClick={() => canSubmit && onSubmit({name,phone,query})} disabled={!canSubmit}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40"
          style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)'}}>
          Create Support Ticket
        </button>
      </div>
    </div>
  )
}

// ─── Main FloatingActions ─────────────────────────────────────────────────────
export default function FloatingActions() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user, setUser, addToast } = useStore()

  // ── UI states ──
  const [fabOpen,  setFabOpen]  = useState(false)  // + quick actions
  const [aiOpen,   setAiOpen]   = useState(false)   // AI chat sheet
  const [confirmLogout, setConfirmLogout] = useState(false)

  // ── AI chat states ──
  const [input,    setInput]    = useState('')
  const [typing,   setTyping]   = useState(false)
  const [ticketId, setTicketId] = useState(null)
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [supportMsgIdx, setSupportMsgIdx] = useState(null)
  const [messages, setMessages] = useState([{
    from: 'bot',
    text: `Hi! 👋 I'm your **CricYaar Guide**. I can help you navigate the app, answer questions, and raise support tickets.\n\nTap a suggestion below or type your question!`,
    actions: [],
  }])
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // ── Drag state ──
  const getDefault = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth  : 375
    const h = typeof window !== 'undefined' ? window.innerHeight : 667
    return { x: w - 68, y: h - 200 }
  }
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('cy_fab_pos')
      if (saved) return JSON.parse(saved)
    } catch {}
    return getDefault()
  })
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 })

  const onPointerDown = useCallback((e) => {
    // Only drag on the container itself (not child buttons)
    drag.current = { active: true, moved: false, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [pos])

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      drag.current.moved = true
      const btnW = 52, btnH = 116  // approx container size
      const newX = Math.max(8, Math.min((window.innerWidth  - btnW - 8), drag.current.origX + dx))
      const newY = Math.max(8, Math.min((window.innerHeight - btnH - 8), drag.current.origY + dy))
      setPos({ x: newX, y: newY })
    }
  }, [])

  const onPointerUp = useCallback(() => {
    drag.current.active = false
    if (drag.current.moved) {
      try { localStorage.setItem('cy_fab_pos', JSON.stringify(pos)) } catch {}
    }
  }, [pos])

  // ── AI helpers ──
  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  useEffect(() => {
    if (aiOpen) {
      setTimeout(() => inputRef.current?.focus(), 350)
      scrollToBottom()
    }
  }, [aiOpen])

  useEffect(() => { scrollToBottom() }, [messages, typing])

  if (!user) return null
  if (SKIP_PATHS.some(p => pathname === p)) return null

  const sendMessage = (text) => {
    const query = (text || input).trim()
    if (!query) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text: query }])
    setTyping(true)
    setTimeout(() => {
      const res = getResponse(query)
      const newMsg = { from: 'bot', text: res.answer, actions: res.actions }
      if (res.showSupportForm) newMsg.showSupportForm = true
      setMessages(prev => {
        const updated = [...prev, newMsg]
        if (res.showSupportForm) setSupportMsgIdx(updated.length - 1)
        return updated
      })
      setTyping(false)
    }, 600)
  }

  const handleAIAction = (action) => {
    if (action.triggerSupport) { sendMessage('contact support'); return }
    if (action.path) { setAiOpen(false); navigate(action.path) }
  }

  const handleSupportSubmit = ({ name, phone, query: q }) => {
    const id = 'CY-' + Math.random().toString(36).substring(2,8).toUpperCase()
    setTicketId(id)
    setTicketSubmitted(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: `✅ **Ticket #${id} raised!**\n\nDear ${name}, our team will reach your number **+91 ${phone}** within **48 hours**. Thank you! 🙏`,
        actions: []
      }])
    }, 400)
  }

  const handleFABAction = (key) => {
    setFabOpen(false)
    switch (key) {
      case 'profile': navigate('/profile'); break
      case 'role':    navigate('/role-select'); break
      case 'support': window.open('https://wa.me/919876543210?text=Hi+CricYaar+support', '_blank'); break
      case 'logout':  setConfirmLogout(true); break
    }
  }

  const handleLogout = () => {
    if (user?.role) localStorage.setItem('cricyaar_last_role', user.role)
    setUser(null)
    setConfirmLogout(false)
    addToast('Logged out. Sign in to continue.', 'info')
    navigate('/login')
  }

  const SUGGESTIONS = ['How to change my role?','How to upgrade to Pro?','How to create a team?','How to book a ground?','Contact support']

  return (
    <>
      {/* ── Draggable container ── */}
      <div
        style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 60, touchAction: 'none', cursor: drag.current.active ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* FAB quick-action pills — expand upward */}
        {fabOpen && (
          <div className="absolute bottom-[108px] right-0 flex flex-col items-end gap-2 animate-slide-up">
            {FAB_ITEMS.map(item => (
              <button
                key={item.key}
                onPointerDown={e => e.stopPropagation()}
                onClick={() => !drag.current.moved && handleFABAction(item.key)}
                className="flex items-center gap-2.5 rounded-full pl-3 pr-2 py-1.5 shadow-lg font-semibold text-sm transition-all active:scale-95 whitespace-nowrap bg-white border border-slate-200"
              >
                <span className="text-navy-800">{item.label}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: item.bg }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Stacked buttons */}
        <div className="flex flex-col items-center gap-2">
          {/* AI Sparkles */}
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => !drag.current.moved && setAiOpen(v => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
            aria-label="CricYaar Guide"
          >
            <Sparkles size={20} className="text-white" />
          </button>

          {/* Plus / Quick actions */}
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => !drag.current.moved && setFabOpen(v => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
            style={{ background: fabOpen ? '#0f172a' : 'linear-gradient(135deg,#0f172a,#1e293b)', boxShadow: '0 4px 16px rgba(15,23,42,0.30)' }}
            aria-label="Quick actions"
          >
            {fabOpen ? <X size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
          </button>
        </div>

        {/* Drag hint */}
        <p className="text-center text-[9px] text-slate-400 mt-1 select-none leading-none">drag</p>
      </div>

      {/* ── FAB backdrop ── */}
      {fabOpen && <div className="fixed inset-0 z-[55]" onClick={() => setFabOpen(false)} />}

      {/* ── AI Chat sheet ── */}
      {aiOpen && (
        <div className="fixed inset-0 z-[65] flex flex-col justify-end" onClick={() => setAiOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up flex flex-col"
            style={{ maxHeight: '80dvh', minHeight: '55dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 flex-shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-navy-900 text-sm">CricYaar Guide</p>
                  <p className="text-[10px] text-brand-500 font-semibold">● Online</p>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
                <X size={15} className="text-navy-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                         style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.from === 'user' ? '' : 'flex-1'}`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.from === 'user'
                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                        : 'bg-slate-50 text-navy-800 rounded-tl-sm border border-slate-100'
                    }`}>
                      <RichText text={msg.text} />
                    </div>
                    {msg.from === 'bot' && msg.actions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.actions.map((a, j) => (
                          <button key={j} onClick={() => handleAIAction(a)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors active:scale-95">
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.from === 'bot' && msg.showSupportForm && (
                      <SupportForm
                        onSubmit={handleSupportSubmit}
                        submitted={ticketSubmitted && supportMsgIdx === i}
                        ticketId={ticketId}
                      />
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                           style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex-shrink-0 active:scale-95">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0 bg-white">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask anything about CricYaar…"
                className="flex-1 text-sm border border-slate-200 rounded-2xl px-4 py-2.5 outline-none focus:border-indigo-400 text-navy-900 placeholder-slate-400 bg-slate-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Logout confirmation ── */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6"
             onClick={() => setConfirmLogout(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-scale-in"
               onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-navy-900 text-lg text-center mb-1">Log out?</h3>
            <p className="text-navy-500 text-sm text-center mb-5 leading-relaxed">
              You'll need to verify your phone number again to log back in.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmLogout(false)}>Cancel</button>
              <button onClick={handleLogout}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: '#ef4444' }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
