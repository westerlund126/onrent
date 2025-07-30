'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Product, Owner, ProductVariant } from 'types/product';
import ProductCard from 'components/card/ProductCard'

interface WishlistItem {
  id: number
  createdAt: string
  products: Product
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.wishlist)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (wishlistId: number) => {
    setRemovingItems(prev => new Set(prev).add(wishlistId))
    
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(wishlistId)
        return newSet
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getLowestPrice = (variants: Product['VariantProducts']) => {
    const availableVariants = variants.filter(v => v.isAvailable)
    if (availableVariants.length === 0) return null
    return Math.min(...availableVariants.map(v => v.price))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Wishlist Saya ({wishlistItems.length})
          </h1>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Wishlist Anda kosong
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Mulai jelajahi produk-produk menarik dan tambahkan ke wishlist untuk disimpan
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

{wishlistItems.map((item) => (
  <ProductCard
    key={item.id}
    product={item.products}
  />
))}

                    {/* <p className="text-xs text-gray-400 mt-2">
                      Ditambahkan {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </p> */}
                  </div>
                

        
        )}
      </div>
    </div>
  )
}