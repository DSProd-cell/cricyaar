import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { registerPush } from './lib/push'
import { closeTopOverlay } from './hooks/useBackButtonClose'

// Components
import Toast            from './components/Toast'
import Sidebar         from './components/Sidebar'
import BottomNav       from './components/BottomNav'
import ProSignupSheet    from './components/ProSignupSheet'
import RoleWelcomeModal  from './components/RoleWelcomeModal'
import SplashOverlay, { resetSplash } from './components/SplashOverlay'
import IplThemeProvider from './components/IplThemeProvider'
import AIAssistant       from './components/AIAssistant'
import { ShareAchievementSheet } from './components/ShareAchievement'
import InviteOnOpenSheet from './components/InviteOnOpenSheet'
import { supabase }    from './lib/supabase'

// Screens — auth / onboarding
import Welcome        from './screens/Welcome'
import ProfileMatch   from './screens/ProfileMatch'
import CitySelect     from './screens/CitySelect'
import Login          from './screens/Login'
import OtpVerify      from './screens/OtpVerify'
import ProfileSetup   from './screens/ProfileSetup'
import Celebration    from './screens/Celebration'
import PlayerMatch    from './screens/PlayerMatch'
import RoleOnboard    from './screens/RoleOnboard'
import PlayerSetup    from './screens/PlayerSetup'
import ProPayment     from './screens/ProPayment'

// Screens — main app
import Home           from './screens/Home'
import MyCricket      from './screens/MyCricket'
import Scoring        from './screens/Scoring'
import LiveMatch      from './screens/LiveMatch'
import GroundSearch      from './screens/GroundSearch'
import UniversalSearch   from './screens/UniversalSearch'
import GroundDetail   from './screens/GroundDetail'
import Teams          from './screens/Teams'
import TeamProfile    from './screens/TeamProfile'
import Tournament     from './screens/Tournament'
import PlayerProfile  from './screens/PlayerProfile'
import Notifications  from './screens/Notifications'
import Settings       from './screens/Settings'
import RoleWarning    from './screens/RoleWarning'
import RoleSelect     from './screens/RoleSelect'
import UmpireProfile  from './screens/UmpireProfile'

// Screens — v2+
import CricYaarPro       from './screens/CricYaarPro'
import OrganiserInbox    from './screens/OrganiserInbox'
import BrowseOpenMatches from './screens/BrowseOpenMatches'
import OpenTournaments   from './screens/OpenTournaments'
import MyTournaments     from './screens/MyTournaments'

// Screens — v3
import WhatIsNew         from './screens/WhatIsNew'
import CreateTournament  from './screens/CreateTournament'

// Screens — CricYaar master PRD
import GroundBooking       from './screens/GroundBooking'
import OpponentFinder      from './screens/OpponentFinder'
import EarningsDashboard   from './screens/EarningsDashboard'
import AadhaarVerification from './screens/AadhaarVerification'
import InviteEarn          from './screens/InviteEarn'
import IplTeamPicker       from './screens/IplTeamPicker'
import GroundOwnerDashboard from './screens/GroundOwnerDashboard'
import SendMoney       from './screens/SendMoney'
import ReceiveMoney    from './screens/ReceiveMoney'
import FetchPastRecord from './screens/FetchPastRecord'
import YareinWelcome   from './screens/YareinWelcome'
import AdminKyc        from './screens/AdminKyc'

function AuthGuard({ children }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/welcome" replace />
  return children
}

