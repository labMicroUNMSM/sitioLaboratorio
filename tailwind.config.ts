import type { Config } from 'tailwindcss'

// Tailwind lee los mismos tokens que src/styles/tokens.css (una sola fuente
// de verdad: el hex vive en el CSS, aquí solo se referencia por variable).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        white: 'var(--color-white)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
        },
        border: 'var(--color-border)',
        guinda: {
          900: 'var(--color-guinda-900)',
          700: 'var(--color-guinda-700)',
          500: 'var(--color-guinda-500)',
          100: 'var(--color-guinda-100)',
        },
        oro: {
          700: 'var(--color-oro-700)',
          200: 'var(--color-oro-200)',
        },
        azul: {
          700: 'var(--color-azul-700)',
          100: 'var(--color-azul-100)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      maxWidth: {
        content: 'var(--content-max-width)',
        page: 'var(--page-max-width)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
      },
    },
  },
  plugins: [],
}

export default config
