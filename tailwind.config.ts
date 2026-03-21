import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},

        // ─── DESIGN SYSTEM TOKENS ───
        "bg-primary": "hsl(var(--bg-primary))",
        "bg-secondary": "hsl(var(--bg-secondary))",
        "bg-tertiary": "hsl(var(--bg-tertiary))",
        "bg-elevated": "hsl(var(--bg-elevated))",
        "bg-accent-soft": "hsl(var(--bg-accent-soft))",

        "surface-primary": "hsl(var(--surface-primary))",
        "surface-secondary": "hsl(var(--surface-secondary))",
        "surface-card": "hsl(var(--surface-card))",
        "surface-card-hover": "hsl(var(--surface-card-hover))",
        "surface-inset": "hsl(var(--surface-inset))",

        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        "text-inverse": "hsl(var(--text-inverse))",
        "text-accent": "hsl(var(--text-accent))",

        "border-subtle": "hsl(var(--border-subtle))",
        "border-default": "hsl(var(--border-default))",
        "border-strong": "hsl(var(--border-strong))",

        "accent-primary": "hsl(var(--accent-primary))",
        "accent-primary-hover": "hsl(var(--accent-primary-hover))",
        "accent-soft": "hsl(var(--accent-soft))",
        "accent-contrast": "hsl(var(--accent-contrast))",

        "success": "hsl(var(--success))",
        "warning": "hsl(var(--warning))",
        "danger": "hsl(var(--danger))",
        "info": "hsl(var(--info))",

        "chart-win": "hsl(var(--chart-win))",
        "chart-draw": "hsl(var(--chart-draw))",
        "chart-loss": "hsl(var(--chart-loss))",
        "chart-goals-for": "hsl(var(--chart-goals-for))",
        "chart-goals-against": "hsl(var(--chart-goals-against))",
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      boxShadow: {
        soft: "var(--shadow-soft)",
        elevated: "var(--shadow-elevated)"
      }
  	}
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};

export default config;
