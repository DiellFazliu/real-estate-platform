import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'heroSlide',
  title: 'Hero Slide',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'e.g., "$ 250,000"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    // ⭐ REFERENCA NË PROPERTY
    defineField({
      name: 'property',
      title: 'Linked Property',
      type: 'reference',
      to: [{ type: 'property' }],
      description: 'Zgjidh pronën që do të hapet kur klikohet slide-i',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'badge',
      title: 'Badge Text',
      type: 'string',
      options: {
        list: [
          { title: 'Featured', value: 'Featured' },
          { title: 'Premium', value: 'Premium' },
          { title: 'Luxury', value: 'Luxury' },
          { title: 'New', value: 'New' },
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'image',
      propertyTitle: 'property.title',
    },
    prepare(selection) {
      const { title, subtitle, media, propertyTitle } = selection
      return {
        title: title || 'Untitled',
        subtitle: propertyTitle ? `→ ${propertyTitle}` : subtitle,
        media: media,
      }
    },
  },
})