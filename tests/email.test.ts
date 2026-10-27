import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendMail = vi.fn()
const createTransport = vi.fn(() => ({ sendMail }))
vi.mock('nodemailer', () => ({ default: { createTransport } }))

const { deliverEmail, describeDeliveryError, operatorAddress, resetTransportForTests } = await import('@/lib/email/deliver')

describe('deliverEmail', () => {
  beforeEach(() => {
    vi.stubEnv('SMTP_HOST', 'smtp.ionos.de')
    vi.stubEnv('SMTP_PORT', '587')
    vi.stubEnv('SMTP_USER', 'info@x-portal.eu')
    vi.stubEnv('SMTP_PASSWORD', 'geheim')
    vi.stubEnv('EMAIL_FROM', 'XPORTAL <info@x-portal.eu>')
    sendMail.mockReset()
    createTransport.mockClear()
    resetTransportForTests()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('schickt über IONOS mit STARTTLS und setzt Antwortadresse', async () => {
    sendMail.mockResolvedValue({})
    expect(await deliverEmail({ to: 'anna@firma.de', subject: 'S', text: 'T', replyTo: 'kunde@firma.de' })).toEqual({ delivered: true })
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.ionos.de', port: 587, secure: false, requireTLS: true }))
    expect(sendMail).toHaveBeenCalledWith({ from: 'XPORTAL <info@x-portal.eu>', to: 'anna@firma.de', subject: 'S', text: 'T', replyTo: 'kunde@firma.de' })
  })

  it('versendet nichts ohne vollständige Konfiguration oder an ungültige Adressen', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('SMTP_PASSWORD', '')
    expect(await deliverEmail({ to: 'anna@firma.de', subject: 'S', text: 'T' })).toEqual({ delivered: false, reason: 'not_configured' })
    vi.stubEnv('SMTP_PASSWORD', 'geheim')
    expect(await deliverEmail({ to: 'keine adresse', subject: 'S', text: 'T' })).toEqual({ delivered: false, reason: 'invalid_recipient' })
    expect(sendMail).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('meldet Fehler ohne Empfänger im Log', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMail.mockRejectedValue(Object.assign(new Error('x'), { code: 'EENVELOPE', responseCode: 550, response: '550 anna@firma.de: mailbox unavailable\nmehr' }))
    const result = await deliverEmail({ to: 'anna@firma.de', subject: 'S', text: 'T' })
    expect(result).toEqual({ delivered: false, reason: 'send_failed', detail: 'EENVELOPE 550 550 <Empfänger>: mailbox unavailable' })
    expect(spy.mock.calls[0][0]).not.toContain('anna@firma.de')
    spy.mockRestore()
  })

  it('kennt das Postfach für neue Anfragen nur mit gültiger Adresse', () => {
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', ' info@x-portal.eu ')
    expect(operatorAddress()).toBe('info@x-portal.eu')
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'kaputt')
    expect(operatorAddress()).toBeNull()
  })

  it('kürzt Serverantworten', () => {
    expect(describeDeliveryError({ code: 'ETIMEDOUT' }, 'a@b.de')).toBe('ETIMEDOUT')
  })
})
