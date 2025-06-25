// // utils/filterUtils.ts
// import { Product, ProductVariant } from 'types/product';
// import { FilterState } from 'components/catalog/FilterCard';

// /**
//  * Get unique sizes from all available product variants
//  */
// export const getAvailableSizes = (products: Product[]): string[] => {
//   const sizes = new Set<string>();
  
//   products.forEach(product => {
//     product.VariantProducts
//       .filter(variant => variant.isAvailable && !variant.isRented)
//       .forEach(variant => sizes.add(variant.size));
//   });
  
//   return Array.from(sizes).sort();
// };

// /**
//  * Get unique colors from all available product variants
//  */
// export const getAvailableColors = (products: Product[]): string[] => {
//   const colors = new Set<string>();
  
//   products.forEach(product => {
//     product.VariantProducts
//       .filter(variant => variant.isAvailable && !variant.isRented)
//       .forEach(variant => colors.add(variant.color.toLowerCase()));
//   });
  
//   return Array.from(colors).sort();
// };

// /**
//  * Get price range from all available product variants
//  */
// export const getPriceRange = (products: Product[]): { min: number; max: number } => {
//   let min = Infinity;
//   let max = 0;
  
//   products.forEach(product => {
//     product.VariantProducts
//       .filter(variant => variant.isAvailable && !variant.isRented)
//       .forEach(variant => {
//         min = Math.min(min, variant.price);
//         max = Math.max(max, variant.price);
//       });
//   });
  
//   return { min: min === Infinity ? 0 : min, max };
// };

// /**
//  * Filter products based on the given filters
//  */
// export const filterProducts = (products: Product[], filters: FilterState): Product[] => {
//   if (!filters.selectedSize && !filters.selectedColor && !filters.selectedPriceRange) {
//     return products;
//   }
  
//   return products.filter(product => {
//     const matchingVariants = product.VariantProducts.filter(variant => {
//       // Skip rented or unavailable variants
//       if (!variant.isAvailable || variant.isRented) return false;

//       // Size filter
//       if (filters.selectedSize && variant.size !== filters.selectedSize) {
//         return false;
//       }

//       // Color filter
//       if (filters.selectedColor && variant.color.toLowerCase() !== filters.selectedColor.toLowerCase()) {
//         return false;
//       }

//       // Price filter
//       if (filters.selectedPriceRange) {
//         const { min, max } = filters.selectedPriceRange;
//         if (variant.price < min || (max !== Infinity && variant.price > max)) {
//           return false;
//         }
//       }

//       return true;
//     });

//     return matchingVariants.length > 0;
//   });
// };

// /**
//  * Get matching variants for a product based on filters
//  */
// export const getMatchingVariants = (product: Product, filters: FilterState): ProductVariant[] => {
//   return product.VariantProducts.filter(variant => {
//     // Skip rented or unavailable variants
//     if (!variant.isAvailable || variant.isRented) return false;

//     // Size filter
//     if (filters.selectedSize && variant.size !== filters.selectedSize) {
//       return false;
//     }

//     // Color filter
//     if (filters.selectedColor && variant.color.toLowerCase() !== filters.selectedColor.toLowerCase()) {
//       return false;
//     }

//     // Price filter
//     if (filters.selectedPriceRange) {
//       const { min, max } = filters.selectedPriceRange;
//       if (variant.price < min || (max !== Infinity && variant.price > max)) {
//         return false;
//       }
//     }

//     return true;
//   });
// };

// /**
//  * Format price for display
//  */
// export const formatPrice = (price: number): string => {
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(price);
// };

// /**
//  * Get the lowest price from available variants
//  */
// export const getLowestPrice = (variants: ProductVariant[]): number => {
//   const availableVariants = variants.filter(v => v.isAvailable && !v.isRented);
//   if (availableVariants.length === 0) return 0;
  
//   return Math.min(...availableVariants.map(v => v.price));
// };

// /**
//  * Get the highest price from available variants
//  */
// export const getHighestPrice = (variants: ProductVariant[]): number => {
//   const availableVariants = variants.filter(v => v.isAvailable && !v.isRented);
//   if (availableVariants.length === 0) return 0;
  
//   return Math.max(...availableVariants.map(v => v.price));
// };

// /**
//  * Check if a product has any available variants
//  */
// export const hasAvailableVariants = (product: Product): boolean => {
//   return product.VariantProducts.some(variant => variant.isAvailable && !variant.isRented);
// };