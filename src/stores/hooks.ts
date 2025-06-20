// stores/hooks.ts - Custom hooks for specific state slices
import { useFittingStore } from './useFittingStore';
import { useUserStore } from './userStore';
import { useScheduleStore } from './useScheduleStore';
import { useSettingsStore } from './useSettingStore';
import { TWorkingHours, useWorkingHoursStore } from './useWorkingHoursStore';

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
  useFittingStore((state) => ({
    setFittingSchedules: state.setFittingSchedules,
    setFittingSlots: state.setFittingSlots,
    fetchFittingSchedules: state.fetchFittingSchedules,
    fetchFittingSlots: state.fetchFittingSlots,
    createFittingSchedule: state.createFittingSchedule,
    updateFittingSchedule: state.updateFittingSchedule,
    cancelFittingSchedule: state.cancelFittingSchedule,
    confirmFittingSchedule: state.confirmFittingSchedule,
  }));

// User hooks
export const useUsers = () => useUserStore((state) => state.users);
export const useSelectedUserId = () =>
  useUserStore((state) => state.selectedUserId);
export const useCurrentUser = () => useUserStore((state) => state.currentUser);
export const useFilterByRole = () =>
  useUserStore((state) => state.filterByRole);
export const useUserActions = () =>
  useUserStore((state) => ({
    setUsers: state.setUsers,
    setSelectedUserId: state.setSelectedUserId,
    setCurrentUser: state.setCurrentUser,
    setFilterByRole: state.setFilterByRole,
    fetchUsers: state.fetchUsers,
    fetchUserById: state.fetchUserById,
  }));

// Schedule hooks
export const useWeeklySlots = () =>
  useScheduleStore((state) => state.weeklySlots);
export const useScheduleBlocks = () =>
  useScheduleStore((state) => state.scheduleBlocks);
export const useScheduleActions = () =>
  useScheduleStore((state) => ({
    setWeeklySlots: state.setWeeklySlots,
    setScheduleBlocks: state.setScheduleBlocks,
    fetchWeeklySlots: state.fetchWeeklySlots,
    fetchScheduleBlocks: state.fetchScheduleBlocks,
    updateWeeklySlot: state.updateWeeklySlot,
    addScheduleBlock: state.addScheduleBlock,
    removeScheduleBlock: state.removeScheduleBlock,
  }));

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

// Derived state hooks (computed values)
export const useFilteredFittingSchedules = () => {
  const schedules = useFittingSchedules();
  const selectedUserId = useSelectedUserId();
  const selectedDate = useSelectedDate();
  const filterByRole = useFilterByRole();

  return schedules.filter((schedule) => {
    const matchesUser =
      selectedUserId === 'all' || schedule.userId === selectedUserId;
    const scheduleDate = new Date(schedule.fittingSlot.dateTime);
    const matchesDate =
      scheduleDate.toDateString() === selectedDate.toDateString();
    const matchesRole =
      filterByRole === 'all' || schedule.user.role === filterByRole;
    return matchesUser && matchesDate && matchesRole;
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

export const useFilteredUsers = () => {
  const users = useUsers();
  const filterByRole = useFilterByRole();

  return filterByRole === 'all'
    ? users
    : users.filter((user) => user.role === filterByRole);
};
