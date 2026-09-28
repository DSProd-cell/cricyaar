import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase, toE164 } from '../lib/supabase'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function OtpVerify() {
  const navigate = useNavigate()
  const { pendingPhone, setUser, addToast, otpMode, proIntent, user, pendingSignup, iplTeam } = useStore()
  const [digits, setDigits]     = useState(['','','','','',''])
  const [error, setError]       = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked]     = useState(false)
  const [lockEnd, setLockEnd]   = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [loading, setLoading]   = useState(false)
  const refs = Array.from({length:6}, () => useRef(null))

  useEffect(() => {
    if (!pendingPhone && otpMode !== 'role-switch') navigate('/login')
    refs[0]?.current?.focus()
  }, [])

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Lock countdown
  useEffect(() => {
    if (!locked || !lockEnd) return
    const t = setInterval(() => {
      if (Date.now() >= lockEnd) { setLocked(false); setAttempts(0); clearInterval(t) }
    }, 1000)
    return () => clearInterval(t)
  }, [locked, lockEnd])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    setError('')
    if (val && i < 5) refs[i+1]?.current?.focus()
    if (next.every(d => d !== '') && !val) return
    if (val && i === 5) handleVerify(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i-1]?.current?.focus()
    if (e.key === 'ArrowLeft'  && i > 0) refs[i-1]?.current?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs[i+1]?.current?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      handleVerify(pasted)
    }
  }

  const handleVerify = async (code) => {
    if (locked || code.length !== 6) return
    setLoading(true)
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164(pendingPhone),
      token: code,
      type: 'sms',
    })
    setLoading(false)

    if (verifyError) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        const end = Date.now() + 10 * 60 * 1000
        setLocked(true)
        setLockEnd(end)
        setError('Too many failed attempts. Try again in 10 minutes.')
      } else {
        setError(verifyError.message || `Incorrect code. ${3 - newAttempts} attempt(s) remaining.`)
      }
      setDigits(['','','','','',''])
      refs[0]?.current?.focus()
      return
    }

    const authUser = data.user
    // The database trigger (see supabase/schema.sql) already created this
    // row the moment the auth user was first created — this just reads it.
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (otpMode === 'role-switch') {
      // Upgrade guest user with real phone → then role select with limited access
      if (!user?.phone) {
        setUser({
          id: authUser.id, phone: authUser.phone, name: profile?.name || user?.name || '',
          city: profile?.city || '', role: profile?.role || 'player',
          roles: profile?.roles?.length ? profile.roles : [profile?.role || 'player'],
          isNew: !profile?.onboarded, avatar: profile?.avatar_url || null,
          lastRoleChangedAt: profile?.last_role_changed_at || null, subscription: profile?.subscription || 'free',
          upiId: profile?.upi_id || null,
          kycStatus: profile?.kyc_status || null,
          kycVerified: profile?.kyc_status === 'approved',
          kycApprovedAt: profile?.kyc_approved_at || null,
        })
      }
      addToast('Account created! Welcome to CricYaar.', 'success')
      navigate('/')
    } else {
      const isNewUser = !profile?.onboarded
      const savedRole = localStorage.getItem('cricyaar_last_role')
      const restoredRole = profile?.role || savedRole || 'fan'

      // For new users with pending signup data, persist name immediately
      if (isNewUser && pendingSignup) {
        const profileUpdate = {
          name: pendingSignup.fullName,
          username: pendingSignup.cricketName,
        }
        if (pendingSignup.motherTongue) profileUpdate.mother_tongue = pendingSignup.motherTongue
        await supabase.from('profiles').update(profileUpdate).eq('id', authUser.id)
      }

      setUser({
        id: authUser.id, phone: authUser.phone,
        name: (isNewUser && pendingSignup) ? pendingSignup.fullName : (profile?.name || ''),
        username: (isNewUser && pendingSignup) ? pendingSignup.cricketName : (profile?.username || ''),
        city: profile?.city || '', role: profile?.role || 'player',
        roles: profile?.roles?.length ? profile.roles : [profile?.role || 'player'],
        isNew: isNewUser, avatar: profile?.avatar_url || null,
        lastRoleChangedAt: profile?.last_role_changed_at || null, subscription: profile?.subscription || 'free',
        upiId: profile?.upi_id || null,
        kycStatus: profile?.kyc_status || null,
        kycVerified: profile?.kyc_status === 'approved',
        kycApprovedAt: profile?.kyc_approved_at || null,
        playerSetupDone: profile?.player_setup_done || false,
        legacyRuns:    profile?.legacy_runs    || 0,
        legacyWickets: profile?.legacy_wickets || 0,
        legacyMatches: profile?.legacy_matches || 0,
        legacyMom:     profile?.legacy_mom     || 0,
        motherTongue:  (isNewUser && pendingSignup?.motherTongue) ? pendingSignup.motherTongue : (profile?.mother_tongue || ''),
      })
      localStorage.setItem('whats_new_seen_version', 'v3')
      // Reset referral popup so it fires after every login/signup
      sessionStorage.removeItem('cy_invite_popup_shown')
      if (isNewUser) {
        // New users: profile setup → cricket style → IPL pick → home
        // Skip RoleOnboard — everyone starts as Player, other roles unlocked via KYC+Pro
        navigate('/profile-match')
      } else if (proIntent) {
        addToast('Phone verified! Complete your Pro setup.', 'success')
        navigate('/pro-payment')
      } else {
        addToast(`Welcome back! Signed in as ${restoredRole}.`, 'success')
        // Always show IPL picker after login so user can add/change their team
        navigate('/ipl-pick', { state: { returnTo: '/' } })
      }

      // Every free login lands here — offer Pro (pay ₹1/month, or get it free
      // via referral) without blocking access. Already-Pro users and anyone
      // already headed to /pro-payment don't need the nudge.
      const renewal = profile?.pro_renewal_date || null
      const withinValidity = renewal ? new Date(renewal) > new Date() : false
      const isPro = profile?.subscription === 'pro_active' ||
        (profile?.subscription === 'pro_cancelled' && withinValidity)
      if (!isNewUser && !isPro && !proIntent) {
        useStore.getState().setShowProSheet(true)
      }
    }
  }

  const handleResend = async () => {
    setCountdown(60)
    const { error: resendError } = await supabase.auth.signInWithOtp({ phone: toE164(pendingPhone) })
    addToast(resendError ? resendError.message : 'OTP resent!', resendError ? 'error' : 'info')
  }

  const lockMinutes = lockEnd ? Math.ceil((lockEnd - Date.now()) / 60000) : 0

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader backTo="/login" showTagline />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="bg-[var(--cy-surface)] rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy-900 text-xl mb-1">Enter OTP</h2>
          <p className="text-navy-500 text-sm mb-6">
            We sent a 6-digit code to <span className="font-semibold text-navy-900">{pendingPhone}</span>
          </p>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-between mb-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={locked || loading}
                aria-label={`OTP digit ${i+1}`}
                className={`otp-input ${d ? 'filled' : ''} ${error ? 'error' : ''} ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {error && <p className="text-red-600 text-sm mt-2" role="alert">{error}</p>}

          {locked && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-700 text-sm font-medium">Account locked for ~{lockMinutes} min</p>
            </div>
          )}

          <button
            className="btn-primary w-full mt-5"
            onClick={() => handleVerify(digits.join(''))}
            disabled={digits.join('').length < 6 || locked || loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verifying…
              </span>
            ) : 'Verify OTP'}
          </button>

          {/* Resend */}
          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-navy-400">Resend OTP in <span className="font-semibold">{countdown}s</span></p>
            ) : (
              <button
                onClick={handleResend}
                className="flex items-center gap-1.5 text-brand-600 font-medium text-sm mx-auto hover:text-brand-700 transition-colors"
              >
                <RefreshCw size={14} />
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
