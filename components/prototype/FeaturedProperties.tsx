import { client } from '@/lib/sanity/client'
import { featuredPropertiesQuery } from '@/lib/sanity/queries'
import { PropertyCard } from './PropertyCard'
import type { Property } from '@/lib/types'

export async function FeaturedProperties() {
  try {
    const properties: Property[] = await client.fetch(featuredPropertiesQuery)

    if (!properties || properties.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="text-[#6B4C3B]/60">
            No properties added yet. Add some in Sanity Studio!
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            _id={property._id}
            title={property.title}
            price={property.price}
            location={property.location}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            area={property.area}
            status="For Sale"
            image={property.image}
            slug={property.slug}
            type="sale"
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching featured properties:', error)
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Error loading properties</p>
      </div>
    )
  }
}