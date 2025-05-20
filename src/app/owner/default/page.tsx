'use client';
import MiniCalendar from 'components/calendar/MiniCalendar';
import { IoArrowBack } from 'react-icons/io5';
import { MdInventory, MdFactCheck } from 'react-icons/md';

import Widget from 'components/widget/Widget';
import CheckTable from 'components/admin/default/CheckTable';
import ComplexTable from 'components/admin/default/ComplexTable';
import DailyTraffic from 'components/admin/default/DailyTraffic';
import tableDataCheck from 'variables/data-tables/tableDataCheck';
import tableDataComplex from 'variables/data-tables/tableDataComplex';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [productStats, setProductStats] = useState({
    totalStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch('/api/products/owner');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const products = await response.json();

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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title={'Total Stok'}
              subtitle={loading ? 'Loading...' : `${productStats.totalStock}`}
            />
            <Widget
              icon={<MdFactCheck className="h-7 w-7" />}
              title={'Sewa Aktif'}
              subtitle={'50'}
            />
            <Widget
              icon={<IoArrowBack className="h-7 w-7" />}
              title={'Pengembalian'}
              subtitle={'80'}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DailyTraffic />
            <MiniCalendar />
          </div>

          {/* Activity Table Section */}
          <div>
            <ComplexTable tableData={tableDataComplex} />
          </div>
        </div>

        <div className="h-full lg:col-span-2">
          <div className="mt-3 h-full pb-3">
            <CheckTable tableData={tableDataCheck} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
