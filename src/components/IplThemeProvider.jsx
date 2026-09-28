import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { getTeamById, DEFAULT_THEME } from '../lib/iplTeams'

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lightenHex(hex, amount) {
  const h = hex.replace('#', '')
  const r = Math.min(255, parseInt(h.slice(0, 2), 16) + Math.round(255 * amount))
  const g = Math.min(255, parseInt(h.slice(2, 4), 16) + Math.round(255 * amount))
  const b = Math.min(255, parseInt(h.slice(4, 6), 16) + Math.round(255 * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// CSS vars set by the surface theme — cleared when no team is active
const SURFACE_OVERRIDE_VARS = [
  '--cy-bg', '--cy-surface', '--cy-subtle', '--cy-input-bg',
  '--cy-border', '--cy-text', '--cy-muted',
  '--cy-topbar-bg', '--cy-topbar-text',
  '--cy-nav-bg', '--cy-nav-border', '--cy-nav-shadow',
  '--cy-navy-900', '--cy-navy-800', '--cy-navy-700', '--cy-navy-600',
  '--cy-navy-500', '--cy-navy-400', '--cy-navy-300', '--cy-navy-200',
  '--cy-navy-100', '--cy-navy-50',
  '--cy-slate-900', '--cy-slate-800', '--cy-slate-700', '--cy-slate-600',
  '--cy-slate-500', '--cy-slate-400', '--cy-slate-300', '--cy-slate-200',
  '--cy-slate-100', '--cy-slate-50',
]

const DARK_NAVY = {
  900: '#f1f5f9', 800: '#e2e8f0', 700: '#cbd5e1',
  600: '#94a3b8', 500: '#94a3b8', 400: '#64748b',
  300: '#475569', 200: '#334155', 100: '#1e293b', 50: '#0f172a',
}

export default function IplThemeProvider({ children }) {
  const iplTeam = useStore(s => s.iplTeam)

  useEffect(() => {
    const team = iplTeam ? getTeamById(iplTeam) : null
    const t = team || DEFAULT_THEME
    const root = document.documentElement

    // Always set the accent/glow vars
    root.style.setProperty('--cy-primary',        t.primary)
    root.style.setProperty('--cy-secondary',      t.secondary)
    root.style.setProperty('--cy-secondary-50',   hexToRgba(t.secondary, 0.5))
    root.style.setProperty('--cy-bg-start',       t.darkBg)
    root.style.setProperty('--cy-bg-mid',         t.midBg)
    root.style.setProperty('--cy-glow',           t.glow)
    root.style.setProperty('--cy-glow2',          t.secondaryGlow)
    root.style.setProperty('--cy-gradient',       t.gradient)
    root.style.setProperty('--cy-on-primary',     t.textOnPrimary || '#ffffff')

    if (team) {
      // Option A: full surface theme — every background follows the team's palette.
      // midBg values are very dark so we lighten cards significantly for readability.
      const cardBg  = lightenHex(t.midBg,  0.15) // card surface — clearly brighter than bg
      const subtleBg = lightenHex(t.midBg, 0.08) // subtle rows/pills

      root.style.setProperty('--cy-bg',          t.darkBg)
      root.style.setProperty('--cy-surface',     cardBg)
      root.style.setProperty('--cy-subtle',      subtleBg)
      root.style.setProperty('--cy-input-bg',    lightenHex(t.darkBg, 0.05))
      root.style.setProperty('--cy-border',      hexToRgba(t.primary, 0.30))
      root.style.setProperty('--cy-text',        '#f1f5f9')
      // Always use a reliable light gray for muted text — never the team secondary,
      // which can be near-black (CSK: #1A2F5F, SRH: #1A1A1A) and unreadable on dark.
      root.style.setProperty('--cy-muted',       '#94a3b8')

      // TopBar: solid primary color header
      root.style.setProperty('--cy-topbar-bg',   t.primary)
      root.style.setProperty('--cy-topbar-text', t.textOnPrimary || '#ffffff')

      // Bottom nav: dark base with team accent border
      root.style.setProperty('--cy-nav-bg',      hexToRgba(t.darkBg, 0.96))
      root.style.setProperty('--cy-nav-border',  hexToRgba(t.primary, 0.30))
      root.style.setProperty('--cy-nav-shadow',
        `0 6px 32px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.45), inset 0 1px 0 ${hexToRgba(t.secondary, 0.08)}`)

      // Flip navy/slate ramps to light values (same as dark mode)
      for (const [stop, val] of Object.entries(DARK_NAVY)) {
        root.style.setProperty(`--cy-navy-${stop}`,  val)
        root.style.setProperty(`--cy-slate-${stop}`, val)
      }
    } else {
      // No team selected — remove all surface overrides so CSS media queries take over
      SURFACE_OVERRIDE_VARS.forEach(v => root.style.removeProperty(v))
    }
  }, [iplTeam])

  return children
}
