// store/useCalendarStore.ts
import { create } from 'zustand';
import type { TBadgeVariant, TWorkingHours } from 'types/fitting';

interface CalendarState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;

  workingHours: TWorkingHours;
  setWorkingHours: (workingHours: TWorkingHours) => void;

}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  badgeVariant: 'colored',
  setBadgeVariant: (variant) => set({ badgeVariant: variant }),

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

}));
