import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateProject from '@/components/create-project'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile and usage
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user has exceeded daily limit
  const dailyLimit = parseInt(process.env.DAILY_USAGE_LIMIT || '5')
  const canCreate = profile?.is_admin || (profile?.daily_usage_count || 0) < dailyLimit

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Marketing Content</h1>
        <p className="text-gray-600">
          Upload your product image and let AI generate professional marketing materials
        </p>
      </div>

      {!canCreate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">Daily Limit Reached</p>
          <p className="text-yellow-700 text-sm">
            You've used all {dailyLimit} generations for today. Your limit will reset in 24 hours.
          </p>
        </div>
      )}

      <CreateProject userId={user.id} canCreate={canCreate} />
    </div>
  )
}
