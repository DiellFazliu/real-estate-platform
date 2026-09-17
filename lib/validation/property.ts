import { z } from 'zod'

export const propertySubmitSchema = z.object({
  title: z
    .string()
    .min(10, 'Titulli duhet të ketë së paku 10 karaktere')
    .max(100, 'Titulli nuk mund të ketë më shumë se 100 karaktere')
    .refine((val) => val.trim().length > 0, 'Titulli nuk mund të jetë bosh')
    .refine(
      (val) => !/^\s+$/.test(val),
      'Titulli nuk mund të jetë vetëm hapësira'
    ),

  description: z
    .string()
    .min(50, 'Përshkrimi duhet të ketë së paku 50 karaktere')
    .max(2000, 'Përshkrimi nuk mund të ketë më shumë se 2000 karaktere')
    .refine(
      (val) => !/https?:\/\/|www\./i.test(val),
      'Nuk lejohen linke në përshkrim'
    )
    .refine(
      (val) => !/(.)\1{10,}/.test(val),
      'Nuk lejohen karaktere të përsëritura'
    )
    .refine(
      (val) => val.split(/\s+/).length >= 8,
      'Përshkrimi duhet të ketë së paku 8 fjalë'
    ),

  price: z
    .number({ invalid_type_error: 'Çmimi duhet të jetë numër' })
    .positive('Çmimi duhet të jetë pozitiv')
    .min(100, 'Çmimi minimal është 100')
    .max(10000000, 'Çmimi maksimal është 10,000,000'),

  location: z
    .string()
    .min(2, 'Lokacioni është i detyrueshëm')
    .max(200, 'Lokacioni nuk mund të ketë më shumë se 200 karaktere'),

  city: z
    .string()
    .min(2, 'Qyteti është i detyrueshëm')
    .max(100, 'Qyteti nuk mund të ketë më shumë se 100 karaktere'),

  propertyType: z.enum(
    ['apartment', 'house', 'villa', 'land', 'commercial'],
    { errorMap: () => ({ message: 'Zgjidh një tip prone' }) }
  ),

  listingType: z.enum(['sale', 'rent'], {
    errorMap: () => ({ message: 'Zgjidh Për Shitje ose Me Qira' }),
  }),

  bedrooms: z
    .number()
    .int('Duhet të jetë numër i plotë')
    .min(0, 'Min 0 dhoma')
    .max(20, 'Max 20 dhoma')
    .optional(),

  bathrooms: z
    .number()
    .int('Duhet të jetë numër i plotë')
    .min(0, 'Min 0 banjo')
    .max(20, 'Max 20 banjo')
    .optional(),

  area: z
    .number()
    .int('Duhet të jetë numër i plotë')
    .positive('Sipërfaqja duhet të jetë pozitive')
    .min(10, 'Min 10 m²')
    .max(100000, 'Max 100,000 m²')
    .optional(),

  latitude: z
    .number({ invalid_type_error: 'Latitude duhet të jetë numër' })
    .min(-90, 'Latitude duhet të jetë midis -90 dhe 90')
    .max(90, 'Latitude duhet të jetë midis -90 dhe 90'),

  longitude: z
    .number({ invalid_type_error: 'Longitude duhet të jetë numër' })
    .min(-180, 'Longitude duhet të jetë midis -180 dhe 180')
    .max(180, 'Longitude duhet të jetë midis -180 dhe 180'),

  images: z
    .array(z.string().min(1))
    .min(3, 'Duhet të ngarkoni së paku 3 imazhe')
    .max(20, 'Maksimumi 20 imazhe'),

  features: z
    .array(z.string().max(50))
    .max(20, 'Maksimumi 20 veçori')
    .optional()
    .default([]),

  contactPhone: z
    .string()
    .min(6, 'Telefoni është i detyrueshëm')
    .max(20, 'Telefoni nuk mund të ketë më shumë se 20 karaktere')
    .regex(/^[+\d\s()-]+$/, 'Format i pavlefshëm i telefonit'),

  contactEmail: z
    .string()
    .email('Email i pavlefshëm')
    .max(255, 'Email shumë i gjatë'),
})

export type PropertySubmitInput = z.infer<typeof propertySubmitSchema>