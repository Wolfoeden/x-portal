import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { AccountView } from '@/components/account/account-view'
import { Container } from '@/components/ui/primitives'
import { pagePath, type Locale } from '@/lib/i18n/routes'
import { loadAccount, sessionUser } from '@/lib/profile/server'
import { enabledSignInMethods, serverSupabase } from '@/lib/supabase/server'

type Search = Record<string, string | string[] | undefined>

/** Das eigene Konto: liest nur, was RLS dem angemeldeten Konto erlaubt. */
export async function AccountPage({ locale, searchParams }: { locale: Locale; searchParams: Promise<Search> }) {
  if (!(await serverSupabase())) redirect(`${pagePath('signIn', locale)}?error=unavailable`)
  const session = await sessionUser()
  if (!session) redirect(pagePath('signIn', locale))

  const [data, methods, { error }] = await Promise.all([loadAccount(session.supabase, session.user), enabledSignInMethods(), searchParams])
  return (
    <>
      <SiteHeader />
      <main>
        <section className="py-14 md:py-24" aria-labelledby="konto-title">
          <Container className="max-w-[860px]">
            {/* Neu angelegtes Profil: andere ID, also frisch aus den Serverdaten aufbauen. */}
            <AccountView
              key={data.freelancer?.id ?? 'neu'}
              data={data}
              providers={methods?.oauth ?? []}
              error={typeof error === 'string' ? error.slice(0, 40) : null}
            />
          </Container>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
