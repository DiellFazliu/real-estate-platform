import { PropertyImage } from '@/components/properties/PropertyImage'
import { FALLBACK_IMAGES } from '@/lib/properties/property-display'
import type { PropertyPageData } from '../properties/types'

export function PropertyGallery({ property, displayImages }: Pick<PropertyPageData, 'property' | 'displayImages'>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
      <div className="relative md:row-span-2 h-[320px] md:h-[620px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
        <PropertyImage
          src={displayImages[0]}
          alt={property.title}
          className="w-full h-full object-cover"
          fallbackSrc={FALLBACK_IMAGES[0]}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
        <PropertyImage
          src={displayImages[1] || FALLBACK_IMAGES[1]}
          alt={`${property.title} - 2`}
          className="w-full h-full object-cover"
          fallbackSrc={FALLBACK_IMAGES[1]}
        />
      </div>

      <div className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0]">
        <PropertyImage
          src={displayImages[2] || FALLBACK_IMAGES[2]}
          alt={`${property.title} - 3`}
          className="w-full h-full object-cover"
          fallbackSrc={FALLBACK_IMAGES[2]}
        />
        {displayImages.length > 3 && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">
              +{displayImages.length - 3} më shumë
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
