// stores/useScheduleStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner'; // or whatever toast import you use with shadcn
import type { IWeeklySlot, IScheduleBlock } from 'types/fitting';
import type { WorkingHours } from 'types/working-hours';

interface ScheduleState {
  weeklySlots: IWeeklySlot[];
  scheduleBlocks: IScheduleBlock[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setWeeklySlots: (slots: IWeeklySlot[]) => void;
  setScheduleBlocks: (blocks: IScheduleBlock[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchWeeklySlots: (ownerId: number) => Promise<void>;
  fetchScheduleBlocks: (ownerId: number) => Promise<void>;

  // Fixed: Use the correct API endpoint for individual slot updates
  updateWeeklySlot: (
    slotId: number,
    updates: Partial<IWeeklySlot>,
  ) => Promise<void>;

  // New: Update full working hours with auto slot generation
  updateWorkingHours: (workingHours: WorkingHours) => Promise<void>;

  addScheduleBlock: (block: Omit<IScheduleBlock, 'id'>) => Promise<void>;
  removeScheduleBlock: (blockId: number) => Promise<void>;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  devtools(
    immer((set) => ({
      weeklySlots: [],
      scheduleBlocks: [],
      isLoading: false,
      error: null,

      setWeeklySlots: (slots) =>
        set((state) => {
          state.weeklySlots = slots;
        }),

      setScheduleBlocks: (blocks) =>
        set((state) => {
          state.scheduleBlocks = blocks;
        }),

      setLoading: (isLoading) =>
        set((state) => {
          state.isLoading = isLoading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      fetchWeeklySlots: async (ownerId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/fitting/weekly-slots?ownerId=${ownerId}`,
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch weekly slots');
          }

          const data = await response.json();
          set((state) => {
            state.weeklySlots = data.weeklySlots || [];
            state.isLoading = false;
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to fetch weekly slots:', error);
        }
      },

      fetchScheduleBlocks: async (ownerId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/schedule-blocks?ownerId=${ownerId}`,
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to fetch schedule blocks',
            );
          }

          const blocks = await response.json();
          set((state) => {
            state.scheduleBlocks = blocks;
            state.isLoading = false;
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to fetch schedule blocks:', error);
        }
      },

      // Fixed: This method now points to a hypothetical individual slot update API
      // Note: You might need to create this API endpoint if it doesn't exist
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

          // Optionally refetch the data to ensure UI is in sync
          // You might want to pass ownerId here or get it from context
          // await get().fetchWeeklySlots(ownerId);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to update working hours:', error);

          // Show error toast
          toast.error('Failed to update working hours', {
            description: errorMessage,
          });

          throw error;
        }
      },

      addScheduleBlock: async (blockData) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/schedule-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blockData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add schedule block');
          }

          const newBlock = await response.json();
          set((state) => {
            state.scheduleBlocks.push(newBlock);
            state.isLoading = false;
          });

          toast.success('Schedule block added successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to add schedule block:', error);
          toast.error(`Failed to add schedule block: ${errorMessage}`);
          throw error;
        }
      },

      removeScheduleBlock: async (blockId) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/schedule-blocks/${blockId}`, {
            method: 'DELETE',
          });

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

          toast.success('Schedule block removed successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to remove schedule block:', error);
          toast.error(`Failed to remove schedule block: ${errorMessage}`);
          throw error;
        }
      },

      reset: () =>
        set((state) => {
          state.weeklySlots = [];
          state.scheduleBlocks = [];
          state.isLoading = false;
          state.error = null;
        }),
    })),
    {
      name: 'useScheduleStore',
    },
  ),
);
