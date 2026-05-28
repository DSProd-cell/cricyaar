import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Sparkles, X, Send, ArrowRight, Bot, ChevronRight } from 'lucide-react'

// ── Intent knowledge base ──────────────────────────────────────────────────
const INTENTS = [
  {
    match: ['change role', 'switch role', 'different role', 'new role', 'switch to', 'become player', 'become organiser', 'become umpire'],
    answer: "You can change your role anytime from **Settings**. No OTP needed after your first login!",
    actions: [{ label: 'Open Settings', path: '/settings' }]
  },
  {
    match: ['pro', 'upgrade', 'premium', 'subscription', 'paid plan', 'unlock', 'become pro', '₹99', 'payment'],
    answer: "**CricYaar Pro** is ₹99/month and unlocks ball-by-ball scoring, squad management, tournaments, ground booking, and more!",
    actions: [{ label: 'Upgrade to Pro — ₹99/mo', path: '/pro-payment' }]
  },
  {
    match: ['team', 'squad', 'create team', 'my team', 'join team', 'manage team'],
    answer: "Manage all your teams from the **Teams** section — create a squad, assign captain & wicketkeeper, and join tournaments.",
    actions: [{ label: 'Go to Teams', path: '/teams' }]
  },
  {
    match: ['add team', 'add to tournament', 'register team'],
    answer: "Organisers can add teams to a tournament from the Organiser Home page under the **Add Teams to Tournament** section. This is a Pro feature.",
    actions: [{ label: 'Go Home', path: '/' }]
  },
  {
    match: ['tournament', 'organise tournament', 'organize tournament', 'create tournament', 'competition', 'league'],
    answer: "You can create and manage entire tournaments — teams, fixtures, and standings — from **Tournaments**.",
    actions: [
      { label: 'Browse Tournaments', path: '/open-tournaments' },
      { label: 'Create Tournament', path: '/create-tournament' }
    ]
  },
  {
    match: ['join tournament', 'enter tournament', 'open tournament'],
    answer: "Browse and join open tournaments in your city from the **Open Tournaments** section.",
    actions: [{ label: 'Browse Open Tournaments', path: '/open-tournaments' }]
  },
  {
    match: ['score a match', 'score match', 'ball by ball', 'live scoring', 'scorer', 'start scoring'],
    answer: "Ball-by-ball live scoring is a **Pro feature**. Upgrade to start scoring matches in real time.",
    actions: [
      { label: 'My Cricket', path: '/my-cricket' },
      { label: 'Upgrade to Pro', path: '/pro-payment' }
    ]
  },
  {
    match: ['live score', 'watch score', 'view score', 'see score'],
    answer: "You can view live scorecards for any match happening in your city — available for all users including free!",
    actions: [{ label: 'My Cricket', path: '/my-cricket' }]
  },
  {
    match: ['ground', 'book ground', 'venue', 'pitch', 'turf', 'find ground', 'book a ground'],
    answer: "Find cricket grounds near you and book time slots directly from the app.",
    actions: [
      { label: 'Find Grounds', path: '/grounds' },
      { label: 'Book a Ground', path: '/ground-booking' }
    ]
  },
  {
    match: ['profile', 'stats', 'career', 'batting stats', 'bowling stats', 'my stats', 'performance'],
    answer: "Your career stats — batting, bowling and fielding history — are all on your **Profile** page.",
    actions: [{ label: 'Go to Profile', path: '/profile' }]
  },
  {
    match: ['settings', 'account settings', 'notification', 'preferences'],
    answer: "All your account settings, role preferences, and notification controls are in **Settings**.",
    actions: [{ label: 'Open Settings', path: '/settings' }]
  },
  {
    match: ['umpire', 'umpiring', 'my assignment', 'umpire assignment', 'match assignment'],
    answer: "Umpires can view upcoming assignments, set per-match rates, and track their rating and earnings from their profile.",
    actions: [{ label: 'Umpire Profile', path: '/umpire-profile' }]
  },
  {
    match: ['invite', 'refer', 'referral', 'invite friend', 'earn reward'],
    answer: "Invite your cricket friends to CricYaar and earn rewards when they join!",
    actions: [{ label: 'Invite & Earn', path: '/invite' }]
  },
  {
    match: ['support', 'help', 'contact', 'problem', 'issue', 'complaint', 'report bug', 'not working'],
    answer: "Our support team is here for you!\n📧 support@cricyaar.com\n📱 WhatsApp: +91 98765 43210\n\nWe respond within a few hours.",
    actions: []
  },
  {
    match: ['earnings', 'income', 'revenue', 'payout', 'how much i earn', 'payment received'],
    answer: "Ground owners and umpires can track all earnings and payment history in the **Earnings Dashboard**.",
    actions: [{ label: 'Earnings Dashboard', path: '/earnings' }]
  },
  {
    match: ['crichero', 'import stats', 'import from crichero'],
    answer: "You can import your CricHeroes career stats directly into CricYaar to display your cricket history.",
    actions: [{ label: 'Import from CricHeroes', path: '/cricheros-import' }]
  },
  {
    match: ['opponent', 'find opponent', 'challenge team', 'find a match'],
    answer: "Use the **Opponent Finder** to challenge other teams to a match in your city!",
    actions: [{ label: 'Find Opponent', path: '/opponent-finder' }]
  },
  {
    match: ['ground owner', 'list my ground', 'my ground', 'ground listing'],
    answer: "Ground owners can list their venue, manage booking slots, and receive payments from the **Ground Owner Dashboard**.",
    actions: [{ label: 'Ground Owner Dashboard', path: '/ground-owner' }]
  },
  {
    match: ['what can i do', 'features', 'what is cricyaar', 'how does it work', 'get started'],
    answer: "CricYaar lets you **score matches**, **manage teams**, **organise tournaments**, **book grounds**, and more!\n\nFree users can read live scores. Upgrade to Pro (₹99/mo) to unlock everything.",
    actions: [
      { label: 'Upgrade to Pro', path: '/pro-payment' },
      { label: 'Browse Grounds', path: '/grounds' }
    ]
  },
]

