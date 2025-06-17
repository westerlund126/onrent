// components/TransactionTable.tsx
import React, { useState, useEffect } from 'react';
import {
  MdKeyboardArrowDown,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdRefresh,
  MdMoreVert,
} from 'react-icons/md';
import Card from 'components/card';
import { ConfirmationPopup } from 'components/confirmationpopup/ConfirmationPopup';
import { useRentalStore } from 'stores/useRentalStore';
import EditRentalForm from 'components/form/owner/EditRentalForm';
import { DeleteConfirmation, RentalFilters, RentalStatus } from 'types/rental';
import {
  getStatusBadgeConfig,
  formatDate,
  formatCurrency,
  getCustomerName,
  getCustomerContact,
  isDeletionDisabled,
  isValidStatus,
} from 'utils/rental';
import { sumBy } from 'lodash';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TransactionTableProps } from 'types/rental';

const getTotalRentalPrice = (rental: any) =>
  sumBy(rental?.rentalItems ?? [], (ri: any) => ri.variantProduct?.price ?? 0);

const getRentalItemsDisplay = (rental: any) => {
  if (!rental.rentalItems || rental.rentalItems.length === 0) {
    return 'Tidak ada item';
  }

  const items = rental.rentalItems.map((item: any) => {
    const product = item.variantProduct?.products;
    const variant = item.variantProduct;
    if (product && variant) {
      return `${product.name} (${variant.size}, ${variant.color})`;
    }
    return 'Item tidak diketahui';
  });

  if (items.length === 1) {
    return items[0];
  } else if (items.length <= 3) {
    return items.join(', ');
  } else {
    return `${items.slice(0, 2).join(', ')} +${items.length - 2} lainnya`;
  }
};

// Status color configurations
const getStatusConfig = (status: RentalStatus) => {
  switch (status) {
    case 'BELUM_LUNAS':
      return { color: 'text-orange-600', bgColor: 'bg-orange-50' };
    case 'LUNAS':
      return { color: 'text-blue-600', bgColor: 'bg-blue-50' };
    case 'TERLAMBAT':
      return { color: 'text-red-600', bgColor: 'bg-red-50' };
    case 'SELESAI':
      return { color: 'text-green-600', bgColor: 'bg-green-50' };
    default:
      return { color: 'text-gray-600', bgColor: 'bg-gray-50' };
  }
};

