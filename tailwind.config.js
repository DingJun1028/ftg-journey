module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ftg: {
          forest: '#10243f',
          green: '#3c6e47',
          'green-dark': '#2d5435',
          sand: '#f3ede1',
          cream: '#faf6ee',
          orange: '#c9a24b',
          'orange-dark': '#a8842f',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,36,63,0.08), 0 1px 2px rgba(16,36,63,0.04)',
        'card-hover': '0 8px 24px rgba(16,36,63,0.12)',
      },
    },
  },
  plugins: [],
};
