export const ROLE_COLORS = {
  fan: {
    primary: '#64748b', light: '#f8fafc', border: '#e2e8f0',
    emoji: '📣', label: 'Fan',
    gradientFrom: '#475569', gradientTo: '#94a3b8',
    shellBg: '#1e293b', shellBgLight: '#334155',
    navActiveBg: 'rgba(100,116,139,0.15)',
  },
  player: {
    primary: '#7C3AED', light: '#F5F3FF', border: '#C4B5FD',
    emoji: '🏏', label: 'Player',
    gradientFrom: '#5B21B6', gradientTo: '#A78BFA',
    shellBg: '#1e1030', shellBgLight: '#3b1f6b',
    navActiveBg: 'rgba(124,58,237,0.15)',
  },
  organiser: {
    primary: '#1a5c38', light: '#f0fdf4', border: '#bbf7d0',
    emoji: '📋', label: 'Organiser',
    gradientFrom: '#0d3d26', gradientTo: '#2d9b60',
    shellBg: '#052e16', shellBgLight: '#166534',
    navActiveBg: 'rgba(26,92,56,0.15)',
  },
  umpire: {
    primary: '#16a34a', light: '#dcfce7', border: '#86efac',
    emoji: '⚖️', label: 'Umpire',
    gradientFrom: '#15803d', gradientTo: '#4ade80',
    shellBg: '#052e16', shellBgLight: '#14532d',
    navActiveBg: 'rgba(22,163,74,0.15)',
  },
  ground_owner: {
    primary: '#2563eb', light: '#eff6ff', border: '#bfdbfe',
    emoji: '🏟️', label: 'Ground Owner',
    gradientFrom: '#1d4ed8', gradientTo: '#60a5fa',
    shellBg: '#0f172a', shellBgLight: '#1e3a5f',
    navActiveBg: 'rgba(37,99,235,0.15)',
  },
}

export function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.fan
}

export const CAN_COLLECT  = ['organiser', 'umpire', 'ground_owner']
export const NEEDS_AADHAAR = ['organiser', 'umpire', 'ground_owner']
