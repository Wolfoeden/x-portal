import type { NextConfig } from 'next'

// Läuft als Server auf Netlify (Funktionen für /api). Vorschau und Staging senden noindex, bis SITE_INDEXABLE=true gesetzt ist.
const indexable = process.env.SITE_INDEXABLE === 'true'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Zwei Root-Layouts (Deutsch und Englisch) brauchen eine eigene, globale 404.
  experimental: { globalNotFound: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: indexable ? securityHeaders : [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
