import { Product, ProductVariant } from 'types/product';
import { FilterState } from 'components/catalog/FilterCard';

export const getAvailableCategories = (products: Product[]): string[] => {
  const categories = new Set<string>();
  products.forEach(product => {
    // Assuming product object has a 'category' property
    if (product.category) {
      categories.add(product.category);
    }
  });
  return Array.from(categories).sort();
};

export const getAvailableSizes = (products: Product[]): string[] => {
  const sizes = new Set<string>();
  
  products.forEach(product => {
    product.VariantProducts
      .filter(variant => variant.isAvailable && !variant.isRented)
      .forEach(variant => sizes.add(variant.size));
  });
  
  return Array.from(sizes).sort();
};


export const getAvailableColors = (products: Product[]): string[] => {
  const colors = new Set<string>();
  
  products.forEach(product => {
    product.VariantProducts
      .filter(variant => variant.isAvailable && !variant.isRented)
      .forEach(variant => colors.add(variant.color.toLowerCase()));
  });
  
  return Array.from(colors).sort();
};


export const getPriceRange = (products: Product[]): { min: number; max: number } => {
  let min = Infinity;
  let max = 0;
  
  products.forEach(product => {
    product.VariantProducts
      .filter(variant => variant.isAvailable && !variant.isRented)
      .forEach(variant => {
        min = Math.min(min, variant.price);
        max = Math.max(max, variant.price);
      });
  });
  
  return { min: min === Infinity ? 0 : min, max };
};


export const hasAvailableVariants = (product: Product): boolean => {
  return product.VariantProducts.some(variant => variant.isAvailable && !variant.isRented);
};


export const filterProducts = (products: Product[], filters: FilterState): Product[] => {
  const hasVariantFilters = filters.selectedSize || filters.selectedColor || filters.selectedPriceRange || filters.selectedCategory;

  // Return all products if no filters are active at all
  if (!filters.selectedCategory && !hasVariantFilters) {
    return products;
  }

  return products.filter(product => {
    // 1. Filter by Category first
    if (filters.selectedCategory && product.category !== filters.selectedCategory) {
      return false;
    }

    // 2. If there are no other filters (size, color, price), the product passes
    if (!hasVariantFilters) {
      return true;
    }

    // 3. If there are other filters, check if at least one variant matches them
    const hasMatchingVariant = product.VariantProducts.some(variant => {
      if (!variant.isAvailable || variant.isRented) return false;

      if (filters.selectedSize && variant.size !== filters.selectedSize) {
        return false;
      }

      if (filters.selectedColor && variant.color.toLowerCase() !== filters.selectedColor.toLowerCase()) {
        return false;
      }

      if (filters.selectedPriceRange) {
        const { min, max } = filters.selectedPriceRange;
        if (variant.price < min || (max !== Infinity && variant.price > max)) {
          return false;
        }
      }

      return true; // This variant matches all active variant filters
    });

    return hasMatchingVariant;
  });
};


export const getMatchingVariants = (product: Product, filters: FilterState): ProductVariant[] => {
  return product.VariantProducts.filter(variant => {
    if (!variant.isAvailable || variant.isRented) return false;

    if (filters.selectedSize && variant.size !== filters.selectedSize) {
      return false;
    }

    if (filters.selectedColor && variant.color.toLowerCase() !== filters.selectedColor.toLowerCase()) {
      return false;
    }

    if (filters.selectedPriceRange) {
      const { min, max } = filters.selectedPriceRange;
      if (variant.price < min || (max !== Infinity && variant.price > max)) {
        return false;
      }
    }

    return true;
  });
};


export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};


export const getLowestPrice = (variants: ProductVariant[]): number => {
  const availableVariants = variants.filter(v => v.isAvailable && !v.isRented);
  if (availableVariants.length === 0) return 0;
  
  return Math.min(...availableVariants.map(v => v.price));
};


export const getHighestPrice = (variants: ProductVariant[]): number => {
  const availableVariants = variants.filter(v => v.isAvailable && !v.isRented);
  if (availableVariants.length === 0) return 0;
  
  return Math.max(...availableVariants.map(v => v.price));
};

