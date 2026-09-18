import { createClient } from 'next-sanity'

// Client për shkrim me token
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})