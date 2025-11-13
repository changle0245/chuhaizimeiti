import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPanel from '@/components/admin-panel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is admin
  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Get all API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .order('service_name')

  return <AdminPanel apiKeys={apiKeys || []} />
}
