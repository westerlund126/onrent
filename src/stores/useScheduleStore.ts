// stores/useScheduleStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner'; 
import type {
  IWeeklySlot,
  IScheduleBlock,
  IScheduleBlockInput,
  IFittingSlot,
} from 'types/fitting';
import type { WorkingHours } from 'types/working-hours';

interface ScheduleState {
  weeklySlots: IWeeklySlot[];
  scheduleBlocks: IScheduleBlock[];
  fittingSlots: IFittingSlot[];
  bookedSlots: IFittingSlot[];
  isLoading: boolean;
  isFittingSlotsLoading: boolean;
  error: string | null;

  setWeeklySlots: (slots: IWeeklySlot[]) => void;
  setScheduleBlocks: (blocks: IScheduleBlock[]) => void;
  setFittingSlots: (slots: IFittingSlot[]) => void;
  setBookedSlots: (slots: IFittingSlot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchWeeklySlots: () => Promise<void>;
  fetchScheduleBlocks: (dateFrom: string, dateTo: string) => Promise<void>;
  fetchFittingSlots: (weekStart: Date) => Promise<void>;
  fetchAllAvailableSlots: () => Promise<void>;
  getAvailableSlots: () => IFittingSlot[];
  updateWeeklySlot: (
    slotId: number,
    updates: Partial<IWeeklySlot>,
  ) => Promise<void>;
  updateWorkingHours: (workingHours: WorkingHours) => Promise<void>;
  addScheduleBlock: (block: IScheduleBlockInput) => Promise<void>;
  updateScheduleBlock: (
    blockId: number,
    updates: Partial<IScheduleBlock>,
  ) => Promise<void>;
  removeScheduleBlock: (blockId: number) => Promise<void>;
  reset: () => void;
}
export const useScheduleStore = create<ScheduleState>()(
  devtools(
    immer((set, get) => ({
      weeklySlots: [],
      scheduleBlocks: [],
      fittingSlots: [],
      bookedSlots: [],
      isLoading: false,
      isFittingSlotsLoading: false,
      error: null,

      setWeeklySlots: (slots) => set({ weeklySlots: slots }),
      setScheduleBlocks: (blocks) => set({ scheduleBlocks: blocks }),
      setFittingSlots: (slots) => set({ fittingSlots: slots }),
      setBookedSlots: (slots) => set({ bookedSlots: slots }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getAvailableSlots: () => {
        return get().fittingSlots.filter(
          (slot) =>
            !slot.isBooked && !get().bookedSlots.some((b) => b.id === slot.id),
        );
      },

      fetchWeeklySlots: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/fitting/weekly-slots', {
            cache: 'no-store',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch weekly slots');
          }
          const data: { weeklySlots: IWeeklySlot[] } = await response.json();
          set({ weeklySlots: data.weeklySlots || [], isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, isLoading: false });
          console.error('Failed to fetch weekly slots:', error);
        }
      },

      fetchScheduleBlocks: async (dateFrom, dateTo) => {
        set({ isLoading: true, error: null });
        try {
          const url = new URL(
            '/api/fitting/schedule-blocks',
            window.location.origin,
          );
          url.searchParams.append('startDate', dateFrom);
          url.searchParams.append('endDate', dateTo);

          const response = await fetch(url.toString(), {
            cache: 'no-store',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to fetch schedule blocks',
            );
          }

          const data: { scheduleBlocks: IScheduleBlock[] } =
            await response.json();
          set({ scheduleBlocks: data.scheduleBlocks || [], isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, isLoading: false });
          console.error('Failed to fetch schedule blocks:', error);
        }
      },

      
      fetchFittingSlots: async (weekStart: Date) => {
        console.log('🔍 fetchFittingSlots called with weekStart:', weekStart);
        set({ isFittingSlotsLoading: true, error: null });

        try {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const dateFromISO = encodeURIComponent(weekStart.toISOString());
          const dateToISO = encodeURIComponent(weekEnd.toISOString());

          const url = `/api/fitting/slots?dateFrom=${dateFromISO}&dateTo=${dateToISO}`;

          const response = await fetch(url, { cache: 'no-store' });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch slots');
          }

          const slots: any[] = await response.json();

          const parseSlot = (slot: any): IFittingSlot => {
            try {
              const isBooked = !!slot.fittingSchedule;
              console.log(
                `🎯 Slot ${slot.id}: dateTime=${slot.dateTime}, isBooked=${isBooked}`,
              );
              let dateTime: Date;
              if (typeof slot.dateTime === 'string') {
                const cleanDateString = slot.dateTime.replace('Z', '');
                dateTime = new Date(cleanDateString);
              } else {
                dateTime = new Date(slot.dateTime);
              }
              return { ...slot, dateTime, isBooked };
            } catch (error) {
              console.error('Failed to parse slot date:', slot.dateTime, error);
              return {
                ...slot,
                dateTime: new Date(),
                isBooked: !!slot.fittingSchedule,
              };
            }
          };

          const parsedSlots = slots.map(parseSlot);
          const availableSlots = parsedSlots.filter((slot) => !slot.isBooked);
          const bookedSlots = parsedSlots.filter((slot) => slot.isBooked);

          set({
            fittingSlots: availableSlots,
            bookedSlots: bookedSlots,
            isFittingSlotsLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error('💥 fetchFittingSlots error:', error);
          set({ error: errorMessage, isFittingSlotsLoading: false });
          toast.error('Failed to fetch slots', { description: errorMessage });
        }
      },

      fetchAllAvailableSlots: async () => {
        console.log('🔍 Fetching all available slots for the next 90 days');
        set({ isFittingSlotsLoading: true, error: null });

        try {
          const dateFrom = new Date();
          const dateTo = new Date();
          dateTo.setDate(dateFrom.getDate() + 90);

          const dateFromISO = encodeURIComponent(dateFrom.toISOString());
          const dateToISO = encodeURIComponent(dateTo.toISOString());

          const url = `/api/fitting/slots?dateFrom=${dateFromISO}&dateTo=${dateToISO}`;

          const response = await fetch(url, { cache: 'no-store' });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to fetch all available slots',
            );
          }

          const slots: any[] = await response.json();

          const parseSlot = (slot: any): IFittingSlot => {
            try {
              const isBooked = !!slot.fittingSchedule;
              console.log(
                `🎯 Slot ${slot.id}: dateTime=${slot.dateTime}, isBooked=${isBooked}`,
              );
              let dateTime: Date;
              if (typeof slot.dateTime === 'string') {
                const cleanDateString = slot.dateTime.replace('Z', '');
                dateTime = new Date(cleanDateString);
              } else {
                dateTime = new Date(slot.dateTime);
              }
              return { ...slot, dateTime, isBooked };
            } catch (error) {
              console.error('Failed to parse slot date:', slot.dateTime, error);
              return {
                ...slot,
                dateTime: new Date(),
                isBooked: !!slot.fittingSchedule,
              };
            }
          };

          const parsedSlots = slots.map(parseSlot);
          const availableSlots = parsedSlots.filter((slot) => !slot.isBooked);
          const bookedSlots = parsedSlots.filter((slot) => slot.isBooked);

          set({
            fittingSlots: availableSlots,
            bookedSlots: bookedSlots,
            isFittingSlotsLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error('💥 fetchAllAvailableSlots error:', error);
          set({ error: errorMessage, isFittingSlotsLoading: false });
          toast.error('Failed to fetch available slots', {
            description: errorMessage,
          });
        }
      },

      updateWeeklySlot: async (slotId, updates) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/fitting/weekly-slots/${slotId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update weekly slot');
          }

          const updatedSlot = await response.json();
          set((state) => {
            const index = state.weeklySlots.findIndex((s) => s.id === slotId);
            if (index !== -1) {
              state.weeklySlots[index] = updatedSlot;
            }
            state.isLoading = false;
          });

          toast.success('Working hours updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to update weekly slot:', error);
          toast.error(`Failed to update: ${errorMessage}`);
          throw error;
        }
      },

      updateWorkingHours: async (workingHours) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/fitting/weekly-slots', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workingHours }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to update working hours',
            );
          }

