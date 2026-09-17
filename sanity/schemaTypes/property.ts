import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    // ═══════════════════════════════════════════════════════════
    // FUSHAT EKZISTUESE
    // ═══════════════════════════════════════════════════════════
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
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
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
    }),
    defineField({
      name: 'area',
      title: 'Area (m²)',
      type: 'number',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),

    // ⭐ LATITUDE DHE LONGITUDE (duhen për hartë)
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      validation: (Rule) => Rule.min(-90).max(90),
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      validation: (Rule) => Rule.min(-180).max(180),
    }),

    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'featured',
      title: 'Featured Property',
      type: 'boolean',
      initialValue: false,
    }),

    // ═══════════════════════════════════════════════════════════
    // FUSHAT E REJA PËR MARKETPLACE
    // ═══════════════════════════════════════════════════════════

    defineField({
      name: 'listingType',
      title: 'Listing Type',
      type: 'string',
      options: {
        list: [
          { title: 'For Sale', value: 'sale' },
          { title: 'For Rent', value: 'rent' },
        ],
      },
    }),

    defineField({
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      options: {
        list: [
          { title: 'Apartment', value: 'apartment' },
          { title: 'House', value: 'house' },
          { title: 'Villa', value: 'villa' },
          { title: 'Land', value: 'land' },
          { title: 'Commercial', value: 'commercial' },
        ],
      },
    }),

    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Owner', value: 'OWNER' },
          { title: 'Agent', value: 'AGENT' },
          { title: 'User', value: 'USER' },
        ],
      },
      initialValue: 'OWNER',
    }),

    defineField({
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Review', value: 'PENDING_REVIEW' },
          { title: 'Approved', value: 'APPROVED' },
          { title: 'Rejected', value: 'REJECTED' },
        ],
      },
      initialValue: 'APPROVED',
    }),

    defineField({
      name: 'listedBy',
      title: 'Listed By',
      type: 'string',
    }),

    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),

    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),

    defineField({
      name: 'rejectionReason',
      title: 'Rejection Reason',
      type: 'text',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'price',
      media: 'images.0',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection
      return {
        title: title || 'Untitled',
        subtitle: subtitle ? `$${subtitle}` : 'No price set',
        media: media,
      }
    },
  },
})