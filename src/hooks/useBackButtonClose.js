import { useEffect, useRef } from 'react'

// A simple stack of "how to close the topmost open overlay" callbacks —
// not React state, since nothing needs to re-render off of it, App.jsx's
// back-button handler just reads it at press-time.
//
// Deliberately NOT built on window.history.pushState/popstate: that seems
// like the obvious approach, but it races badly with React 18 StrictMode's
// dev-only mount→cleanup→mount dance — the synthetic cleanup's history.back()
// and the remount's new popstate listener can interleave so the overlay
// closes itself immediately after opening. A plain stack sidesteps that
// entirely (push/pop/push nets out to the same single entry, safe under
// double-invoke) and doesn't need real browser history anyway — the
// Capacitor hardware back button isn't a browser back/forward gesture.
const overlayStack = []

/** Registers `onClose` as how to dismiss the current full-screen overlay
 * while it's mounted — call unconditionally near the top of the overlay
 * component, passing the same handler already wired to its "X"/cancel
 * button. The global back-button handler (App.jsx) checks this stack first,
 * before falling through to route navigation / exiting the app. */
export function useBackButtonClose(onClose) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const entry = { close: () => onCloseRef.current() }
    overlayStack.push(entry)
    return () => {
      const idx = overlayStack.indexOf(entry)
      if (idx !== -1) overlayStack.splice(idx, 1)
    }
  }, [])
}

/** Closes the topmost registered overlay, if any. Returns true if it did
 * (so the caller knows not to fall through to other back-button handling). */
export function closeTopOverlay() {
  if (overlayStack.length === 0) return false
  overlayStack[overlayStack.length - 1].close()
  return true
}
