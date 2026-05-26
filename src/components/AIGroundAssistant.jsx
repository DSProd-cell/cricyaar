import { useState, useRef, useEffect } from 'react'
import { X, Sparkles, Send, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { GROUNDS } from '../data/mock'

// ── Demo-mode responses when API key not configured ────────────────────────
const DEMO_RESPONSES = [
  (q) => {
    const lower = q.toLowerCase()
    if (lower.includes('bengaluru') || lower.includes('bangalore')) {
      return '**Chinnaswamy Box Cricket** (MG Road, ₹600/hr) has floodlights till midnight and great facilities. **Mullanpur Sports Complex** is an Astro Turf venue in Chandigarh — the top-rated ground (4.6★) with full facilities. For Bengaluru specifically, Chinnaswamy Box Cricket is your best bet for evening T20s.'
    }
    if (lower.includes('mumbai')) {
      return '**Wankhede Cricket Ground** (Marine Drive, ₹1,200/hr) is the top-rated Turf ground in Mumbai with all facilities and floodlights till 11 PM. For budget-friendly, try **Bandra Box Cricket Arena** (₹500/hr) with all-day floodlights.'
    }
    if (lower.includes('delhi')) {
      return '**Kotla Cricket Club** (Vikas Marg, ₹900/hr) is the best Turf ground in Delhi with floodlights till 10 PM. It has parking, changing rooms, and first aid on-site.'
    }
    if (lower.includes('turf')) {
      return 'Top Turf grounds on CricYaar: **Wankhede Cricket Ground** (Mumbai, 4.7★, ₹1,200/hr) and **Kotla Cricket Club** (Delhi, 4.2★, ₹900/hr). Both have floodlights and full facilities.'
    }
    if (lower.includes('flood') || lower.includes('night') || lower.includes('evening')) {
      return 'Grounds with floodlights: **Wankhede** (Mumbai, 6–11 PM), **Chinnaswamy Box Cricket** (Bengaluru, 7 PM–12 AM), **Bandra Box Cricket Arena** (Mumbai, all day), **Mullanpur Sports Complex** (Chandigarh, 6–11 PM), **Kotla Cricket Club** (Delhi, 5–10 PM).'
    }
    if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) {
      return 'Budget-friendly options: **Hyderabad Cricket Club** (₹400/hr), **Bandra Box Cricket Arena** (₹500/hr), **Chinnaswamy Box Cricket** (₹600/hr). All have good ratings and basic facilities.'
    }
    return 'I can help you find cricket grounds! Try asking about a specific city, pitch type, floodlights, or budget — e.g. "best turf ground in Mumbai" or "cheap ground with floodlights in Bengaluru".'
  }
]

function getDemoResponse(query) {
  return DEMO_RESPONSES[0](query)
}

// Format bold text (**text**) in AI responses
function FormattedText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}

export default function AIGroundAssistant({ visible, onClose }) {
  const { user, incrementAiQuery, canAskAI, aiQueriesLeft } = useStore()
  const [messages, setMessages]     = useState([])
  const [input,    setInput]        = useState('')
  const [loading,  setLoading]      = useState(false)
  const [error,    setError]        = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const queriesLeft = aiQueriesLeft()
  const isLimitHit  = !canAskAI()

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [visible])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || loading || isLimitHit) return

    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)
    incrementAiQuery()

    // Build ground context (summaries)
    const groundContext = GROUNDS.map(g => ({
      name: g.name, city: g.city, area: g.area,
      pitchType: g.pitchType, condition: g.pitchCondition,
      floodlights: g.floodlights, floodlightHours: g.floodlightHours || null,
      rentPerHour: g.rentPerHour, rentPerMatch: g.rentPerMatch,
      rating: g.rating, matchCount: g.matchCount,
      facilities: Object.entries(g.facilities).filter(([,v]) => v).map(([k]) => k),
    }))

    try {
      const res = await fetch('/api/ground-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          groundContext,
        }),
      })
      const data = await res.json()

      let aiText
      if (data.demo) {
        aiText = getDemoResponse(q)
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        aiText = data.content?.[0]?.text || 'Sorry, I couldn\'t understand that. Please try again.'
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiText }])
    } catch (e) {
      setError('Couldn\'t get a response. Please try again.')
      setMessages(prev => prev.slice(0, -1)) // remove user message on error
      setInput(q)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    if (input) handleSend()
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-modal flex flex-col animate-slide-up"
        style={{ height: '70dvh', maxWidth: '640px', margin: '0 auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-navy-900 text-sm">AI Ground Assistant</p>
              <p className="text-navy-400 text-xs">Powered by Claude</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-navy-600 hover:bg-slate-200 transition-colors"
            aria-label="Close AI assistant"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles size={22} className="text-brand-500" />
              </div>
              <p className="font-semibold text-navy-900 text-sm mb-1">Ask me anything about grounds</p>
              <p className="text-navy-400 text-xs max-w-xs mx-auto leading-relaxed">
                Best turf ground in Bengaluru · Grounds with floodlights in Mumbai · Cheapest ground near Delhi
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-br-md'
                    : 'bg-slate-100 text-navy-800 rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? <FormattedText text={msg.content} /> : msg.content}
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay:'0ms' }} />
                <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay:'150ms' }} />
                <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay:'300ms' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm">
              <p className="text-red-600 flex-1">{error}</p>
              <button onClick={handleRetry} className="flex items-center gap-1 text-red-500 font-semibold flex-shrink-0 hover:text-red-600">
                <RotateCcw size={13} />
                Retry
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {isLimitHit ? (
              <div className="flex-1 cm-input bg-slate-50 text-navy-400 text-sm cursor-not-allowed flex items-center h-11">
                You've used all 10 questions for today. Come back tomorrow.
              </div>
            ) : (
              <input
                ref={inputRef}
                className="flex-1 cm-input h-11"
                placeholder="Ask anything about grounds… e.g. best turf in Bengaluru"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={loading}
                autoComplete="off"
              />
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || isLimitHit}
              className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center flex-shrink-0 transition-all hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send size={17} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-navy-400 text-[11px]">Answers based on CricYaar listings. May not reflect real-time availability.</p>
            {queriesLeft !== Infinity && (
              <p className="text-navy-400 text-[11px] flex-shrink-0 ml-2">{queriesLeft} remaining today</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
