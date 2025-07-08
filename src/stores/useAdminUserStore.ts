// stores/useUserStore.ts
import { toast } from 'sonner';
import { create } from 'zustand';

// Types
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  role: 'CUSTOMER' | 'OWNER';
  email: string;
  createdAt: string;
  phone_numbers?: string;
  imageUrl?: string;
}

export interface UserFilters {
  roles?: string[];
  search?: string;
  limit?: number;
  page?: number;
}

interface UserStore {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  roleUpdateLoading: number | null;
  deleteLoading: number | null;
  filters: UserFilters;

  // Actions
  setCurrentPage: (page: number) => void;
  setFilters: (filters: UserFilters) => void;
  loadUsers: () => Promise<void>;
  updateUserRole: (userId: number, role: string) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const defaultFilters: UserFilters = {
  roles: ['CUSTOMER', 'OWNER'],
  limit: 10,
  page: 1,
};

export const useAdminUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  roleUpdateLoading: null,
  deleteLoading: null,
  filters: defaultFilters,

  // Actions
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    get().loadUsers();
  },

  setFilters: (filters: UserFilters) => {
    set({
      filters: { ...get().filters, ...filters },
      currentPage: 1,
    });
  },

  clearError: () => set({ error: null }),

  loadUsers: async () => {
    const { filters, currentPage } = get();
    set({ loading: true, error: null });

    try {
      const queryParams = new URLSearchParams();

      if (filters.roles && filters.roles.length > 0) {
        queryParams.append('roles', filters.roles.join(','));
      }

      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      if (filters.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      queryParams.append('page', currentPage.toString());

      const response = await fetch(
        `/api/admin/users?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();

      set({
        users: data.users || [],
        totalItems: data.totalItems || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading users:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load users',
        users: [],
        totalItems: 0,
        totalPages: 1,
      });
    }
  },

  updateUserRole: async (userId: number, role: string) => {
    set({ roleUpdateLoading: userId, error: null });

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }

      const updatedUser = await response.json();

      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user,
        ),
        roleUpdateLoading: null,
        error: null,
      }));
      toast.success(`Berhasil mengubah role!`);
    } catch (error) {
      console.error('Error updating user role:', error);
      set({
        roleUpdateLoading: null,
        error:
          error instanceof Error ? error.message : 'Failed to update user role',
      });

      toast.error('Gagal mengubah peran. Silakan coba lagi.');
    }
  },

  deleteUser: async (userId: number) => {
    set({ deleteLoading: userId, error: null });

    try {
      console.log('Attempting to delete user with ID:', userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log('Error data from API:', errorData);
        } catch (parseError) {
          console.log('Failed to parse error response:', parseError);
          errorData = { message: response.statusText };
        }
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Failed to delete user: ${response.status} ${response.statusText}`,
        );
      }

      // Show success message immediately
      toast.success('Pengguna berhasil dihapus dari sistem!');

      // Optimistically remove user from the local state
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        totalItems: state.totalItems - 1,
        deleteLoading: null,
      }));

      // Refresh data after a short delay to ensure webhook has processed
      // This handles cases where the webhook might take a moment to sync
      setTimeout(() => {
        get().loadUsers();
      }, 1000);
    } catch (error) {
      console.error('Error deleting user:', error);

      // More specific error handling
      let errorMessage = 'Gagal menghapus pengguna.';
      if (error instanceof Error) {
        if (error.message.includes('Clerk')) {
          errorMessage = 'Gagal menghapus pengguna dari sistem autentikasi.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Anda tidak memiliki izin untuk menghapus pengguna.';
        } else if (error.message.includes('admin')) {
          errorMessage = 'Tidak dapat menghapus akun admin.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Pengguna tidak ditemukan.';
        } else {
          errorMessage = error.message;
        }
      }

      set({
        deleteLoading: null,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      });

      toast.error(errorMessage);
    }
  },

  refreshData: async () => {
    await get().loadUsers();
  },
}));
