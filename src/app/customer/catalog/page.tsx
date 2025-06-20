'use client';
import Banner from 'components/admin/catalog/Banner';
import TopCreatorTable from 'components/admin/catalog/TableTopCreators';
import { useEffect, useState } from 'react';
import { Product } from 'types/product';
import ProductCard from 'components/card/ProductCard';

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Error loading products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        {/* <div className="mb-5" /> */}
        {/* <HistoryItem /> */}
        <TopCreatorTable/>
      </div>
      <div className="col-span-4 h-fit w-full xl:col-span-1 2xl:col-span-4">
        {/* NFt Banner */}
        <Banner/>
        {/* NFt Header */}
        <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
          <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
            Produk Favorit
          </h4>
          {/* <ul className="mt-4 flex items-center justify-between md:mt-0 md:justify-center md:!gap-5 2xl:!gap-12">
            <li>
              <a
                className="text-base font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                Art
              </a>
            </li>
            <li>
              <a
                className="text-base font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                Music
              </a>
            </li>
            <li>
              <a
                className="text-base font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                Collection
              </a>
            </li>
            <li>
              <a
                className="text-base font-medium text-brand-500 hover:text-brand-500 dark:text-white"
                href=" "
              >
                Sports
              </a>
            </li>
          </ul> */}
        </div>

        {/* NFTs trending card */}
        <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Recenlty Added setion */}
        <div className="mb-5 mt-5 flex items-center justify-between px-[26px]">
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            Produk Terbaru
          </h4>
        </div>

        {/* Recently Add NFTs */}
        {/* <div className="grid grid-cols-1 gap-5 md:grid-cols-3"> */}
        <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      {/* </div> */}

      {/* right side section */}
    </div>
  );
};

export default Catalog;
