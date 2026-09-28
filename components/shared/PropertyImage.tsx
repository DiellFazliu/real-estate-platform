'use client'

import Image from 'next/image'

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
    <Image
      src={imageUrl}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, 33vw"
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        if (target.src !== FALLBACK) {
          target.src = FALLBACK
        }
      }}
    />
  )
}