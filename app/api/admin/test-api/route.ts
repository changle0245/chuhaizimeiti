import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

async function getApiKey(serviceName: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('api_keys')
    .select('api_key')
    .eq('service_name', serviceName)
    .single()

  return data?.api_key
}

async function testOpenAI(apiKey: string) {
  const openai = new OpenAI({ apiKey })
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Say "API test successful"' }],
    max_tokens: 10,
  })
  return response.choices[0]?.message?.content?.includes('successful')
}

async function testRemoveBg(apiKey: string) {
  const response = await fetch('https://api.remove.bg/v1.0/account', {
    headers: { 'X-Api-Key': apiKey },
  })
  return response.ok
}

async function testStability(apiKey: string) {
  const response = await fetch('https://api.stability.ai/v1/user/account', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return response.ok
}

async function testShotstack(apiKey: string) {
  const response = await fetch('https://api.shotstack.io/v1/sources', {
    headers: { 'x-api-key': apiKey },
  })
  return response.ok
}

export async function POST(request: Request) {
  try {
    const { service_name } = await request.json()

    if (!service_name) {
      return NextResponse.json(
        { error: 'Missing service name' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get API key
    const apiKey = await getApiKey(service_name)
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Test the API
    let success = false
    let error = null

    try {
      switch (service_name) {
        case 'openai':
          success = await testOpenAI(apiKey)
          break
        case 'removebg':
          success = await testRemoveBg(apiKey)
          break
        case 'stability':
          success = await testStability(apiKey)
          break
        case 'shotstack':
          success = await testShotstack(apiKey)
          break
        default:
          throw new Error('Unknown service')
      }
    } catch (err: any) {
      error = err.message
      success = false
    }

    // Update test status
    await supabase
      .from('api_keys')
      .update({
        last_tested_at: new Date().toISOString(),
        test_status: success ? 'success' : 'failed',
      })
      .eq('service_name', service_name)

    if (!success) {
      throw new Error(error || 'API test failed')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error testing API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'API test failed' },
      { status: 500 }
    )
  }
}
