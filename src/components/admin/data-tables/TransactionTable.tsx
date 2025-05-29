// components/TransactionTable.tsx
import React, { useState, useEffect } from 'react';
import {
  MdKeyboardArrowDown,
  MdEdit,
  MdDelete,
  MdVisibility,
} from 'react-icons/md';
import Card from 'components/card';
import CardMenu from 'components/card/CardMenu';
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

interface TransactionTableProps {
  filters?: RentalFilters;
  onViewDetails?: (rentalId: number) => void;
  onEdit?: (rentalId: number) => void;
}

const getTotalRentalPrice = (rental: any) =>
  sumBy(rental?.rentalItems ?? [], (ri: any) => ri.variantProduct?.price ?? 0);

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

  const renderStatusBadge = (status: RentalStatus) => {
    const config = getStatusBadgeConfig(status);
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const renderActionButtons = (rental: any) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleViewDetails(rental.id)}
        className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
        title="Lihat Detail"
      >
        <MdVisibility className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleEdit(rental.id)}
        className="rounded p-1 text-green-600 transition-colors hover:bg-green-50 hover:text-green-800"
        title="Edit"
      >
        <MdEdit className="h-4 w-4" />
      </button>
      <button
        onClick={() => openDeleteConfirmation(rental.id, rental.rentalCode)}
        disabled={isDeletionDisabled(rental.status)}
        className={`rounded p-1 transition-colors ${
          isDeletionDisabled(rental.status)
            ? 'cursor-not-allowed text-gray-400'
            : 'text-red-600 hover:bg-red-50 hover:text-red-800'
        }`}
        title={
          isDeletionDisabled(rental.status)
            ? 'Cannot delete active rental'
            : 'Hapus'
        }
      >
        <MdDelete className="h-4 w-4" />
      </button>
    </div>
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
              Caba Lagi
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
        <CardMenu />
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
                <div className="flex items-center">
                  Total
                  <MdKeyboardArrowDown className="ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Tanggal Mulai
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
            {rentals.map((rental) => (
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
                      {rental.user.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-secondary-500">
                  {getCustomerContact(rental.user)}
                </td>
                <td className="px-4 py-3 font-semibold text-secondary-500">
                  {formatCurrency(getTotalRentalPrice(rental))}
                </td>
                <td className="px-4 py-3 font-semibold text-secondary-500">
                  {formatDate(rental.startDate)}
                </td>
                <td className="px-4 py-3 font-semibold text-secondary-500">
                  {formatDate(rental.endDate)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={rental.status}
                    onChange={({ target }) => {
                      if (target.value !== rental.status) {
                        handleStatusChange(rental.id, target.value);
                      }
                    }}
                    disabled={statusUpdateLoading === rental.id}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="BELUM_LUNAS">Belum Lunas</option>
                    <option value="LUNAS">Lunas</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                  {statusUpdateLoading === rental.id && (
                    <div className="mt-1 text-xs text-blue-600">
                      Memperbarui...
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{renderActionButtons(rental)}</td>
              </tr>
            ))}
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

      {/* edit dialog */}
      <EditRentalForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedRentalId(null);
        }}
        rentalId={selectedRentalId}
        onSuccess={handleEditSuccess}
      />

      {/* pagination */}
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

      {/* delete confirmation */}
      {deleteConfirmation.isOpen && (
        <ConfirmationPopup
          message={`Apakah Anda yakin ingin menghapus transaksi ${deleteConfirmation.rentalCode}? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={handleDeleteRental}
          onCancel={cancelDelete}
          loading={deleteLoading}
        />
      )}
    </Card>
  );
};

export default TransactionTable;
