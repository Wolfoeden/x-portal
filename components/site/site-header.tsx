'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent } from 'react'
import {
  BookOpenCheck,
  Building2,
  ChevronDown,
  FolderKanban,
  Globe,
  Menu,
  ShieldCheck,
  UserPlus,
  Users,
  Workflow,
  X,
  type LucideProps,
} from 'lucide-react'
import { Wordmark } from '@/components/brand/logo'
import { ButtonLink, Container } from '@/components/ui/primitives'
import { useLocale } from '@/components/i18n/locale-provider'
import { useLanguageSwitch } from '@/components/i18n/language-link'
import { pageHref, pagePath, type Locale } from '@/lib/i18n/routes'
import type { MenuEntry } from '@/lib/i18n/types'
import { APP_START_PATH } from '@/lib/site'

const icons: Record<MenuEntry['icon'], ComponentType<LucideProps>> = {
  talent: Users,
  projects: FolderKanban,
  hubs: Building2,
  automation: Workflow,
  training: BookOpenCheck,
  isms: ShieldCheck,
  freelancer: UserPlus,
}

function DesktopMenu({ label, entries, locale }: { label: string; entries: MenuEntry[]; locale: Locale }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Per Maus geöffnet bleibt das Menü beim Klick offen; erst ein Klick auf ein offenes Menü schließt es.
  const openedByHover = useRef(false)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const show = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (!open) openedByHover.current = true
    setOpen(true)
  }
  const hide = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  const toggle = () => {
    if (open && openedByHover.current) {
      openedByHover.current = false
      return
    }
    openedByHover.current = false
    setOpen((value) => !value)
  }

  return (
    <div ref={wrapRef} className="relative" onPointerEnter={show} onPointerLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={`inline-flex h-10 items-center gap-1 rounded-full px-3 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${open ? 'text-brand' : ''}`}
      >
        {label}
        <ChevronDown aria-hidden size={15} strokeWidth={1.75} className={`text-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 w-[400px] pt-2"
      >
        <ul className="rounded-2xl border border-line bg-white p-2 shadow-frame">
          {entries.map((entry) => {
            const Icon = icons[entry.icon]
            return (
              <li key={entry.label}>
                <Link
                  href={pageHref(entry.page, locale, entry.anchor)}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-line bg-white text-ink">
                    <Icon aria-hidden size={17} strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium text-ink">{entry.label}</span>
                    <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{entry.text}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const { locale, dict } = useLocale()
  const text = dict.header
  const language = useLanguageSwitch()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileId = useId()
  const isCurrent = (href: string) => (pathname === href ? 'page' : undefined)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? 'hidden' : ''
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-colors duration-200 ${
        scrolled || mobileOpen ? 'border-line' : 'border-transparent'
      }`}
    >
      <Container className="flex h-16 items-center gap-6">
        <Link href={pagePath('home', locale)} className="shrink-0 rounded-md text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" aria-label={text.homeLabel}>
          <Wordmark className="h-7 w-auto max-[359px]:h-6" />
        </Link>

        <nav aria-label={text.navLabel} className="ml-4 hidden items-center text-[15px] text-ink xl:flex">
          {text.menus.map((menu) => (
            <DesktopMenu key={menu.label} label={menu.label} entries={menu.entries} locale={locale} />
          ))}
          {text.links.map((item) => {
            const href = pageHref(item.page, locale, item.anchor)
            return (
              <Link
                key={item.label}
                href={href}
                aria-current={isCurrent(href)}
                className="inline-flex h-10 items-center rounded-full px-3 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[current=page]:text-brand"
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={language.href}
            onClick={language.onClick}
            hrefLang={language.other}
            lang={language.other}
            className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-[15px] text-muted transition-colors hover:text-ink xl:inline-flex"
          >
            <Globe aria-hidden size={16} strokeWidth={1.75} />
            {text.otherLanguage}
          </Link>
          {/* Angemeldet oder nicht entscheidet data-auth am <html> (components/auth/auth-state-script.tsx). */}
          <Link href={pagePath('signIn', locale)} className="auth-out hidden h-10 items-center rounded-full px-3 text-[15px] text-ink transition-colors hover:text-brand sm:inline-flex">
            {text.signIn}
          </Link>
          <Link href={pagePath('account', locale)} className="auth-in hidden h-10 items-center rounded-full px-3 text-[15px] text-ink transition-colors hover:text-brand sm:inline-flex">
            {text.account}
          </Link>
          <ButtonLink href={pageHref('places', locale, 'waitlist')} className="auth-out ml-1 h-10 px-[18px] max-sm:h-9 max-sm:px-4 max-sm:text-[14px]">
            {/* Auf schmalen Handys der kurze Text, sonst wird die Kopfzeile breiter als der Bildschirm. */}
            <span className="sm:hidden">{text.waitlistShort}</span>
            <span className="max-sm:hidden">{text.waitlist}</span>
          </ButtonLink>
          <ButtonLink href={APP_START_PATH} prefetch={false} className="auth-in ml-1 h-10 px-[18px] max-sm:h-9 max-sm:px-4 max-sm:text-[14px]">
            {text.start}
          </ButtonLink>
          <button
            type="button"
            aria-label={mobileOpen ? text.closeMenu : text.openMenu}
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            onClick={() => setMobileOpen((value) => !value)}
            className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink xl:hidden"
          >
            {mobileOpen ? <X aria-hidden size={22} strokeWidth={1.75} /> : <Menu aria-hidden size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </Container>

      <div id={mobileId} hidden={!mobileOpen} className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-white xl:hidden">
        <Container className="flex flex-col gap-8 py-6">
          {text.menus.map((menu) => (
            <div key={menu.label}>
              <p className="mb-2 text-[13px] text-faint">{menu.label}</p>
              <ul className="flex flex-col">
                {menu.entries.map((entry) => (
                  <li key={entry.label}>
                    <Link href={pageHref(entry.page, locale, entry.anchor)} onClick={() => setMobileOpen(false)} className="flex flex-col py-2.5">
                      <span className="text-[17px] font-medium text-ink">{entry.label}</span>
                      <span className="text-[14px] text-muted">{entry.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <ul className="flex flex-col border-t border-line pt-4">
            {text.links.map((item) => {
              const href = pageHref(item.page, locale, item.anchor)
              return (
                <li key={item.label}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isCurrent(href)}
                    className="block py-2.5 text-[17px] font-medium text-ink aria-[current=page]:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-col gap-3">
            <ButtonLink href={pageHref('places', locale, 'waitlist')} onClick={() => setMobileOpen(false)} className="auth-out h-12 w-full">
              {text.waitlist}
            </ButtonLink>
            <ButtonLink href={APP_START_PATH} prefetch={false} onClick={() => setMobileOpen(false)} className="auth-in h-12 w-full">
              {text.start}
            </ButtonLink>
            <ButtonLink href={pagePath('signIn', locale)} variant="secondary" onClick={() => setMobileOpen(false)} className="auth-out h-12 w-full">
              {text.signIn}
            </ButtonLink>
            <ButtonLink href={pagePath('account', locale)} variant="secondary" onClick={() => setMobileOpen(false)} className="auth-in h-12 w-full">
              {text.account}
            </ButtonLink>
            <Link
              href={language.href}
              onClick={language.onClick}
              hrefLang={language.other}
              lang={language.other}
              className="inline-flex items-center justify-center gap-1.5 py-2 text-[15px] text-muted"
            >
              <Globe aria-hidden size={16} strokeWidth={1.75} />
              {text.otherLanguage}
            </Link>
          </div>
        </Container>
      </div>
    </header>
  )
}