const TransactionTable: React.FC<TransactionTableProps> = ({
  filters = {},
  onViewDetails,
  onEdit,
}) => {
  const {
    rentals,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    statusUpdateLoading,
    deleteLoading,

    setCurrentPage,
    setFilters,
    loadRentals,
    updateRentalStatus,
    deleteRental,
    refreshData,
  } = useRentalStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);

  const router = useRouter();

  const handleEditSuccess = () => {
    loadRentals();
    setIsEditDialogOpen(false);
  };

  const handleEdit = (rentalId: number) => {
    setSelectedRentalId(rentalId);
    setIsEditDialogOpen(true);
    if (onEdit) onEdit(rentalId);
  };

  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      rentalId: null,
      rentalCode: null,
    });

  const itemsPerPage = filters.limit || 10;

  useEffect(() => {
    const storeFilters = useRentalStore.getState().filters;
    const areFiltersEqual =
      JSON.stringify(storeFilters) === JSON.stringify(filters);
    if (!areFiltersEqual) {
      setFilters(filters);
    }
  }, [filters, setFilters]);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  const handleStatusChange = async (rentalId: number, newStatus: string) => {
    if (!isValidStatus(newStatus)) {
      console.error('Invalid status:', newStatus);
      return;
    }
    await updateRentalStatus(rentalId, newStatus);
  };

  const openDeleteConfirmation = (rentalId: number, rentalCode: string) => {
    setDeleteConfirmation({
      isOpen: true,
      rentalId,
      rentalCode,
    });
  };

  const handleDeleteRental = async () => {
    if (!deleteConfirmation.rentalId) return;
    await deleteRental(deleteConfirmation.rentalId);
    cancelDelete();
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      rentalId: null,
      rentalCode: null,
    });
  };

  const handleViewDetails = (rentalId: number) => {
    if (onViewDetails) {
      onViewDetails(rentalId);
    } else {
      // router.push(`/owner/transaction/${rentalId}`);
      router.push(`/owner/transaction/mockDetails`);
    }
  };

  const renderActionDropdown = (rental: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MdMoreVert className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleViewDetails(rental.id)}
          className="cursor-pointer"
        >
          <MdVisibility className="mr-2 h-4 w-4" />
          Lihat Detail
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleEdit(rental.id)}
          className="cursor-pointer"
        >
          <MdEdit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openDeleteConfirmation(rental.id, rental.rentalCode)}
          disabled={isDeletionDisabled(rental.status)}
          className={`cursor-pointer ${
            isDeletionDisabled(rental.status)
              ? 'cursor-not-allowed text-gray-400'
              : 'text-red-600 focus:text-red-600'
          }`}
        >
          <MdDelete className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-lg font-medium text-gray-600">
              Loading transaksi...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-lg font-medium text-red-500">
              Error: {error}
            </p>
            <button
              onClick={refreshData}
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card extra="w-full h-full">
      <header className="relative flex items-center justify-between px-4 pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Daftar Transaksi
        </div>
        <Button
          onClick={refreshData}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Refresh Table"
        >
          <MdRefresh className="h-4 w-4" />
        </Button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Nama Pelanggan
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  Kontak
                  <MdKeyboardArrowDown className="ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Item Rental
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  Total
                  <MdKeyboardArrowDown className="ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Tanggal Selesai
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  Status
                  <MdKeyboardArrowDown className="ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const statusConfig = getStatusConfig(rental.status);
              return (
                <tr
                  key={rental.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-secondary-500">
                        {getCustomerName(rental.user)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {rental.rentalCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-secondary-500">
                    {getCustomerContact(rental.user)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs text-sm text-gray-700">
                      <span
                        className="block truncate"
                        title={getRentalItemsDisplay(rental)}
                      >
                        {getRentalItemsDisplay(rental)}
                      </span>
                      {rental.rentalItems && rental.rentalItems.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {rental.rentalItems.length} item
                          {rental.rentalItems.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-secondary-500">
                    {formatCurrency(getTotalRentalPrice(rental))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-secondary-500">
                    {formatDate(rental.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={rental.status}
                      onValueChange={(value) => {
                        if (value !== rental.status) {
                          handleStatusChange(rental.id, value);
                        }
                      }}
                      disabled={statusUpdateLoading === rental.id}
                    >
                      <SelectTrigger
                        className={`h-8 w-32 text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor} border-0`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="BELUM_LUNAS"
                          className="text-orange-600"
                        >
                          Belum Lunas
                        </SelectItem>
                        <SelectItem value="LUNAS" className="text-blue-600">
                          Lunas
                        </SelectItem>
                        <SelectItem value="TERLAMBAT" className="text-red-600">
                          Terlambat
                        </SelectItem>
                        <SelectItem value="SELESAI" className="text-green-600">
                          Selesai
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {statusUpdateLoading === rental.id && (
                      <div className="mt-1 text-xs text-blue-600">
                        Memperbarui...
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{renderActionDropdown(rental)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rentals.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <EditRentalForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedRentalId(null);
        }}
        rentalId={selectedRentalId}
        onSuccess={handleEditSuccess}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} –{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems}{' '}
            transaksi
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmation.isOpen && (
        <ConfirmationPopup
          message={`Apakah Anda yakin ingin menghapus transaksi ${deleteConfirmation.rentalCode}? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDeleteRental}
          onCancel={cancelDelete}
        />
      )}
    </Card>
  );
};

export default TransactionTable;
