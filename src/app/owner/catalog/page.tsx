'use client';
import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import { useEffect, useState } from 'react';
import CatalogTable from 'components/owner/data-tables/CatalogTable';
import { Button } from '@/components/ui/button';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const Tables = () => {
  const [productStats, setProductStats] = useState({
    totalStock: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch('/api/products/owner', {
  credentials: 'include',
});
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const products = await response.json();

        const totalProducts = products.length;
        let totalStock = 0;

        products.forEach((product) => {
          if (
            product.VariantProducts &&
            Array.isArray(product.VariantProducts)
          ) {
            totalStock += product.VariantProducts.length;
          }
        });

        setProductStats({
          totalStock,
          totalProducts,
        });
      } catch (err) {
        console.error('Failed to fetch product stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductStats();
  }, []);

  const handleAddProductClick = () => {
    router.push('/owner/catalog/addproduct');
  };

  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-5 lg:col-span-3">
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-9">
            <div className="md:col-span-4">
              <Widget
                icon={<MdInventory className="h-7 w-7" />}
                title={'Total Stok'}
                subtitle={loading ? 'Loading...' : `${productStats.totalStock}`}
              />
            </div>
            <div className="md:col-span-4">
              <Widget
                icon={<MdFactCheck className="h-7 w-7" />}
                title={'Produk'}
                subtitle={
                  loading ? 'Loading...' : `${productStats.totalProducts}`
                }
              />
            </div>
            <div className="md:col-span-1 flex items-center justify-center">
              <Button
  onClick={handleAddProductClick}
  className="flex flex-col items-center justify-center h-[90px] w-full rounded-[20px] bg-orange-500 text-white text-sm font-semibold hover:brightness-110 transition-all gap-1"
>
  <FaPlus className="h-7 w-7" />
  <span>Tambah Produk</span>
</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <CatalogTable />
        {/* <CldUploadButton uploadPreset="onrent3636"/>
  <CldImage
  width="960"
  height="600"
  src="cld-sample-3"
  sizes="100vw"
  alt="Description of my image"
/> */}
      </div>
    </div>
  );
};

export default Tables;
