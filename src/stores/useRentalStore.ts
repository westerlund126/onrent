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
  filters: RentalFilters;

  setRentals: (rentals: Rental[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setPagination: (totalPages: number, totalItems: number) => void;
  setStatusUpdateLoading: (rentalId: number | null) => void;
  setEditUpdateLoading: (rentalId: number | null) => void;
  setDeleteLoading: (loading: boolean) => void;
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
  filters: { page: 1, limit: 10 },

  setRentals: (rentals) => set({ rentals }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPagination: (totalPages, totalItems) => set({ totalPages, totalItems }),
  setStatusUpdateLoading: (rentalId) => set({ statusUpdateLoading: rentalId }),
  setEditUpdateLoading: (rentalId) => set({ editUpdateLoading: rentalId }),
  setDeleteLoading: (loading) => set({ deleteLoading: loading }),
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

  refreshData: async () => {
    const { loadRentals } = get();
    await loadRentals();
  },
}));
