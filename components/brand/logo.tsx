import { MARK, WORDMARK } from './logo-paths'

/** Bildmarke allein, z. B. in der App-Leiste. Farbe über `color`. */
export function LogoMark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      fill="currentColor"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d={MARK.d} />
    </svg>
  )
}

/** Wortmarke: das Logo mit dem X als Bildmarke, ein Pfad. */
export function Wordmark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={WORDMARK.viewBox}
      fill="currentColor"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d={WORDMARK.d} />
    </svg>
  )
}
