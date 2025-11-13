'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Database } from '@/lib/database.types'

type ApiKey = Database['public']['Tables']['api_keys']['Row']

interface AdminPanelProps {
  apiKeys: ApiKey[]
}

const API_SERVICES = [
  { name: 'openai', label: 'OpenAI API', description: 'GPT-4 Vision & GPT-4o for content generation' },
  { name: 'removebg', label: 'Remove.bg API', description: 'Background removal service' },
  { name: 'stability', label: 'Stability AI API', description: 'Background generation with SDXL' },
  { name: 'shotstack', label: 'Shotstack API', description: 'Video generation service' },
]

export default function AdminPanel({ apiKeys: initialApiKeys }: AdminPanelProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(
    initialApiKeys.reduce((acc, key) => ({ ...acc, [key.service_name]: key.api_key }), {})
  )
  const [testingService, setTestingService] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async (serviceName: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: serviceName,
          api_key: apiKeys[serviceName],
        }),
      })

      if (!response.ok) throw new Error('Failed to save API key')

      toast({
        title: 'Success',
        description: `${serviceName} API key saved successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save API key',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (serviceName: string) => {
    setTestingService(serviceName)
    try {
      const response = await fetch('/api/admin/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_name: serviceName }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: `${serviceName} API is working correctly`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to test ${serviceName} API`,
        variant: 'destructive',
      })
    } finally {
      setTestingService(null)
    }
  }

  const handleTestAll = async () => {
    for (const service of API_SERVICES) {
      if (apiKeys[service.name]) {
        await handleTest(service.name)
        // Add delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage API keys and system configuration</p>
        </div>
        <Button onClick={handleTestAll} variant="outline">
          Test All APIs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure and test API keys for all integrated services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {API_SERVICES.map((service) => {
            const existingKey = initialApiKeys.find(k => k.service_name === service.name)
            const isActive = existingKey?.is_active
            const lastTested = existingKey?.last_tested_at
            const testStatus = existingKey?.test_status

            return (
              <div key={service.name} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{service.label}</h3>
                      {isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    {lastTested && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last tested: {new Date(lastTested).toLocaleString()}
                        {testStatus && ` - ${testStatus}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={service.name}>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id={service.name}
                      type="password"
                      placeholder={`Enter ${service.label} key`}
                      value={apiKeys[service.name] || ''}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, [service.name]: e.target.value })
                      }
                    />
                    <Button
                      onClick={() => handleSave(service.name)}
                      disabled={!apiKeys[service.name] || saving}
                      variant="outline"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => handleTest(service.name)}
                      disabled={!apiKeys[service.name] || testingService === service.name}
                      variant="secondary"
                    >
                      {testingService === service.name ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Usage Limit:</span>
              <span className="font-medium">{process.env.DAILY_USAGE_LIMIT || 5} generations/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Provider:</span>
              <span className="font-medium">Cloudflare R2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Task Queue:</span>
              <span className="font-medium">Inngest</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
