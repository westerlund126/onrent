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
    productsId: number;
    variantProductId: number;
    user: RentalUser;
    owner: RentalUser; 
    products: RentalProduct;
    variantProduct: RentalVariant;
    Tracking: RentalTracking[];
    Return?: RentalReturn[];
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
  
  // API Response types
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