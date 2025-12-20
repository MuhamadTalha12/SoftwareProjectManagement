/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#B2FBF6',
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #B2FBF6 0%, #E0F7FA 100%)',
        },
      },
    },
    // ADD THIS LINE:
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }