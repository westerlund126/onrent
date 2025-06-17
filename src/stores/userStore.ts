//stores/userStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { IUser, UserRole } from 'types/user';

interface UserState {
  users: IUser[];
  selectedUserId: number | 'all';
  currentUser: IUser | null;
  filterByRole: UserRole | 'all';
  // Actions
  setUsers: (users: IUser[]) => void;
  setSelectedUserId: (userId: number | 'all') => void;
  setCurrentUser: (user: IUser | null) => void;
  setFilterByRole: (role: UserRole | 'all') => void;
  fetchUsers: (role?: UserRole) => Promise<void>;
  fetchUserById: (userId: number) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    users: [],
    selectedUserId: 'all',
    currentUser: null,
    filterByRole: 'all',

    setUsers: (users) =>
      set((state) => {
        state.users = users;
      }),

    setSelectedUserId: (userId) =>
      set((state) => {
        state.selectedUserId = userId;
      }),

    setCurrentUser: (user) =>
      set((state) => {
        state.currentUser = user;
      }),

    setFilterByRole: (role) =>
      set((state) => {
        state.filterByRole = role;
      }),

    fetchUsers: async (role) => {
      try {
        const url = role ? `/api/users?role=${role}` : '/api/users';
        const response = await fetch(url);
        const users = await response.json();
        set((state) => {
          state.users = users;
        });
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    },

    fetchUserById: async (userId) => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const user = await response.json();
        set((state) => {
          state.currentUser = user;
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    },
  })),
);
