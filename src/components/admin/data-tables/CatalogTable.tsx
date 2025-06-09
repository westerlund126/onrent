// components/ProductCatalog.tsx
import Card from 'components/card';
import React, { useEffect } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdEdit, MdDelete, MdMoreVert, MdRefresh } from 'react-icons/md';
import { ProductDetails } from 'components/catalog/ProductDetails';
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
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useCatalogStore } from 'stores/useCatalogStore';
import { Product } from 'types/product';

const ProductCatalog = () => {
  const router = useRouter();
  
  // Zustand store state and actions
  const {
    products,
    loading,
    error,
    expandedProductId,
    deleteConfirmation,
    productDeleteConfirmation,
    loadProducts,
    refreshData,
    toggleExpand,
    handleStatusChange,
    openDeleteConfirmation,
    handleDeleteVariant,
    cancelDelete,
    openProductDeleteConfirmation,
    handleDeleteProduct,
    cancelProductDelete
  } = useCatalogStore();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleEditProduct = (product: Product) => {
    router.push(`/owner/catalog/editproduct/${product.id}`);
  };

  const renderActionDropdown = (product: Product) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MdMoreVert className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleEditProduct(product)}
          className="cursor-pointer"
        >
          <MdEdit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openProductDeleteConfirmation(product.id, product.name)}
          className="cursor-pointer"
        >
          <MdDelete className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Varian Tersedia</th>
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
                        <td className="px-4 py-3">{renderActionDropdown(product)}</td>
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

export default ProductCatalog;