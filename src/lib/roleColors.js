// Central role color map — used by TopBar, BottomNav, Profile, and any role-aware component.
export const ROLE_COLORS = {
  fan:          { primary: '#0891b2', light: '#ecfeff', border: '#a5f3fc', emoji: '📣', label: 'Fan' },
  player:       { primary: '#16a34a', light: '#f0fdf4', border: '#86efac', emoji: '🏏', label: 'Player' },
  organiser:    { primary: '#2563eb', light: '#eff6ff', border: '#93c5fd', emoji: '📋', label: 'Organiser' },
  umpire:       { primary: '#d97706', light: '#fffbeb', border: '#fcd34d', emoji: '⚖️', label: 'Umpire' },
  ground_owner: { primary: '#7c3aed', light: '#f5f3ff', border: '#c4b5fd', emoji: '🏟️', label: 'Ground Owner' },
}

export function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.fan
}

// Roles that can collect money (need payment features)
export const CAN_COLLECT = ['organiser', 'umpire', 'ground_owner']

// Roles that need Aadhaar KYC (collect money + identity critical)
export const NEEDS_AADHAAR = ['organiser', 'umpire', 'ground_owner']
