import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Plus, X, LogOut, RefreshCw, Headphones, User } from 'lucide-react'

const SKIP_PATHS = ['/welcome', '/login', '/otp', '/setup', '/usp', '/role-warning', '/role-select', '/whats-new', '/pro-payment']

const ITEMS = [
  {
    icon: User,
    label: 'My Profile',
    color: '#22c55e',
    bg: '#dcfce7',
    key: 'profile',
  },
  {
    icon: RefreshCw,
    label: 'Change Role',
    color: '#6366f1',
    bg: '#eef2ff',
    key: 'role',
  },
  {
    icon: Headphones,
    label: 'Quick Support',
    color: '#f59e0b',
    bg: '#fef3c7',
    key: 'support',
  },
  {
    icon: LogOut,
    label: 'Log Out',
    color: '#ef4444',
    bg: '#fee2e2',
    key: 'logout',
  },
]

export default function GlobalFAB() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, setUser, addToast } = useStore()
  const [open, setOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  // Don't show on auth/onboarding screens or if not logged in
  if (!user) return null
  if (SKIP_PATHS.includes(pathname)) return null
  if (pathname.startsWith('/score')) return null

  const handleAction = (key) => {
    setOpen(false)
    switch (key) {
      case 'profile':
        navigate('/profile')
        break
      case 'role':
        navigate('/role-select')
        break
      case 'support':
        window.open('https://wa.me/919876543210?text=Hi+CricYaar+support%2C+I+need+help+with+the+app', '_blank')
        break
      case 'logout':
        setConfirmLogout(true)
        break
    }
  }

  const handleLogout = () => {
    setUser(null)
    setConfirmLogout(false)
    addToast('Logged out successfully', 'info')
    navigate('/usp')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[55]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB container — right side, above AI chat button */}
      <div className="fixed bottom-[152px] right-4 z-[60] flex flex-col items-end gap-2">

        {/* Action pills */}
        {open && (
          <div className="flex flex-col items-end gap-2 animate-slide-up">
            {ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => handleAction(item.key)}
                className="flex items-center gap-2.5 rounded-full pl-3 pr-2 py-1.5 shadow-lg font-semibold text-sm transition-all active:scale-95 whitespace-nowrap"
                style={{ background: '#fff', border: '1.5px solid #e2e8f0' }}
              >
                <span className="text-navy-800">{item.label}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}
                >
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
          style={{
            background: open
              ? '#0f172a'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            boxShadow: '0 4px 16px rgba(15,23,42,0.30)',
          }}
          aria-label="Quick actions"
        >
          {open
            ? <X size={20} className="text-white" />
            : <Plus size={20} className="text-white" />
          }
        </button>
      </div>

      {/* Logout confirmation dialog */}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-6"
          onClick={() => setConfirmLogout(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-navy-900 text-lg text-center mb-1">Log out?</h3>
            <p className="text-navy-500 text-sm text-center mb-5 leading-relaxed">
              You'll need to verify your phone number again to log back in.
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-colors"
                style={{ background: '#ef4444' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
