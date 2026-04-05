/**
 * Readerboard Design Tokens
 * Single source of truth for all design constants used across components.
 * Tailwind config references these for utility generation.
 * Components import these for dynamic/conditional styling.
 */

export const colors = {
  // Backgrounds
  bg: {
    primary: '#F5F3FF',     // Page background (violet-50)
    secondary: '#EDE9FE',   // Card / section background (violet-100)
    tertiary: '#DDD6FE',    // Stronger tint for alternating rows (violet-200)
    white: '#FFFFFF',
    dark: '#1E1B4B',        // Dark sections / dark cards (indigo-950)
  },

  // Brand
  brand: {
    primary: '#7C3AED',     // Primary purple (violet-600)
    primaryHover: '#6D28D9', // Hover state (violet-700)
    primaryLight: '#A78BFA', // Light purple (violet-400)
    primarySubtle: '#C4B5FD', // Subtle tint (violet-300)
    accent: '#F59E0B',       // Gold accent (amber-500)
    accentHover: '#D97706',  // Gold hover (amber-600)
  },

  // Text
  text: {
    primary: '#1E1B4B',     // Headings (indigo-950)
    secondary: '#4C1D95',   // Subheadings (violet-900)
    body: '#6B7280',        // Body text (gray-500)
    muted: '#9CA3AF',       // Muted labels (gray-400)
    white: '#FFFFFF',
    inverse: '#F5F3FF',     // Light text on dark bg
  },

  // Rank badges
  rank: {
    gold: '#F59E0B',       // 1st place
    goldRing: '#FCD34D',   // 1st place avatar ring
    silver: '#9CA3AF',     // 2nd place
    silverRing: '#D1D5DB', // 2nd place avatar ring
    bronze: '#D97706',     // 3rd place
    bronzeRing: '#FBBF24', // 3rd place avatar ring
  },

  // Trend indicators
  trend: {
    up: '#10B981',         // Emerald-500
    down: '#EF4444',       // Red-500
  },

  // UI states
  state: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#7C3AED',
  },
} as const;

export const spacing = {
  pill: '9999px',          // Pill-shaped radius
  card: '16px',            // Standard card radius
  cardLg: '24px',          // Large card radius
  button: '12px',          // Button radius
  input: '12px',           // Input radius
  badge: '9999px',         // Badge (fully round)
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 2px 8px rgba(0, 0, 0, 0.06)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.08)',
  glow: '0 0 20px rgba(124, 58, 237, 0.15)',  // Purple glow
  goldGlow: '0 0 20px rgba(245, 158, 11, 0.25)', // Gold glow for #1
} as const;

/** Rank-specific styling for leaderboard podium and rows */
export const rankStyles = {
  1: {
    ringColor: 'ring-amber-300',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-white',
    avatarSize: 'w-28 h-28',
    label: '🥇',
  },
  2: {
    ringColor: 'ring-gray-300',
    badgeBg: 'bg-gray-400',
    badgeText: 'text-white',
    avatarSize: 'w-20 h-20',
    label: '🥈',
  },
  3: {
    ringColor: 'ring-amber-600',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    avatarSize: 'w-20 h-20',
    label: '🥉',
  },
} as const;

/** Leaderboard row styling — alternating tints */
export const rowStyles = {
  default: 'bg-violet-50 hover:bg-violet-100',
  alternate: 'bg-violet-100/60 hover:bg-violet-100',
  currentUser: 'bg-violet-200 ring-2 ring-violet-400',
} as const;
