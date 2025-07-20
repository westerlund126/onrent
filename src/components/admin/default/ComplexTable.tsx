import React, { useEffect, useState } from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import Progress from "components/progress";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { FaCircle } from "react-icons/fa";

// Defines the structure of a single row in the table
type RowObj = {
  nama: string;
  status: string;
  tanggal: string;
  progres: number;
};

// Maps rental tracking status to a human-readable format and progress value
const statusMap: {
  [key: string]: { text: string; progress: number; color: string };
} = {
  RENTAL_ONGOING: { text: "Aktif", progress: 25, color: "green-500" },
  RETURN_PENDING: { text: "Menunggu", progress: 50, color: "amber-500" },
  RETURNED: { text: "Selesai", progress: 75, color: "blue-500" },
  COMPLETED: { text: "Selesai", progress: 100, color: "blue-500" },
};

const columnHelper = createColumnHelper<RowObj>();

export default function ComplexTable() {
  const [tableData, setTableData] = useState<RowObj[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Fetches rental data from the API when the component mounts
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch("/api/rentals?userType=owner&page=1&limit=4");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          // Transforms API data into the format expected by the table
          const formattedData = result.data.map((rental: any) => {
            const latestTracking = rental.Tracking[0];
            const statusInfo =
              statusMap[latestTracking?.status] || statusMap.RENTAL_ONGOING;
            return {
              nama: `${rental.user.first_name} ${rental.user.last_name}`,
              status: statusInfo.text,
              tanggal: new Date(rental.startDate).toLocaleDateString("id-ID"),
              progres: statusInfo.progress,
            };
          });
          setTableData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch rental data:", error);
      }
    };
    fetchRentals();
  }, []);

  // Defines the columns for the table
  const columns = [
    columnHelper.accessor("nama", {
      id: "nama",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">NAMA</p>
      ),
      cell: (info) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => (
        <p className="text-sm font-bold text-gray-600 dark:text-white">
          STATUS
        </p>
      ),
      cell: (info) => {
        const status = info.getValue();
        const statusInfo =
          Object.values(statusMap).find((s) => s.text === status) ||
          statusMap.RENTAL_ONGOING;
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
    columnHelper.accessor("tanggal", {
      id: "tanggal",
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
    columnHelper.accessor("progres", {
      id: "progres",
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
    <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
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
                          header.getContext()
                        )}
                        {{
                          asc: "",
                          desc: "",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.slice(0, 5)
              .map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className="min-w-[150px] border-white/0 py-3  pr-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
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
