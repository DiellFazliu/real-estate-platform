// ═══════════════════════════════════════════════════════════════
// SEKSIONI 5: IMAZHET
// ═══════════════════════════════════════════════════════════════

import { Section } from './FormPrimitives'
import { ImageUploader } from '../ImageUploader'
import type { UploadedImage, PropertyFormInitialData } from './types'

interface Props {
  initialData?: PropertyFormInitialData
  maxImages: number
  fieldErrors: Record<string, string[]>
  onUpload: (images: UploadedImage[]) => void
}

export function ImagesSection({
  initialData,
  maxImages,
  fieldErrors,
  onUpload,
}: Props) {
  return (
    <Section
      title={`Imazhet ${maxImages !== -1 ? `(maks. ${maxImages})` : ''}`}
    >
      <ImageUploader
        initialImages={initialData?.images}
        onUpload={onUpload}
        maxImages={maxImages === -1 ? undefined : maxImages}
      />

      {fieldErrors.images && (
        <p className="text-red-500 text-sm">{fieldErrors.images[0]}</p>
      )}
    </Section>
  )
}