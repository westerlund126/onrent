// stores/useScheduleStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { IWeeklySlot, IScheduleBlock } from 'types/fitting';

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
  updateWeeklySlot: (
    slotId: number,
    updates: Partial<IWeeklySlot>,
  ) => Promise<void>;
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
          // Fixed API endpoint (was /api/weekly-slots, now /api/fitting/weekly-slots)
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

      updateWeeklySlot: async (slotId, updates) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/weekly-slots/${slotId}`, {
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to update weekly slot:', error);
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to add schedule block:', error);
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          console.error('Failed to remove schedule block:', error);
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
