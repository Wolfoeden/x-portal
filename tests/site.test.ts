import { describe, expect, it } from 'vitest'
import { siteIsIndexable } from '@/lib/site'

describe('Suchmaschinen', () => {
  it('lässt Deploy-Previews und Branch-Deploys draußen, auch mit Flag', () => {
    expect(siteIsIndexable('deploy-preview', 'true')).toBe(false)
    expect(siteIsIndexable('branch-deploy', 'true')).toBe(false)
  })

  it('indexiert nur, wenn SITE_INDEXABLE=true und der Kontext keine Vorschau ist', () => {
    expect(siteIsIndexable('production', 'true')).toBe(true)
    expect(siteIsIndexable('production', undefined)).toBe(false)
    expect(siteIsIndexable('production', 'false')).toBe(false)
    expect(siteIsIndexable(undefined, 'true')).toBe(true)
  })
})
