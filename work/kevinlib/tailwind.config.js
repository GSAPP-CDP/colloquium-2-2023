/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily :{
        'Inter': ["Inter", "sans-serif"],
        'barlow': ["Barlow","sans-serif"],
        'nunito': ['nunito', 'sans-serif'],
        'cabin': ['Cabin', 'sans-serif'],
        'Open_Sans': ['"Open Sans"', 'sans-serif']
    },
  }
  },
  plugins: [require('@tailwindcss/typography')]
}

