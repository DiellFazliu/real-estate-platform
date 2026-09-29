import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'real-estate-platform',
  // ⭐ Për development, përdor `isDev: true`
  isDev: process.env.NODE_ENV === 'development',
  // eventKey dhe signingKey janë optional në dev
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
})