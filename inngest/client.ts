import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'product-marketing-automation',
  eventKey: process.env.INNGEST_EVENT_KEY,
})
