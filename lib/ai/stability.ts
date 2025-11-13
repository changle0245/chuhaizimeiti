import { createClient } from '@/lib/supabase/server'

async function getStabilityApiKey() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', 'stability')
    .eq('is_active', true)
    .single()

  if (!data?.api_key) {
    throw new Error('Stability AI API key not configured')
  }

  return data.api_key
}

export async function generateBackground(prompt: string): Promise<Buffer> {
  const apiKey = await getStabilityApiKey()

  const response = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Stability AI error: ${error}`)
  }

  const data = await response.json()
  const base64Image = data.artifacts[0].base64
  return Buffer.from(base64Image, 'base64')
}
