// hooks/useWishlistData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

type WishlistItem = {
  id: number;
  userId: number;
  productsId: number;
  createdAt: string;
  products: {
    id: number;
    name: string;
    images: string[];
    owner: {
      id: number;
      username: string;
    };
    VariantProducts: {
      id: number;
      price: number;
    }[];
  };
};

export const useWishlistData = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  const fetchWishlist = async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/wishlist');
      
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch wishlist');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productsId: number) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productsId }),
      });

      if (response.ok) {
        // Remove from local state
        setWishlist(prev => prev.filter(item => item.productsId !== productsId));
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error removing from wishlist:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isSignedIn]);

  return {
    wishlist,
    loading,
    error,
    refetch: fetchWishlist,
    removeFromWishlist
  };
};

// utils/wishlist.ts
export const wishlistAPI = {
  async add(productsId: number) {
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productsId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to wishlist');
    }

    return response.json();
  },

  async remove(productsId: number) {
    const response = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productsId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from wishlist');
    }

    return response.json();
  },

  async check(productsId: number) {
    const response = await fetch(`/api/wishlist/check?productsId=${productsId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check wishlist status');
    }

    return response.json();
  },

  async getAll() {
    const response = await fetch('/api/wishlist');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch wishlist');
    }

    return response.json();
  }
};