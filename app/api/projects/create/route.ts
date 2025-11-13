import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { inngest } from '@/inngest/client'

export async function POST(request: Request) {
  try {
    const { originalImageUrl, settings } = await request.json()

    if (!originalImageUrl || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const dailyLimit = parseInt(process.env.DAILY_USAGE_LIMIT || '5')
    const canCreate = profile?.is_admin || (profile?.daily_usage_count || 0) < dailyLimit

    if (!canCreate) {
      return NextResponse.json(
        { error: 'Daily usage limit exceeded' },
        { status: 429 }
      )
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl,
        settings,
        status: 'pending',
      })
      .select()
      .single()

    if (projectError) throw projectError

    // Increment usage count
    if (!profile?.is_admin) {
      await supabase.rpc('check_and_increment_usage', { user_uuid: user.id })
    }

    // Trigger Inngest workflow
    await inngest.send({
      name: 'project/process',
      data: {
        projectId: project.id,
        userId: user.id,
        originalImageUrl,
        settings,
      },
    })

    return NextResponse.json({ projectId: project.id, project })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}