function WhatsNewGate({ children }) {
  const { user, showProSheet, showRoleModal, showShareSheet, shareData, dismissShare } = useStore()
  const { pathname } = useLocation()

  // Auto-mark whats-new as seen so it never blocks the landing page / home screen.
  useEffect(() => {
    if (!localStorage.getItem('whats_new_seen_version')) {
      localStorage.setItem('whats_new_seen_version', 'v3')
    }
  }, [])

  // Theme: respect user preference, fall back to time-based auto
  const themeMode = useStore(s => s.themeMode) || 'auto'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      if (themeMode === 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
      } else if (themeMode === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        // Auto: follow the OS/system dark-mode setting
        document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      }
    }

    applyTheme()
    if (themeMode !== 'auto') return

    // Re-apply whenever the system setting changes (e.g. scheduled dark mode)
    mq.addEventListener('change', applyTheme)
    return () => mq.removeEventListener('change', applyTheme)
  }, [themeMode])

  // ── 30-day session persistence ─────────────────────────────────────────────
  // On every app open: stamp last_active, sign out if inactive >30 days,
  // restore Zustand user from Supabase session if page was hard-refreshed.
  useEffect(() => {
    const now = Date.now()
    const lastActive = localStorage.getItem('cy_last_active')
    const { setUser: _setUser, logout } = useStore.getState()

    if (lastActive) {
      const daysSince = (now - parseInt(lastActive, 10)) / 86400000
      if (daysSince > 30) {
        logout()
        return
      }
    }
    localStorage.setItem('cy_last_active', String(now))

    // Restore user if Zustand lost it (e.g. hard refresh cleared memory)
    // but Supabase still has a valid session in localStorage.
    // NOTE: We intentionally do NOT call logout() when there is no Supabase
    // session — Zustand state persists across sessions and the 30-day
    // cy_last_active check above is the only auto-logout gate.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const storeUser = useStore.getState().user
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            if (!profile) return
            const prevKycStatus = storeUser?.kycStatus
            _setUser({
              id: session.user.id,
              phone: session.user.phone,
              name: profile.name || '',
              username: profile.username || '',
              city: profile.city || '',
              role: profile.role || 'fan',
              roles: profile.roles?.length ? profile.roles : [profile.role || 'player'],
              isNew: !profile.onboarded,
              avatar: profile.avatar_url || null,
              subscription: profile.subscription || 'free',
              kycVerified: profile.kyc_status === 'approved',
              kycStatus: profile.kyc_status || null,
              kycApprovedAt: profile.kyc_approved_at || null,
              groundOwnerVerified: profile.ground_owner_verified || false,
              playerSetupDone: profile.player_setup_done || false,
            })
            // Notify user if KYC was just approved since last session
            if (prevKycStatus === 'pending' && profile.kyc_status === 'approved') {
              setTimeout(() => useStore.getState().addToast('🎉 KYC has been verified', 'success'), 1500)
            }
          })
      }
    })

    // Keep last_active fresh whenever Supabase auto-refreshes the JWT
    // SIGNED_OUT: only clear Zustand state — don't call logout() which would re-trigger signOut()
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') {
        localStorage.setItem('cy_last_active', String(Date.now()))
      }
      if (event === 'SIGNED_OUT') {
        const { user: storeUser } = useStore.getState()
        if (storeUser) {
          useStore.setState({ user: null, isAuthenticated: false })
        }
        resetSplash()
      }
    })
    return () => authSub.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (user?.id) registerPush(user.id) }, [user?.id])

  // Re-check push registration whenever the app comes back to the foreground —
  // covers the case where the user grants the notification permission from
  // system Settings mid-session instead of the in-app prompt.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive && user?.id) registerPush(user.id)
    })
    return () => { sub.remove() }
  }, [user?.id])

  // Android hardware back button.
  //  1. An open overlay (MatchConfigScreen, TossModal, etc. — see
  //     useBackButtonClose) always gets first claim: close just that overlay.
  //  2. Otherwise step back through in-app route history.
  //  3. At the true root (Home, or the pre-login screens, with nothing left
  //     to pop) — require a second press within 2s to actually exit, same as
  //     most native apps, instead of exiting on the first tap. Home is still
  //     a hard floor for *route* history: it won't walk back into the
  //     pre-login welcome/login/OTP screens sitting behind it. To switch
  //     accounts, log out instead.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let lastBackPress = 0
    const sub = CapApp.addListener('backButton', () => {
      if (closeTopOverlay()) return
      const atHome = window.location.pathname === '/'
      if (!atHome && window.history.state && window.history.state.idx > 0) {
        window.history.back()
        return
      }
      const now = Date.now()
      if (now - lastBackPress < 2000) {
        CapApp.exitApp()
        return
      }
      lastBackPress = now
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
      useStore.getState().addToast('Press back again to exit', 'info')
    })
    return () => { sub.remove() }
  }, [])

  return (
    <>
      {children}
      {showProSheet && <ProSignupSheet />}
      {showRoleModal && pathname !== '/whats-new' && <RoleWelcomeModal />}
      <AIAssistant />
      <GlobalShareSheet />
      <InviteOnOpenSheet />
    </>
  )
}

function GlobalShareSheet() {
  const { showShareSheet, shareData, dismissShare } = useStore()
  if (!showShareSheet || !shareData) return null
  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" onClick={dismissShare}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative" onClick={e => e.stopPropagation()}>
        <ShareAchievementSheet {...shareData} onClose={dismissShare} />
      </div>
    </div>
  )
}

