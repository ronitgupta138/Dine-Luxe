import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./app/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./hooks/**/*.{ts,tsx}',
		'./lib/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				// Brand colors
				ink: 'rgb(var(--ink) / <alpha-value>)',
				muted: 'rgb(var(--muted) / <alpha-value>)',
				paper: 'rgb(var(--paper) / <alpha-value>)',
				surface: 'rgb(var(--surface) / <alpha-value>)',
				accent: 'rgb(var(--accent) / <alpha-value>)',
				accent2: 'rgb(var(--accent-2) / <alpha-value>)',
				accent3: 'rgb(var(--accent-3) / <alpha-value>)',
				
				// Semantic status colors from design system
				brand: {
					primary: '#1A3C5E',
					secondary: '#E8A020',
				},
				status: {
					success: '#1E7E34',
					warning: '#F39C12',
					danger: '#C0392B',
					info: '#2980B9',
					neutral: '#7F8C8D',
					cleaning: '#F1C40F',
				},
				
				// Dark mode colors (Kitchen/KDS)
				dark: {
					bg: '#111111',
					surface: '#1A1A1A',
					border: '#2D2D2D',
					text: '#FFFFFF',
					textSecondary: '#AAAAAA',
				},
			},
			fontFamily: {
				sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
				display: ['var(--font-display)', 'ui-serif', 'Georgia'],
			},
			fontSize: {
				'2xs': ['10px', { lineHeight: '1.4' }],
				xs: ['12px', { lineHeight: '1.5' }],
				sm: ['14px', { lineHeight: '1.5' }],
				base: ['16px', { lineHeight: '1.5' }],
				lg: ['18px', { lineHeight: '1.5' }],
				xl: ['20px', { lineHeight: '1.4' }],
				'2xl': ['24px', { lineHeight: '1.3' }],
				'3xl': ['32px', { lineHeight: '1.2' }],
				'4xl': ['48px', { lineHeight: '1.1' }],
			},
			spacing: {
				'4xs': '4px',
				'3xs': '8px',
				'2xs': '12px',
				xs: '16px',
				sm: '20px',
				md: '24px',
				lg: '32px',
				xl: '48px',
				'2xl': '64px',
				'3xl': '96px',
			},
			borderRadius: {
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '16px',
				pill: '9999px',
				circle: '50%',
			},
			boxShadow: {
				soft: '0 24px 50px -32px rgb(var(--shadow) / 0.55)',
				sm: '0 1px 3px rgba(0,0,0,0.12)',
				md: '0 4px 12px rgba(0,0,0,0.15)',
				lg: '0 8px 24px rgba(0,0,0,0.2)',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				rise: {
					'0%': { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(100%)', opacity: '0' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-10px)' },
					'75%': { transform: 'translateX(10px)' },
				},
				'pulse-red': {
					'0%, 100%': { 
						borderColor: '#C0392B', 
						boxShadow: '0 0 0 0 rgba(192,57,43,0.4)' 
					},
					'50%': { 
						boxShadow: '0 0 0 8px rgba(192,57,43,0)' 
					},
				},
				'pulse-green': {
					'0%, 100%': { 
						boxShadow: '0 0 0 0 rgba(30,126,52,0.4)' 
					},
					'50%': { 
						boxShadow: '0 0 0 8px rgba(30,126,52,0)' 
					},
				},
				'count-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
			animation: {
				float: 'float 10s ease-in-out infinite',
				rise: 'rise 0.6s ease-out',
				shimmer: 'shimmer 1.4s infinite linear',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-in',
				'slide-up': 'slide-up 0.4s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-in',
				'scale-in': 'scale-in 0.3s ease-out',
				'shake': 'shake 0.4s ease-in-out',
				'pulse-red': 'pulse-red 1.5s ease infinite',
				'pulse-green': 'pulse-green 1.5s ease infinite',
				'count-up': 'count-up 0.8s ease-out',
			},
			transitionTimingFunction: {
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
		},
	},
	plugins: [],
}

export default config