          const result = await response.json();

          set((state) => {
            state.isLoading = false;
          });

          toast.success('Working hours updated', {
            description:
              result.slotGeneration?.message ||
              'Booking slots have been updated',
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to update working hours:', error);

          toast.error('Failed to update working hours', {
            description: errorMessage,
          });

          throw error;
        }
      },

      addScheduleBlock: async (blockData: IScheduleBlockInput) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/fitting/schedule-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blockData),
          });

          if (!response.ok) {
            const errorData = await response.json();

            if (response.status === 400 && errorData.details) {
              const validationErrors = errorData.details
                .map((err: any) => err.message)
                .join(', ');
              throw new Error(`Validation failed: ${validationErrors}`);
            }

            throw new Error(errorData.error || 'Failed to add schedule block');
          }

          const newBlock: IScheduleBlock = await response.json();
          set((state) => {
            state.scheduleBlocks.push(newBlock);
            state.isLoading = false;
          });

          toast.success('Time period blocked successfully', {
            description: 'This time slot is now unavailable for bookings',
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to add schedule block:', error);
          toast.error('Failed to block time period', {
            description: errorMessage,
          });
          throw error;
        }
      },

      updateScheduleBlock: async (blockId, updates) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/fitting/schedule-blocks/${blockId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();

            if (response.status === 400 && errorData.details) {
              const validationErrors = errorData.details
                .map((err: any) => err.message)
                .join(', ');
              throw new Error(`Validation failed: ${validationErrors}`);
            }

            throw new Error(
              errorData.error || 'Failed to update schedule block',
            );
          }

          const updatedBlock = await response.json();
          set((state) => {
            const index = state.scheduleBlocks.findIndex(
              (b) => b.id === blockId,
            );
            if (index !== -1) {
              state.scheduleBlocks[index] = updatedBlock;
            }
            state.isLoading = false;
          });

          toast.success('Schedule block updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to update schedule block:', error);
          toast.error('Failed to update schedule block', {
            description: errorMessage,
          });
          throw error;
        }
      },

      removeScheduleBlock: async (blockId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/fitting/schedule-blocks/${blockId}`,
            {
              method: 'DELETE',
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to remove schedule block',
            );
          }

          set((state) => {
            state.scheduleBlocks = state.scheduleBlocks.filter(
              (b) => b.id !== blockId,
            );
            state.isLoading = false;
          });

          toast.success('Schedule block removed successfully', {
            description: 'This time period is now available for bookings',
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to remove schedule block:', error);
          toast.error('Failed to remove schedule block', {
            description: errorMessage,
          });
          throw error;
        }
      },

      reset: () =>
        set({
          weeklySlots: [],
          scheduleBlocks: [],
          fittingSlots: [],
          bookedSlots: [],
          isLoading: false,
          isFittingSlotsLoading: false,
          error: null,
        }),
    })),
    {
      name: 'useScheduleStore',
    },
  ),
);
