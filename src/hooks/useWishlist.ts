// hooks/useWishlist.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export const useWishlist = (productId: number) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (!isSignedIn) return;
    
    checkWishlistStatus();
  }, [productId, isSignedIn]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check?productsId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
  if (!isSignedIn) {
    alert('Please sign in to add items to wishlist');
    return;
  }

  setLoading(true);

  try {
    if (isInWishlist) {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productsId: productId }),
      });

      if (response.ok) {
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        const error = await response.json();
        console.error('Error removing from wishlist:', error);
        toast.error('Failed to remove from wishlist');
      }
    } else {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productsId: productId }),
      });

      if (response.ok) {
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      } else {
        const error = await response.json();
        console.error('Error adding to wishlist:', error);
        toast.error(error.message || 'Failed to add to wishlist');

        if (response.status === 409) {
          setIsInWishlist(true);
        }
      }
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    toast.error('Something went wrong');
  } finally {
    setLoading(false);
  }
};


  return {
    isInWishlist,
    toggleWishlist,
    loading
  };
};