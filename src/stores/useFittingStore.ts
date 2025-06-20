//stores/useFittingStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { IFittingSchedule, IFittingSlot } from 'types/fitting';

interface FittingState {
  selectedDate: Date;
  fittingSchedules: IFittingSchedule[];
  fittingSlots: IFittingSlot[];
  isLoading: boolean;
  error: string | null;

  setSelectedDate: (date: Date) => void;
  setFittingSchedules: (schedules: IFittingSchedule[]) => void;
  setFittingSlots: (slots: IFittingSlot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchFittingSchedules: (dateFrom?: string, dateTo?: string) => Promise<void>;
  fetchFittingSlots: (dateFrom?: string, dateTo?: string) => Promise<void>;
  createFittingSchedule: (scheduleData: {
    fittingSlotId: number;
    duration?: number;
    note?: string;
    phoneNumber?: string;
    variantId?: number;
  }) => Promise<IFittingSchedule | null>;
  updateFittingSchedule: (
    scheduleId: number,
    updates: Partial<IFittingSchedule>,
  ) => Promise<void>;
  cancelFittingSchedule: (scheduleId: number) => Promise<void>;
  confirmFittingSchedule: (scheduleId: number) => Promise<void>;

  
  createFittingSlot: (slotData: {
    dateTime: string;
    isAutoConfirm?: boolean;
  }) => Promise<IFittingSlot | null>;
  updateFittingSlot: (
    slotId: number,
    updates: {
      dateTime?: string;
      isAutoConfirm?: boolean;
      allowUpdateWhenBooked?: boolean;
    },
  ) => Promise<void>;
}

export const useFittingStore = create<FittingState>()(
  immer((set, get) => ({
    selectedDate: new Date(),
    fittingSchedules: [],
    fittingSlots: [],
    isLoading: false,
    error: null,

    setSelectedDate: (date) =>
      set((state) => {
        state.selectedDate = date;
      }),

    setFittingSchedules: (schedules) =>
      set((state) => {
        state.fittingSchedules = schedules;
      }),

    setFittingSlots: (slots) =>
      set((state) => {
        state.fittingSlots = slots;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    fetchFittingSchedules: async (dateFrom, dateTo) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const url = `/api/fitting/schedule${
          params.toString() ? `?${params.toString()}` : ''
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch schedules: ${response.statusText}`);
        }

        const schedules = await response.json();

        set((state) => {
          state.fittingSchedules = schedules;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to fetch fitting schedules:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to fetch schedules';
          state.isLoading = false;
        });
      }
    },

    fetchFittingSlots: async (dateFrom, dateTo) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const url = `/api/fitting/slots${
          params.toString() ? `?${params.toString()}` : ''
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch slots: ${response.statusText}`);
        }

        const slots = await response.json();

        set((state) => {
          state.fittingSlots = slots;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to fetch fitting slots:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to fetch slots';
          state.isLoading = false;
        });
      }
    },

    createFittingSchedule: async (scheduleData) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const requestData = {
          fittingSlotId: scheduleData.fittingSlotId,
          duration: scheduleData.duration || 60,
          note: scheduleData.note,
          phoneNumber: scheduleData.phoneNumber,
          variantIds: scheduleData.variantId ? [scheduleData.variantId] : [],
        };

        const response = await fetch('/api/fitting/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create schedule');
        }

        const { schedule: newSchedule } = await response.json(); // Note {schedule} destructuring

        set((state) => {
          state.fittingSchedules.push(newSchedule);
          const slotIndex = state.fittingSlots.findIndex(
            (slot) => slot.id === scheduleData.fittingSlotId,
          );
          if (slotIndex !== -1) {
            state.fittingSlots[slotIndex].isBooked = true;
          }
          state.isLoading = false;
        });

        return newSchedule;
      } catch (error) {
        
      }
    },

    updateFittingSchedule: async (scheduleId, updates) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch(`/api/fitting/schedule/${scheduleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update schedule');
        }

        const updatedSchedule = await response.json();

        set((state) => {
          const index = state.fittingSchedules.findIndex(
            (s) => s.id === scheduleId,
          );
          if (index !== -1) {
            state.fittingSchedules[index] = {
              ...state.fittingSchedules[index],
              ...updatedSchedule,
            };
          }
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to update fitting schedule:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to update schedule';
          state.isLoading = false;
        });
      }
    },

    cancelFittingSchedule: async (scheduleId) => {
      try {
        await get().updateFittingSchedule(scheduleId, { status: 'CANCELED' });
      } catch (error) {
        console.error('Failed to cancel fitting schedule:', error);
      }
    },

    confirmFittingSchedule: async (scheduleId) => {
      try {
        await get().updateFittingSchedule(scheduleId, { status: 'CONFIRMED' });
      } catch (error) {
        console.error('Failed to confirm fitting schedule:', error);
      }
    },

    createFittingSlot: async ({ dateTime, isAutoConfirm = false }) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/fitting/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateTime, isAutoConfirm }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create slot');
        }

        const newSlot = await response.json();

        set((state) => {
          state.fittingSlots.push(newSlot);
          state.isLoading = false;
        });

        return newSlot;
      } catch (error) {
        console.error('Failed to create fitting slot:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to create slot';
          state.isLoading = false;
        });
        return null;
      }
    },

    updateFittingSlot: async (slotId, updates) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch(`/api/fitting/slots/${slotId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update slot');
        }

        const updatedSlot = await response.json();

        set((state) => {
          const index = state.fittingSlots.findIndex((s) => s.id === slotId);
          if (index !== -1) {
            state.fittingSlots[index] = {
              ...state.fittingSlots[index],
              ...updatedSlot,
            };
          }
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to update fitting slot:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to update slot';
          state.isLoading = false;
        });
      }
    },
  })),
);
