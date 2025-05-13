// api/productApi.ts

import { Product, ProductVariant, StatusType } from "types/product";

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};

export const updateVariantStatus = async (
  productId: number, 
  variantId: number, 
  newStatus: StatusType,
  variant: ProductVariant
): Promise<ProductVariant> => {
  // Determine what to update based on the new status
  let isAvailable = variant.isAvailable;
  let isRented = variant.isRented;
  
  if (newStatus === "Aktif") {
    isAvailable = true;
    isRented = false;
  } else if (newStatus === "Nonaktif") {
    isAvailable = false;
    isRented = false;
  } else if (newStatus === "Disewa") {
    isAvailable = false;
    isRented = true;
  }

  const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      size: variant.size,
      color: variant.color,
      price: variant.price,
      isAvailable,
      isRented,
      bustlength: variant.bustlength,
      waistlength: variant.waistlength,
      length: variant.length
    }),
  });
  
  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('API Error Details:', errorDetails);
    throw new Error(`Failed to update variant: ${response.status}`);
  }
  
  return await response.json();
};

export const deleteVariant = async (productId: number, variantId: number): Promise<void> => {
  const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete variant: ${response.status}`);
  }
};