import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Copy, Share2, Gift, Users, Crown, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

const HISTORY = [
  { name: 'Priya Sharma', action: 'signed up', date: 'May 2025', reward: null },
  { name: 'Amit Patel', action: 'upgraded to Pro', date: 'Apr 2025', reward: '1 free month' },
  { name: 'Ravi Kumar', action: 'upgraded to Pro', date: 'Mar 2025', reward: '1 free month' },
]

export default function InviteEarn() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()
  const [copied, setCopied] = useState(false)
  const code = 'RAHUL21'
  const referralLink = `https://cricyaar.app/join?ref=${code}`

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    addToast('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join CricYaar', text: `Join CricYaar — India's best cricket app! Sign up using my link and get your first Pro month at ₹49: ${referralLink}`, url: referralLink })
    } else {
      navigator.clipboard?.writeText(referralLink)
      addToast('Referral link copied!')
    }
  }

  return (
    <div className="min-h-dvh bg-navy-50 flex flex-col">
      <div className="bg-white border-b border-navy-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 text-navy-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-navy-900 text-base">Invite & Earn</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a2f 100%)' }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift size={20} className="text-amber-400" />
              <h2 className="text-white font-extrabold text-lg">Invite Friends, Earn Free Months</h2>
            </div>
            <p className="text-navy-300 text-sm mb-4 leading-relaxed">
              When your friend upgrades to Pro using your code, you both win — they get ₹49 first month, you get 1 free month (stackable).
            </p>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
              <p className="text-navy-300 text-xs mb-1">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white tracking-widest flex-1">{code}</span>
                <button onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-navy-900'}`}>
                  <Copy size={14} />{copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <button onClick={handleShare}
              className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2">
              <Share2 size={16} />Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="card p-4">
          <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><Users size={16} className="text-brand-500" />Your Progress</h3>
          <div className="space-y-3">
            {[
              { label: 'Friends joined CricYaar', value: '3', color: 'text-navy-900' },
              { label: 'Upgraded to Pro (₹49 deal)', value: '2', color: 'text-amber-600' },
              { label: 'Free months earned', value: '2', color: 'text-brand-600' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-navy-600">{s.label}</span>
                <span className={`font-black text-xl ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Crown size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 text-xs"><strong>Next reward:</strong> 1 free month when <strong>Priya Sharma</strong> subscribes to Pro</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="card p-4">
          <h3 className="font-bold text-navy-900 mb-3">How It Works</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Share your code', desc: 'Send your referral link via WhatsApp' },
              { step: '2', title: 'Friend signs up', desc: 'They join CricYaar using your link' },
              { step: '3', title: 'They upgrade to Pro', desc: 'They get first month at ₹49 (50% off)' },
              { step: '4', title: 'You earn a free month', desc: '1 free month added to your account — stacks!' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">{s.title}</p>
                  <p className="text-navy-500 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards history */}
        <div className="card p-4">
          <h3 className="font-bold text-navy-900 mb-3">Rewards History</h3>
          <div className="divide-y divide-navy-100">
            {HISTORY.map((h, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-900 text-sm">{h.name}</p>
                  <p className="text-navy-400 text-xs">{h.action} · {h.date}</p>
                </div>
                {h.reward ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">{h.reward}</span>
                ) : (
                  <span className="text-xs text-navy-400">Pending upgrade</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
