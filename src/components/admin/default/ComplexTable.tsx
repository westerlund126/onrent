import React from 'react';
import Card from 'components/card';
import CardMenu from 'components/card/CardMenu';
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


export const statusMap: {
  [key: string]: { text: string; progress: number; color: string };
} = {
  RENTAL_ONGOING: { text: 'Aktif', progress: 50, color: 'green-500' },
  RETURN_PENDING: { text: 'Menunggu', progress: 75, color: 'amber-500' },
  RETURNED: { text: 'Selesai', progress: 100, color: 'blue-500' },
  COMPLETED: { text: 'Selesai', progress: 100, color: 'blue-500' },
};

const columnHelper = createColumnHelper<RowObj>();

/**
 * @param {RowObj[]} tableData 
 */
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
        const status = info.getValue();
        const statusInfo =
          Object.values(statusMap).find((s) => s.text === status) ||
          ({ color: 'gray-500' } as { color: string });
        return (
          <div className="flex items-center">
            <FaCircle className={`text-${statusInfo.color} me-1`} />
            <p className="text-sm font-bold text-navy-700 dark:text-white">
              {status}
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
          Aktivitas Sewa
        </div>
        <CardMenu />
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
