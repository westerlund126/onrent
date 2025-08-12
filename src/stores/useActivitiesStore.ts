// store/useActivitiesStore.ts
import { create } from 'zustand';
import { toast } from 'sonner';

interface Activity {
  id: number;
  type: 'rental' | 'fitting';
  date: string;
  ownerName: string;
  products: string[];
  parentProductIds?: number[];
  status: string;
  totalPrice: number | null;
  rentalCode?: string;
  startDate?: string;
  endDate?: string;
  additionalInfo?: string;
  hasReview?: boolean;
  duration?: number;
  note?: string;
  fittingDateTime?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  rentalId: number;
  productId: number;
  user: {
    first_name: string;
    last_name?: string;
    username: string;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalActivities: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FittingCancelConfirmation {
  isOpen: boolean;
  fittingId: number | null;
  ownerName: string;
  isCanceling: boolean;
}

interface ActivitiesState {
  // Activities state
  activities: Activity[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  
  // Reviews state (organized by productId)
  reviews: Record<number, Review[]>;
  reviewsLoading: Record<number, boolean>;
  reviewsError: Record<number, string | null>;
  
  // Fitting cancel state
  fittingCancelConfirmation: FittingCancelConfirmation;
  
  // Activities actions
  fetchActivities: (page?: number, limit?: number) => Promise<void>;
  refreshActivities: () => Promise<void>;
  updateActivityStatus: (activityId: number, type: string, newStatus: string) => void;
  
  // Review actions
  fetchProductReviews: (productId: number) => Promise<void>;
  submitReview: (reviewData: {
    rentalId: number;
    rating: number;
    comment: string;
    products: number[];
  }) => Promise<void>;
  
  // Fitting cancel actions
  openFittingCancelConfirmation: (fittingId: number, ownerName: string) => void;
  cancelFittingCancellation: () => void;
  confirmCancelFitting: () => Promise<void>;
  
  // Utility actions
  reset: () => void;
}

const initialState = {
  activities: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  reviews: {},
  reviewsLoading: {},
  reviewsError: {},
  fittingCancelConfirmation: {
    isOpen: false,
    fittingId: null,
    ownerName: '',
    isCanceling: false,
  }
};

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  ...initialState,

  fetchActivities: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/activities?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      
      set({
        activities: data.activities,
        pagination: data.pagination,
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        loading: false
      });
      console.error('Error fetching activities:', error);
    }
  },

  refreshActivities: async () => {
    const { pagination } = get();
    await get().fetchActivities(1, pagination.currentPage * 10);
  },

  updateActivityStatus: (activityId: number, type: string, newStatus: string) => {
    set((state) => ({
      activities: state.activities.map(activity =>
        (activity.id === activityId && activity.type === type)
          ? { ...activity, status: newStatus }
          : activity
      )
    }));
  },

  fetchProductReviews: async (productId: number) => {
    set((state) => ({
      reviewsLoading: { ...state.reviewsLoading, [productId]: true },
      reviewsError: { ...state.reviewsError, [productId]: null }
    }));

    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      
      set((state) => ({
        reviews: { ...state.reviews, [productId]: data.reviews },
        reviewsLoading: { ...state.reviewsLoading, [productId]: false }
      }));
    } catch (error: any) {
      set((state) => ({
        reviewsError: { ...state.reviewsError, [productId]: error.message },
        reviewsLoading: { ...state.reviewsLoading, [productId]: false }
      }));
      console.error('Error fetching product reviews:', error);
    }
  },

  submitReview: async (reviewData) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengirim review');
      }

      const result = await response.json();
      
      // Update the activity to mark as reviewed
      set((state) => ({
        activities: state.activities.map(activity =>
          activity.id === reviewData.rentalId && activity.type === 'rental'
            ? { ...activity, hasReview: true }
            : activity
        )
      }));

      // Refresh reviews for all products that were reviewed
      reviewData.products.forEach(productId => {
        get().fetchProductReviews(productId);
      });
      
      toast.success("Review berhasil dikirim", {
        description: "Terima kasih atas review Anda!"
      });

      return result;
    } catch (error: any) {
      toast.error("Gagal mengirim review", {
        description: error.message || "Terjadi kesalahan, silakan coba lagi"
      });
      throw error;
    }
  },

  openFittingCancelConfirmation: (fittingId: number, ownerName: string) => {
    set({
      fittingCancelConfirmation: {
        isOpen: true,
        fittingId,
        ownerName,
        isCanceling: false,
      }
    });
  },

  cancelFittingCancellation: () => {
    set({
      fittingCancelConfirmation: {
        isOpen: false,
        fittingId: null,
        ownerName: '',
        isCanceling: false,
      }
    });
  },

  confirmCancelFitting: async () => {
    const { fittingCancelConfirmation } = get();
    if (!fittingCancelConfirmation.fittingId) return;

    set((state) => ({
      fittingCancelConfirmation: {
        ...state.fittingCancelConfirmation,
        isCanceling: true
      }
    }));

    try {
      const response = await fetch(`/api/fitting/schedule/${fittingCancelConfirmation.fittingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELED' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membatalkan fitting.');
      }

      get().updateActivityStatus(fittingCancelConfirmation.fittingId, 'fitting', 'CANCELED');
      toast.success('Jadwal fitting berhasil dibatalkan.');
      get().cancelFittingCancellation();
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error(error.message);
      set((state) => ({
        fittingCancelConfirmation: {
          ...state.fittingCancelConfirmation,
          isCanceling: false
        }
      }));
    }
  },

  reset: () => {
    set(initialState);
  }
}));