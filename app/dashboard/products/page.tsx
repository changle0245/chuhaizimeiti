import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductLibrary from '@/components/product-library'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user products
  const { data: products } = await supabase
    .from('product_library')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ProductLibrary products={products || []} userId={user.id} />
}
