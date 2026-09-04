import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { registerPush } from './lib/push'
import { closeTopOverlay } from './hooks/useBackButtonClose'

// Components
import Toast           from './components/Toast'
import Sidebar         from './components/Sidebar'
import BottomNav       from './components/BottomNav'
import ProSignupSheet    from './components/ProSignupSheet'
import RoleWelcomeModal  from './components/RoleWelcomeModal'

// Screens — auth / onboarding
import USPScreen      from './screens/USPScreen'
import Welcome        from './screens/Welcome'
import Login          from './screens/Login'
import OtpVerify      from './screens/OtpVerify'
import ProfileSetup   from './screens/ProfileSetup'
import ProPayment     from './screens/ProPayment'

// Screens — main app
import Home           from './screens/Home'
import MyCricket      from './screens/MyCricket'
import Scoring        from './screens/Scoring'
import LiveMatch      from './screens/LiveMatch'
import GroundSearch   from './screens/GroundSearch'
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
import CricHeroesImport  from './screens/CricHeroesImport'
import CreateTournament  from './screens/CreateTournament'

// Screens — CricYaar master PRD
import GroundBooking       from './screens/GroundBooking'
import OpponentFinder      from './screens/OpponentFinder'
import EarningsDashboard   from './screens/EarningsDashboard'
import AadhaarVerification from './screens/AadhaarVerification'
import InviteEarn          from './screens/InviteEarn'
import GroundOwnerDashboard from './screens/GroundOwnerDashboard'

function AuthGuard({ children }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/usp" replace />
  return children
}

function WhatsNewGate({ children }) {
  const { user, showProSheet, showRoleModal } = useStore()
  const { pathname } = useLocation()

  // Auto-mark whats-new as seen so it never blocks the landing page / home screen.
  // The /whats-new route still exists and can be linked from Settings.
  useEffect(() => {
    if (!localStorage.getItem('whats_new_seen_version')) {
      localStorage.setItem('whats_new_seen_version', 'v3')
    }
  }, [])

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
      {/* FloatingActions (AI guide + quick actions) is parked for a future
          release — not wired to real functionality yet, so it's not shown. */}
    </>
  )
}

function AppShell({ children }) {
  const { pathname } = useLocation()
  const { user } = useStore()

  const noShell = ['/welcome','/login','/otp','/setup','/role-warning','/role-select','/whats-new','/usp','/pro-payment'].includes(pathname)
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
      <Toast />
      <WhatsNewGate>
      <AppShell>
        <Routes>
          {/* USP + auth */}
          <Route path="/usp"     element={<USPScreen />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/otp"         element={<OtpVerify />} />
          <Route path="/setup"       element={<ProfileSetup />} />
          <Route path="/pro-payment" element={<AuthGuard><ProPayment /></AuthGuard>} />

          {/* Main app */}
          <Route path="/"               element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/my-cricket"     element={<AuthGuard><MyCricket /></AuthGuard>} />
          <Route path="/score/:matchId" element={<AuthGuard><Scoring /></AuthGuard>} />
          <Route path="/live/:id"       element={<AuthGuard><LiveMatch /></AuthGuard>} />
          <Route path="/score"          element={<AuthGuard><Scoring /></AuthGuard>} />
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
          <Route path="/cricheros-import"    element={<AuthGuard><CricHeroesImport /></AuthGuard>} />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      </WhatsNewGate>
    </BrowserRouter>
  )
}
