// store/settingsStore.ts - Application settings
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TBadgeVariant } from 'types/fitting';

interface SettingsState {
  badgeVariant: TBadgeVariant;
  // Actions
  setBadgeVariant: (variant: TBadgeVariant) => void;
}

export const useSettingsStore = create<SettingsState>()(
  immer((set) => ({
    badgeVariant: 'colored',

    setBadgeVariant: (variant) =>
      set((state) => {
        state.badgeVariant = variant;
      }),
  })),
);
