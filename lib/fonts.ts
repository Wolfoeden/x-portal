import localFont from 'next/font/local'

// Ein Aufruf für beide Root-Layouts (Deutsch und Englisch).
export const inter = localFont({
  src: '../app/fonts/InterVariable.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
})
