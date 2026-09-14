import { client } from '@/lib/sanity/client'
import { featuredPropertiesQuery } from '@/lib/sanity/queries'
import { PropertyCard } from './PropertyCard'

interface Property {
  _id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  status: string
  image: string
  slug: { current: string }
}

export async function FeaturedProperties() {
  try {
    const properties = await client.fetch(featuredPropertiesQuery)

    if (!properties || properties.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-white/40">No properties added yet. Add some in Sanity Studio!</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((property: Property) => (
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
      <div className="text-center py-12">
        <p className="text-red-400">Error loading properties</p>
      </div>
    )
  }
}