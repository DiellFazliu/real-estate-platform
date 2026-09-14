import { groq } from 'next-sanity'

// ═══════════════════════════════════════════════════════════════
// HERO SLIDES (me referencë në property)
// ═══════════════════════════════════════════════════════════════

export const heroSlidesQuery = groq`
  *[_type == "heroSlide" && isActive == true] | order(order asc) {
    _id,
    title,
    subtitle,
    price,
    description,
    badge,
    "imageUrl": image.asset->url,
    // ⭐ Referenca në property
    "propertySlug": property->slug.current,
    "propertyId": property->_id,
    "propertyStatus": property->status
  }
`

// ═══════════════════════════════════════════════════════════════
// FEATURED PROPERTIES
// ═══════════════════════════════════════════════════════════════

export const featuredPropertiesQuery = groq`
  *[_type == "property" && status == "PUBLISHED" && featured == true] | order(_createdAt desc)[0...3] {
    _id,
    title,
    slug,
    price,
    description,
    location,
    city,
    latitude,
    longitude,
    bedrooms,
    bathrooms,
    area,
    status,
    featured,
    "image": images[0].asset->url,
    "images": images[] {
      asset->{
        url,
        metadata { dimensions }
      }
    },
    features
  }
`

// ═══════════════════════════════════════════════════════════════
// ALL PROPERTIES
// ═══════════════════════════════════════════════════════════════

export const allPropertiesQuery = groq`
  *[_type == "property" && status == "PUBLISHED"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    price,
    description,
    location,
    city,
    latitude,
    longitude,
    bedrooms,
    bathrooms,
    area,
    status,
    featured,
    "image": images[0].asset->url,
    "images": images[] {
      asset->{
        url,
        metadata { dimensions }
      }
    },
    features
  }
`

// ═══════════════════════════════════════════════════════════════
// SINGLE PROPERTY BY SLUG
// ═══════════════════════════════════════════════════════════════

export const propertyBySlugQuery = groq`
  *[_type == "property" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    price,
    status,
    bedrooms,
    bathrooms,
    area,
    location,
    city,
    latitude,
    longitude,
    features,
    featured,
    "images": images[] {
      asset->{
        url,
        metadata { dimensions }
      }
    }
  }
`