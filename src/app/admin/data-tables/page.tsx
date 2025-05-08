'use client';
import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import AddProductWidget from 'components/addproduct/AddProduct';
import { useEffect, useState } from 'react';
import ColumnsTable from 'components/admin/data-tables/ColumnsTable';

const Tables = () => {
  const [productStats, setProductStats] = useState({
    totalStock: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const products = await response.json();
        
        // Calculate total stats from the actual API response structure
        const totalProducts = products.length;
        
        // Calculate total stock from all variant products
        let totalStock = 0;
        

products.forEach(product => {
  if (product.VariantProducts && Array.isArray(product.VariantProducts)) {
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
        <div className="lg:col-span-3 space-y-5">
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