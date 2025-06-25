// stores/hooks.ts 
import { useFittingStore } from './useFittingStore';
import { useScheduleStore } from './useScheduleStore';
import { useSettingsStore } from './useSettingStore';
import { useWorkingHoursStore } from './useWorkingHoursStore';
import { useFittingFormStore } from './useFittingFormStore';
import type { FittingFormData } from './useFittingFormStore';
import { useUserStore } from './useUserStore';
import { useShallow } from 'zustand/react/shallow';
import { TWorkingHours } from 'types/fitting';

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

//Fitting form hooks
export const useFittingPageType = () =>
  useFittingFormStore((state) => state.pageType);

export const useFittingProductData = () =>
  useFittingFormStore((state) => state.productData);

export const useFittingOwnerData = () =>
  useFittingFormStore((state) => state.ownerData);

export const useFittingCurrentUserData = () =>
  useFittingFormStore((state) => state.currentUserData);

export const useFittingAvailableSlots = () =>
  useFittingFormStore((state) => state.availableSlots);

export const useFittingSelectedSlot = () =>
  useFittingFormStore((state) => state.selectedSlot);

// Fitting Form hooks - Form data
export const useFittingFormData = () =>
  useFittingFormStore((state) => state.formData);

export const useFittingFormField = <K extends keyof FittingFormData>(field: K) =>
  useFittingFormStore((state) => state.formData[field]);

export const useIsPhoneNumberUpdated = () =>
  useFittingFormStore((state) => state.isPhoneNumberUpdated);

// Fitting Form hooks - Loading states
export const useFittingFormLoading = () =>
  useFittingFormStore((state) => ({
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    loadingStates: state.loadingStates,
  }));

export const useFittingFormError = () =>
  useFittingFormStore((state) => state.error);

// Fitting Form hooks - Actions
export const useFittingFormActions = () =>
  useFittingFormStore((state) => ({
    setPageContext: state.setPageContext,
    updateFormField: state.updateFormField,
    toggleVariant: state.toggleVariant,
    clearSelectedVariants: state.clearSelectedVariants,
    setSelectedSlot: state.setSelectedSlot,
    fetchProductData: state.fetchProductData,
    fetchOwnerData: state.fetchOwnerData,
    fetchCurrentUserData: state.fetchCurrentUserData,
    fetchAvailableSlots: state.fetchAvailableSlots,
    submitFittingSchedule: state.submitFittingSchedule,
    reset: state.reset,
    resetForm: state.resetForm,
  }));

// Derived state hooks for fitting form
export const useFittingAvailableDates = () => {
  const availableSlots = useFittingAvailableSlots();
  
  return useFittingFormStore((state) => {
    const dateMap = new Map();

    availableSlots.forEach((slot) => {
      const date = new Date(slot.dateTime);
      const dateKey = date.toISOString().split('T')[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          value: dateKey,
          label: date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          slots: [],
        });
      }

      dateMap.get(dateKey).slots.push(slot);
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.value.localeCompare(b.value),
    );
  });
};

export const useFittingAvailableTimesForDate = (selectedDate?: string) => {
  const availableSlots = useFittingAvailableSlots();
  const formData = useFittingFormData();
  
  return useFittingFormStore((state) => {
    const dateToUse = selectedDate || formData.selectedDate;
    if (!dateToUse) return [];

    return availableSlots
      .filter((slot) => {
        const slotDate = new Date(slot.dateTime);
        return slotDate.toISOString().split('T')[0] === dateToUse;
      })
      .map((slot) => {
        const time = new Date(slot.dateTime);
        return {
          value: time.toTimeString().slice(0, 5),
          label: `${time.toTimeString().slice(0, 5)} WIB`,
          slot: slot,
        };
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  });
};

export const useFittingAvailableVariants = () => {
  const productData = useFittingProductData();
  
  return useFittingFormStore((state) => {
    if (!productData || !productData.VariantProducts) return [];

    return productData.VariantProducts.filter(
      (variant) => variant.isAvailable && !variant.isRented,
    );
  });
};

export const useFittingSelectedVariants = () => {
  const formData = useFittingFormData();
  const availableVariants = useFittingAvailableVariants();
  
  return availableVariants.filter((variant) =>
    formData.selectedVariants.includes(variant.id)
  );
};

// Form validation hook
export const useFittingFormValidation = () => {
  const formData = useFittingFormData();
  const pageType = useFittingPageType();
  const selectedSlot = useFittingSelectedSlot();
  
  return useFittingFormStore((state) => {
    const isValid = 
      formData.customerName.trim() !== '' &&
      formData.phoneNumber.trim() !== '' &&
      formData.selectedDate !== '' &&
      formData.selectedTime !== '' &&
      selectedSlot !== null &&
      (pageType !== 'product' || formData.selectedVariants.length > 0);
    
    const errors = [];
    
    if (!formData.customerName.trim()) {
      errors.push('Nama lengkap harus diisi');
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.push('Nomor telepon harus diisi');
    }
    
    if (!formData.selectedDate) {
      errors.push('Tanggal harus dipilih');
    }
    
    if (!formData.selectedTime) {
      errors.push('Waktu harus dipilih');
    }
    
    if (pageType === 'product' && formData.selectedVariants.length === 0) {
      errors.push('Pilih minimal satu varian produk');
    }
    
    return {
      isValid,
      errors,
    };
  });
};