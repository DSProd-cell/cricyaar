// Central role color map — used by TopBar, BottomNav, Profile, and any role-aware component.
export const ROLE_COLORS = {
  fan:          { primary: '#64748b', light: '#f8fafc', border: '#e2e8f0', emoji: '📣', label: 'Fan',         gradientFrom: '#475569', gradientTo: '#94a3b8' },
  player:       { primary: '#ea580c', light: '#fff7ed', border: '#fed7aa', emoji: '🏏', label: 'Player',      gradientFrom: '#c2410c', gradientTo: '#fb923c' },
  organiser:    { primary: '#1a5c38', light: '#f0fdf4', border: '#bbf7d0', emoji: '📋', label: 'Organiser',   gradientFrom: '#0d3d26', gradientTo: '#2d9b60' },
  umpire:       { primary: '#16a34a', light: '#dcfce7', border: '#86efac', emoji: '⚖️', label: 'Umpire',      gradientFrom: '#15803d', gradientTo: '#4ade80' },
  ground_owner: { primary: '#2563eb', light: '#eff6ff', border: '#bfdbfe', emoji: '🏟️', label: 'Ground Owner', gradientFrom: '#1d4ed8', gradientTo: '#60a5fa' },
}

export function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.fan
}

// Roles that can collect money (need payment features)
export const CAN_COLLECT = ['organiser', 'umpire', 'ground_owner']

// Roles that need Aadhaar KYC (collect money + identity critical)
export const NEEDS_AADHAAR = ['organiser', 'umpire', 'ground_owner']
