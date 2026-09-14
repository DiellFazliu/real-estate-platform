import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════════════
      // COLORS - Earthy / Warm Palette
      // ═══════════════════════════════════════════════════════════════
      colors: {
        // Base
        black: '#000000',
        'coffee-bean': '#6B4C3B',
        'linen': '#F3E9E0',
        'parchment': '#F7F3EE',
        
        // Semantic
        background: '#F7F3EE',
        foreground: '#000000',
        card: {
          DEFAULT: '#F3E9E0',
          foreground: '#000000',
        },
        popover: {
          DEFAULT: '#F3E9E0',
          foreground: '#000000',
        },
        primary: {
          DEFAULT: '#6B4C3B',
          foreground: '#F7F3EE',
          light: '#8B6B5A',
          dark: '#4A3328',
        },
        secondary: {
          DEFAULT: '#F3E9E0',
          foreground: '#6B4C3B',
        },
        muted: {
          DEFAULT: '#E8DDD2',
          foreground: '#6B4C3B',
        },
        accent: {
          DEFAULT: '#8B6B5A',
          foreground: '#F7F3EE',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#F7F3EE',
        },
        border: '#E8DDD2',
        input: '#E8DDD2',
        ring: '#6B4C3B',
      },

      // ═══════════════════════════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════════════════════════
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },

      // ═══════════════════════════════════════════════════════════════
      // FONTS
      // ═══════════════════════════════════════════════════════════════
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },

      // ═══════════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════════
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },

      // ═══════════════════════════════════════════════════════════════
      // BOX SHADOWS
      // ═══════════════════════════════════════════════════════════════
      boxShadow: {
        'card': '0 4px 12px rgba(107, 76, 59, 0.08)',
        'card-hover': '0 20px 40px rgba(107, 76, 59, 0.15)',
        'soft': '0 2px 8px rgba(107, 76, 59, 0.06)',
        'elegant': '0 10px 30px rgba(107, 76, 59, 0.12)',
      },

      // ═══════════════════════════════════════════════════════════════
      // BACKGROUND IMAGES
      // ═══════════════════════════════════════════════════════════════
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #6B4C3B, #8B6B5A)',
        'gradient-warm': 'linear-gradient(135deg, #F7F3EE, #F3E9E0)',
      },
    },
  },
  plugins: [],
}

export default config