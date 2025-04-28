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

type Product = {
  id: number;
  name: string;
  category: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
  ownerId: number;
  owner: {
    id: number;
    name: string;
  };
  total_sewa?: number;
  status?: string;
  specs?: string;
};

type RowObj = {
  produk: string;
  kategori: string;
  harga: number;
  stok: number;
  total_sewa: number;
  status: string;
  specs?: string;
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
        const response = await fetch('http://localhost:3000/api/products');
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
  const transformedData: RowObj[] = products.map(product => ({
    produk: product.name,
    kategori: product.category,
    harga: product.price,
    stok: product.stock,
    total_sewa: product.total_sewa || 0,
    status: determineStatus(product.stock),
    specs: `Size: ${product.size}, Color: ${product.color}, Owner: ${product.owner.name}`
  }));

  // Helper function to determine status based on stock
  function determineStatus(stock: number): string {
    if (stock > 5) return "Aktif";
    if (stock > 0) return "Disewa";
    return "Nonaktif";
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
        <p className="text-sm font-bold text-gray-600 dark:text-white">Stok</p>
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
                            <div className="text-sm text-navy-700 dark:text-white">
                              <h4 className="font-bold mb-2">Spesifikasi Produk</h4>
                              <p>{row.original.specs || "Data spesifikasi tidak tersedia"}</p>
                            </div>
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

export default ColumnsTable;