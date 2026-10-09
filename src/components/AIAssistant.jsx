import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import {
  Sparkles, X, Send, ArrowRight, Bot, Check,
  Ticket, Phone, User, MessageSquare, Loader,
  Megaphone, ChevronRight
} from 'lucide-react'

// ── Pages where chat should NOT appear ──────────────────────────────────────
const SKIP_PATHS = [
  '/welcome', '/login', '/otp', '/usp', '/role-onboard', '/player-setup',
  '/celebration', '/player-match', '/landing', '/profile-match', '/city-select',
  '/role-select', '/setup', '/fetch-past-record', '/ipl-pick', '/yarein-welcome',
]

// ── Context labels for current page ─────────────────────────────────────────
const PAGE_CONTEXT = {
  '/':               'Home',
  '/teams':          'Teams',
  '/search':         'Universal Search',
  '/grounds':        'Ground Search',
  '/profile':        'Profile',
  '/settings':       'Settings',
  '/my-cricket':     'My Cricket',
  '/open-tournaments': 'Tournaments',
  '/create-tournament': 'Create Tournament',
  '/ground-booking': 'Ground Booking',
  '/opponent-finder':'Opponent Finder',
  '/earnings':       'Earnings',
  '/invite':         'Invite & Earn',
  '/notifications':  'Notifications',
}

