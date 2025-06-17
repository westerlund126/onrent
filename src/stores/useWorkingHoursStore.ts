// stores/useWorkingHoursStore.ts
import { toast } from 'sonner';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TWorkingHours = { [key: number]: { from: number; to: number } };

interface WorkingHoursState {
  workingHours: TWorkingHours;
  isLoading: boolean;
  error: string | null;

  setWorkingHours: (workingHours: TWorkingHours) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchWorkingHours: (ownerId?: number) => Promise<void>;
  updateWorkingHours: (workingHours: TWorkingHours) => Promise<void>;
  reset: () => void;
}

const DEFAULT_WORKING_HOURS: TWorkingHours = {
  0: { from: 0, to: 0 }, // Sunday
  1: { from: 8, to: 17 }, // Monday
  2: { from: 8, to: 17 }, // Tuesday
  3: { from: 8, to: 17 }, // Wednesday
  4: { from: 8, to: 17 }, // Thursday
  5: { from: 8, to: 17 }, // Friday
  6: { from: 8, to: 12 }, // Saturday
};

export const useWorkingHoursStore = create<WorkingHoursState>()(
  devtools(
    (set, get) => ({
      workingHours: DEFAULT_WORKING_HOURS,
      isLoading: false,
      error: null,

      setWorkingHours: (workingHours) => set({ workingHours }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchWorkingHours: async (ownerId?: number) => {
        set({ isLoading: true, error: null });

        try {
          const url = ownerId
            ? `/api/fitting/weekly-slots?ownerId=${ownerId}`
            : '/api/fitting/weekly-slots';

          const response = await fetch(url);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch working hours');
          }

          const data = await response.json();
          set({
            workingHours: data.workingHours || DEFAULT_WORKING_HOURS,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set({
            error: errorMessage,
            isLoading: false,
            workingHours: DEFAULT_WORKING_HOURS,
          });
          console.error('Error fetching working hours:', error);
        }
      },

      updateWorkingHours: async (workingHours) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/fitting/weekly-slots', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workingHours }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to update working hours',
            );
          }

          const data = await response.json();
          set({
            workingHours: data.workingHours || workingHours,
            isLoading: false,
          });

          toast(
            data.slotsGenerated
              ? `Generated ${data.slotsGenerated} booking slots for the next 60 days.`
              : 'Your working hours have been saved.',
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          set({
            error: errorMessage,
            isLoading: false,
          });
          console.error('Error updating working hours:', error);
          throw error;
        }
      },

      reset: () =>
        set({
          workingHours: DEFAULT_WORKING_HOURS,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'useWorkingHoursStore',
    },
  ),
);
