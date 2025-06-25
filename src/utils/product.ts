// utils/productUtils.ts
import { StatusType, ProductVariant } from 'types/product';

// Convert boolean flags to status string
export const getVariantStatus = (variant: ProductVariant): StatusType => {
  if (variant.isRented) return 'Disewa';
  if (variant.isAvailable) return 'Aktif';
  return 'Nonaktif';
};

// Convert status string to boolean flags
export const getStatusFlags = (status: StatusType) => {
  switch (status) {
    case 'Aktif':
      return { isAvailable: true, isRented: false };
    case 'Nonaktif':
      return { isAvailable: false, isRented: false };
    case 'Disewa':
      return { isAvailable: false, isRented: true };
    default:
      return { isAvailable: false, isRented: false };
  }
};

// Calculate price range for a product
export const getPriceRange = (variants: ProductVariant[]): string => {
  const prices = variants
    .map(v => v.price)
    .filter(price => typeof price === 'number' && !isNaN(price));

  if (prices.length === 0) return '-';

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return minPrice === maxPrice
    ? `${minPrice.toLocaleString('id-ID')}`
    : `${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`;
};

// Count available variants
export const countAvailableVariants = (variants: ProductVariant[]): number => {
  return variants.filter(v => v.isAvailable && !v.isRented).length;
};

// Count rented variants
export const countRentedVariants = (variants: ProductVariant[]): number => {
  return variants.filter(v => v.isRented).length;
};

// Validate variant data
export const validateVariantData = (variantData: Partial<ProductVariant>): string[] => {
  const errors: string[] = [];
  
  if (!variantData.size) errors.push('Size is required');
  if (!variantData.color) errors.push('Color is required');
  if (!variantData.price || variantData.price <= 0) errors.push('Valid price is required');
  
  return errors;
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// category

export type CategoryType = 
  | 'GAUN_PENGANTIN'
  | 'KEBAYA'
  | 'PAKAIAN_ADAT'
  | 'JARIK'
  | 'SELOP'
  | 'BESKAP'
  | 'SELENDANG'
  | 'JAS'
  | 'LAINNYA';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  GAUN_PENGANTIN: 'Gaun Pengantin',
  KEBAYA: 'Kebaya',
  PAKAIAN_ADAT: 'Pakaian Adat',
  JARIK: 'Jarik',
  SELOP: 'Selop',
  BESKAP: 'Beskap',
  SELENDANG: 'Selendang',
  JAS: 'Jas',
  LAINNYA: 'Lainnya',
};

export const formatCategoryName = (category: string): string => {
  return CATEGORY_LABELS[category as CategoryType] || category;
};

export const getCategoryOptions = () => {
  return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
};