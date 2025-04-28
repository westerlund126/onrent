'use client';
import tableDataCheck from 'variables/data-tables/tableDataCheck';
import CheckTable from 'components/admin/data-tables/CheckTable';
import tableDataComplex from 'variables/data-tables/tableDataComplex';
import DevelopmentTable from 'components/admin/data-tables/DevelopmentTable';
import ColumnsTable from 'components/admin/data-tables/ColumnsTable';
import ComplexTable from 'components/admin/data-tables/ComplexTable';
import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import AddProductWidget from 'components/addproduct/AddProduct';
import { useEffect, useState } from 'react';

const Tables = () => {
  const [productStats, setProductStats] = useState({
    totalStock: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const products = await response.json();
        
        // Calculate total stock and number of products
        const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
        const totalProducts = products.length;
        
        setProductStats({
          totalStock,
          totalProducts
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
        <div className="lg:col-span-3 space-y-5">
          {/* Card widgets */}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-7">
            <div className="md:col-span-3">
              <Widget
                icon={<MdInventory className="h-7 w-7" />}
                title={'Total Stok'}
                subtitle={loading ? 'Loading...' : `${productStats.totalStock}`}
              />
            </div>
            <div className="md:col-span-3">
              <Widget
                icon={<MdFactCheck className="h-7 w-7" />}
                title={'Produk'}
                subtitle={loading ? 'Loading...' : `${productStats.totalProducts}`}
              />
            </div>
            <div className="md:col-span-1">
              <AddProductWidget/>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <ColumnsTable />
      </div>
    </div>
  );
};

export default Tables;