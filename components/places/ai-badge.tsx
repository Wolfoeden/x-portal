/** Kleines i auf den Bildern: zeigt beim Überfahren oder Antippen, dass es Drohnenfotos sind und die Gebäude mit KI eingesetzt wurden. */
export function AiBadge({ text, label, className = 'left-3.5 top-3.5' }: { text: string; label: string; className?: string }) {
  return (
    <span className={`group/ki absolute z-10 flex items-center ${className}`}>
      <button
        type="button"
        aria-label={label}
        className="grid size-[30px] place-items-center rounded-full bg-[rgb(14_20_17/0.66)] font-serif text-[14px] font-semibold italic text-white backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        i
      </button>
      <span role="tooltip" className="pointer-events-none ml-2 w-max max-w-[min(300px,70vw)] rounded-2xl bg-[rgb(14_20_17/0.82)] px-3.5 py-2 leading-snug text-[12.5px] font-medium text-white opacity-0 backdrop-blur-md transition-opacity group-hover/ki:opacity-100 group-focus-within/ki:opacity-100">
        {text}
      </span>
    </span>
  )
}
