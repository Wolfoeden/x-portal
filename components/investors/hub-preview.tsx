'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

/** Node001 auf der Karte: Punkt mit Schild. Überfahren oder Antippen zeigt das Bild vom Grundstück, ein Klick darauf führt zu den Orten. */
export function HubPreview(props: { href: string; name: string; status: string; show: string; title: string; text: string; action: string; label: string; imageAlt: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="group/hub relative">
      <button
        type="button"
        aria-label={props.show}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative -ml-[13px] -mt-[13px] block size-[26px] rounded-full bg-white shadow-[0_0_0_6px_rgb(143_217_171/0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <span aria-hidden className="absolute inset-0 rounded-full border-2 border-white [animation:hub-pulse_2.4s_ease-out_infinite] motion-reduce:[animation:none]" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => setOpen((value) => !value)}
        className="absolute left-6 top-[-26px] whitespace-nowrap rounded-2xl bg-white px-3.5 py-2.5 text-left text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)] transition-colors hover:bg-brand-soft max-sm:hidden"
      >
        <span className="block text-[14px] font-medium">{props.name}</span>
        <span className="block text-[12.5px] text-muted">{props.status}</span>
      </button>
      <Link
        href={props.href}
        aria-label={props.label}
        className={`absolute left-[-150px] top-[34px] w-[300px] overflow-hidden text-left rounded-[22px] bg-white text-ink shadow-[0_2px_4px_rgb(0_0_0/0.12),0_40px_80px_-30px_rgb(0_0_0/0.75)] transition-[opacity,transform] duration-200 max-sm:left-[-180px] max-sm:w-[230px] ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-y-2 scale-[0.97] opacity-0 group-hover/hub:pointer-events-auto group-hover/hub:translate-y-0 group-hover/hub:scale-100 group-hover/hub:opacity-100 group-focus-within/hub:pointer-events-auto group-focus-within/hub:translate-y-0 group-focus-within/hub:scale-100 group-focus-within/hub:opacity-100'
        }`}
      >
        <span className="group/img relative block aspect-[300/178] overflow-hidden">
          <Image src="/orte/hub-01-hang.webp" alt={props.imageAlt} fill sizes="300px" className="object-cover object-[60%_50%] transition-transform duration-1000 group-hover/img:scale-105" />
        </span>
        <span className="flex items-end justify-between gap-3 px-4 pb-4 pt-3.5">
          <span>
            <b className="block text-[16px] font-medium leading-tight tracking-[-0.01em]">{props.title}</b>
            <span className="text-[13px] text-muted">{props.text}</span>
          </span>
          <span className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 text-[13px] font-medium text-white">
            {props.action}
            <ArrowRight aria-hidden size={14} strokeWidth={2} />
          </span>
        </span>
      </Link>
    </div>
  )
}
