/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
  extend: {
    colors: {
      primary: {
        dark: '#40404f',
        text: 'grey',
      },
      accent: {
        blue: 'blue',
      },
      background: {
        white: '#ffffff',
      },
    },
  },
}
,
  plugins: [],
}