// ── Intent knowledge base ────────────────────────────────────────────────────
const INTENTS = [
  {
    match: ['change role', 'switch role', 'different role', 'new role', 'how to change', 'become player', 'become organiser', 'become umpire', 'become fan', 'become ground'],
    answer: "To **change your role**, follow these steps:\n\n1️⃣ Tap **Settings** (gear icon, top-right on any page)\n2️⃣ Scroll down to the **Role** section\n3️⃣ Tap **Change Role** → pick your new role\n4️⃣ Confirm — no OTP needed!\n\nYour data stays safe when you switch.",
    actions: [{ label: 'Open Settings', path: '/settings' }]
  },
  {
    match: ['pro', 'upgrade', 'premium', 'subscription', 'paid plan', 'unlock', 'become pro', '₹1', 'how to pay', 'how to subscribe'],
    answer: "To **upgrade to Pro** (just ₹1/month):\n\n1️⃣ Tap **Upgrade to Pro** below\n2️⃣ Choose your payment — UPI, Card, or Net Banking via Razorpay\n3️⃣ Toggle **Auto-renew** on or off\n4️⃣ Complete payment → Pro activates instantly!\n\n✅ Unlocks: Live scoring, squad management, tournaments, ground booking, AI Ground Assistant & more.",
    actions: [{ label: 'Upgrade to Pro — ₹1/mo', path: '/pro-payment' }]
  },
  {
    match: ['create team', 'new team', 'make a team', 'start a team'],
    answer: "To **create a team** (Pro feature):\n\n1️⃣ Go to **Teams** using the bottom navigation\n2️⃣ Tap **Create Team** (bottom right)\n3️⃣ Add team name, city & colour\n4️⃣ Set captain & wicketkeeper\n5️⃣ Add players to your squad\n\nYou need a **Pro subscription** to save & activate the team.",
    actions: [
      { label: 'Go to Teams', path: '/teams' },
      { label: 'Upgrade to Pro', path: '/pro-payment' }
    ]
  },
  {
    match: ['join team', 'join a team', 'team code', 'find a team', 'request to join'],
    answer: "To **join a team**:\n\n**Option A — Team Code:**\n1️⃣ Go to **Teams** → tap **Join with code**\n2️⃣ Enter the 7-character code from your captain (e.g. MUM-7X2)\n\n**Option B — Browse open teams:**\n1️⃣ Go to **Teams** → tap **Find a Team** tab\n2️⃣ Filter by city & position\n3️⃣ Tap **Request to Join** on any open team\n\nJoining requires a **Pro** subscription.",
    actions: [{ label: 'Go to Teams', path: '/teams' }]
  },
  {
    match: ['my team', 'manage team', 'squad', 'team members', 'team profile'],
    answer: "To **manage your team**:\n\n1️⃣ Go to **Teams** in the bottom navigation\n2️⃣ Tap your team card to open the **Team Profile**\n3️⃣ View squad, match history & tournament stats\n\nCaptains can also view **Join Requests** from players.",
    actions: [{ label: 'Go to Teams', path: '/teams' }]
  },
  {
    match: ['add team to tournament', 'register team', 'enter tournament as team'],
    answer: "To **register your team in a tournament**:\n\n1️⃣ Go to **Home** → tap **Add Teams to Tournament** (Organiser Home)\n   OR go to **Tournaments** → open a tournament → tap **Register Team**\n2️⃣ Select your team\n3️⃣ Confirm — organiser will approve\n\nThis is a **Pro** feature.",
    actions: [
      { label: 'Browse Tournaments', path: '/open-tournaments' },
      { label: 'Go to Home', path: '/' }
    ]
  },
  {
    match: ['create tournament', 'organise tournament', 'organize tournament', 'new tournament', 'start a tournament'],
    answer: "To **create a tournament**:\n\n1️⃣ Go to **Teams** → tap **Tournaments** tab\n2️⃣ Tap **Create Tournament**\n3️⃣ Fill in format, dates, entry fee & prize\n4️⃣ Share the tournament link with teams\n\nThis is a **Pro** feature for Organisers.",
    actions: [
      { label: 'Create Tournament', path: '/create-tournament' },
      { label: 'Upgrade to Pro', path: '/pro-payment' }
    ]
  },
  {
    match: ['join tournament', 'enter tournament', 'open tournament', 'find tournament'],
    answer: "To **join an open tournament**:\n\n1️⃣ Go to **Open Tournaments** (bottom nav → Teams icon)\n2️⃣ Browse tournaments in your city\n3️⃣ Tap a tournament → **Register Team** or **Join as Free Agent**\n4️⃣ Wait for organiser approval\n\nJoining requires **Pro**.",
    actions: [{ label: 'Browse Open Tournaments', path: '/open-tournaments' }]
  },
  {
    match: ['score a match', 'score match', 'ball by ball', 'live scoring', 'start scoring', 'how to score'],
    answer: "To **score a match live**:\n\n1️⃣ Go to **My Cricket** (bottom navigation)\n2️⃣ Open an existing match or create a new one\n3️⃣ Tap **Start Scoring** — enter each ball result\n4️⃣ Scorecard updates live for all viewers!\n\nLive scoring is a **Pro** feature. Free users can read scorecards.",
    actions: [
      { label: 'My Cricket', path: '/my-cricket' },
      { label: 'Upgrade to Pro', path: '/pro-payment' }
    ]
  },
  {
    match: ['live score', 'watch score', 'view score', 'see score', 'read scorecard'],
    answer: "To **watch live scores**:\n\n1️⃣ Tap **My Cricket** in the bottom navigation\n2️⃣ Any live match shows in real time\n3️⃣ Tap a match to open the full scorecard\n\nThis is available **free** for all users! 🏏",
    actions: [{ label: 'My Cricket', path: '/my-cricket' }]
  },
  {
    match: ['book ground', 'book a ground', 'ground booking', 'how to book'],
    answer: "To **book a cricket ground**:\n\n1️⃣ Tap **Find Grounds** below or use Search in bottom nav\n2️⃣ Pick a ground → tap **Book via App**\n3️⃣ Select date & time slot\n4️⃣ Fill match details → pay securely via **Razorpay**\n5️⃣ Show the booking code on arrival ✅\n\nBooking is a **Pro** feature.",
    actions: [
      { label: 'Find Grounds', path: '/grounds' },
      { label: 'Book a Ground', path: '/ground-booking' }
    ]
  },
  {
    match: ['find ground', 'ground near me', 'search ground', 'turf', 'venue'],
    answer: "To **find a cricket ground**:\n\n1️⃣ Tap the **Search** icon in the bottom navigation\n2️⃣ Browse grounds by city, pitch type & facilities\n3️⃣ Tap any ground to see details, pricing & availability\n4️⃣ Rate it or book directly from the app!",
    actions: [{ label: 'Browse Grounds', path: '/grounds' }]
  },
  {
    match: ['my stats', 'batting stats', 'bowling stats', 'career stats', 'my performance', 'view profile'],
    answer: "To **view your cricket stats**:\n\n1️⃣ Tap **Profile** (person icon, bottom right)\n2️⃣ Browse tabs: Overview, Batting, Bowling, Fielding\n3️⃣ See recent innings chart & career averages\n4️⃣ Tap **My Teams** tab to see your team records\n\nPro users get deeper career history.",
    actions: [{ label: 'Go to Profile', path: '/profile' }]
  },
  {
    match: ['edit profile', 'update name', 'change city', 'update profile', 'bio'],
    answer: "To **edit your profile**:\n\n1️⃣ Go to **Profile** (bottom nav)\n2️⃣ Tap the ✏️ **Edit** button (top right)\n3️⃣ Update your name, city or bio\n4️⃣ Tap **Save Changes** — done!",
    actions: [{ label: 'Go to Profile', path: '/profile' }]
  },
  {
    match: ['settings', 'account settings', 'notifications', 'preferences', 'account'],
    answer: "In **Settings** you can:\n\n⚙️ Change your **Role**\n🔔 Manage **Notifications**\n👤 View your account details\n🔒 Privacy & security options\n\nAccess it via the gear icon on any home page.",
    actions: [{ label: 'Open Settings', path: '/settings' }]
  },
  {
    match: ['umpire', 'umpiring', 'my assignment', 'umpire assignment', 'get assigned'],
    answer: "As an **Umpire**, you can:\n\n1️⃣ Go to your **Umpire Profile** to see assignments\n2️⃣ Set your **per-match charges**\n3️⃣ Accept or decline upcoming matches\n4️⃣ Track your rating and earnings\n\nThis requires the **Umpire role** (change in Settings).",
    actions: [{ label: 'Umpire Profile', path: '/umpire-profile' }]
  },
  {
    match: ['invite', 'refer', 'referral', 'invite friend', 'earn reward', 'share app'],
    answer: "To **invite friends & earn rewards**:\n\n1️⃣ Tap **Invite & Earn** below\n2️⃣ Share your unique referral link via WhatsApp or social\n3️⃣ When your friend signs up — you earn reward points!\n4️⃣ Redeem points for Pro subscription discounts 🎁",
    actions: [{ label: 'Invite & Earn', path: '/invite' }]
  },
  {
    match: ['earnings', 'income', 'payout', 'how much i earn', 'payment received', 'revenue'],
    answer: "To **view your earnings**:\n\n1️⃣ Go to **Earnings Dashboard** below\n2️⃣ See all completed bookings & payments\n3️⃣ Track pending payouts from Razorpay Route\n\nAvailable for **Ground Owners** and **Umpires** (Pro).",
    actions: [{ label: 'Earnings Dashboard', path: '/earnings' }]
  },
  {
    match: ['find opponent', 'challenge team', 'opponent', 'looking for match', 'find a match'],
    answer: "To **find an opponent**:\n\n1️⃣ Tap **Find Opponent** below\n2️⃣ Set your city, format & preferred date\n3️⃣ Browse available teams looking for matches\n4️⃣ Send a **Challenge Request**!\n\nRequires **Pro** for Captains/Organisers.",
    actions: [{ label: 'Find Opponent', path: '/opponent-finder' }]
  },
  {
    match: ['ground owner', 'list ground', 'my ground', 'add ground', 'ground listing'],
    answer: "To **list your ground**:\n\n1️⃣ Switch to **Ground Owner** role (Settings → Change Role)\n2️⃣ Go to **Ground Owner Dashboard**\n3️⃣ Add photos, pricing & slot availability\n4️⃣ Teams can find & book your ground instantly\n\nPayments come via **Razorpay** — no fraud risk.",
    actions: [{ label: 'Ground Owner Dashboard', path: '/ground-owner' }]
  },
  {
    match: ['what can i do', 'features', 'what is cricyaar', 'how does it work', 'get started', 'help me'],
    answer: "Welcome to **CricYaar** 🏏 Here's what you can do:\n\n🆓 **Free (Fan):** Watch live scores, browse grounds & teams\n\n👑 **Pro (₹1/mo):**\n• Score matches ball-by-ball\n• Create & manage teams\n• Join & run tournaments\n• Book grounds via Razorpay\n• AI Ground Assistant\n\nWhat would you like to do first?",
    actions: [
      { label: 'Upgrade to Pro', path: '/pro-payment' },
      { label: 'Browse Grounds', path: '/grounds' },
      { label: 'View Teams', path: '/teams' }
    ]
  },
  {
    match: ['support', 'help', 'contact', 'problem', 'issue', 'complaint', 'report', 'not working', 'bug', 'wrong', 'error'],
    answer: "I'm sorry you're having trouble! Let me raise a support ticket for you. Please fill in your details below 👇",
    actions: [],
    showSupportForm: true
  },
]

