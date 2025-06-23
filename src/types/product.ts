// types/product.ts
export type StatusType = 'Aktif' | 'Nonaktif' | 'Disewa';

export interface ProductVariant {
  id: number;
  productsId: number;
  size: string;
  color: string;
  price: number;
  sku: string;
  isAvailable: boolean;
  isRented: boolean;
  bustlength?: number;
  waistlength?: number;
  length?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  totalProducts: number;
  id: number;
  username: string;
  imageUrl?: string;
  businessName?: string;
  businessAddress?: string;
  email?: string;
  phone_numbers?: string;
  firstName?: string;
  lastName?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  images: string[];
  description?: string;
  ownerId: number;
  owner: Owner;
  VariantProducts: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface DeleteConfirmation {
  isOpen: boolean;
  variantId: number | null;
  productId: number | null;
}

export interface CreateProductData {
  name: string;
  category: string;
  images: string[];
  description?: string;
  ownerId: number;
  variants: CreateVariantData[];
}

export interface CreateVariantData {
  size: string;
  color: string;
  price: number;
  isAvailable?: boolean;
  isRented?: boolean;
  bustlength?: number;
  waistlength?: number;
  length?: number;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  images?: string[];
  description?: string;
  variants?: ProductVariant[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DeleteVariantResponse {
  success: boolean;
  deleted: ProductVariant;
  productDeleted: boolean;
  product?: Product;
  message?: string;
}