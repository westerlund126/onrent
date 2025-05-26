// components/RentalTransactionTable.tsx
import Card from 'components/card';
import CardMenu from 'components/card/CardMenu';
import { ConfirmationPopup } from 'components/confirmationpopup/ConfirmationPopup';
import React, { useEffect, useState } from 'react';
import {
  MdKeyboardArrowDown,
  MdEdit,
  MdDelete,
  MdVisibility,
} from 'react-icons/md';

// Types based on your schema
interface RentalUser {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  phone_numbers?: string;
}

interface RentalProduct {
  id: number;
  name: string;
}

interface RentalVariant {
  id: number;
  sku: string;
  size?: string;
  color?: string;
  price: number;
}

interface RentalTracking {
  id: number;
  status: 'RENTAL_ONGOING' | 'RETURN_PENDING' | 'RETURNED' | 'COMPLETED';
  updatedAt: string;
}

interface Rental {
  id: number;
  rentalCode: string;
  startDate: string;
  endDate: string;
  status: 'BELUM_LUNAS' | 'LUNAS' | 'TERLAMBAT' | 'SELESAI';
  createdAt: string;
  updatedAt: string;
  user: RentalUser;
  products: RentalProduct;
  variantProduct: RentalVariant;
  Tracking: RentalTracking[];
}

interface DeleteConfirmation {
  isOpen: boolean;
  rentalId: number | null;
  rentalCode: string | null;
}

const TransactionTable = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      rentalId: null,
      rentalCode: null,
    });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadRentals();
  }, [currentPage]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/rentals?page=${currentPage}&limit=${itemsPerPage}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch rentals');
      }

      const result = await response.json();
      setRentals(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch transactions',
      );
      console.error('Failed to fetch rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (rentalId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await loadRentals();
    } catch (err) {
      console.error('Failed to update rental status:', err);
      alert('Failed to update status. Please try again.');
    }
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

    try {
      const response = await fetch(
        `/api/rentals/${deleteConfirmation.rentalId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete rental');
      }

      setRentals(rentals.filter((r) => r.id !== deleteConfirmation.rentalId));
      cancelDelete();

      if (rentals.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadRentals();
      }
    } catch (err) {
      console.error('Failed to delete rental:', err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      rentalId: null,
      rentalCode: null,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      BELUM_LUNAS: {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Belum Lunas',
      },
      LUNAS: { color: 'bg-green-100 text-green-800', text: 'Lunas' },
      TERLAMBAT: { color: 'bg-red-100 text-red-800', text: 'Terlambat' },
      SELESAI: { color: 'bg-gray-100 text-gray-800', text: 'Selesai' },
    };

    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      text: status,
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCustomerName = (user: RentalUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.username;
  };

  const getCustomerContact = (user: RentalUser) => {
    return user.phone_numbers || '-';
  };

  if (loading) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg font-medium">Loading transactions...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card extra="w-full pb-10 p-4 h-full">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg font-medium text-red-500">Error: {error}</p>
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
                className="border-b border-gray-100 hover:bg-gray-50"
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
                  {formatCurrency(rental.variantProduct.price)}
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
                    onChange={(e) =>
                      handleStatusChange(rental.id, e.target.value)
                    }
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BELUM_LUNAS">Belum Lunas</option>
                    <option value="LUNAS">Lunas</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        /* Handle view details */
                      }}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      title="Lihat Detail"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        /* Handle edit */
                      }}
                      className="rounded p-1 text-green-600 hover:bg-green-50 hover:text-green-800"
                      title="Edit"
                    >
                      <MdEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        openDeleteConfirmation(rental.id, rental.rentalCode)
                      }
                      className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-800"
                      title="Hapus"
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rentals.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems}{' '}
            transaksi
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
