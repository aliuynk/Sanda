/**
 * Shared Tailwind preset for Sanda web applications.
 * Design tokens reflect the Sanda brand: earthy, trustworthy, food-grade.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // CSS variables are defined in the shared globals.css so that dark
        // mode can swap tokens without a full Tailwind rebuild.
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Brand tokens — always available regardless of theme.
        earth: {
          50: '#f7f5f0',
          100: '#ece6d8',
          200: '#d6c9ad',
          300: '#bca67d',
          400: '#a08758',
          500: '#856e45',
          600: '#6b5837',
          700: '#54432c',
          800: '#3d3121',
          900: '#261e14',
        },
        leaf: {
          50: '#f2f8ee',
          100: '#def0d3',
          200: '#bddfa7',
          300: '#92c876',
          400: '#6aae4b',
          500: '#4d9432',
          600: '#3a7725',
          700: '#2e5c1f',
          800: '#24471a',
          900: '#1a3313',
        },
        clay: {
          50: '#fdf5ed',
          100: '#f8e2ca',
          200: '#f0c396',
          300: '#e69d5d',
          400: '#d97c36',
          500: '#c6611e',
          600: '#a64c17',
          700: '#833916',
          800: '#5f2a12',
          900: '#3e1c0c',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
