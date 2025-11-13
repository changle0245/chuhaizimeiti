'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Database } from '@/lib/database.types'
import { Plus, Trash2 } from 'lucide-react'

type Product = Database['public']['Tables']['product_library']['Row']

interface ProductLibraryProps {
  products: Product[]
  userId: string
}

export default function ProductLibrary({ products: initialProducts, userId }: ProductLibraryProps) {
  const [products, setProducts] = useState(initialProducts)
  const [isAdding, setIsAdding] = useState(false)
  const [newProduct, setNewProduct] = useState({
    productName: '',
    category: '',
    description: '',
    keywords: '',
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleAddProduct = async () => {
    if (!newProduct.productName || !newProduct.category || !newProduct.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          keywords: newProduct.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error('Failed to add product')

      const { product } = await response.json()
      setProducts([product, ...products])
      setNewProduct({
        productName: '',
        category: '',
        description: '',
        keywords: '',
      })
      setIsAdding(false)

      toast({
        title: 'Success',
        description: 'Product added to your library',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete product')

      setProducts(products.filter((p) => p.id !== productId))

      toast({
        title: 'Success',
        description: 'Product deleted from your library',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Library</h1>
          <p className="text-gray-600 mt-2">
            Build your product knowledge base for better AI-generated content
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                placeholder="e.g., Iron Incense Burner"
                value={newProduct.productName}
                onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Home Decor, Kitchenware"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                placeholder="Detailed description of the product..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="e.g., decorative, traditional, handmade"
                value={newProduct.keywords}
                onChange={(e) => setNewProduct({ ...newProduct, keywords: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddProduct} disabled={saving}>
                {saving ? 'Adding...' : 'Add Product'}
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Your product library is empty. Add products to help AI generate better content.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{product.product_name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                  </div>
                  <Button
                    onClick={() => handleDeleteProduct(product.id)}
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">{product.description}</p>
                {product.keywords && product.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
