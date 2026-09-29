import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import {generateIntelligenceFunction} from '@/inngest/functions/generate-intelligence'
import {refreshAllIntelligenceFunction} from '@/inngest/functions/refresh-all-intelligence'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateIntelligenceFunction,
    refreshAllIntelligenceFunction,
  ],
})