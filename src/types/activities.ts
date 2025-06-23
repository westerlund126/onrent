export type RentalTrackingEvent = {
  id: number;
  status: 'RENTAL_ONGOING' | 'RETURN_PENDING' | 'RETURNED' | 'COMPLETED';
  updatedAt: string;
  description: string;
};

export type VariantProduct = {
  id: number;
  sku: string;
  size?: string | null;
  color?: string | null;
  price: number;
  bustlength?: number | null;
  waistlength?: number | null;
  length?: number | null;
  products: {
    id: number;
    name: string;
    description: string;
    category: string;
    images: string[];
  };
};

export type RentalItem = {
  id: number;
  variantProduct: VariantProduct;
};

export type RentalOwner = {
  id: number;
  first_name: string;
  last_name?: string | null;
  businessName?: string | null;
  email?: string | null; 
  phone_numbers?: string | null;
  businessAddress?: string | null;
};

export type RentalDetail = {
  id: number;
  rentalCode: string;
  status: 'BELUM_LUNAS' | 'LUNAS' | 'TERLAMBAT' | 'SELESAI';
  startDate: string;
  endDate: string;
  additionalInfo?: string | null;
  createdAt: string;
  updatedAt: string;
  owner: RentalOwner;
  rentalItems: RentalItem[];
};

// Fitting Types
export type FittingTrackingEvent = {
  id: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  updatedAt: string;
  description: string;
};

export type FittingProduct = {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    category: string;
    images: string[];
  };
  variantProduct?: {
    id: number;
    sku: string;
    size?: string | null;
    color?: string | null;
    price: number;
    bustlength?: number | null;
    waistlength?: number | null;
    length?: number | null;
  } | null;
};

export type FittingDetail = {
  id: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  duration: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  fittingSlot: {
    id: number;
    dateTime: string;
    duration: number;
    owner: RentalOwner;
  };
  FittingProduct: FittingProduct[];
};

export type ActivityDetail = RentalDetail | FittingDetail;