import { groq } from 'next-sanity'

// ═══════════════════════════════════════════════════════════════
// HERO SLIDES
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
    "propertySlug": property->slug.current,
    "propertyId": property->_id,
    "propertyStatus": property->status
  }
`

// ═══════════════════════════════════════════════════════════════
// REUSABLE PROPERTY FIELDS
// ═══════════════════════════════════════════════════════════════

const propertyFields = groq`
  _id,
  title,
  slug,
  description,
  price,
  pricePerM2,
  listingType,
  status,
  featured,
  location,
  neighborhood,
  city,
  postalCode,
  latitude,
  longitude,
  distanceFromCenter,
  propertyType,
  bedrooms,
  bathrooms,
  area,
  balconies,
  floor,
  totalFloors,
  yearBuilt,
  renovationYear,
  condition,
  orientation,
  furnished,
  hasElevator,
  hasParking,
  hasGarden,
  hasPool,
  hasAirConditioning,
  hasHeating,
  hasSecurity,
  hasInternet,
  features,
  energyClass,
  source,
  reviewStatus,
  listedBy,
  contactPhone,
  contactEmail,
  "images": images[] {
    asset->{
      url,
      metadata { dimensions }
    },
    alt
  }
`

// ═══════════════════════════════════════════════════════════════
// FEATURED PROPERTIES
// ═══════════════════════════════════════════════════════════════

export const featuredPropertiesQuery = groq`
  *[_type == "property" && status == "PUBLISHED" && reviewStatus == "APPROVED" && featured == true] | order(_createdAt desc)[0...3] {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// ALL PROPERTIES
// ═══════════════════════════════════════════════════════════════

export const allPropertiesQuery = groq`
  *[_type == "property" && status == "PUBLISHED" && reviewStatus == "APPROVED"] | order(_createdAt desc) {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// SINGLE PROPERTY BY SLUG
// ═══════════════════════════════════════════════════════════════

export const propertyBySlugQuery = groq`
  *[_type == "property" && slug.current == $slug][0] {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// PROPERTIES FOR RENT
// ═══════════════════════════════════════════════════════════════

export const rentPropertiesQuery = groq`
  *[_type == "property" && status == "PUBLISHED" && reviewStatus == "APPROVED" && listingType == "rent"] | order(_createdAt desc) {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// PROPERTIES BY NEIGHBORHOOD
// ═══════════════════════════════════════════════════════════════

export const propertiesByNeighborhoodQuery = groq`
  *[_type == "property" && status == "PUBLISHED" && neighborhood == $neighborhood] | order(price asc) {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// PROPERTIES BY PRICE RANGE
// ═══════════════════════════════════════════════════════════════

export const propertiesByPriceRangeQuery = groq`
  *[_type == "property" && status == "PUBLISHED" && price >= $minPrice && price <= $maxPrice] | order(price asc) {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// PENDING REVIEW PROPERTIES (OWNER)
// ═══════════════════════════════════════════════════════════════

export const pendingReviewPropertiesQuery = groq`
  *[_type == "property" && reviewStatus == "PENDING_REVIEW"] | order(_createdAt asc) {
    ${propertyFields}
  }
`

// ═══════════════════════════════════════════════════════════════
// PROPERTIES BY SELLER
// ═══════════════════════════════════════════════════════════════

export const propertiesBySellerQuery = groq`
  *[_type == "property" && listedBy == $email] | order(_createdAt desc) {
    ${propertyFields}
  }
`