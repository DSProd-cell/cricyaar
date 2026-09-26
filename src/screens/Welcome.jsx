import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Welcome() {
  const { user, showSplash, setShowSplash } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) { navigate('/', { replace: true }); return }
    // This screen renders nothing on its own — SplashOverlay (mounted at the
    // App root) is what actually shows the logo/CTAs here. Reaching /welcome
    // any way other than a fresh app load (browser/hardware back after
    // Sign Up or Log In, e.g.) left showSplash already false from the first
    // dismiss, so nothing appeared and the screen looked frozen/broken.
    if (!showSplash) setShowSplash(true)
  }, [user, showSplash]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0a0118 0%, #120520 55%, #07021a 100%)' }} />
  )
}