const SUGGESTIONS = [
  'How to change my role?',
  'How to upgrade to Pro?',
  'Where are my teams?',
  'How to organize a tournament?',
  'How to book a ground?',
  'How to score a match?',
  'Contact support',
]

function getResponse(query) {
  const q = query.toLowerCase().trim()
  for (const intent of INTENTS) {
    if (intent.match.some(kw => q.includes(kw.toLowerCase()))) {
      return { answer: intent.answer, actions: intent.actions }
    }
  }
  return {
    answer: "I'm not sure about that yet! Try asking about roles, teams, tournaments, scoring, or ground booking. Or reach out to support.",
    actions: [{ label: 'Contact Support', path: null, isInfo: true }]
  }
}

// Render markdown-style **bold** text
function RichText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <span>
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

export default function AIAssistant({ fanMode = false }) {
  const navigate = useNavigate()
  const { user } = useStore()
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your CricYaar assistant. Ask me anything — roles, teams, tournaments, or how to get around the app!`,
      actions: []
    }
  ])
  const [typing, setTyping]   = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    const query = text || input
    if (!query.trim()) return
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { from: 'user', text: query }])
    setTyping(true)

    // Simulate thinking delay
    setTimeout(() => {
      const response = getResponse(query)
      setMessages(prev => [...prev, { from: 'bot', text: response.answer, actions: response.actions }])
      setTyping(false)
    }, 600)
  }

  const handleAction = (action) => {
    if (action.path) {
      setOpen(false)
      navigate(action.path)
    }
  }

  // Position above BottomNav (64px) or FanHome banner (~80px)
  const btnBottom = fanMode ? 'bottom-[96px]' : 'bottom-20'

  return (
    <>
      {/* ── Floating trigger button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed ${btnBottom} right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95`}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
          }}
          aria-label="Open AI Assistant"
        >
          <Sparkles size={20} className="text-white" />
        </button>
      )}

      {/* ── Chat sheet ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div
            className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up flex flex-col"
            style={{ maxHeight: '75dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 flex-shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 flex-shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-navy-900 text-sm">CricYaar Assistant</p>
                <p className="text-[11px] text-indigo-500 font-medium">Ask me anything about the app</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100"
              >
                <X size={15} className="text-navy-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {msg.from === 'bot' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-indigo-500 text-white rounded-tr-sm'
                          : 'bg-slate-100 text-navy-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.from === 'bot' ? <RichText text={msg.text} /> : msg.text}
                    </div>

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {msg.actions.map((action, j) => (
                          <button
                            key={j}
                            onClick={() => handleAction(action)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors active:scale-[0.98] text-left"
                          >
                            <ArrowRight size={13} className="flex-shrink-0" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start animate-fade-in">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex-shrink-0">
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
            <div className="px-4 pb-6 pt-2 border-t border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything…"
                  className="flex-1 bg-transparent text-sm text-navy-900 placeholder-slate-400 outline-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 active:scale-90"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
