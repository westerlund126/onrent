import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export const useWishlist = (productId: string | number) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();

  // Convert productId to number for API calls
  const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (!isSignedIn || !numericProductId || isNaN(numericProductId)) return;
    
    checkWishlistStatus();
  }, [productId, isSignedIn, numericProductId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check?productsId=${numericProductId}`);
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

    if (!numericProductId || isNaN(numericProductId)) {
      toast.error('Invalid product ID');
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
          body: JSON.stringify({ productsId: numericProductId }),
        });

        if (response.ok) {
          setIsInWishlist(false);
        } else {
          const error = await response.json();
          console.error('Error removing from wishlist:', error);
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productsId: numericProductId }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success('Berhasil menambahkan ke favorit');
        } else {
          const error = await response.json();
          console.error('Error adding to wishlist:', error);
          toast.error(error.message || 'Gagal menambahkan ke favorit');

          if (response.status === 409) {
            setIsInWishlist(true);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Terjadi kesalahan saat mengubah status favorit');
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