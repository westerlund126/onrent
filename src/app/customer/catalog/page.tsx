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

const Catalog = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category'); 

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    ...EMPTY_FILTERS,
    selectedCategory: initialCategory,
  });

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
  }, []);

  useEffect(() => {
    const filtered = filterProducts(allProducts, activeFilters);
    setFilteredProducts(filtered);
  }, [activeFilters, allProducts]);


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
      <div className="col-span-1 h-full w-full rounded-xl">
        <FilterCard 
          products={allProducts} 
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange} 
        />
      </div>

      <div className="col-span-1 lg:col-span-3 h-fit w-full">
        <Banner />
        
        <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
          <div>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              Semua Produk
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} Produk Ditemukan
            </p>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="z-20 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50">
            <p className="text-gray-500">Tidak ada produk yang sesuai dengan filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;