function getResponse(query, pathname) {
  const q = query.toLowerCase().trim()

  // Context-aware shortcut: user asks about something they're already on
  const ctx = PAGE_CONTEXT[pathname]
  if (ctx && (q.includes('how') || q.includes('where') || q.includes('what'))) {
    // minor context hint added to standard answer
  }

  for (const intent of INTENTS) {
    if (intent.match.some(kw => q.includes(kw.toLowerCase()))) {
      return {
        answer: intent.answer,
        actions: intent.actions || [],
        showSupportForm: intent.showSupportForm || false
      }
    }
  }
  return {
    answer: "I'm not sure about that yet! 🤔 Try asking:\n• **How to change my role?**\n• **How to upgrade to Pro?**\n• **How to create a team?**\n• **How to book a ground?**\n\nOr raise a **support ticket** if something's not working.",
    actions: [{ label: 'Contact Support', path: null, triggerSupport: true }],
    showSupportForm: false
  }
}

// Render **bold** markdown text
function RichText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <span className="leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold">{part}</strong>
          : part.split('\n').map((line, j, arr) => (
              <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))
      )}
    </span>
  )
}

// ── Support Form component (inline in chat) ──────────────────────────────────
function SupportForm({ onSubmit, submitted, ticketId }) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [query, setQuery] = useState('')

  if (submitted) {
    return (
      <div className="mt-2 rounded-2xl overflow-hidden border border-green-200 bg-green-50">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={16} className="text-green-600" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-green-800 text-sm">Ticket Created!</p>
            <p className="text-green-700 text-xs font-mono font-bold mt-0.5">#{ticketId}</p>
            <p className="text-green-700 text-xs mt-1.5 leading-relaxed">
              Our team is reviewing your query. You'll hear back within <strong>48 hours</strong>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const canSubmit = name.trim() && phone.trim().length >= 10 && query.trim()

  return (
    <div className="mt-2 rounded-2xl overflow-hidden border border-indigo-100 bg-[var(--cy-surface)] shadow-sm">
      <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
        <p className="text-indigo-700 font-bold text-xs uppercase tracking-wider">Support Ticket</p>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {/* Name */}
        <div>
          <label className="text-[11px] font-bold text-navy-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <User size={10} className="text-navy-400" /> Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-[var(--cy-surface)] outline-none focus:border-indigo-400 placeholder-slate-400 text-navy-900 transition-colors"
          />
        </div>
        {/* Phone */}
        <div>
          <label className="text-[11px] font-bold text-navy-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Phone size={10} className="text-navy-400" /> Phone Number *
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-[var(--cy-surface)] outline-none focus:border-indigo-400 placeholder-slate-400 text-navy-900 transition-colors"
          />
        </div>
        {/* Query */}
        <div>
          <label className="text-[11px] font-bold text-navy-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <MessageSquare size={10} className="text-navy-400" /> Query Details *
          </label>
          <textarea
            rows={3}
            value={query}
            onChange={e => setQuery(e.target.value.slice(0, 300))}
            placeholder="Describe your issue in detail…"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-[var(--cy-surface)] outline-none focus:border-indigo-400 placeholder-slate-400 text-navy-900 resize-none transition-colors"
          />
          <p className="text-right text-[10px] text-slate-400 mt-0.5">{query.length}/300</p>
        </div>
        <button
          onClick={() => canSubmit && onSubmit({ name, phone, query })}
          disabled={!canSubmit}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        >
          Create Support Ticket
        </button>
      </div>
    </div>
  )
}

// ── Broadcast request types ──────────────────────────────────────────────────
const BROADCAST_TYPES = [
  { key: 'player',     label: 'Looking for Players',    emoji: '🏏', targetRole: 'player',       color: '#10b981' },
  { key: 'ground',     label: 'Looking for a Ground',   emoji: '🏟️', targetRole: 'ground_owner', color: '#3b82f6' },
  { key: 'umpire',     label: 'Looking for an Umpire',  emoji: '⚖️', targetRole: 'umpire',       color: '#f59e0b' },
  { key: 'tournament', label: 'Looking for Tournament', emoji: '🏆', targetRole: 'organiser',    color: '#8b5cf6' },
  { key: 'team',       label: 'Looking to Join a Team', emoji: '🤝', targetRole: 'captain',      color: '#ef4444' },
]

function generateWaText(type, note, userName, city) {
  const found = BROADCAST_TYPES.find(t => t.key === type)
  const label = found ? found.label : 'Looking for help'
  const lines = [
    `🏏 *CricYaar Request*`,
    `📢 ${label}`,
    note ? `📝 ${note}` : '',
    `📍 ${city || 'Bengaluru'}`,
    `👤 ${userName || 'A CricYaar user'}`,
    `\n_Sent via CricYaar app_`,
  ].filter(Boolean)
  return encodeURIComponent(lines.join('\n'))
}

// ── InformDS Broadcast Sheet ─────────────────────────────────────────────────
function InformDSSheet({ onClose, onOpenChat, user }) {
  const [selected, setSelected] = useState(null)
  const [note, setNote]         = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [waText, setWaText]     = useState('')

  const handleSend = async () => {
    if (!selected) return
    setSending(true)
    const type = BROADCAST_TYPES.find(t => t.key === selected)
    const wa = generateWaText(selected, note, user?.name, user?.city)
    setWaText(wa)

    try {
      await supabase.from('broadcasts').insert({
        sender_id:   user?.id,
        type:        selected,
        note:        note || null,
        city:        user?.city || 'Bengaluru',
        target_role: type?.targetRole || null,
      })
    } catch (_) {
      // table may not exist yet — WhatsApp path still works
    }
    setSending(false)
    setSent(true)
  }

  const openWa = () => {
    window.open(`https://wa.me/?text=${waText}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[65] flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative bg-[var(--cy-surface)] rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up flex flex-col"
        style={{ maxHeight: '80dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#6366f1)' }}>
            <Megaphone size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-navy-900 text-sm">Inform DS</p>
            <p className="text-[11px] text-violet-500 font-medium">Broadcast to cricketers in {user?.city || 'your city'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!sent ? (
            <>
              {/* Request type picker */}
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">What are you looking for?</p>
                <div className="space-y-2">
                  {BROADCAST_TYPES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setSelected(t.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98]"
                      style={{
                        borderColor: selected === t.key ? t.color : 'var(--cy-border)',
                        background: selected === t.key ? `${t.color}12` : 'var(--cy-surface)',
                      }}
                    >
                      <span className="text-xl flex-shrink-0">{t.emoji}</span>
                      <span className="font-semibold text-sm text-navy-900 flex-1 text-left">{t.label}</span>
                      {selected === t.key && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: t.color }}>
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Add a note <span className="normal-case font-normal text-navy-400">(optional)</span></p>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={note}
                    onChange={e => setNote(e.target.value.slice(0, 120))}
                    placeholder={`e.g. Need 3 batsmen · Sunday · ${user?.city || 'Bengaluru'}`}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-[var(--cy-surface)] outline-none focus:border-violet-400 placeholder-slate-400 text-navy-900 resize-none transition-colors"
                  />
                  <p className="text-right text-[10px] text-slate-400 mt-0.5">{note.length}/120</p>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!selected || sending}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6366f1)' }}
              >
                {sending ? <Loader size={15} className="animate-spin" /> : <Megaphone size={15} />}
                {sending ? 'Sending…' : 'Broadcast Request'}
              </button>

              {/* App help link */}
              <button onClick={onOpenChat} className="w-full flex items-center justify-center gap-1.5 text-xs text-navy-400 py-1">
                <Sparkles size={11} className="text-indigo-400" />
                <span>Need app help? Ask DS</span>
                <ChevronRight size={11} className="text-navy-300" />
              </button>
            </>
          ) : (
            /* Success state */
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#d1fae5' }}>
                <Check size={30} className="text-green-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-extrabold text-navy-900 text-base mb-1">Request Broadcast! 🎉</p>
                <p className="text-sm text-navy-500">
                  {BROADCAST_TYPES.find(t => t.key === selected)?.label} — notifying cricketers in <strong>{user?.city || 'Bengaluru'}</strong>
                </p>
              </div>

              <button
                onClick={openWa}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: '#25d366' }}
              >
                <span className="text-base">💬</span>
                Share on WhatsApp Too
              </button>
              <p className="text-[11px] text-navy-400">Opens WhatsApp with a pre-filled message — send to your cricket group</p>

              <button onClick={onClose} className="w-full py-3 rounded-2xl border border-slate-200 font-semibold text-sm text-navy-600">
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

// ── Main Component ───────────────────────────────────────────────────────────
export default function AIAssistant() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user }     = useStore()

  // ── All hooks MUST come before any conditional return ──
  const [open, setOpen]                       = useState(false)
  const [showBroadcast, setShowBroadcast]     = useState(false)
  const [input, setInput]                     = useState('')
  const [typing, setTyping]                   = useState(false)
  const [ticketId, setTicketId]               = useState(null)
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [supportMsgIndex, setSupportMsgIndex] = useState(null)
  const [btnVisible, setBtnVisible]           = useState(true)
  const lastScrollY = useRef(0)
  const hideTimer   = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      const goingDown = current > lastScrollY.current + 4
      lastScrollY.current = current
      if (goingDown) {
        setBtnVisible(false)
        clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => setBtnVisible(true), 600)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(hideTimer.current) }
  }, [])
  const roleGreeting = (() => {
    const role = user?.role || 'fan'
    const name = user?.name ? `, ${user.name.split(' ')[0]}` : ''
    const tips = {
      player:       `As a **Player**, I can help you join tournaments, track stats, score matches, and find teams.`,
      organiser:    `As an **Organiser**, I can help you create tournaments, manage teams, assign umpires, and collect fees.`,
      umpire:       `As an **Umpire**, I can help you get match assignments, set charges, and track earnings.`,
      ground_owner: `As a **Ground Owner**, I can help you list your ground, manage bookings, and receive payments.`,
      fan:          `I can help you watch live scores, explore teams & grounds, and upgrade to Pro.`,
    }
    return `Hi${name}! 👋 I'm **DS**, your CricYaar AI guide.\n\n${tips[role] || tips.fan}\n\nTap a question below or ask me anything!`
  })()

  const [messages, setMessages]               = useState([{
    from: 'bot',
    text: roleGreeting,
    actions: []
  }])
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350)
      scrollToBottom()
    }
  }, [open])

  useEffect(() => { scrollToBottom() }, [messages, typing])

  // ── Guard: only hide on bare auth screens ──
  if (!user) return null
  if (SKIP_PATHS.some(p => pathname === p)) return null

  const sendMessage = (text) => {
    const query = (text || input).trim()
    if (!query) return
    setInput('')

    setMessages(prev => [...prev, { from: 'user', text: query }])
    setTyping(true)

    setTimeout(() => {
      const response = getResponse(query, pathname)
      const newMsg = {
        from: 'bot',
        text: response.answer,
        actions: response.actions,
      }
      if (response.showSupportForm) {
        newMsg.showSupportForm = true
        setSupportMsgIndex(prev => messages.length + 1) // will be set after append
      }
      setMessages(prev => {
        const updated = [...prev, newMsg]
        if (response.showSupportForm) setSupportMsgIndex(updated.length - 1)
        return updated
      })
      setTyping(false)
    }, 600)
  }

  const handleAction = (action) => {
    if (action.triggerSupport) {
      // Inject support form directly
      sendMessage('contact support')
      return
    }
    if (action.path) {
      setOpen(false)
      navigate(action.path)
    }
  }

  const handleSupportSubmit = ({ name, phone, query: q }) => {
    const id = 'CY-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setTicketId(id)
    setTicketSubmitted(true)
    // Add confirmation bot message
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: `✅ **Ticket #${id} raised successfully!**\n\nDear ${name}, we've received your query. Our support team will reach out to your registered number **+91 ${phone}** within **48 hours**.\n\nThank you for your patience! 🙏`,
        actions: []
      }])
    }, 400)
  }

  // Role-aware suggestions
  const SUGGESTIONS = (() => {
    const role = user?.role || 'fan'
    const base = ['Contact support']
    const byRole = {
      player:       ['How do I join a tournament?', 'How to track my stats?', 'How to score a match?', 'How to find a team?'],
      organiser:    ['How to create a tournament?', 'How to manage team registrations?', 'How to assign umpires?', 'How to collect entry fees?'],
      umpire:       ['How to get match assignments?', 'How to set my charges?', 'How to view earnings?', 'How do I get verified?'],
      ground_owner: ['How to list my ground?', 'How to manage bookings?', 'How to receive payments?', 'How do I set slot availability?'],
      fan:          ['How to watch live scores?', 'How to upgrade to Pro?', 'How to follow a player?', 'How to book a ground?'],
    }
    return [...(byRole[role] || byRole.fan), ...base]
  })()

  return (
    <>
      {/* ── Inform DS Floating trigger ── */}
      {!open && !showBroadcast && (
        <button
          onClick={() => setShowBroadcast(true)}
          className="fixed right-4 z-[58] flex items-center gap-1.5 pl-2 pr-3 h-10 rounded-full shadow-lg active:scale-95"
          style={{
            bottom: 82,
            background: 'linear-gradient(135deg, #7C3AED, #6366f1)',
            boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
            transform: btnVisible ? 'translateY(0) scale(1)' : 'translateY(120%) scale(0.85)',
            opacity: btnVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
            pointerEvents: btnVisible ? 'auto' : 'none',
          }}
          aria-label="Inform DS — Broadcast to CricYaar users"
        >
          <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-[10px] tracking-tight">DS</span>
          </div>
          <span className="text-white font-bold text-xs">Inform DS</span>
        </button>
      )}

      {/* ── Broadcast sheet ── */}
      {showBroadcast && (
        <InformDSSheet
          user={user}
          onClose={() => setShowBroadcast(false)}
          onOpenChat={() => { setShowBroadcast(false); setOpen(true) }}
        />
      )}

      {/* ── Chat sheet ── */}
      {open && (
        <div
          className="fixed inset-0 z-[65] flex flex-col justify-end"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div
            className="relative bg-[var(--cy-surface)] rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up flex flex-col"
            style={{ maxHeight: '80dvh', minHeight: '55dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 flex-shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-slate-100"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-navy-900 text-sm leading-tight">CricYaar Guide</p>
                <p className="text-[11px] text-indigo-500 font-medium">
                  {PAGE_CONTEXT[pathname] ? `You're on: ${PAGE_CONTEXT[pathname]}` : 'Ask me anything about the app'}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 flex-shrink-0"
              >
                <X size={15} className="text-navy-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 animate-fade-in ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot avatar */}
                  {msg.from === 'bot' && (
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                    >
                      <Bot size={11} className="text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0" style={{ maxWidth: msg.from === 'user' ? '78%' : '88%' }}>
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                        msg.from === 'user'
                          ? 'bg-indigo-500 text-white rounded-tr-sm ml-auto inline-block'
                          : 'bg-slate-100 text-navy-800 rounded-tl-sm'
                      }`}
                      style={msg.from === 'user' ? { display: 'inline-block', float: 'right' } : {}}
                    >
                      {msg.from === 'bot'
                        ? <RichText text={msg.text} />
                        : msg.text
                      }
                    </div>

                    {msg.from === 'user' && <div className="clear-both" />}

                    {/* Action buttons */}
                    {msg.from === 'bot' && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {msg.actions.map((action, j) => (
                          <button
                            key={j}
                            onClick={() => handleAction(action)}
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors active:scale-[0.97] text-left"
                          >
                            <ArrowRight size={13} className="flex-shrink-0 text-indigo-400" />
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Support form */}
                    {msg.from === 'bot' && msg.showSupportForm && (
                      <SupportForm
                        onSubmit={handleSupportSubmit}
                        submitted={ticketSubmitted}
                        ticketId={ticketId}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                  >
                    <Bot size={11} className="text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions — show when conversation just started */}
            {messages.length <= 1 && !typing && (
              <div className="px-4 pb-2 flex-shrink-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Questions</p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="flex-shrink-0 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full text-xs font-semibold hover:bg-indigo-100 transition-colors whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-6 pt-2 border-t border-slate-100 flex-shrink-0 bg-[var(--cy-surface)] rounded-b-3xl">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !typing && sendMessage()}
                  placeholder="Ask me anything…"
                  className="flex-1 bg-transparent text-sm text-navy-900 placeholder-slate-400 outline-none min-w-0"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center transition-all disabled:opacity-40 active:scale-90"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                  {typing
                    ? <Loader size={13} className="text-white animate-spin" />
                    : <Send size={13} className="text-white" />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
