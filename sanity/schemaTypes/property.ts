import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'location', title: 'Location' },
    { name: 'characteristics', title: 'Characteristics' },
    { name: 'features', title: 'Features' },
    { name: 'marketplace', title: 'Marketplace' },
    { name: 'contact', title: 'Contact' },
  ],
  fields: [
    // ═══════════════════════════════════════════════════════════
    // BASIC INFO
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'basic',
      rows: 5,
    }),
    defineField({
      name: 'price',
      title: 'Price (€)',
      type: 'number',
      group: 'basic',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'pricePerM2',
      title: 'Price per m² (€)',
      type: 'number',
      group: 'basic',
      description: 'Llogaritet automatikisht nga price / area',
    }),
    defineField({
      name: 'listingType',
      title: 'Listing Type',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'For Sale', value: 'sale' },
          { title: 'For Rent', value: 'rent' },
        ],
        layout: 'radio',
      },
      initialValue: 'sale',
    }),
    defineField({
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'Apartment', value: 'apartment' },
          { title: 'House', value: 'house' },
          { title: 'Villa', value: 'villa' },
          { title: 'Penthouse', value: 'penthouse' },
          { title: 'Studio', value: 'studio' },
          { title: 'Land', value: 'land' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Office', value: 'office' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'basic',
      readOnly: true,
      options: {
        list: [
          { title: 'Draft', value: 'DRAFT' },
          { title: 'Published', value: 'PUBLISHED' },
          { title: 'Sold', value: 'SOLD' },
          { title: 'Rented', value: 'RENTED' },
          { title: 'Archived', value: 'ARCHIVED' },
        ],
      },
      initialValue: 'DRAFT',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Property',
      type: 'boolean',
      group: 'basic',
      initialValue: false,
    }),

    // ═══════════════════════════════════════════════════════════
    // LOCATION
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'location',
      title: 'Street Address',
      type: 'string',
      group: 'location',
    }),
    defineField({
      name: 'neighborhood',
      title: 'Neighborhood (Lagjja)',
      type: 'string',
      group: 'location',
      options: {
        list: [
          { title: 'Qendra', value: 'Qendra' },
          { title: 'Dardania', value: 'Dardania' },
          { title: 'Dragodan', value: 'Dragodan' },
          { title: 'Ulpiana', value: 'Ulpiana' },
          { title: 'Bregu i Diellit', value: 'Bregu i Diellit' },
          { title: 'Lakrishte', value: 'Lakrishte' },
          { title: 'Kalabria', value: 'Kalabria' },
          { title: 'Arberia', value: 'Arberia' },
          { title: 'Mati 1', value: 'Mati 1' },
          { title: 'Aktash', value: 'Aktash' },
          { title: 'Taslixhe', value: 'Taslixhe' },
          { title: 'Veternik', value: 'Veternik' },
          { title: 'Sunny Hill', value: 'Sunny Hill' },
          { title: 'Tophane', value: 'Tophane' },
        ],
      },
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'location',
      initialValue: 'Prishtina',
    }),
    defineField({
      name: 'postalCode',
      title: 'Postal Code',
      type: 'string',
      group: 'location',
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      group: 'location',
      validation: (Rule) => Rule.min(-90).max(90),
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      group: 'location',
      validation: (Rule) => Rule.min(-180).max(180),
    }),
    defineField({
      name: 'distanceFromCenter',
      title: 'Distance from Center (km)',
      type: 'number',
      group: 'location',
      description: 'Distanca nga qendra e qytetit në kilometra',
    }),

    // ═══════════════════════════════════════════════════════════
    // CHARACTERISTICS
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: 'characteristics',
      validation: (Rule) => Rule.min(0).max(20),
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: 'characteristics',
      validation: (Rule) => Rule.min(0).max(20),
    }),
    defineField({
      name: 'area',
      title: 'Area (m²)',
      type: 'number',
      group: 'characteristics',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'balconies',
      title: 'Balconies',
      type: 'number',
      group: 'characteristics',
      initialValue: 0,
    }),
    defineField({
      name: 'floor',
      title: 'Floor',
      type: 'number',
      group: 'characteristics',
      description: '0 për përdhes, -1 për bodrum',
    }),
    defineField({
      name: 'totalFloors',
      title: 'Total Floors in Building',
      type: 'number',
      group: 'characteristics',
    }),
    defineField({
      name: 'yearBuilt',
      title: 'Year Built',
      type: 'number',
      group: 'characteristics',
      validation: (Rule) => Rule.min(1900).max(2030),
    }),
    defineField({
      name: 'renovationYear',
      title: 'Renovation Year',
      type: 'number',
      group: 'characteristics',
      description: 'Viti i rinovimit të fundit (nëse ka)',
    }),
    defineField({
      name: 'condition',
      title: 'Condition',
      type: 'string',
      group: 'characteristics',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Excellent', value: 'excellent' },
          { title: 'Good', value: 'good' },
          { title: 'Needs Renovation', value: 'needs_renovation' },
          { title: 'Under Construction', value: 'under_construction' },
        ],
      },
      initialValue: 'good',
    }),
    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      group: 'characteristics',
      options: {
        list: [
          { title: 'North', value: 'north' },
          { title: 'South', value: 'south' },
          { title: 'East', value: 'east' },
          { title: 'West', value: 'west' },
          { title: 'North-East', value: 'north_east' },
          { title: 'North-West', value: 'north_west' },
          { title: 'South-East', value: 'south_east' },
          { title: 'South-West', value: 'south_west' },
        ],
      },
    }),
    defineField({
      name: 'furnished',
      title: 'Furnished',
      type: 'string',
      group: 'characteristics',
      options: {
        list: [
          { title: 'Unfurnished', value: 'unfurnished' },
          { title: 'Semi-Furnished', value: 'semi_furnished' },
          { title: 'Fully Furnished', value: 'fully_furnished' },
        ],
      },
      initialValue: 'unfurnished',
    }),

    // ═══════════════════════════════════════════════════════════
    // FEATURES
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'hasElevator',
      title: 'Has Elevator',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasParking',
      title: 'Has Parking',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasGarden',
      title: 'Has Garden',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasPool',
      title: 'Has Pool',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasAirConditioning',
      title: 'Has Air Conditioning',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasHeating',
      title: 'Has Heating',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasSecurity',
      title: 'Has Security System',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'hasInternet',
      title: 'Has Internet Ready',
      type: 'boolean',
      group: 'features',
      initialValue: false,
    }),
    defineField({
      name: 'features',
      title: 'Additional Features',
      type: 'array',
      group: 'features',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Fjalë kyçe shtesë si "smart home", "fireplace", "gym"',
    }),
    defineField({
      name: 'energyClass',
      title: 'Energy Class',
      type: 'string',
      group: 'features',
      options: {
        list: [
          { title: 'A+', value: 'A+' },
          { title: 'A', value: 'A' },
          { title: 'B', value: 'B' },
          { title: 'C', value: 'C' },
          { title: 'D', value: 'D' },
          { title: 'E', value: 'E' },
          { title: 'F', value: 'F' },
        ],
      },
    }),

    // ═══════════════════════════════════════════════════════════
    // IMAGES
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'basic',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.max(20),
    }),

    // ═══════════════════════════════════════════════════════════
    // MARKETPLACE
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      group: 'marketplace',
      readOnly: true,
      options: {
        list: [
          { title: 'Owner', value: 'OWNER' },
          { title: 'Agent', value: 'AGENT' },
          { title: 'User', value: 'USER' },
        ],
        layout: 'radio',
      },
      initialValue: 'OWNER',
    }),
    defineField({
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      group: 'marketplace',
      readOnly: true,
      options: {
        list: [
          { title: 'Pending Review', value: 'PENDING_REVIEW' },
          { title: 'Approved', value: 'APPROVED' },
          { title: 'Rejected', value: 'REJECTED' },
        ],
        layout: 'radio',
      },
      initialValue: 'APPROVED',
    }),
    defineField({
      name: 'listedBy',
      title: 'Listed By',
      type: 'string',
      group: 'marketplace',
      readOnly: true,
      description: 'Email i listuesit',
    }),
    defineField({
      name: 'rejectionReason',
      title: 'Rejection Reason',
      type: 'text',
      group: 'marketplace',
      readOnly: true,
    }),

    // ═══════════════════════════════════════════════════════════
    // CONTACT
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'contact',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'price',
      media: 'images.0',
      neighborhood: 'neighborhood',
    },
    prepare(selection) {
      const { title, subtitle, media, neighborhood } = selection
      return {
        title: title || 'Untitled',
        subtitle: `${neighborhood ? neighborhood + ' • ' : ''}${
          subtitle ? '€' + subtitle.toLocaleString() : 'No price'
        }`,
        media: media,
      }
    },
  },

  orderings: [
    {
      title: 'Price, High to Low',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
    {
      title: 'Price, Low to High',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
})