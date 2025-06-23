// stores/hooks.ts - Custom hooks for specific state slices
import { useFittingStore } from './useFittingStore';
import { useScheduleStore } from './useScheduleStore';
import { useSettingsStore } from './useSettingStore';
import { TWorkingHours, useWorkingHoursStore } from './useWorkingHoursStore';
import { useUserStore } from './useUserStore';
import { useShallow } from 'zustand/react/shallow';

// Fitting hooks
export const useSelectedDate = () =>
  useFittingStore((state) => state.selectedDate);
export const useSetSelectedDate = () =>
  useFittingStore((state) => state.setSelectedDate);
export const useFittingSchedules = () =>
  useFittingStore((state) => state.fittingSchedules);
export const useFittingSlots = () =>
  useFittingStore((state) => state.fittingSlots);
export const useFittingActions = () =>
  useFittingStore(
    useShallow((state) => ({
      setFittingSchedules: state.setFittingSchedules,
      setFittingSlots: state.setFittingSlots,
      fetchFittingSchedules: state.fetchFittingSchedules,
      fetchFittingSlots: state.fetchFittingSlots,
      createFittingSchedule: state.createFittingSchedule,
      updateFittingSchedule: state.updateFittingSchedule,
      cancelFittingSchedule: state.cancelFittingSchedule,
      confirmFittingSchedule: state.confirmFittingSchedule,
    })),
  );

// Schedule hooks
export const useWeeklySlots = () =>
  useScheduleStore((state) => state.weeklySlots);
export const useScheduleBlocks = () =>
  useScheduleStore((state) => state.scheduleBlocks);
export const useScheduleActions = () =>
  useScheduleStore(
    useShallow((state) => ({
    setWeeklySlots: state.setWeeklySlots,
    setScheduleBlocks: state.setScheduleBlocks,
    fetchWeeklySlots: state.fetchWeeklySlots,
    fetchScheduleBlocks: state.fetchScheduleBlocks,
    updateWeeklySlot: state.updateWeeklySlot,
    addScheduleBlock: state.addScheduleBlock,
    removeScheduleBlock: state.removeScheduleBlock,
  })));

// Settings hooks
export const useBadgeVariant = () =>
  useSettingsStore((state) => state.badgeVariant);
export const useSetBadgeVariant = () =>
  useSettingsStore((state) => state.setBadgeVariant);

// Working hours hooks
export const useWorkingHours = (): [
  TWorkingHours,
  (workingHours: TWorkingHours) => void,
] => {
  const workingHours = useWorkingHoursStore((state) => state.workingHours);
  const setWorkingHours = useWorkingHoursStore(
    (state) => state.setWorkingHours,
  );
  return [workingHours, setWorkingHours];
};
export const useWorkingHoursLoading = (): boolean =>
  useWorkingHoursStore((state) => state.isLoading);
export const useWorkingHoursError = (): string | null =>
  useWorkingHoursStore((state) => state.error);
export const useFetchWorkingHours = (): ((ownerId?: number) => Promise<void>) =>
  useWorkingHoursStore((state) => state.fetchWorkingHours);
export const useUpdateWorkingHours = (): [
  (workingHours: TWorkingHours) => Promise<void>,
  boolean,
] => {
  const update = useWorkingHoursStore((state) => state.updateWorkingHours);
  const isLoading = useWorkingHoursStore((state) => state.isLoading);
  return [update, isLoading];
};
export const useResetWorkingHours = (): (() => void) =>
  useWorkingHoursStore((state) => state.reset);

// User hooks
export const useUserActions = () => {
  const user = useUserStore((s) => s.user);
  const isLoading = useUserStore((s) => s.isLoading);
  const error = useUserStore((s) => s.error);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const updatePhoneNumber = useUserStore((s) => s.updatePhoneNumber);
  const updateBusinessProfile = useUserStore((s) => s.updateBusinessProfile);
  const clearError = useUserStore((s) => s.clearError);
  const setUser = useUserStore((s) => s.setUser);

  return {
    user,
    isLoading,
    error,
    fetchUser,
    updatePhoneNumber,
    updateBusinessProfile,
    clearError,
    setUser,
  };
};

// Derived state hooks (computed values)
export const useFilteredFittingSchedules = () => {
  const schedules = useFittingSchedules();
  const selectedDate = useSelectedDate();

  return schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.fittingSlot.dateTime);
    const matchesDate =
      scheduleDate.toDateString() === selectedDate.toDateString();
    return matchesDate;
  });
};

export const useAvailableFittingSlots = () => {
  const slots = useFittingSlots();
  const selectedDate = useSelectedDate();

  return slots.filter((slot) => {
    const slotDate = new Date(slot.dateTime);
    const matchesDate = slotDate.toDateString() === selectedDate.toDateString();
    return matchesDate && !slot.isBooked;
  });
};

export const useFilteredScheduleBlocks = () => {
  const scheduleBlocks = useScheduleBlocks();
  const selectedDate = useSelectedDate();

  return scheduleBlocks.filter((block) => {
    const blockStartDate = new Date(block.startTime);
    const matchesDate =
      blockStartDate.toDateString() === selectedDate.toDateString();
    return matchesDate;
  });
};
