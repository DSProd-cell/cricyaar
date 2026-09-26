import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { getTeamById, DEFAULT_THEME } from '../lib/iplTeams'

export default function IplThemeProvider({ children }) {
  const iplTeam = useStore(s => s.iplTeam)

  useEffect(() => {
    const team = iplTeam ? getTeamById(iplTeam) : null
    const t = team || DEFAULT_THEME
    const root = document.documentElement
    root.style.setProperty('--cy-primary',    t.primary)
    root.style.setProperty('--cy-secondary',  t.secondary)
    root.style.setProperty('--cy-bg-start',   t.darkBg)
    root.style.setProperty('--cy-bg-mid',     t.midBg)
    root.style.setProperty('--cy-glow',       t.glow)
    root.style.setProperty('--cy-glow2',      t.secondaryGlow)
    root.style.setProperty('--cy-gradient',   t.gradient)
    // Per-team readable text color for anything filled with --cy-primary —
    // most teams' primary is dark enough for white text, but e.g. CSK's
    // bright yellow needs dark text instead.
    root.style.setProperty('--cy-on-primary', t.textOnPrimary || '#ffffff')
  }, [iplTeam])

  return children
}
