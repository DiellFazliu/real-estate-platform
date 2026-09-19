'use client'

interface PropertyImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

const FALLBACK =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'

export function PropertyImage({ src, alt, className = '' }: PropertyImageProps) {
  const imageUrl = src && src.startsWith('http') ? src : FALLBACK

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement
        if (target.src !== FALLBACK) {
          target.src = FALLBACK
        }
      }}
    />
  )
}