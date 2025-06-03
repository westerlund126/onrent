// components/ProductCatalog.tsx
import Card from 'components/card';
import CardMenu from 'components/card/CardMenu';
import { ConfirmationPopup } from 'components/confirmationpopup/ConfirmationPopup';
import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdEdit, MdDelete } from 'react-icons/md';
import { 
  fetchProducts, 
  updateVariantStatus, 
  deleteVariant,
  deleteProduct 
} from 'app/api/products/fetch/productApi';
import { DeleteConfirmation, Product, StatusType } from 'types/product';
import { ProductDetails } from 'components/catalog/ProductDetails';
import { toast } from 'sonner';
import { formatCategoryName } from 'utils/product';
import EditProductDialog from 'components/catalog/EditProduct';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { AlertDialogOverlay } from '@radix-ui/react-alert-dialog';

interface ProductDeleteConfirmation {
  isOpen: boolean;
  productId: number | null;
  productName: string;
}

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    variantId: null,
    productId: null
  });
  const [productDeleteConfirmation, setProductDeleteConfirmation] = useState<ProductDeleteConfirmation>({
    isOpen: false,
    productId: null,
    productName: ''
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch products',
        );
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const toggleExpand = (productId: number) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  };

  const openProductDeleteConfirmation = (productId: number, productName: string) => {
    setProductDeleteConfirmation({
      isOpen: true,
      productId,
      productName
    });
  };

  const handleDeleteProduct = async () => {
    if (!productDeleteConfirmation.productId) return;
    
    try {
      await deleteProduct(productDeleteConfirmation.productId);
      
      // Remove the product from the list
      setProducts(products.filter(p => p.id !== productDeleteConfirmation.productId));
      
      toast.success('Produk berhasil dihapus!');
      cancelProductDelete();
      
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Gagal menghapus produk. Coba lagi.');
    }
  };

  const cancelProductDelete = () => {
    setProductDeleteConfirmation({
      isOpen: false,
      productId: null,
      productName: ''
    });
  };

  const handleStatusChange = async (
    productId: number, 
    variantId: number, 
    newStatus: StatusType
  ) => {
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
      
      setProducts(products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            VariantProducts: p.VariantProducts.map(v => 
              v.id === variantId ? updatedVariant : v
            )
          };
        }
        return p;
      }));
      
      toast.success('Status berhasil diubah');
      
    } catch (err) {
      console.error('Failed to update variant status:', err);
      toast.error('Gagal mengganti status. Coba lagi.');
    }
  };

  const openDeleteConfirmation = (variantId: number, productId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      variantId,
      productId
    });
  };

  const handleDeleteVariant = async () => {
    if (!deleteConfirmation.variantId || !deleteConfirmation.productId) return;
    
    try {
      const productId = deleteConfirmation.productId;
      const variantId = deleteConfirmation.variantId;
      
      const result = await deleteVariant(productId, variantId);
      
      if (result.productDeleted) {
        // Remove the entire product from the list
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Varian berhasil dihapus. Produk juga dihapus karena tidak ada varian yang tersisa.');
      } else {
        // Update the product with remaining variants
        setProducts(products.map(p => {
          if (p.id === productId && result.product) {
            return result.product;
          }
          return p;
        }));
        toast.success('Variant berhasil dihapus!');
      }
      
      cancelDelete();
      
    } catch (err) {
      console.error('Failed to delete variant:', err);
      toast.error('Gagal menghapus varian. Coba kembali!.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      variantId: null,
      productId: null
    });
  };

  if (loading) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-medium">Loading products...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-medium text-red-500">Error: {error}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card extra="w-full h-full">
        <header className="relative flex items-center justify-between px-4 pt-4">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Katalog On-Rent
          </div>
          <CardMenu />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produk</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  <div className="flex items-center">
                    Kategori
                    <MdKeyboardArrowDown className="ml-1" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  <div className="flex items-center">
                    Harga
                    <MdKeyboardArrowDown className="ml-1" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Variasi</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Variasi Tersedia</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">Belum ada produk. Silakan tambah produk baru.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  // Calculate total variants and available variants for the main row
                  const totalVariants = product.VariantProducts.length;
                  const availableVariants = product.VariantProducts.filter(
                    v => v.isAvailable && !v.isRented
                  ).length;
                  
                  // Get price range
                  const prices = product.VariantProducts
                    .map(v => v.price)
                    .filter(price => typeof price === 'number' && !isNaN(price));

                  let priceDisplay = '-';
                  if (prices.length > 0) {
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    priceDisplay = minPrice === maxPrice
                      ? `Rp ${minPrice.toLocaleString('id-ID')}`
                      : `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`;
                  }
                  
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <button 
                              onClick={() => toggleExpand(product.id)}
                              className="mr-2 focus:outline-none"
                            >
                              {isExpanded ? (
                                <MdKeyboardArrowUp className="h-5 w-5 text-gray-600" />
                              ) : (
                                <MdKeyboardArrowDown className="h-5 w-5 text-gray-600" />
                              )}
                            </button>
                            <span className="font-semibold text-secondary-500">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-secondary-500">
                          {formatCategoryName(product.category)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-secondary-500">{priceDisplay}</td>
                        <td className="py-3 px-4 font-semibold text-secondary-500">{totalVariants}</td>
                        <td className="py-3 px-4 font-semibold text-secondary-500">{availableVariants}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="rounded p-1 text-green-600 transition-colors hover:bg-green-50 hover:text-green-800"
                              title="Edit"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openProductDeleteConfirmation(product.id, product.name)}
                              className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                              title="Hapus"
                            >
                              <MdDelete className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <ProductDetails 
                              product={product}
                              onStatusChange={handleStatusChange}
                              onDeleteClick={openDeleteConfirmation}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Variant Delete Confirmation */}
        <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && cancelDelete()}>
                      <AlertDialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />

  <AlertDialogContent className='bg-white'>
    <AlertDialogHeader>
      <AlertDialogTitle>Hapus Varian?</AlertDialogTitle>
      <AlertDialogDescription>
        Apakah Anda yakin ingin menghapus varian ini? Jika ini adalah varian terakhir, produk akan ikut terhapus.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Batal</AlertDialogCancel>
      <AlertDialogAction onClick={handleDeleteVariant}>Hapus</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

        {/* Product Delete Confirmation */}
      
          <AlertDialog open={productDeleteConfirmation.isOpen} onOpenChange={(open) => !open && cancelProductDelete()} >
            <AlertDialogOverlay className="bg-black fixed inset-0 z-50 backdrop-blur-sm backdrop-contrast-50" />
  <AlertDialogContent className='bg-white'>
    <AlertDialogHeader>
      <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
      <AlertDialogDescription>
        Apakah Anda yakin ingin menghapus produk <b>"{productDeleteConfirmation.productName}"</b>? Semua varian dari produk ini akan ikut terhapus.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Batal</AlertDialogCancel>
      <AlertDialogAction onClick={handleDeleteProduct}>Hapus</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
        
      </Card>

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onProductUpdated={handleProductUpdated}
      />
    </>
  );
};

export default ProductCatalog;