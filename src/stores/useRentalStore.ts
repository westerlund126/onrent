// stores/useRentalStore.ts
import { create } from 'zustand';
import {
  Rental,
  RentalListResponse,
  RentalStatus,
  RentalFilters,
  ApiResponse,
} from 'types/rental';

interface RentalUpdateData {
  status?: RentalStatus;
  startDate?: string;
  endDate?: string;
  additionalInfo?: string;
  variantIds?: number[];
}

interface RentalState {
  rentals: Rental[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  statusUpdateLoading: number | null;
  editUpdateLoading: number | null;
  deleteLoading: boolean;
  returnInitiateLoading: number | null; // New: For customer return action
  returnConfirmLoading: number | null; // New: For owner confirmation action
  filters: RentalFilters;

  setRentals: (rentals: Rental[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setPagination: (totalPages: number, totalItems: number) => void;
  setStatusUpdateLoading: (rentalId: number | null) => void;
  setEditUpdateLoading: (rentalId: number | null) => void;
  setDeleteLoading: (loading: boolean) => void;
  setReturnInitiateLoading: (rentalId: number | null) => void; // New
  setReturnConfirmLoading: (rentalId: number | null) => void; // New
  setFilters: (filters: RentalFilters) => void;

  loadRentals: () => Promise<void>;
  updateRentalStatus: (
    rentalId: number,
    newStatus: RentalStatus,
  ) => Promise<void>;
  updateRental: (
    rentalId: number,
    updateData: RentalUpdateData,
  ) => Promise<Rental>;
  deleteRental: (rentalId: number) => Promise<void>;
  initiateReturn: (rentalId: number) => Promise<void>; // New: Customer return
  confirmReturn: (rentalId: number) => Promise<void>; // New: Owner confirmation
  refreshData: () => Promise<void>;

  buildQueryParams: () => string;
}

export const useRentalStore = create<RentalState>((set, get) => ({
  rentals: [],
  loading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  statusUpdateLoading: null,
  editUpdateLoading: null,
  deleteLoading: false,
  returnInitiateLoading: null, // New
  returnConfirmLoading: null, // New
  filters: { page: 1, limit: 10 },

  setRentals: (rentals) => set({ rentals }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPagination: (totalPages, totalItems) => set({ totalPages, totalItems }),
  setStatusUpdateLoading: (rentalId) => set({ statusUpdateLoading: rentalId }),
  setEditUpdateLoading: (rentalId) => set({ editUpdateLoading: rentalId }),
  setDeleteLoading: (loading) => set({ deleteLoading: loading }),
  setReturnInitiateLoading: (rentalId) =>
    set({ returnInitiateLoading: rentalId }), // New
  setReturnConfirmLoading: (rentalId) =>
    set({ returnConfirmLoading: rentalId }), // New
  setFilters: (newFilters) =>
    set((state) => {
      const merged = { ...state.filters, ...newFilters };

      const noChange = Object.keys(merged).every(
        (k) =>
          merged[k as keyof typeof merged] ===
          state.filters[k as keyof typeof merged],
      );
      if (noChange) return state;

      return {
        filters: merged,
        currentPage: newFilters.page ?? state.currentPage,
      };
    }),

  buildQueryParams: () => {
    const { currentPage, filters } = get();
    const params = new URLSearchParams();

    params.append('page', currentPage.toString());
    params.append('limit', (filters.limit || 10).toString());

    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.userId) {
      params.append('userId', filters.userId.toString());
    }

    return params.toString();
  },

  loadRentals: async () => {
    const {
      buildQueryParams,
      setLoading,
      setError,
      setRentals,
      setPagination,
    } = get();

    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams();
      const response = await fetch(`/api/rentals?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: RentalListResponse = await response.json();

      setRentals(result.data);
      setPagination(result.pagination.totalPages, result.pagination.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Failed to fetch rentals:', err);
    } finally {
      setLoading(false);
    }
  },

  updateRentalStatus: async (rentalId: number, newStatus: RentalStatus) => {
    const { setStatusUpdateLoading, setRentals, loadRentals } = get();

    try {
      setStatusUpdateLoading(rentalId);

      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const result: ApiResponse<Rental> = await response.json();

      set((state) => ({
        rentals: state.rentals.map((rental) =>
          rental.id === rentalId
            ? {
                ...rental,
                status: newStatus,
                Tracking: result.data?.Tracking || rental.Tracking,
              }
            : rental,
        ),
      }));

      console.log('Status updated successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update status';
      console.error('Failed to update rental status:', err);
      alert(`${errorMessage}. Please try again.`);

      await loadRentals();
    } finally {
      setStatusUpdateLoading(null);
    }
  },

  updateRental: async (rentalId: number, updateData: RentalUpdateData) => {
    const { setEditUpdateLoading } = get();

    try {
      setEditUpdateLoading(rentalId);

      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(errorData.error || 'Failed to update rental');
      }

      const result: ApiResponse<Rental> = await response.json();

      if (!result.data) {
        throw new Error('No data returned from update');
      }

      set((state) => ({
        rentals: state.rentals.map((rental) =>
          rental.id === rentalId ? result.data! : rental,
        ),
      }));

      console.log('Rental updated successfully');
      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update rental';
      console.error('Failed to update rental:', err);
      throw err;
    } finally {
      setEditUpdateLoading(null);
    }
  },

  deleteRental: async (rentalId: number) => {
    const {
      setDeleteLoading,
      currentPage,
      totalItems,
      filters,
      setCurrentPage,
      setPagination,
    } = get();

    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(errorData.error || 'Failed to delete rental');
      }

      set((state) => ({
        rentals: state.rentals.filter((r) => r.id !== rentalId),
      }));

      const itemsPerPage = filters.limit || 10;
      const newTotalItems = totalItems - 1;

      const state = get();
      if (state.rentals.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
        setPagination(newTotalPages, newTotalItems);
      }

      console.log('Rental deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete transaction';
      console.error('Failed to delete rental:', err);
      alert(`${errorMessage}. Please try again.`);
    } finally {
      setDeleteLoading(false);
    }
  },

  initiateReturn: async (rentalId: number) => {
    const { setReturnInitiateLoading, loadRentals } = get();

    try {
      setReturnInitiateLoading(rentalId);

      const response = await fetch(`/api/rentals/${rentalId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(errorData.error || 'Failed to initiate return');
      }

      const result: ApiResponse<Rental> = await response.json();

      set((state) => ({
        rentals: state.rentals.map((rental) =>
          rental.id === rentalId
            ? {
                ...rental,
                Tracking: result.data?.Tracking || rental.Tracking,
              }
            : rental,
        ),
      }));

      console.log('Return initiated successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initiate return';
      console.error('Failed to initiate return:', err);
      alert(`${errorMessage}. Please try again.`);

      await loadRentals();
    } finally {
      setReturnInitiateLoading(null);
    }
  },

  confirmReturn: async (rentalId: number) => {
  const { setReturnConfirmLoading, loadRentals } = get();

  try {
    setReturnConfirmLoading(rentalId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`/api/rentals/${rentalId}/confirm-return`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ApiResponse = await response.json();
      
      // Handle specific error cases
      if (response.status === 408) {
        throw new Error('Request timeout. The operation may still be processing. Please refresh the page.');
      }
      
      if (response.status === 409) {
        throw new Error('Return has already been processed.');
      }
      
      throw new Error(errorData.error || 'Failed to confirm return');
    }

    const result: ApiResponse<Rental> = await response.json();

    // Update the rental in state with completed status
    set((state) => ({
      rentals: state.rentals.map((rental) =>
        rental.id === rentalId
          ? {
              ...rental,
              status: result.data?.status || rental.status,
              Tracking: result.data?.Tracking || rental.Tracking,
            }
          : rental,
      ),
    }));

    console.log('Return confirmed successfully');
  } catch (err) {
    let errorMessage = 'Failed to confirm return';
    
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check if the operation completed and refresh the page.';
      } else {
        errorMessage = err.message;
      }
    }
    
    console.error('Failed to confirm return:', err);
    alert(`${errorMessage}. Please try again.`);

    await loadRentals();
  } finally {
    setReturnConfirmLoading(null);
  }
},

  refreshData: async () => {
    const { loadRentals } = get();
    await loadRentals();
  },
}));
