'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  onUpload: (url: string) => void
  initialUrl?: string
}

export function HeroSlideImageUpload({ onUpload, initialUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUpload(data.url)
    } catch (err: any) {
      setError(err.message)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload('')
  }

  return (
    <div>
      <div
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#6B4C3B] transition"
      >
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B4C3B]" />
          </div>
        )}

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Kliko ose tërhiq imazhin
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP (max 5MB)
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}