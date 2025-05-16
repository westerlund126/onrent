// types/product.ts
export interface ProductVariant {
  id: number;
  size: string | null;
  color: string | null;
  price: number;
  isAvailable: boolean;
  isRented: boolean;
  bustlength: number | null;
  waistlength: number | null;
  length: number | null;
  sku: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  images: string[];
  description: string;
  ownerId: number;
  owner: {
    id: number;
    name: string;
  };
  VariantProducts: ProductVariant[];
}

export interface DeleteConfirmation {
  isOpen: boolean;
  variantId: number | null;
  productId: number | null;
}

export type StatusType = 'Aktif' | 'Nonaktif' | 'Disewa';
