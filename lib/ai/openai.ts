import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

async function getOpenAIClient() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', 'openai')
    .eq('is_active', true)
    .single()

  if (!data?.api_key) {
    throw new Error('OpenAI API key not configured')
  }

  return new OpenAI({ apiKey: data.api_key })
}

export async function identifyProduct(imageUrl: string): Promise<{
  productName: string
  category: string
  description: string
  keywords: string[]
}> {
  const openai = await getOpenAIClient()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this product image and provide:
1. Product name
2. Category (e.g., "Iron Incense Burner", "Glass Fruit Plate", etc.)
3. Detailed description
4. 5-7 relevant keywords

Respond in JSON format:
{
  "productName": "...",
  "category": "...",
  "description": "...",
  "keywords": ["...", "..."]
}`,
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content)
}

export async function generateMarketingCopy(
  productInfo: {
    productName: string
    category: string
    description: string
    keywords: string[]
  },
  language: 'english' | 'arabic',
  targetMarket: string = 'arabic_muslim'
): Promise<string> {
  const openai = await getOpenAIClient()

  const languageInstructions = {
    english: 'Write in English, keeping cultural sensitivity to Arab/Muslim audiences.',
    arabic: 'Write in Arabic (العربية), using culturally appropriate language for Muslim audiences.',
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert marketing copywriter specializing in products for Arab and Muslim markets.
You understand cultural nuances, appropriate imagery, and what resonates with this audience.`,
      },
      {
        role: 'user',
        content: `Create compelling marketing copy for this product:

Product: ${productInfo.productName}
Category: ${productInfo.category}
Description: ${productInfo.description}
Keywords: ${productInfo.keywords.join(', ')}

Target Market: ${targetMarket}
Language: ${language}

${languageInstructions[language]}

Create a marketing copy that:
1. Highlights the product's unique features
2. Appeals to the target audience's values and lifestyle
3. Includes a call-to-action
4. Is concise (100-150 words)
5. Is culturally appropriate and respectful`,
      },
    ],
    max_tokens: 300,
  })

  return response.choices[0]?.message?.content || ''
}

export async function generateBackgroundPrompt(
  productInfo: {
    productName: string
    category: string
    description: string
  },
  style: 'modern' | 'traditional' | 'lifestyle' | 'plain'
): Promise<string> {
  const openai = await getOpenAIClient()

  const styleGuides = {
    modern: 'clean, minimalist, contemporary design with neutral colors',
    traditional: 'traditional Arabic/Islamic patterns, ornate details, warm colors',
    lifestyle: 'realistic lifestyle scene, natural setting, relatable context',
    plain: 'solid color background, simple and elegant',
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Create a detailed image generation prompt for a product background.

Product: ${productInfo.productName}
Category: ${productInfo.category}
Style: ${style} (${styleGuides[style]})

Generate a prompt for Stable Diffusion that describes the perfect background for this product.
The prompt should be detailed, specific, and suitable for ${style} style.
Focus only on the background, not the product itself.

Respond with just the prompt text, nothing else.`,
      },
    ],
    max_tokens: 150,
  })

  return response.choices[0]?.message?.content || ''
}
