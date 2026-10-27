import 'server-only'

import nodemailer, { type Transporter } from 'nodemailer'
// Ohne den ausdrücklichen Options-Typ wählt TypeScript die falsche Überladung von createTransport.
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

// Versand über IONOS (SMTP, Montabaur, Verarbeitung in der EU), nach dem Muster von lib/email/deliver.ts im alten Projekt.
// Hier gehen nur Vorgangsmails raus: Bestätigungen und Hinweise zu etwas, das die Person selbst ausgelöst hat.
// Werbung bräuchte Sperrliste und Abmeldelink; die gibt es hier bewusst nicht.

export type EmailMessage = { to: string; subject: string; text: string; replyTo?: string }

export type DeliveryResult = { delivered: true } | { delivered: false; reason: 'not_configured' | 'invalid_recipient' | 'send_failed'; detail?: string }

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/

type SmtpConfig = { host: string; port: number; user: string; password: string; from: string }

/** Ohne vollständige Angaben wird nicht geraten: lieber kein Versand als ein halber. */
export function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const password = process.env.SMTP_PASSWORD
  const from = process.env.EMAIL_FROM?.trim() || user
  const port = Number.parseInt(process.env.SMTP_PORT?.trim() || '587', 10)
  if (!host || !user || !password || !from || !Number.isInteger(port) || port < 1 || port > 65_535) return null
  return { host, port, user, password, from }
}

/** Postfach des Betreibers für neue Anfragen. */
export function operatorAddress() {
  const address = process.env.CONTACT_NOTIFICATION_EMAIL?.trim()
  return address && EMAIL.test(address) ? address : null
}

let cached: { key: string; transport: Transporter } | null = null

function transportFor(config: SmtpConfig) {
  // Der Schlüssel enthält kein Passwort; er erkennt nur eine geänderte Konfiguration.
  const key = `${config.host}:${config.port}:${config.user}`
  if (cached?.key === key) return cached.transport
  const options: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    // 465 spricht sofort TLS, 587 handelt es über STARTTLS aus.
    secure: config.port === 465,
    requireTLS: config.port !== 465,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  }
  cached = { key, transport: nodemailer.createTransport(options) }
  return cached.transport
}

export function resetTransportForTests() {
  cached = null
}

/** Fehlerart ohne Empfänger: SMTP-Server nennen die Adresse gern in ihrer Antwort. */
export function describeDeliveryError(error: unknown, recipient: string) {
  const value = (error ?? {}) as { code?: unknown; responseCode?: unknown; response?: unknown; message?: unknown }
  const parts: string[] = []
  if (typeof value.code === 'string') parts.push(value.code)
  if (typeof value.responseCode === 'number') parts.push(String(value.responseCode))
  const text = typeof value.response === 'string' ? value.response : typeof value.message === 'string' ? value.message : ''
  if (text) parts.push(text.split('\n')[0]?.trim() ?? '')
  return parts.join(' ').split(recipient).join('<Empfänger>').replace(/\s+/g, ' ').trim().slice(0, 200)
}

export async function deliverEmail(message: EmailMessage): Promise<DeliveryResult> {
  const config = smtpConfig()
  if (!config) {
    console.error(JSON.stringify({ event: 'email_skipped', reason: 'not_configured' }))
    return { delivered: false, reason: 'not_configured' }
  }
  const to = message.to.trim()
  if (!EMAIL.test(to) || to.length > 254) return { delivered: false, reason: 'invalid_recipient' }
  const replyTo = message.replyTo?.trim()
  try {
    await transportFor(config).sendMail({
      from: config.from,
      to,
      subject: message.subject,
      text: message.text,
      ...(replyTo && EMAIL.test(replyTo) ? { replyTo } : {}),
    })
    return { delivered: true }
  } catch (error) {
    const detail = describeDeliveryError(error, to)
    // Ins Log nur die Art des Fehlers, nie Empfänger, Betreff oder Text.
    console.error(JSON.stringify({ event: 'email_failed', detail }))
    return { delivered: false, reason: 'send_failed', detail }
  }
}
