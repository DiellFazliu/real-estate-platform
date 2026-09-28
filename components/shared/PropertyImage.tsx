'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PropertyImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackSrc?: string
  priority?: boolean
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'

const KNOWN_BROKEN = [
  'photo-1522708323590-d24dbb6b0261',
]

function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_FALLBACK

  // Kontrollo nëse është URL e vlefshme
  if (!url.startsWith('http')) return DEFAULT_FALLBACK

  // Kontrollo nëse është e prishur
  const isBroken = KNOWN_BROKEN.some((broken) => url.includes(broken))
  if (isBroken) return DEFAULT_FALLBACK

  return url
}

export function PropertyImage({
  src,
  alt,
  className = '',
  fallbackSrc = DEFAULT_FALLBACK,
  priority = false,
}: PropertyImageProps) {
  const [imgSrc, setImgSrc] = useState(() => sanitizeUrl(src))
  const [hasError, setHasError] = useState(false)

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, 50vw"
      className={className}
      priority={priority}
      onError={() => {
        if (!hasError) {
          setHasError(true)
          setImgSrc(fallbackSrc)
        }
      }}
    />
  )
}