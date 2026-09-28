'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PropertyImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export function PropertyImage({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
}: PropertyImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, 50vw"
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true)
          setImgSrc(fallbackSrc)
        }
      }}
    />
  )
}