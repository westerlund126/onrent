'use client';
import Banner from 'components/admin/catalog/Banner';
import { useEffect, useState, useCallback } from 'react';
import { Product } from 'types/product';
import ProductCard from 'components/card/ProductCard';
import FilterCard, { FilterState } from 'components/catalog/FilterCard';
import { filterProducts, hasAvailableVariants } from 'utils/filter';
import { Search } from 'lucide-react';

const Catalog = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    selectedSize: null,
    selectedColor: null,
    selectedPriceRange: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        // Filter out products with no available variants
        const availableProducts = data.filter((product: Product) => hasAvailableVariants(product));
        setAllProducts(availableProducts);
        setFilteredProducts(availableProducts);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    const filtered = filterProducts(allProducts, newFilters);
    setFilteredProducts(filtered);
  }, [allProducts]);

  // Separate products into trending and recent
  const trendingProducts = filteredProducts.slice(0, 6); // First 6 products as trending
  const recentProducts = filteredProducts.slice(-6); // Last 6 products as recent

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg">Loading products...</p>
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
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-5">
      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        <FilterCard products={allProducts} onFilterChange={handleFilterChange} />
      </div>
      <div className="col-span-4 h-fit w-full xl:col-span-1 2xl:col-span-4">
        <Banner />
        
        {/* Results summary */}
        <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
          <div>
            <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
              Produk Favorit
            </h4>
            <p className="ml-1 text-sm text-gray-500 mt-1">
              {filteredProducts.length} produk ditemukan
            </p>
          </div>
        </div>

        {/* Product trending card */}
        {trendingProducts.length > 0 ? (
          <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Tidak ada produk yang sesuai dengan filter</p>
          </div>
        )}

        <div className="mb-5 mt-5 flex items-center justify-between px-[26px]">
          <div>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              Produk Terbaru
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Produk terbaru yang tersedia
            </p>
          </div>
        </div>

        {/* Recently Add Products */}
        {recentProducts.length > 0 ? (
          <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
            {recentProducts.map((product) => (
              <ProductCard key={`recent-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Tidak ada produk terbaru yang sesuai dengan filter</p>
          </div>
        )}

        {/* Show all filtered products if there are many */}
        {filteredProducts.length > 12 && (
          <>
            <div className="mb-5 mt-5 flex items-center justify-between px-[26px]">
              <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                Semua Produk
              </h4>
            </div>
            <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={`all-${product.id}`} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;