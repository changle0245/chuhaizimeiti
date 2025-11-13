import { createClient } from '@/lib/supabase/server'

async function getRemoveBgApiKey() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', 'removebg')
    .eq('is_active', true)
    .single()

  if (!data?.api_key) {
    throw new Error('Remove.bg API key not configured')
  }

  return data.api_key
}

export async function removeBackground(imageUrl: string): Promise<Buffer> {
  const apiKey = await getRemoveBgApiKey()

  const formData = new FormData()
  formData.append('image_url', imageUrl)
  formData.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Remove.bg API error: ${error}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
