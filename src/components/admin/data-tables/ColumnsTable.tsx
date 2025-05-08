// components/ProductCatalog.tsx
import Card from 'components/card';
import CardMenu from 'components/card/CardMenu';
import { ConfirmationPopup } from 'components/confirmationpopup/ConfirmationPopup';
import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { fetchProducts, updateVariantStatus, deleteVariant } from './fetch/productApi';
import { DeleteConfirmation, Product, StatusType } from 'types/product';
import { ProductDetails } from 'components/catalog/ProductDetails';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    variantId: null,
    productId: null
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
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

  // Handler for status change
  const handleStatusChange = async (productId: number, variantId: number, newStatus: StatusType) => {
    try {
      console.log(`Changing status for variant ${variantId} to ${newStatus}`);
      
      // Find the variant to update
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const variant = product.VariantProducts.find(v => v.id === variantId);
      if (!variant) return;
      
      // Update via API
      const updatedVariant = await updateVariantStatus(productId, variantId, newStatus, variant);
      
      // Update local state with the updated variant
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
      
    } catch (err) {
      console.error('Failed to update variant status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Handler for variant deletion confirmation
  const openDeleteConfirmation = (variantId: number, productId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      variantId,
      productId
    });
  };

  // Handler for actual variant deletion
  const handleDeleteVariant = async () => {
    if (!deleteConfirmation.variantId || !deleteConfirmation.productId) return;
    
    try {
      const productId = deleteConfirmation.productId;
      const variantId = deleteConfirmation.variantId;
      
      // Delete via API
      await deleteVariant(productId, variantId);
      
      // Update local state by removing the deleted variant
      setProducts(products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            VariantProducts: p.VariantProducts.filter(v => v.id !== variantId)
          };
        }
        return p;
      }));
      
      // Close the confirmation dialog
      cancelDelete();
      
    } catch (err) {
      console.error('Failed to delete variant:', err);
      alert('Failed to delete variant. Please try again.');
    }
  };

  // Cancel deletion
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
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              // Calculate total variants and available variants for the main row
              const totalVariants = product.VariantProducts.length;
              const availableVariants = product.VariantProducts.filter(v => v.isAvailable && !v.isRented).length;
              
              // Get price range
              const prices = product.VariantProducts
                .map(v => v.price)
                .filter(price => typeof price === 'number' && !isNaN(price));

              let priceDisplay = '-';
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                priceDisplay = minPrice === maxPrice
                  ? `${minPrice.toLocaleString('id-ID')}`
                  : `${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`;
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
                    <td className="py-3 px-4 font-semibold text-secondary-500">{product.category}</td>
                    <td className="py-3 px-4 font-semibold text-secondary-500">{priceDisplay}</td>
                    <td className="py-3 px-4 font-semibold text-secondary-500">{totalVariants}</td>
                    <td className="py-3 px-4 font-semibold text-secondary-500">{availableVariants}</td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="p-0">
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
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Popup for Deletion */}
      {deleteConfirmation.isOpen && (
        <ConfirmationPopup
          message="Apakah Anda yakin ingin menghapus varian ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDeleteVariant}
          onCancel={cancelDelete}
        />
      )}
    </Card>
  );
};

export default ProductCatalog;