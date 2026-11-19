/** An open pavilion on a plinth. The same glyph denotes one Node throughout the diagrams. */
export function NodeSymbol() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="m4 29 20 10 20-10-20-10Z" fill="var(--node-base, var(--color-brand-soft))" />
      <path d="M9 18v11l15 7 15-7V18M24 25v11M16 21v11M32 21v11" />
      <path d="M3 17 24 7l21 10-21 10Z" fill="var(--node-roof, white)" />
      <path d="m10 17 14-6.6 14 6.6" opacity=".55" />
    </g>
  )
}
