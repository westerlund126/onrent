// api/fetch/productApi.ts
import { Product, ProductVariant, StatusType } from 'types/product';

// Fetch all products for the current owner
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products/owner', {
  credentials: 'include', 
});
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};

// Fetch a single product by ID
export const fetchProductById = async (productId: number): Promise<Product> => {
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};

// Create a new product
export const createProduct = async (productData: any): Promise<Product> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('API Error Details:', errorDetails);
    throw new Error(`Failed to create product: ${response.status}`);
  }

  return await response.json();
};

// Update a product
export const updateProduct = async (
  productId: number,
  productData: any
): Promise<Product> => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('API Error Details:', errorDetails);
    throw new Error(`Failed to update product: ${response.status}`);
  }

  return await response.json();
};

// Delete a product
export const deleteProduct = async (productId: number): Promise<void> => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.status}`);
  }
};

// Update variant status (handles the status conversion logic)
export const updateVariantStatus = async (
  productId: number,
  variantId: number,
  newStatus: StatusType,
  variant: ProductVariant,
): Promise<ProductVariant> => {
  let isAvailable = variant.isAvailable;
  let isRented = variant.isRented;

  // Convert status to boolean flags
  if (newStatus === 'Aktif') {
    isAvailable = true;
    isRented = false;
  } else if (newStatus === 'Nonaktif') {
    isAvailable = false;
    isRented = false;
  } else if (newStatus === 'Disewa') {
    isAvailable = false;
    isRented = true;
  }

  const response = await fetch(
    `/api/products/${productId}/variants/${variantId}`,
    {
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
        length: variant.length,
      }),
    },
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('API Error Details:', errorDetails);
    throw new Error(`Failed to update variant: ${response.status}`);
  }

  return await response.json();
};

// Create a new variant for a product
export const createVariant = async (
  productId: number,
  variantData: any
): Promise<ProductVariant> => {
  const response = await fetch(`/api/products/${productId}/variants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variantData),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('API Error Details:', errorDetails);
    throw new Error(`Failed to create variant: ${response.status}`);
  }

  return await response.json();
};

// Delete a variant (includes auto-delete product if no variants remain)
export const deleteVariant = async (
  productId: number,
  variantId: number,
): Promise<{
  success: boolean;
  productDeleted: boolean;
  product?: Product;
  message?: string;
}> => {
  const response = await fetch(
    `/api/products/${productId}/variants/${variantId}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete variant: ${response.status}`);
  }

  return await response.json();
};

// Fetch owner information
export const fetchOwnerInfo = async (): Promise<{
  id: number;
  role: string;
  username?: string;
}> => {
  const response = await fetch('/api/auth/owner');
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};