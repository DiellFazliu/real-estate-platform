'use client'

import { useState } from 'react'

interface UploadedImage {
  assetId: string
  url: string
}

interface ImageUploaderProps {
  onUpload: (images: UploadedImage[]) => void
  maxImages?: number
}

export function ImageUploader({
  onUpload,
  maxImages = 20,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      setError(`Maksimumi ${maxImages} imazhe`)
      return
    }

    setUploading(true)
    setError('')

    const newImages: UploadedImage[] = []

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.success) {
          newImages.push({
            assetId: data.assetId,
            url: data.url,
          })
        } else {
          setError(data.error || 'Gabim gjatë ngarkimit')
        }
      } catch (err) {
        setError('Gabim gjatë ngarkimit')
      }
    }

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onUpload(updatedImages)
    setUploading(false)
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onUpload(updatedImages)
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setImages(updated)
    onUpload(updated)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6B4C3B] transition">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${
            uploading || images.length >= maxImages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-[#6B4C3B]'
          }`}
        >
          {uploading
            ? 'Duke ngarkuar...'
            : images.length >= maxImages
            ? `Keni arritur maksimumin (${maxImages})`
            : 'Kliko për të ngarkuar imazhe'}
        </label>
        <p className="text-sm text-gray-500 mt-2">
          JPG, PNG, WebP — Max 5MB secila — Min 3, Max {maxImages}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <>
          <p className="text-sm text-gray-600">
            {images.length} imazhe të ngarkuara — Imazhi i parë është kopertina
          </p>
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={image.assetId} className="relative group">
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-[#6B4C3B] text-white text-xs px-2 py-1 rounded">
                    Kryesore
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    className="bg-black/60 text-white rounded px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === images.length - 1}
                    className="bg-black/60 text-white rounded px-2 py-1 text-xs disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}