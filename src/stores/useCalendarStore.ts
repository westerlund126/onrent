// store/calendarStore.ts
import { create } from 'zustand';

interface CalendarState {
  selectedSlot: any | null;
  events: any[];
  setSelectedSlot: (slot: any) => void;
  setEvents: (events: any[]) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedSlot: null,
  events: [],
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setEvents: (events) => set({ events }),
}));
