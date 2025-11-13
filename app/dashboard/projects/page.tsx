import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all user projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-2">View and manage all your marketing projects</p>
        </div>
        <Link href="/dashboard">
          <Button>Create New Project</Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any projects yet</p>
              <Link href="/dashboard">
                <Button>Create Your First Project</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={project.original_image_url}
                      alt="Project"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {project.status === 'completed' && (
                        <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
                          Completed
                        </span>
                      )}
                      {project.status === 'processing' && (
                        <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded">
                          Processing
                        </span>
                      )}
                      {project.status === 'pending' && (
                        <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
                          Pending
                        </span>
                      )}
                      {project.status === 'failed' && (
                        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{formatDate(project.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
