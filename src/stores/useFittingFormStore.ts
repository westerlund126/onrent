// stores/useFittingFormStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Product, Owner } from 'types/product';

export type FittingPageType = 'owner' | 'product' | 'catalog';

export interface FittingFormData {
  customerName: string;
  phoneNumber: string;
  notes: string;
  selectedDate: string;
  selectedTime: string;
  selectedVariants: number[];
  tfProofUrl?: string; 
}

export interface AvailableSlot {
  id: number;
  dateTime: string;
  isBooked: boolean;
  ownerId: number;
}

interface FittingFormState {
  pageType: FittingPageType;
  productId: string | null;
  ownerId: string | null;
  productData: Product | null;
  ownerData: Owner | null;
  currentUserData: any | null;
  formData: FittingFormData;
  selectedSlot: AvailableSlot | null;
  availableSlots: AvailableSlot[];
  isPhoneNumberUpdated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  loadingStates: {
    slots: boolean;
    product: boolean;
    owner: boolean;
    userData: boolean;
  };
  
  error: string | null;

  setPageContext: (pageType: FittingPageType, productId?: string, ownerId?: string) => void;
  setProductData: (product: Product | null) => void;
  setOwnerData: (owner: Owner | null) => void;
  setCurrentUserData: (userData: any) => void;
  setAvailableSlots: (slots: AvailableSlot[]) => void;
  setSelectedSlot: (slot: AvailableSlot | null) => void;
  
  updateFormField: <K extends keyof FittingFormData>(field: K, value: FittingFormData[K]) => void;
  setPhoneNumberUpdated: (updated: boolean) => void;
  toggleVariant: (variantId: number) => void;
  clearSelectedVariants: () => void;
  
  setLoadingState: (key: keyof FittingFormState['loadingStates'] | 'main' | 'submitting', loading: boolean) => void;
  setError: (error: string | null) => void;
  
  fetchProductData: (productId: string) => Promise<void>;
  fetchOwnerData: (ownerId: string) => Promise<void>;
  fetchCurrentUserData: () => Promise<void>;
  fetchAvailableSlots: (ownerId: string) => Promise<void>;
  submitFittingSchedule: () => Promise<boolean>;
  
  // Utility actions
  reset: () => void;
  resetForm: () => void;
}

const initialFormData: FittingFormData = {
  customerName: '',
  phoneNumber: '',
  notes: '',
  selectedDate: '',
  selectedTime: '',
  selectedVariants: [],
  tfProofUrl: '',
};

