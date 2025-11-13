import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { processProject } from '@/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processProject],
  signingKey: process.env.INNGEST_SIGNING_KEY,
})
