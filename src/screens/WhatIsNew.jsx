import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Bot, Target, BarChart2, MapPin, Crown, Users, CheckCircle, AlertCircle } from 'lucide-react'

const NEW_FEATURES = [
  { icon: Bot,        color: '#10b981', bg: '#d1fae5', title: 'AI Ground Assistant',              desc: 'Ask "best turf ground in Bengaluru with floodlights" and get instant answers.' },
  { icon: Target,     color: '#ef4444', bg: '#fee2e2', title: 'Assigned Scorer',                   desc: 'Organiser designates one scorer per match — only they can access live scoring.' },
  { icon: BarChart2,  color: '#6366f1', bg: '#e0e7ff', title: 'CricHeroes Import',                 desc: 'Bring your match history and stats from CricHeroes (import screen live; sync in v4).' },
  { icon: MapPin,     color: '#f59e0b', bg: '#fef3c7', title: 'Ground Directions',                 desc: 'Tap "Get Directions" on any ground to open Google Maps navigation instantly.' },
  { icon: Users,      color: '#8b5cf6', bg: '#ede9fe', title: 'Browse Open Teams & Tournaments',   desc: 'Players can find open teams and register as free agents in tournaments without a code.' },
  { icon: Crown,      color: '#d97706', bg: '#fef9c3', title: 'Captain Powers',                    desc: 'Captains manage squad, set team visibility Open/Invite Only, and handle join requests.' },
]

const FIXES = [
  'OTP resend timer not resetting correctly on some Android devices',
  'Points table NRR calculation rounding error for DLS matches',
  'Ground listing photos failing to upload on iOS Safari',
  'Role switch flow crashing when user had no city set on their profile',
]

export default function WhatIsNew() {
  const navigate = useNavigate()
  const { user } = useStore()

  const handleDismiss = () => {
    localStorage.setItem('whats_new_seen_version', 'v3')
    // Authenticated users go home; unauthenticated go to USP screen
    navigate(user ? '/' : '/usp', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="pt-10 px-6 pb-4 text-center">
        <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
          <span className="text-white font-black text-lg">CY</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 mb-3">
          <span className="text-brand-600 font-bold text-sm">What's new in v3</span>
        </div>
        <p className="text-navy-400 text-sm">Released May 2026</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">

        {/* New features */}
        <h2 className="font-bold text-navy-900 text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-500 rounded-full flex-shrink-0" />
          New Features
        </h2>
        <div className="space-y-3 mb-6">
          {NEW_FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">{title}</p>
                <p className="text-navy-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fixes */}
        <h2 className="font-bold text-navy-900 text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-slate-300 rounded-full flex-shrink-0" />
          Bug Fixes
        </h2>
        <div className="space-y-2.5 mb-8">
          {FIXES.map((fix, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <CheckCircle size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-navy-500 text-sm leading-relaxed">Fixed: {fix}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-3 border-t border-slate-100">
        <button
          onClick={handleDismiss}
          className="btn-primary w-full py-4 text-base gap-2"
        >
          Got it — let's play 🏏
        </button>
      </div>
    </div>
  )
}
