import React, { useEffect, useState } from 'react';
import CardMenu from 'components/card/CardMenu';
import Card from 'components/card';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { MdCancel, MdCheckCircle, MdOutlineError, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

// Interface to match the actual API response structure based on Prisma schema
interface ProductVariant {
  id: number;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  availstock: number;
  rentedstock: number;
  isAvailable: boolean;
  createdAt: string;
  productsId: number;
  bustlength: number | null;
  waistlength: number | null;
  length: number | null;
}

interface Product {
  id: number;
  name: string;
  category: string;
  images: string[];
  description: string;
  createdAt: string;
  ownerId: number;
  owner: {
    id: number;
    name: string;
  };
  VariantProducts: ProductVariant[];
}

// Table row structure
type RowObj = {
  id: number;
  produk: string;
  kategori: string;
  harga: number;
  stok: number;
  availstock: number;
  rentedstock: number;
  total_sewa: number;
  status: string;
  specs: {
    size: string | null;
    color: string | null;
    owner: string;
    bust: number | null;
    waist: number | null;
    length: number | null;
    description: string;
  };
  variantId: number;
};

function ColumnsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Transform the API data to match our table structure
  const transformedData: RowObj[] = React.useMemo(() => {
    if (!products.length) return [];
    
    // Flatten product data with variants
    return products.flatMap(product => 
      product.VariantProducts.map(variant => ({
        id: product.id,
        variantId: variant.id,
        produk: product.name,
        kategori: product.category,
        harga: variant.price,
        stok: variant.stock,
        availstock: variant.availstock,
        rentedstock: variant.rentedstock,
        total_sewa: variant.rentedstock || 0, // Using rentedstock as total rentals
        status: determineStatus(variant.isAvailable, variant.availstock, variant.rentedstock),
        specs: {
          size: variant.size,
          color: variant.color,
          owner: product.owner.name,
          bust: variant.bustlength,
          waist: variant.waistlength,
          length: variant.length,
          description: product.description
        }
      }))
    );
  }, [products]);

  // Helper function to determine status based on isAvailable flag and stock values
  function determineStatus(isAvailable: boolean, availStock: number, rentedStock: number): string {
    if (!isAvailable) return "Nonaktif"; // If product is marked as unavailable
    if (rentedStock > 0) return "Disewa"; // If product has any rented items
    return "Aktif"; // Otherwise product is active and available
  }
  
  const columnHelper = createColumnHelper<RowObj>();
  
  const columns = [
    columnHelper.accessor('produk', {
      id: 'produk',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">Produk</p>
      ),
      cell: (info) => (
        <div className="flex items-center">
          <div 
            className="cursor-pointer mr-2" 
            onClick={() => info.row.toggleExpanded()}
          >
            {info.row.getIsExpanded() ? (
              <MdKeyboardArrowUp className="text-navy-700 dark:text-white" />
            ) : (
              <MdKeyboardArrowDown className="text-navy-700 dark:text-white" />
            )}
          </div>
          <p className="text-sm font-bold text-navy-700 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor('kategori', {
      id: 'kategori',
      header: ({ column }) => (
        <div 
          className="flex items-center cursor-pointer" 
          onClick={column.getToggleSortingHandler()}
        >
          <p className="text-sm font-bold text-gray-600 dark:text-white">
            Kategori
          </p>
          
          <span className="ml-1">
            {column.getIsSorted() === 'asc' ? (
              <MdKeyboardArrowUp className="text-gray-600 dark:text-white" />
            ) : (
              <MdKeyboardArrowDown className="text-gray-600 dark:text-white" />
            )}
          </span>
        </div>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor('harga', {
      id: 'harga',
      header: ({ column }) => (
        <div 
          className="flex items-center cursor-pointer" 
          onClick={column.getToggleSortingHandler()}
        >
          <p className="text-sm font-bold text-gray-600 dark:text-white">
            Harga
          </p>
          <span className="ml-1">
            {column.getIsSorted() === 'asc' ? (
              <MdKeyboardArrowUp className="text-gray-600 dark:text-white" />
            ) : (
              <MdKeyboardArrowDown className="text-gray-600 dark:text-white" />
            )}
          </span>
        </div>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          Rp {info.getValue().toLocaleString('id-ID')}
        </p>
      ),
    }),
    columnHelper.accessor('stok', {
      id: 'stok',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">Stok Total</p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor('availstock', {
      id: 'availstock',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">Stok Tersedia</p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor('total_sewa', {
      id: 'total_sewa',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">Total Penyewaan</p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">Status</p>
      ),
      cell: (info) => (
        <div className="flex items-center">
          {info.getValue() === "Aktif" ? (
            <MdCheckCircle className="text-green-500 me-1 dark:text-green-300" />
          ) : info.getValue() === "Nonaktif" ? (
            <MdCancel className="text-red-500 me-1 dark:text-red-300" />
          ) : info.getValue() === "Disewa" ? (
            <MdOutlineError className="text-amber-500 me-1 dark:text-amber-300" />
          ) : null}
          <p className="text-sm font-bold text-navy-700 dark:text-white">
            {info.getValue()}
          </p>
        </div>
      ),
    }),
  ];
  
  const table = useReactTable({
    data: transformedData,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  });
  
  if (loading) {
    return (
      <Card extra={'w-full pb-10 p-4 h-full'}>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-medium">Loading products...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card extra={'w-full pb-10 p-4 h-full'}>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-medium text-red-500">Error: {error}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card extra={'w-full pb-10 p-4 h-full'}>
      <header className="relative flex items-center justify-between">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Katalog On-Rent
        </div>
        <CardMenu />
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        {transformedData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg font-medium">No products found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="!border-px !border-gray-400">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/30"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table
                .getRowModel()
                .rows.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <tr>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="min-w-[150px] border-white/0 py-3 pr-4"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <tr>
                          <td colSpan={columns.length} className="bg-gray-50 dark:bg-navy-700/50 p-4">
                            <ExpandedRowContent specs={row.original.specs} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

// Component for expanded row content
function ExpandedRowContent({ specs }: { specs: RowObj['specs'] }) {
  return (
    <div className="text-sm text-navy-700 dark:text-white">
      <h4 className="font-bold mb-4">Spesifikasi Produk</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-2">
            <span className="font-semibold">Ukuran:</span> {specs.size || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Warna:</span> {specs.color || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Pemilik:</span> {specs.owner}
          </div>
        </div>
        
        <div>
          {specs.bust && (
            <div className="mb-2">
              <span className="font-semibold">Lingkar Dada:</span> {specs.bust} cm
            </div>
          )}
          {specs.waist && (
            <div className="mb-2">
              <span className="font-semibold">Lingkar Pinggang:</span> {specs.waist} cm
            </div>
          )}
          {specs.length && (
            <div className="mb-2">
              <span className="font-semibold">Panjang:</span> {specs.length} cm
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <span className="font-semibold">Deskripsi:</span>
        <p className="mt-1">{specs.description}</p>
      </div>
    </div>
  );
}

export default ColumnsTable;