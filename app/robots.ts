import type { MetadataRoute } from 'next'
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, host: SITE_URL }
}
