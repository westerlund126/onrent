'use client';
import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import { useEffect, useState } from 'react';
import ColumnsTable from 'components/admin/data-tables/ColumnsTable';
import { Button } from '@/components/ui/button';
import ProductForm from 'components/form/owner/ProductForm';
import { FaPlus } from 'react-icons/fa';

const Tables = () => {
  const [productStats, setProductStats] = useState({
    totalStock: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // 🔹 state for modal visibility

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch('/api/products/owner');
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

  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-5 lg:col-span-3">
          {/* Card widgets */}
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
  onClick={() => setIsOpen(true)}
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
        <ColumnsTable />
      </div>

      {/* 🔹 Modal Form */}
      <ProductForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default Tables;
