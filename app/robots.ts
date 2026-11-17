import type { MetadataRoute } from 'next'
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site'

// Produktion: alles außer /api; KI-Crawler werden nicht ausgeschlossen (Einordnung durch KI ist gewollt, siehe /llms.txt).
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, host: SITE_URL, sitemap: new URL('/sitemap.xml', SITE_URL).toString() }
}
