import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProjectDetail from '@/components/project-detail'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    redirect('/dashboard/projects')
  }

  return <ProjectDetail project={project} />
}
