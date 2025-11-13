import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { productName, category, description, keywords } = await request.json()

    if (!productName || !category || !description) {
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

    // Insert product
    const { data: product, error } = await supabase
      .from('product_library')
      .insert({
        user_id: user.id,
        product_name: productName,
        category,
        description,
        keywords: keywords || [],
        target_market: 'arabic_muslim',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add product' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get products
    const { data: products, error } = await supabase
      .from('product_library')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
