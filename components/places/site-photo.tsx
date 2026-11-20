import { getImageProps } from 'next/image'

type SitePhotoProps = { src: string; alt: string; sizes: string; className: string; mobileSrc?: string }

/** The frame sets the size. Static story photos need responsive sources, with no client component. */
export function SitePhoto({ src, alt, sizes, className, mobileSrc }: SitePhotoProps) {
  const { props } = getImageProps({ src, alt, sizes, fill: true, loading: 'lazy', decoding: 'async', fetchPriority: 'low' })
  const photo = <img {...props} className={className} />
  return mobileSrc ? (
    <picture>
      <source media="(max-width: 599px)" type="image/avif" srcSet={mobileSrc} />
      {photo}
    </picture>
  ) : photo
}
