import { afterEach, describe, expect, it, vi } from 'vitest'
import { visitorKey } from '@/lib/server/request'

const request = (headers: Record<string, string>) => new Request('https://xportal-vorschau.netlify.app/api/analyse', { method: 'POST', headers })

afterEach(() => vi.unstubAllEnvs())

describe('visitorKey', () => {
  it('nimmt auf Netlify die IP aus dem Header der Plattform, je IP ein eigener Schlüssel', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('IP_HASH_SECRET', 'x'.repeat(64))
    const first = visitorKey(request({ 'x-nf-client-connection-ip': '203.0.113.1' }))
    const second = visitorKey(request({ 'x-nf-client-connection-ip': '203.0.113.2' }))
    expect(first).toMatchObject({ bucket: 'analyse' })
    expect('key' in first && 'key' in second && first.key !== second.key).toBe(true)
    expect(JSON.stringify(first)).not.toContain('203.0.113.1')
  })

  it('gibt ohne IP keinen gemeinsamen Schlüssel aus', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('IP_HASH_SECRET', 'x'.repeat(64))
    expect(visitorKey(request({}))).toEqual({ problem: 'no_ip' })
  })

  it('verlangt in Produktion ein ausreichend langes Geheimnis', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('IP_HASH_SECRET', 'kurz')
    expect(visitorKey(request({ 'x-nf-client-connection-ip': '203.0.113.1' }))).toEqual({ problem: 'no_secret' })
  })

  it('zählt Testanfragen getrennt', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('IP_HASH_SECRET', 'x'.repeat(64))
    expect(visitorKey(request({ 'x-xportal-test': '1', 'x-nf-client-connection-ip': '203.0.113.1' }))).toEqual({ key: 'xportal-test-bucket', bucket: 'analyse_test' })
  })
})
