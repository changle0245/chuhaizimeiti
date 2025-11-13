import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import JSZip from 'jszip'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.status !== 'completed') {
      return NextResponse.json(
        { error: 'Project not completed yet' },
        { status: 400 }
      )
    }

    // Create ZIP file
    const zip = new JSZip()

    // Download and add files to zip
    const downloads: Promise<void>[] = []

    // Original image
    if (project.original_image_url) {
      downloads.push(
        fetch(project.original_image_url)
          .then((res) => res.arrayBuffer())
          .then((buffer) => zip.file('original.png', buffer))
      )
    }

    // Background removed
    if (project.background_removed_url) {
      downloads.push(
        fetch(project.background_removed_url)
          .then((res) => res.arrayBuffer())
          .then((buffer) => zip.file('background-removed.png', buffer))
      )
    }

    // Processed image
    if (project.processed_image_url) {
      downloads.push(
        fetch(project.processed_image_url)
          .then((res) => res.arrayBuffer())
          .then((buffer) => zip.file('final-image.png', buffer))
      )
    }

    // Video
    if (project.video_url) {
      downloads.push(
        fetch(project.video_url)
          .then((res) => res.arrayBuffer())
          .then((buffer) => zip.file('video.mp4', buffer))
      )
    }

    // Marketing copy
    if (project.copy_english) {
      zip.file('copy-english.txt', project.copy_english)
    }

    if (project.copy_arabic) {
      zip.file('copy-arabic.txt', project.copy_arabic)
    }

    // Wait for all downloads
    await Promise.all(downloads)

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="project-${project.id}.zip"`,
      },
    })
  } catch (error: any) {
    console.error('Error downloading project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download project' },
      { status: 500 }
    )
  }
}
