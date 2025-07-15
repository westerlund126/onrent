// stores/useFittingStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  IFittingSchedule,
  IFittingSlot,
  OwnerSettings,
} from 'types/fitting';

interface FittingState {
  selectedDate: Date;
  fittingSchedules: IFittingSchedule[];
  fittingSlots: IFittingSlot[];
  ownerSettings: OwnerSettings | null;
  isLoading: boolean;
  error: string | null;
  scheduleLoadingStates: Record<number, boolean>;

  setSelectedDate: (date: Date) => void;
  setFittingSchedules: (schedules: IFittingSchedule[]) => void;
  setFittingSlots: (slots: IFittingSlot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setScheduleLoading: (scheduleId: number, loading: boolean) => void;

  fetchFittingSchedules: (dateFrom?: string, dateTo?: string) => Promise<void>;
  fetchFittingSlots: (dateFrom?: string, dateTo?: string) => Promise<void>;
  createFittingSchedule: (scheduleData: {
    fittingSlotId: number;
    duration?: number;
    note?: string;
    phoneNumber?: string;
    variantId?: number;
    variantIds?: number[];
  }) => Promise<IFittingSchedule | null>;
  updateFittingSchedule: (
    scheduleId: number,
    updates: Partial<IFittingSchedule>,
  ) => Promise<void>;
  cancelFittingSchedule: (scheduleId: number) => Promise<void>;
  confirmFittingSchedule: (scheduleId: number) => Promise<void>;
  rejectFittingSchedule: (scheduleId: number) => Promise<void>;
  fetchOwnerSettings: () => Promise<void>;
  updateOwnerSettings: (settings: Partial<OwnerSettings>) => Promise<void>;

  createFittingSlot: (slotData: {
    dateTime: string;
  }) => Promise<IFittingSlot | null>;
  updateFittingSlot: (
    slotId: number,
    updates: {
      dateTime?: string;
      allowUpdateWhenBooked?: boolean;
    },
  ) => Promise<void>;
}

export const useFittingStore = create<FittingState>()(
  immer((set, get) => ({
    selectedDate: new Date(),
    fittingSchedules: [],
    fittingSlots: [],
    ownerSettings: null, 
    isLoading: false,
    error: null,
    scheduleLoadingStates: {},

    setSelectedDate: (date) =>
      set((state) => {
        if (date instanceof Date && !isNaN(date.getTime())) {
          state.selectedDate = new Date(date);
        } else {
          console.warn(
            'Invalid date provided to setSelectedDate, using current date',
          );
          state.selectedDate = new Date();
        }
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

    setScheduleLoading: (scheduleId, loading) =>
      set((state) => {
        state.scheduleLoadingStates[scheduleId] = loading;
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

        const processedSchedules = schedules.map((schedule: any) => {
          const base = new Date(schedule.fittingSlot?.dateTime ?? null);
          const duration = schedule.duration ?? 60;

          return {
            ...schedule,
            startTime: base,
            endTime: new Date(base.getTime() + duration * 60 * 1000),
            title: `${schedule.user?.first_name || 'Unknown'} - ${
              schedule.fittingType?.name || 'Fitting'
            }`,
            color: schedule.fittingType?.color || 'blue',
          };
        });

        set((state) => {
          state.fittingSchedules = processedSchedules;
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

    fetchOwnerSettings: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/owner/settings');

        if (!response.ok) {
          throw new Error(
            `Failed to fetch owner settings: ${response.statusText}`,
          );
        }

        const { data } = await response.json();

        set((state) => {
          state.ownerSettings = data;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to fetch owner settings:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to fetch owner settings';
          state.isLoading = false;
        });
      }
    },

    updateOwnerSettings: async (settings) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/owner/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update owner settings');
        }

        const { data } = await response.json();

        set((state) => {
          state.ownerSettings = data;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to update owner settings:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to update owner settings';
          state.isLoading = false;
        });
        throw error;
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
          variantIds: scheduleData.variantId
            ? [scheduleData.variantId, ...(scheduleData.variantIds || [])]
            : scheduleData.variantIds || [],
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

        const { schedule: newSchedule, message } = await response.json();

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
        console.error('Failed to create fitting schedule:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to create schedule';
          state.isLoading = false;
        });
        return null;
      }
    },

    updateFittingSchedule: async (scheduleId, updates) => {
      set((state) => {
        state.scheduleLoadingStates[scheduleId] = true;
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
            // Process the updated schedule similar to fetchFittingSchedules
            const base = new Date(
              updatedSchedule.fittingSlot?.dateTime ?? null,
            );
            const duration = updatedSchedule.duration ?? 60;

            state.fittingSchedules[index] = {
              ...state.fittingSchedules[index],
              ...updatedSchedule,
              startTime: base,
              endTime: new Date(base.getTime() + duration * 60 * 1000),
              title: `${updatedSchedule.user?.first_name || 'Unknown'} - ${
                updatedSchedule.fittingType?.name || 'Fitting'
              }`,
              color: updatedSchedule.fittingType?.color || 'blue',
            };
          }
          state.scheduleLoadingStates[scheduleId] = false;
        });
      } catch (error) {
        console.error('Failed to update fitting schedule:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to update schedule';
          state.scheduleLoadingStates[scheduleId] = false;
        });
        throw error;
      }
    },

    cancelFittingSchedule: async (scheduleId) => {
      try {
        await get().updateFittingSchedule(scheduleId, { status: 'CANCELED' });
      } catch (error) {
        console.error('Failed to cancel fitting schedule:', error);
        throw error;
      }
    },

    confirmFittingSchedule: async (scheduleId) => {
      try {
        await get().updateFittingSchedule(scheduleId, { status: 'CONFIRMED' });
      } catch (error) {
        console.error('Failed to confirm fitting schedule:', error);
        throw error;
      }
    },

    rejectFittingSchedule: async (scheduleId) => {
      try {
        await get().updateFittingSchedule(scheduleId, { status: 'REJECTED' });
      } catch (error) {
        console.error('Failed to reject fitting schedule:', error);
        throw error;
      }
    },

    // Updated slot methods without isAutoConfirm
    createFittingSlot: async ({ dateTime }) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/fitting/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateTime }),
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
