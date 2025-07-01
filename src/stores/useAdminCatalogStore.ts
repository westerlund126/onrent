// stores/useAdminCatalogStore.ts
import { create } from 'zustand';
import { deleteProduct } from 'app/api/products/fetch/productApi';
import { Product } from 'types/product';
import { toast } from 'sonner';

interface ProductDeleteConfirmation {
  isOpen: boolean;
  productId: number | null;
  productName: string;
}

interface AdminCatalogState {
  // State
  products: Product[];
  loading: boolean;
  error: string | null;
  expandedProductId: number | null;
  productDeleteConfirmation: ProductDeleteConfirmation;

  // Actions
  loadProducts: () => Promise<void>;
  refreshData: () => Promise<void>;
  toggleExpand: (productId: number) => void;
  openProductDeleteConfirmation: (productId: number, productName: string) => void;
  handleDeleteProduct: () => Promise<void>;
  cancelProductDelete: () => void;
  setError: (error: string | null) => void;
}

export const useAdminCatalogStore = create<AdminCatalogState>((set, get) => ({
  // Initial state
  products: [],
  loading: true,
  error: null,
  expandedProductId: null,
  productDeleteConfirmation: {
    isOpen: false,
    productId: null,
    productName: ''
  },

  // Actions
  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      // Admin-specific fetch - gets all products from all owners
      const response = await fetch('/api/products', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      set({ products: data, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      set({ error: errorMessage, loading: false });
      console.error('Failed to fetch products:', err);
    }
  },

  refreshData: async () => {
    const { loadProducts } = get();
    await loadProducts();
  },

  toggleExpand: (productId: number) => {
    const { expandedProductId } = get();
    set({ expandedProductId: expandedProductId === productId ? null : productId });
  },

  openProductDeleteConfirmation: (productId: number, productName: string) => {
    set({
      productDeleteConfirmation: {
        isOpen: true,
        productId,
        productName
      }
    });
  },

  handleDeleteProduct: async () => {
    const { productDeleteConfirmation, products } = get();
    if (!productDeleteConfirmation.productId) return;
    
    try {
      await deleteProduct(productDeleteConfirmation.productId);
      
      // Remove the product from the list
      set({
        products: products.filter(p => p.id !== productDeleteConfirmation.productId)
      });
      
      toast.success('Produk berhasil dihapus!');
      get().cancelProductDelete();
      
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Gagal menghapus produk. Coba lagi.');
    }
  },

  cancelProductDelete: () => {
    set({
      productDeleteConfirmation: {
        isOpen: false,
        productId: null,
        productName: ''
      }
    });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));