import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useEffect } from 'react'

// Components
import Toast           from './components/Toast'
import Sidebar         from './components/Sidebar'
import BottomNav       from './components/BottomNav'
import ProSignupSheet    from './components/ProSignupSheet'
import RoleWelcomeModal  from './components/RoleWelcomeModal'
import GlobalFAB         from './components/GlobalFAB'
import AIAssistant       from './components/AIAssistant'

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
  const { user, showProSheet, showRoleModal, setShowRoleModal } = useStore()
  const navigate   = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!user) return
    const skip = ['/whats-new','/welcome','/login','/otp','/setup','/usp','/role-warning','/role-select','/pro-payment']
    if (skip.includes(pathname) || pathname.startsWith('/score')) return
    const seen = localStorage.getItem('whats_new_seen_version')
    if (seen !== 'v3') {
      // Suppress role modal while WhatsNew is showing — it'll appear after dismissal on home
      setShowRoleModal(false)
      navigate('/whats-new', { replace: true })
    }
  }, [user, pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {children}
      {showProSheet && <ProSignupSheet />}
      {/* Don't show role modal while WhatsNew is open — it would overlay the screen */}
      {showRoleModal && pathname !== '/whats-new' && <RoleWelcomeModal />}
      {/* Global quick-action FAB — shown on all authenticated pages */}
      <GlobalFAB />
      {/* Global AI Assistant — shown on all authenticated pages */}
      <AIAssistant />
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
