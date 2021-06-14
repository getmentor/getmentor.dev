module.exports = {
  purge: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
      },
    },

    fontFamily: {
      sans: ['Open Sans', 'Segoe UI', 'sans-serif'],
    },

    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
