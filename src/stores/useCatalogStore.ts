// stores/useCatalogStore.ts
import { create } from 'zustand';
import { 
  fetchProducts, 
  updateVariantStatus, 
  deleteVariant,
  deleteProduct 
} from 'app/api/products/fetch/productApi';
import { Product, StatusType, DeleteConfirmation } from 'types/product';
import { toast } from 'sonner';

interface ProductDeleteConfirmation {
  isOpen: boolean;
  productId: number | null;
  productName: string;
}

interface CatalogState {
  // State
  products: Product[];
  loading: boolean;
  error: string | null;
  expandedProductId: number | null;
  deleteConfirmation: DeleteConfirmation;
  productDeleteConfirmation: ProductDeleteConfirmation;

  // Actions
  loadProducts: () => Promise<void>;
  refreshData: () => Promise<void>;
  toggleExpand: (productId: number) => void;
  handleStatusChange: (productId: number, variantId: number, newStatus: StatusType) => Promise<void>;
  openDeleteConfirmation: (variantId: number, productId: number) => void;
  handleDeleteVariant: () => Promise<void>;
  cancelDelete: () => void;
  openProductDeleteConfirmation: (productId: number, productName: string) => void;
  handleDeleteProduct: () => Promise<void>;
  cancelProductDelete: () => void;
  setError: (error: string | null) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  // Initial state
  products: [],
  loading: true,
  error: null,
  expandedProductId: null,
  deleteConfirmation: {
    isOpen: false,
    variantId: null,
    productId: null
  },
  productDeleteConfirmation: {
    isOpen: false,
    productId: null,
    productName: ''
  },

  // Actions
  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchProducts();
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

  handleStatusChange: async (productId: number, variantId: number, newStatus: StatusType) => {
    const { products } = get();
    try {
      console.log(`Changing status for variant ${variantId} to ${newStatus}`);
      
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const variant = product.VariantProducts.find(v => v.id === variantId);
      if (!variant) return;
      
      const updatedVariant = await updateVariantStatus(
        productId, 
        variantId, 
        newStatus, 
        variant
      );
      
      console.log('Updated variant data:', updatedVariant);
      
      set({
        products: products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              VariantProducts: p.VariantProducts.map(v => 
                v.id === variantId ? updatedVariant : v
              )
            };
          }
          return p;
        })
      });
      
      toast.success('Status berhasil diubah');
      
    } catch (err) {
      console.error('Failed to update variant status:', err);
      toast.error('Gagal mengganti status. Coba lagi.');
    }
  },

  openDeleteConfirmation: (variantId: number, productId: number) => {
    set({
      deleteConfirmation: {
        isOpen: true,
        variantId,
        productId
      }
    });
  },

  handleDeleteVariant: async () => {
    const { deleteConfirmation, products } = get();
    if (!deleteConfirmation.variantId || !deleteConfirmation.productId) return;
    
    try {
      const productId = deleteConfirmation.productId;
      const variantId = deleteConfirmation.variantId;
      
      const result = await deleteVariant(productId, variantId);
      
      if (result.productDeleted) {
        // Remove the entire product from the list
        set({
          products: products.filter(p => p.id !== productId)
        });
        toast.success('Varian berhasil dihapus. Produk juga dihapus karena tidak ada varian yang tersisa.');
      } else {
        // Update the product with remaining variants
        set({
          products: products.map(p => {
            if (p.id === productId && result.product) {
              return result.product;
            }
            return p;
          })
        });
        toast.success('Variant berhasil dihapus!');
      }
      
      get().cancelDelete();
      
    } catch (err) {
      console.error('Failed to delete variant:', err);
      toast.error('Gagal menghapus varian. Coba kembali!.');
    }
  },

  cancelDelete: () => {
    set({
      deleteConfirmation: {
        isOpen: false,
        variantId: null,
        productId: null
      }
    });
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