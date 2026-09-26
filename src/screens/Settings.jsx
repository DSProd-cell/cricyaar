import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import TopBar from '../components/TopBar'
import { LEGAL_URL } from '../lib/constants'
import { Bell, Globe, Shield, Info, Sparkles, Phone } from 'lucide-react'
import { useState } from 'react'

export default function Settings() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()
  const [pushNotifs, setPushNotifs] = useState(true)

  const ROWS = [
    {
      icon: Bell,
      label: 'Push notifications',
      desc: pushNotifs ? 'On' : 'Off',
      action: () => setPushNotifs(p => !p),
      toggle: true,
      value: pushNotifs,
    },
    {
      icon: Phone,
      label: 'Change phone number',
      desc: user?.phone || '+91 —',
      action: () => addToast('OTP flow would open here', 'info'),
    },
    {
      icon: Globe,
      label: 'Language',
      desc: 'English (India)',
      action: () => {},
    },
    {
      icon: Shield,
      label: 'Privacy & data',
      desc: '',
      action: () => window.open(`${LEGAL_URL}#privacy`, '_blank', 'noopener,noreferrer'),
    },
    {
      icon: Info,
      label: 'About CricYaar',
      desc: 'v1.0.0 — Demo build',
      action: () => {},
    },
  ]

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Settings" showBack />

      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3 px-1">App preferences</p>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
          {ROWS.map((row, i) => {
            const Icon = row.icon
            return (
              <button
                key={i}
                onClick={row.action}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm">{row.label}</p>
                  {row.desc && <p className="text-navy-400 text-xs mt-0.5">{row.desc}</p>}
                </div>
                {row.toggle ? (
                  <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${row.value ? 'bg-brand-500' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${row.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-300 flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => navigate('/whats-new')}
          className="flex items-center justify-center gap-1.5 mt-6 mx-auto text-navy-400 text-xs hover:text-brand-500 transition-colors"
        >
          <Sparkles size={12} />
          What's New in v3
        </button>
      </main>
    </div>
  )
}
