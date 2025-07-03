// components/admin/AdminCatalogTable.tsx
import Card from 'components/card';
import React, { useEffect } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdDelete, MdRefresh } from 'react-icons/md';
import { AdminProductDetails } from 'components/admin/AdminProductDetails';
import { formatCategoryName } from 'utils/product';
import {
  AlertDialog,
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
import { useAdminCatalogStore } from 'stores/useAdminCatalogStore';
import { Product } from 'types/product';

const AdminCatalogTable = () => {
  // Zustand store state and actions
  const {
    products,
    loading,
    error,
    expandedProductId,
    productDeleteConfirmation,
    loadProducts,
    refreshData,
    toggleExpand,
    openProductDeleteConfirmation,
    handleDeleteProduct,
    cancelProductDelete
  } = useAdminCatalogStore();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDeleteClick = (product: Product) => {
    openProductDeleteConfirmation(product.id, product.name);
  };

  if (loading) {
   return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-lg font-medium text-gray-600">
              Loading Produk...
            </p>
          </div>
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
            Katalog Produk
          </div>
          <Button
            onClick={refreshData}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Refresh Table"
          >
            <MdRefresh className="h-4 w-4" />
          </Button>
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Varian</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pemilik</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">Belum ada produk.</p>
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
                        <td className="py-3 px-4 font-semibold text-secondary-500">
                          {product.owner?.businessName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-500 transition-colors hover:text-red-700"
                            title="Hapus Produk"
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <AdminProductDetails 
                              product={product}
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

        {/* Product Delete Confirmation */}
        <AlertDialog open={productDeleteConfirmation.isOpen} onOpenChange={(open) => !open && cancelProductDelete()}>
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
    </>
  );
};

export default AdminCatalogTable;