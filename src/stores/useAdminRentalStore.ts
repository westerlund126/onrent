// stores/useAdminRentalStore.ts
import { create } from 'zustand';
import {
  Rental,
  RentalListResponse,
  RentalStatus,
  RentalFilters,
} from 'types/rental';

interface AdminRentalFilters extends RentalFilters {
  ownerId?: number;
}

interface AdminRentalState {
  rentals: Rental[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filters: AdminRentalFilters;

  setRentals: (rentals: Rental[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setPagination: (totalPages: number, totalItems: number) => void;
  setFilters: (filters: AdminRentalFilters) => void;

  loadRentals: () => Promise<void>;
  refreshData: () => Promise<void>;
  buildQueryParams: () => string;
}

export const useAdminRentalStore = create<AdminRentalState>((set, get) => ({
  rentals: [],
  loading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  filters: { page: 1, limit: 10 },

  setRentals: (rentals) => set({ rentals }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPagination: (totalPages, totalItems) => set({ totalPages, totalItems }),
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
    if (filters.ownerId) {
      params.append('ownerId', filters.ownerId.toString());
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
      const response = await fetch(`/api/admin/rentals?${queryParams}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: RentalListResponse = await response.json();

      setRentals(result.data);
      setPagination(result.pagination.totalPages, result.pagination.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Failed to fetch admin rentals:', err);
    } finally {
      setLoading(false);
    }
  },

  refreshData: async () => {
    const { loadRentals } = get();
    await loadRentals();
  },
}));