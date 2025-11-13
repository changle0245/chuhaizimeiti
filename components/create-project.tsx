'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/image-upload'
import ProjectSettings from '@/components/project-settings'

interface CreateProjectProps {
  userId: string
  canCreate: boolean
}

export type ProjectSettings = {
  backgroundStyle: 'auto' | 'modern' | 'traditional' | 'lifestyle' | 'plain'
  customBackgroundPrompt?: string
  videoDuration: 5 | 10 | 15 | 30
  includeMusic: boolean
  languages: ('english' | 'arabic')[]
}

export default function CreateProject({ userId, canCreate }: CreateProjectProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [settings, setSettings] = useState<ProjectSettings>({
    backgroundStyle: 'auto',
    videoDuration: 10,
    includeMusic: true,
    languages: ['english', 'arabic'],
  })
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<'upload' | 'settings' | 'processing'>('upload')
  const router = useRouter()
  const { toast } = useToast()

  const handleImageSelect = (file: File, preview: string) => {
    setUploadedImage(file)
    setImagePreview(preview)
    setStep('settings')
  }

  const handleGenerate = async () => {
    if (!uploadedImage || !canCreate) return

    setProcessing(true)
    setStep('processing')

    try {
      // Upload image
      const formData = new FormData()
      formData.append('file', uploadedImage)
      formData.append('userId', userId)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error('Failed to upload image')

      const { fileUrl } = await uploadResponse.json()

      // Create project
      const projectResponse = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImageUrl: fileUrl,
          settings,
        }),
      })

      if (!projectResponse.ok) throw new Error('Failed to create project')

      const { projectId } = await projectResponse.json()

      toast({
        title: 'Success!',
        description: 'Your project is being processed. This may take a few minutes.',
      })

      // Redirect to project page
      router.push(`/dashboard/projects/${projectId}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      })
      setStep('settings')
    } finally {
      setProcessing(false)
    }
  }

  const handleBack = () => {
    if (step === 'settings') {
      setStep('upload')
      setUploadedImage(null)
      setImagePreview(null)
    }
  }

  return (
    <div className="space-y-6">
      {step === 'upload' && (
        <Card>
          <CardContent className="pt-6">
            <ImageUpload
              onImageSelect={handleImageSelect}
              disabled={!canCreate}
            />
          </CardContent>
        </Card>
      )}

      {step === 'settings' && imagePreview && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <Label>Uploaded Image</Label>
                <div className="mt-2 relative w-full max-w-md mx-auto">
                  <img
                    src={imagePreview}
                    alt="Uploaded product"
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <ProjectSettings
                settings={settings}
                onSettingsChange={setSettings}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
            <Button onClick={handleGenerate} disabled={processing}>
              {processing ? 'Creating...' : 'Generate Content'}
            </Button>
          </div>
        </>
      )}

      {step === 'processing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Processing Your Image</h3>
              <p className="text-gray-600">
                AI is working its magic. This usually takes 2-5 minutes...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
