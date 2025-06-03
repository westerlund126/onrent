// types/rental.ts
export interface RentalUser {
    id: number;
    username: string;
    first_name: string;
    last_name?: string;
    phone_numbers?: string;
    email?: string;
  }
  
  export interface RentalProduct {
    id: number;
    name: string;
    category?: string;
    description?: string;
    images?: string[];
  }
  
  export interface RentalVariant {
    id: number;
    sku: string;
    size?: string;
    color?: string;
    price: number;
    bustlength?: number;
    waistlength?: number;
    length?: number;
  }
  
  export interface RentalTracking {
    id: number;
    status: 'RENTAL_ONGOING' | 'RETURN_PENDING' | 'RETURNED' | 'COMPLETED';
    updatedAt: string;
    createdAt: string;
  }
  
  export interface RentalReturn {
    id: number;
    returnDate: string;
    condition?: string;
    notes?: string;
  }

  export interface RentalItem {
    id: number;
    variantProduct: {
      id: number;
      sku: string;
      size?: string;
      color?: string;
      price: number;
      products: {
        id: number;
        name: string;
        category: string;
      };
    };
  }
  
  export interface Rental {
    id: number;
    rentalCode: string;
    startDate: string;
    endDate: string;
    status: 'BELUM_LUNAS' | 'LUNAS' | 'TERLAMBAT' | 'SELESAI';
    createdAt: string;
    updatedAt: string;
    userId: number;
    ownerId: number;
    user: RentalUser;
    owner: RentalUser;
    Tracking: RentalTracking[];
    Return?: RentalReturn[];
    rentalItems: RentalItem[];
  }
  
  export interface RentalListResponse {
    data: Rental[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  export interface DeleteConfirmation {
    isOpen: boolean;
    rentalId: number | null;
    rentalCode: string | null;
  }
  
  export interface RentalFilters {
    status?: string;
    userId?: number;
    page?: number;
    limit?: number;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
  }
  
  export type RentalStatus = 'BELUM_LUNAS' | 'LUNAS' | 'TERLAMBAT' | 'SELESAI';
  export type TrackingStatus = 'RENTAL_ONGOING' | 'RETURN_PENDING' | 'RETURNED' | 'COMPLETED';
  
  export interface CreateRentalData {
    customerId: number;
    variantId: number;
    startDate: string;
    endDate: string;
    status?: RentalStatus;
  }
  
  export interface UpdateRentalData {
    status?: RentalStatus;
    startDate?: string;
    endDate?: string;
    variantId?: number;
  }

  export interface EditRentalFormProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: number | null;
    onSuccess?: (rental: any) => void;
  }

  export interface SelectedVariant {
    id: number;
    sku: string;
    size: string;
    color?: string;
    price: number;
    productName: string;
    productId: number;
  }

  export interface RentalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (rental: any) => void;
  }

  export interface SelectedProduct {
    id: number;
    variantId: number;
    productName: string;
    sku: string;
    size?: string;
    color?: string;
    price?: number;
  }

  export interface TransactionTableProps {
    filters?: RentalFilters;
    onViewDetails?: (rentalId: number) => void;
    onEdit?: (rentalId: number) => void;
  }