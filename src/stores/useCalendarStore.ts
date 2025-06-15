// store/useCalendarStore.ts
import { create } from 'zustand';
import type {
  IUser,
  TBadgeVariant,
  TWorkingHours,
  TVisibleHours,
} from 'types/fitting';

interface CalendarState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  selectedUserId: string | 'all';
  setSelectedUserId: (userId: string | 'all') => void;

  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;

  visibleHours: TVisibleHours;
  setVisibleHours: (visibleHours: TVisibleHours) => void;

  workingHours: TWorkingHours;
  setWorkingHours: (workingHours: TWorkingHours) => void;

  users: IUser[];
  setUsers: (users: IUser[]) => void;
  fetchUsers: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  selectedUserId: 'all',
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),

  badgeVariant: 'colored',
  setBadgeVariant: (variant) => set({ badgeVariant: variant }),

  visibleHours: { from: 7, to: 18 },
  setVisibleHours: (visibleHours) => set({ visibleHours }),

  workingHours: {
    0: { from: 0, to: 0 }, // Sunday closed
    1: { from: 8, to: 17 }, // Monday
    2: { from: 8, to: 17 }, // Tuesday
    3: { from: 8, to: 17 }, // Wednesday
    4: { from: 8, to: 17 }, // Thursday
    5: { from: 8, to: 17 }, // Friday
    6: { from: 8, to: 12 }, // Saturday half day
  },
  setWorkingHours: (workingHours) => set({ workingHours }),

  users: [],
  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      set({ users });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },
}));