export const useFittingFormStore = create<FittingFormState>()(
  immer((set, get) => ({
    // Initial state
    pageType: 'owner',
    productId: null,
    ownerId: null,
    productData: null,
    ownerData: null,
    currentUserData: null,
    
    formData: initialFormData,
    selectedSlot: null,
    availableSlots: [],
    
    isPhoneNumberUpdated: false,
    isLoading: false,
    isSubmitting: false,
    loadingStates: {
      slots: false,
      product: false,
      owner: false,
      userData: false,
    },
    error: null,

    // Context actions
    setPageContext: (pageType, productId, ownerId) =>
      set((state) => {
        state.pageType = pageType;
        state.productId = productId || null;
        state.ownerId = ownerId || null;
      }),

    setProductData: (product) =>
      set((state) => {
        state.productData = product;
      }),

    setOwnerData: (owner) =>
      set((state) => {
        state.ownerData = owner;
      }),

    setCurrentUserData: (userData) =>
      set((state) => {
        state.currentUserData = userData;
        
        if (userData) {
          if (userData.first_name || userData.last_name) {
            const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
            state.formData.customerName = fullName;
          }
          
          if (userData.phone_numbers) {
            state.formData.phoneNumber = userData.phone_numbers;
          }
        }
      }),

    setAvailableSlots: (slots) =>
      set((state) => {
        state.availableSlots = slots;
      }),

    setSelectedSlot: (slot) =>
      set((state) => {
        state.selectedSlot = slot;
      }),

    updateFormField: (field, value) =>
      set((state) => {
        state.formData[field] = value;
        
        if (field === 'phoneNumber') {
          const currentPhone = state.currentUserData?.phone_numbers;
          state.isPhoneNumberUpdated = (value as string).trim() !== '' && value !== currentPhone;
        }
      }),

    setPhoneNumberUpdated: (updated) =>
      set((state) => {
        state.isPhoneNumberUpdated = updated;
      }),

    toggleVariant: (variantId) =>
      set((state) => {
        const variants = state.formData.selectedVariants;
        if (variants.includes(variantId)) {
          state.formData.selectedVariants = variants.filter(id => id !== variantId);
        } else {
          state.formData.selectedVariants.push(variantId);
        }
      }),

    clearSelectedVariants: () =>
      set((state) => {
        state.formData.selectedVariants = [];
      }),

    // Loading actions
    setLoadingState: (key, loading) =>
      set((state) => {
        if (key === 'main') {
          state.isLoading = loading;
        } else if (key === 'submitting') {
          state.isSubmitting = loading;
        } else {
          state.loadingStates[key] = loading;
        }
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    // Async actions
    fetchProductData: async (productId) => {
      set((state) => {
        state.loadingStates.product = true;
        state.error = null;
      });

      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        
        const product = await response.json();
        
        set((state) => {
          state.productData = product;
          state.loadingStates.product = false;
        });
      } catch (error) {
        console.error('Error fetching product data:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch product';
          state.loadingStates.product = false;
        });
      }
    },

    fetchOwnerData: async (ownerId) => {
      set((state) => {
        state.loadingStates.owner = true;
        state.error = null;
      });

      try {
        const response = await fetch(`/api/fitting/owner/${ownerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch owner data');
        }
        
        const owner = await response.json();
        
        set((state) => {
          state.ownerData = owner;
          state.loadingStates.owner = false;
        });
      } catch (error) {
        console.error('Error fetching owner data:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch owner';
          state.loadingStates.owner = false;
        });
      }
    },

    fetchCurrentUserData: async () => {
      set((state) => {
        state.loadingStates.userData = true;
        state.error = null;
      });

      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        get().setCurrentUserData(userData);
        
        set((state) => {
          state.loadingStates.userData = false;
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch user data';
          state.loadingStates.userData = false;
        });
      }
    },

    fetchAvailableSlots: async (ownerId) => {
      set((state) => {
        state.loadingStates.slots = true;
        state.error = null;
  });

  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 60);

    // 🔧 FIX: Make the customer API call match the working owner API call
    // Remove ownerId parameter since the API should determine it from auth
    // Remove availableOnly since we want the same filtering as owner interface
    const url = `/api/fitting/slots?dateFrom=${startDate.toISOString()}&dateTo=${endDate.toISOString()}`;
    
    // 🔍 DEBUG: Log the exact URL and parameters  
    console.log('🔍 CUSTOMER fetchAvailableSlots FIXED:', {
      url,
      originalOwnerId: ownerId,
      originalOwnerIdType: typeof ownerId,
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString(),
      note: 'Now matching owner interface - no ownerId, no availableOnly'
    });

    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error('Failed to fetch available slots');
    }
    
    const slots = await response.json();
    
    // 🔍 DEBUG: Check if the 9 AM slot is now properly filtered
    console.log('🔍 CUSTOMER API Response (FIXED):', {
      totalSlots: slots.length,
      firstFewSlots: slots.slice(0, 5).map(slot => ({
        id: slot.id,
        dateTime: slot.dateTime,
        localString: new Date(slot.dateTime).toLocaleString(),
        isBooked: slot.isBooked
      }))
    });

    // 🔍 DEBUG: Check for the specific 9 AM slot
    const nineAmSlot = slots.find(slot => slot.dateTime === '2025-08-04T09:00:00.000Z');
    if (nineAmSlot) {
      console.log('❌ STILL PROBLEM: 9 AM slot found in customer response (should not be there):', nineAmSlot);
    } else {
      console.log('✅ SUCCESS: 9 AM slot properly filtered out from customer response!');
    }

    set((state) => {
      state.availableSlots = slots;
      state.loadingStates.slots = false;
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    set((state) => {
      state.error = error instanceof Error ? error.message : 'Failed to fetch slots';
      state.loadingStates.slots = false;
    });
  }
},

    submitFittingSchedule: async () => {
      const state = get();
      const { formData, selectedSlot, pageType } = state;

      if (!selectedSlot) {
        set((draft) => {
          draft.error = 'No slot selected';
        });
        return false;
      }

      set((state) => {
        state.isSubmitting = true;
        state.error = null;
      });

      try {
        const fittingData = {
          fittingSlotId: selectedSlot.id,
          duration: 60,
          note: (formData.notes as string).trim() || null,
          phoneNumber: (formData.phoneNumber as string).trim(),
          customerName: (formData.customerName as string).trim(),
          variantIds: pageType === 'product' ? formData.selectedVariants : [],
          tfProofUrl: formData.tfProofUrl ? formData.tfProofUrl.trim() : null,
        };

        const response = await fetch('/api/fitting/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fittingData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create fitting schedule');
        }

        const result = await response.json();
        console.log('Fitting schedule created:', result);

        set((state) => {
          state.isSubmitting = false;
        });

        return true;
      } catch (error) {
        console.error('Error submitting fitting schedule:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to submit';
          state.isSubmitting = false;
        });
        return false;
      }
    },

    // Utility actions
    reset: () =>
      set((state) => {
        state.pageType = 'owner';
        state.productId = null;
        state.ownerId = null;
        state.productData = null;
        state.ownerData = null;
        state.currentUserData = null;
        state.formData = { ...initialFormData };
        state.selectedSlot = null;
        state.availableSlots = [];
        state.isPhoneNumberUpdated = false;
        state.isLoading = false;
        state.isSubmitting = false;
        state.loadingStates = {
          slots: false,
          product: false,
          owner: false,
          userData: false,
        };
        state.error = null;
      }),

    resetForm: () =>
      set((state) => {
        state.formData = { ...initialFormData };
        state.selectedSlot = null;
        state.isPhoneNumberUpdated = false;
      }),
  })),
);