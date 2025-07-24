import React from 'react';
import Card from 'components/card';
import Progress from 'components/progress';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { FaCircle } from 'react-icons/fa';

export type RowObj = {
  nama: string;
  status: string;
  tanggal: string;
  progres: number;
};

export const rentalStatusMap: {
  [key: string]: { text: string; color: string };
} = {
  BELUM_LUNAS: { text: 'Belum Lunas', color: 'red-500' },
  LUNAS: { text: 'Lunas', color: 'green-500' },
  TERLAMBAT: { text: 'Terlambat', color: 'amber-500' },
  SELESAI: { text: 'Selesai', color: 'blue-500' },
};


export const trackingProgressMap: { [key: string]: number } = {
  RENTAL_ONGOING: 25,
  RETURN_PENDING: 50,
  RETURNED: 75,
  COMPLETED: 100,
};

const columnHelper = createColumnHelper<RowObj>();


export default function ComplexTable(props: { tableData: RowObj[] }) {
  const { tableData } = props;
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = [
    columnHelper.accessor('nama', {
      id: 'nama',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">NAMA</p>
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
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          STATUS
        </p>
      ),
      cell: (info) => {
        const statusText = info.getValue();
        const statusInfo =
          Object.values(rentalStatusMap).find((s) => s.text === statusText) ||
          ({ color: 'gray-500' } as { color: string });
        return (
          <div className="flex items-center">
            <FaCircle className={`text-${statusInfo.color} me-1`} />
            <p className="text-sm font-bold text-navy-700 dark:text-white">
              {statusText}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor('tanggal', {
      id: 'tanggal',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          TANGGAL
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor('progres', {
      id: 'progres',
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          PROGRES
        </p>
      ),
      cell: (info) => (
        <div className="flex items-center">
          <Progress width="w-[108px]" value={info.getValue()} />
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: tableData, 
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <Card extra={'w-full h-full px-6 pb-6 sm:overflow-x-auto'}>
      <div className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Aktivitas Sewa Terbaru
        </div>
      </div>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="!border-px !border-gray-400">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
                    >
                      <div className="items-center justify-between text-xs text-gray-200">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="min-w-[150px] border-white/0 py-3 pr-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
