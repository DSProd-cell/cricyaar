/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // 400-700 are redeclared against the IPL team CSS variables (set by
        // IplThemeProvider) so choosing a team recolors buttons, active tabs,
        // and icon accents everywhere — not just the mobile edge glow, which
        // was the only thing actually reading --cy-primary before. 50/100/
        // 200/300/800/900 (light tints, deep tints) stay fixed since they're
        // used as subtle background fills where an exact team-color match
        // matters far less than in a solid button or headline.
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: 'var(--cy-secondary)',
          500: 'var(--cy-primary)',   // PRIMARY — was fixed Deep Grape, now IPL-team-aware
          600: 'var(--cy-primary)',
          700: 'var(--cy-bg-mid)',
          800: '#4C1D95',
          900: '#3B0764',
        },
        // navy/slate are redeclared against CSS custom properties (defined in
        // index.css) so the whole app's text/border/surface colors invert for
        // system dark mode without touching every screen individually — see
        // the --cy-navy-*/--cy-slate-* tokens and their dark media query.
        navy: {
          900: 'var(--cy-navy-900)',
          800: 'var(--cy-navy-800)',
          700: 'var(--cy-navy-700)',
          600: 'var(--cy-navy-600)',
          500: 'var(--cy-navy-500)',
          400: 'var(--cy-navy-400)',
          300: 'var(--cy-navy-300)',
          200: 'var(--cy-navy-200)',
          100: 'var(--cy-navy-100)',
          50:  'var(--cy-navy-50)',
        },
        slate: {
          50:  'var(--cy-slate-50)',
          100: 'var(--cy-slate-100)',
          200: 'var(--cy-slate-200)',
          300: 'var(--cy-slate-300)',
          400: 'var(--cy-slate-400)',
          500: 'var(--cy-slate-500)',
          600: 'var(--cy-slate-600)',
          700: 'var(--cy-slate-700)',
          800: 'var(--cy-slate-800)',
          900: 'var(--cy-slate-900)',
        },
      },
      animation: {
        'slide-up':   'slideUp 0.25s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'count-up':   'fadeIn 0.4s ease-out',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp:  { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:  { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'modal': '0 20px 60px -10px rgb(0 0 0 / 0.25)',
        'bottom-nav': '0 -1px 0 0 rgb(0 0 0 / 0.06)',
      }
    }
  },
  plugins: []
}
