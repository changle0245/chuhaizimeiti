import { createClient } from '@/lib/supabase/server'

async function getShotstackApiKey() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', 'shotstack')
    .eq('is_active', true)
    .single()

  if (!data?.api_key) {
    throw new Error('Shotstack API key not configured')
  }

  return data.api_key
}

export async function generateVideo(
  imageUrl: string,
  duration: number,
  includeMusic: boolean
): Promise<string> {
  const apiKey = await getShotstackApiKey()

  // Create video edit
  const edit = {
    timeline: {
      soundtrack: includeMusic
        ? {
            src: 'https://shotstack-assets.s3.amazonaws.com/music/unminus/ambisax.mp3',
            effect: 'fadeInFadeOut',
            volume: 0.5,
          }
        : undefined,
      tracks: [
        {
          clips: [
            {
              asset: {
                type: 'image',
                src: imageUrl,
              },
              start: 0,
              length: duration,
              fit: 'contain',
              scale: 1,
              position: 'center',
              transition: {
                in: 'fade',
                out: 'fade',
              },
            },
          ],
        },
      ],
    },
    output: {
      format: 'mp4',
      resolution: 'hd',
    },
  }

  // Submit render
  const renderResponse = await fetch('https://api.shotstack.io/v1/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(edit),
  })

  if (!renderResponse.ok) {
    const error = await renderResponse.text()
    throw new Error(`Shotstack render error: ${error}`)
  }

  const { response: renderData } = await renderResponse.json()
  const renderId = renderData.id

  // Poll for completion
  let videoUrl: string | null = null
  let attempts = 0
  const maxAttempts = 60 // 5 minutes max

  while (!videoUrl && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

    const statusResponse = await fetch(
      `https://api.shotstack.io/v1/render/${renderId}`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    )

    const { response: statusData } = await statusResponse.json()

    if (statusData.status === 'done') {
      videoUrl = statusData.url
    } else if (statusData.status === 'failed') {
      throw new Error('Video generation failed')
    }

    attempts++
  }

  if (!videoUrl) {
    throw new Error('Video generation timeout')
  }

  return videoUrl
}
