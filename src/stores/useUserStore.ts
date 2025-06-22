// stores/useUserStore.ts
import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  username: string;
  imageUrl: string | null;
  phone_numbers: string | null;
  businessAddress: string | null;
  businessName: string | null;
  businessBio: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'OWNER';
  clerkUserId: string;
  createdAt: Date;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUser: () => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  updateBusinessProfile: (updates: {
    first_name: string;
    last_name: string | null;
    username: string;
    businessAddress: string | null;
    businessName: string | null;
  }) => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/user/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      set({ user: userData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  updatePhoneNumber: async (phoneNumber: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/user/phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to update phone number');
      }

      const updatedUser = await response.json();
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  updateBusinessProfile: async (updates) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update business profile');
      }

      const updatedUser = await response.json();
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),
}));
