import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SignInPanel } from '@/components/auth/sign-in-panel'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { pagePath, type Locale } from '@/lib/i18n/routes'
import { enabledSignInMethods, serverSupabase } from '@/lib/supabase/server'

type Search = Record<string, string | string[] | undefined>

export async function SignInPage({ locale, searchParams }: { locale: Locale; searchParams: Promise<Search> }) {
  // Wer schon angemeldet ist, landet direkt im Konto.
  const supabase = await serverSupabase()
  const { data } = supabase ? await supabase.auth.getClaims() : { data: null }
  if (data?.claims?.sub) redirect(pagePath('account', locale))

  const { error, neu } = await searchParams
  // ?neu=1 kommt vom Assistenten auf /freelancer: Hier darf ein Konto entstehen.
  const signup = neu === '1'
  const methods = await enabledSignInMethods()
  const copy = getDictionary(locale).auth
  const words = signup ? { label: copy.signup.label, title: copy.signup.title, text: copy.signup.text } : copy
  return (
    <>
      <SiteHeader />
      <main>
        <section className="py-14 md:py-24" aria-labelledby="anmelden-title">
          <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <div className="flex flex-col gap-6">
              <p className="text-[14px] text-faint">{words.label}</p>
              <h1 id="anmelden-title" className={`${chapterTitle} text-ink`}>
                {words.title}
              </h1>
              <p className="max-w-[440px] text-[18px] leading-relaxed text-muted">{words.text}</p>
            </div>
            <div className="w-full max-w-[460px] lg:justify-self-end">
              <SignInPanel
                error={!methods ? 'unavailable' : typeof error === 'string' ? error.slice(0, 40) : null}
                providers={methods?.oauth ?? []}
                email={methods?.email ?? false}
                signup={signup}
              />
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