function AppShell({ children }) {
  const { pathname } = useLocation()
  const { user } = useStore()

  const noShell = [
    '/welcome','/login','/otp','/setup','/role-warning','/role-select',
    '/whats-new','/pro-payment','/celebration','/player-match',
    '/role-onboard','/player-setup','/city-select','/profile-match','/ipl-pick',
  ].includes(pathname)
    || pathname.startsWith('/score')
    || pathname.startsWith('/ground-booking')
    || pathname === '/aadhaar-verify'

  const isFanHome = pathname === '/' && user?.role === 'fan'

  if (noShell || isFanHome) return children

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        {children}
        <BottomNav />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <IplThemeProvider>
      <Toast />
      <SplashOverlay />
      <div className="mobile-border-left" aria-hidden="true" />
      <div className="mobile-border-right" aria-hidden="true" />
      <WhatsNewGate>
      <AppShell>
        <Routes>
          {/* Landing + auth */}
          <Route path="/landing"       element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome"       element={<Welcome />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/otp"           element={<OtpVerify />} />
          <Route path="/setup"         element={<ProfileSetup />} />
          <Route path="/profile-match" element={<ProfileMatch />} />
          <Route path="/celebration"   element={<Celebration />} />
          <Route path="/city-select"   element={<CitySelect />} />
          <Route path="/player-match"  element={<PlayerMatch />} />
          <Route path="/role-onboard"  element={<RoleOnboard />} />
          <Route path="/player-setup"  element={<PlayerSetup />} />
          <Route path="/pro-payment"   element={<AuthGuard><ProPayment /></AuthGuard>} />

          {/* Main app */}
          <Route path="/"               element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/my-cricket"     element={<AuthGuard><MyCricket /></AuthGuard>} />
          <Route path="/score/:matchId" element={<AuthGuard><Scoring /></AuthGuard>} />
          <Route path="/live/:id"       element={<AuthGuard><LiveMatch /></AuthGuard>} />
          <Route path="/score"          element={<AuthGuard><Scoring /></AuthGuard>} />
          <Route path="/search"         element={<AuthGuard><UniversalSearch /></AuthGuard>} />
          <Route path="/grounds"        element={<AuthGuard><GroundSearch /></AuthGuard>} />
          <Route path="/grounds/:id"    element={<AuthGuard><GroundDetail /></AuthGuard>} />
          <Route path="/teams"          element={<AuthGuard><Teams /></AuthGuard>} />
          <Route path="/teams/:id"      element={<AuthGuard><TeamProfile /></AuthGuard>} />
          <Route path="/tournaments/:id" element={<AuthGuard><Tournament /></AuthGuard>} />
          <Route path="/profile"        element={<AuthGuard><PlayerProfile /></AuthGuard>} />
          <Route path="/notifications"  element={<AuthGuard><Notifications /></AuthGuard>} />
          <Route path="/settings"       element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/role-warning"   element={<AuthGuard><RoleWarning /></AuthGuard>} />
          <Route path="/role-select"    element={<AuthGuard><RoleSelect /></AuthGuard>} />
          <Route path="/umpire-profile" element={<AuthGuard><UmpireProfile /></AuthGuard>} />

          {/* v2 */}
          <Route path="/pro"              element={<AuthGuard><CricYaarPro /></AuthGuard>} />
          <Route path="/organiser-inbox"  element={<AuthGuard><OrganiserInbox /></AuthGuard>} />
          <Route path="/browse-matches"   element={<AuthGuard><BrowseOpenMatches /></AuthGuard>} />
          <Route path="/open-tournaments"  element={<AuthGuard><OpenTournaments /></AuthGuard>} />
          <Route path="/my-tournaments"   element={<AuthGuard><MyTournaments /></AuthGuard>} />

          {/* v3 */}
          <Route path="/whats-new"           element={<WhatIsNew />} />
          <Route path="/create-tournament"   element={<AuthGuard><CreateTournament /></AuthGuard>} />
          <Route path="/profile/:playerId"   element={<AuthGuard><PlayerProfile /></AuthGuard>} />

          {/* CricYaar master PRD */}
          <Route path="/ground-booking"      element={<AuthGuard><GroundBooking /></AuthGuard>} />
          <Route path="/ground-booking/:id"  element={<AuthGuard><GroundBooking /></AuthGuard>} />
          <Route path="/opponent-finder"     element={<AuthGuard><OpponentFinder /></AuthGuard>} />
          <Route path="/earnings"            element={<AuthGuard><EarningsDashboard /></AuthGuard>} />
          <Route path="/aadhaar-verify"      element={<AuthGuard><AadhaarVerification /></AuthGuard>} />
          <Route path="/invite"              element={<AuthGuard><InviteEarn /></AuthGuard>} />
          <Route path="/ground-owner"        element={<AuthGuard><GroundOwnerDashboard /></AuthGuard>} />
          <Route path="/send-money"          element={<AuthGuard><SendMoney /></AuthGuard>} />
          <Route path="/receive-money"       element={<AuthGuard><ReceiveMoney /></AuthGuard>} />

          {/* IPL Team Picker */}
          <Route path="/ipl-pick"          element={<IplTeamPicker />} />
          <Route path="/fetch-past-record" element={<AuthGuard><FetchPastRecord /></AuthGuard>} />
          <Route path="/yarein-welcome"    element={<AuthGuard><YareinWelcome /></AuthGuard>} />

          {/* Admin */}
          <Route path="/admin/kyc" element={<AuthGuard><AdminKyc /></AuthGuard>} />

          {/* Legacy redirect */}
          <Route path="/usp" element={<Navigate to="/welcome" replace />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      </WhatsNewGate>
      </IplThemeProvider>
    </BrowserRouter>
  )
}
