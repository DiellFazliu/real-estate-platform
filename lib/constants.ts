export const HERO_STATS = [
  { value: '500', label: 'Listings' },
  { value: '200', label: 'Clients' },
  { value: '50', label: 'Agents' },
] as const

export const EXPLORE_LINKS = [
  { label: 'Properties for Sale', href: '/properties?type=sale' },
  { label: 'Properties for Rent', href: '/properties?type=rent' },
  { label: 'Our Agents', href: '/agents' },
] as const

export const SIDEBAR_TEXT = {
  brandLabel: 'Reva Real Estate',
  heading: {
    line1: 'Find a place',
    line2: "you'll love to live.",
  },
  description:
    'Browse our curated selection of premium properties across the city.',
  searchLabel: 'Search',
  searchPlaceholder: 'Location, property type...',
  searchButton: 'Search Properties',
  exploreLabel: 'Explore',
} as const

export const ITEMS_PER_PAGE = 3
export const SLIDER_INTERVAL = 6000