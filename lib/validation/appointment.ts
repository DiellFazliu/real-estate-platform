import { z } from 'zod'

export const appointmentSchema = z.object({
  propertyId: z.number().int().positive('Prona është e detyrueshme'),
  scheduledAt: z
    .string()
    .min(1, 'Data dhe ora është e detyrueshme')
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Data/orа është e pavlefshme',
    }),
  notes: z
    .string()
    .max(500, 'Shënimet nuk mund të jenë më shumë se 500 karaktere')
    .optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>