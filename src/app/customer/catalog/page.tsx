'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; 
import Banner from 'components/admin/catalog/Banner';
import { Product } from 'types/product';
import ProductCard from 'components/card/ProductCard';
import FilterCard, { FilterState } from 'components/catalog/FilterCard';
import { filterProducts, hasAvailableVariants } from 'utils/filter';

const EMPTY_FILTERS: FilterState = {
  selectedCategory: null,
  selectedSize: null,
  selectedColor: null,
  selectedPriceRange: null,
};

const ITEMS_PER_PAGE = 12; 
const Catalog = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category'); 

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    ...EMPTY_FILTERS,
    selectedCategory: initialCategory,
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const availableProducts = data.filter((product: Product) => hasAvailableVariants(product));
        setAllProducts(availableProducts);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = useCallback((newFilter: Partial<FilterState>) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      ...newFilter,
    }));
    setCurrentPage(1); 
  }, []);

  useEffect(() => {
    const filtered = filterProducts(allProducts, activeFilters);
    setFilteredProducts(filtered);
    setCurrentPage(1); 
  }, [activeFilters, allProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        Previous
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-brand-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        Next
      </button>
    );

    return (
      <div className="flex justify-center items-center mt-8 mb-4">
        <div className="flex items-center">
          {pages}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg">Memuat Produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 lg:grid-cols-4">
      {/* Filter Card */}
      <div className="col-span-1 h-full w-full rounded-xl">
        <FilterCard 
          products={allProducts} 
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange} 
        />
      </div>

      {/* Main Content */}
      <div className="col-span-1 lg:col-span-3 h-fit w-full">
        <div className="hidden md:block">
          <Banner />
        </div>
        
        <div className="block lg:hidden mb-4">
        </div>

        <div className="mb-4 mt-5 flex flex-col justify-between px-2 sm:px-4 md:flex-row md:items-center">
          <div>
            <h4 className="text-xl sm:text-2xl font-bold text-navy-700 dark:text-white">
              Semua Produk
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} Produk Ditemukan
            </p>
          </div>
          
          {/* Page info */}
          {totalPages > 1 && (
            <div className="mt-2 md:mt-0">
              <p className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </p>
            </div>
          )}
        </div>

        {currentProducts.length > 0 ? (
          <>
            <div className="z-20 grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 px-2 sm:px-0">
              {currentProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  extra="h-full" 
                />
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50 mx-2 sm:mx-0">
            <p className="text-gray-500 text-center px-4">
              Tidak ada produk yang sesuai dengan filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;