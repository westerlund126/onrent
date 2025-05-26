'use client';

import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import { useEffect, useState } from 'react';
import Card from 'components/card';
import RentalForm from 'components/form/owner/RentalForm';
import TransactionTable from 'components/admin/data-tables/TransactionTable';

const Transaction = () => {
  const [productStats, setProductStats] = useState({
    totalStock: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

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
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-4">
            <div>
              <Widget
                icon={<MdInventory className="h-7 w-7" />}
                title={'Lunas'}
                subtitle={loading ? 'Loading...' : `${productStats.totalStock}`}
              />
            </div>
            <div className="">
              <Widget
                icon={<MdInventory className="h-7 w-7" />}
                title={'Belum Lunas'}
                subtitle={loading ? 'Loading...' : `${productStats.totalStock}`}
              />
            </div>
            <div className="">
              <Widget
                icon={<MdFactCheck className="h-7 w-7" />}
                title={'Terlambat'}
                subtitle={
                  loading ? 'Loading...' : `${productStats.totalProducts}`
                }
              />
            </div>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer md:col-span-1">
              <Card extra="!flex-row flex-grow items-center rounded-[20px] h-[90px] bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="flex w-full items-center justify-center text-white">
                  <p className="text-lg font-bold">+ Tambah Transaksi</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <TransactionTable />
      </div>

      {/* Pass dialog state to form */}
      <RentalForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default Transaction;