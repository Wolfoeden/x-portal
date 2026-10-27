import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

export function Container({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1272px] px-5 md:px-8 ${className}`}>{children}</div>
}

const buttonBase =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

export const buttonStyles = {
  primary: `${buttonBase} bg-brand text-white hover:bg-brand-hover`,
  secondary: `${buttonBase} border border-line-strong bg-white text-ink hover:border-ink/40`,
  ink: `${buttonBase} bg-ink text-white hover:bg-ink/85`,
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }

export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={`${buttonStyles[variant]} ${className}`} {...props} />
}

const badgeTones = {
  neutral: 'bg-surface text-muted',
  brand: 'bg-brand-soft text-brand-ink',
  amber: 'bg-amber-soft text-amber-ink',
  ink: 'bg-ink text-white',
}

export function Badge({ tone = 'neutral', className = '', children }: { tone?: keyof typeof badgeTones; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium leading-none ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function Eyebrow({ className = '', children }: { className?: string; children: ReactNode }) {
  return <p className={`text-[15px] text-muted ${className}`}>{children}</p>
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="accent-text">{children}</span>
}
