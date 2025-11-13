'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectDetailProps {
  project: Project
}

export default function ProjectDetail({ project: initialProject }: ProjectDetailProps) {
  const [project, setProject] = useState(initialProject)
  const [polling, setPolling] = useState(initialProject.status === 'processing' || initialProject.status === 'pending')
  const router = useRouter()
  const { toast } = useToast()

  // Poll for status updates
  useEffect(() => {
    if (!polling) return

    const interval = setInterval(async () => {
      const response = await fetch(`/api/projects/${project.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)

        if (data.project.status === 'completed' || data.project.status === 'failed') {
          setPolling(false)
          if (data.project.status === 'completed') {
            toast({
              title: 'Success!',
              description: 'Your project has been completed',
            })
          } else {
            toast({
              title: 'Processing Failed',
              description: data.project.error_message || 'An error occurred',
              variant: 'destructive',
            })
          }
        }
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [polling, project.id, toast])

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/download`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-${project.id}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download project files',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = () => {
    switch (project.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Failed
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Details</h1>
          <p className="text-gray-600 mt-1">
            Created {new Date(project.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge()}
          {project.status === 'completed' && (
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          )}
        </div>
      </div>

      {project.status === 'failed' && project.error_message && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Processing Failed</h3>
                <p className="text-sm text-red-700 mt-1">{project.error_message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(project.status === 'pending' || project.status === 'processing') && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Processing Your Project</h3>
              <p className="text-gray-600">
                AI is generating your marketing content. This usually takes 2-5 minutes...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {project.status === 'completed' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card>
            <CardHeader>
              <CardTitle>Original Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={project.original_image_url}
                alt="Original"
                className="w-full rounded-lg border"
              />
            </CardContent>
          </Card>

          {/* Background Removed */}
          {project.background_removed_url && (
            <Card>
              <CardHeader>
                <CardTitle>Background Removed</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={project.background_removed_url}
                  alt="Background removed"
                  className="w-full rounded-lg border bg-gray-100"
                />
              </CardContent>
            </Card>
          )}

          {/* Processed Image */}
          {project.processed_image_url && (
            <Card>
              <CardHeader>
                <CardTitle>With New Background</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={project.processed_image_url}
                  alt="Processed"
                  className="w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* Video */}
          {project.video_url && (
            <Card>
              <CardHeader>
                <CardTitle>Marketing Video</CardTitle>
              </CardHeader>
              <CardContent>
                <video
                  src={project.video_url}
                  controls
                  className="w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Marketing Copy */}
      {project.status === 'completed' && (project.copy_english || project.copy_arabic) && (
        <div className="grid md:grid-cols-2 gap-6">
          {project.copy_english && (
            <Card>
              <CardHeader>
                <CardTitle>English Copy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{project.copy_english}</p>
              </CardContent>
            </Card>
          )}

          {project.copy_arabic && (
            <Card>
              <CardHeader>
                <CardTitle>Arabic Copy (العربية)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-right" dir="rtl">
                  {project.copy_arabic}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={() => router.push('/dashboard/projects')} variant="outline">
          Back to Projects
        </Button>
      </div>
    </div>
  )
}
