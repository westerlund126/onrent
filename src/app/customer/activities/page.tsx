// components/CustomerActivityPage.js
"use client";
import { Calendar, Package, Eye, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useActivities } from 'hooks/useActivities';
import {
  formatDateTime,
  formatCurrency,
  getStatusBadgeConfig,
  isValidStatus as isValidRentalStatus,
  RentalStatus
} from 'utils/rental';
import {
  getFittingStatusConfig,
  isValidFittingStatus,
  FittingStatus
} from 'utils/fitting';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from '@/components/ui/alert-dialog'; 

const CustomerActivityPage = () => {
  const router = useRouter();
  const {
    activities,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    fittingCancelConfirmation,
    openFittingCancelConfirmation,
    cancelFittingCancellation,
    handleConfirmCancelFitting,
  } = useActivities();

  const handleViewDetail = (activity) => {
    router.push(`/customer/activities/${activity.type}/${activity.id}`);
  };

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Aktivitas Saya</h1>
            <p className="text-gray-600">Riwayat rental dan fitting Anda</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Aktivitas Saya</h1>
            <p className="text-gray-600">Riwayat rental dan fitting Anda</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-24 h-20 bg-gray-200 rounded-3xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Aktivitas Saya</h1>
            <p className="text-gray-600">Riwayat rental dan fitting Anda</p>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Aktivitas</h3>
              <p className="text-gray-600">Aktivitas rental dan fitting Anda akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                let statusConfig;
                if (activity.type === 'rental' && isValidRentalStatus(activity.status)) {
                  statusConfig = getStatusBadgeConfig(activity.status);
                } else if (activity.type === 'fitting' && isValidFittingStatus(activity.status)) {
                  statusConfig = getFittingStatusConfig(activity.status);
                } else {
                  statusConfig = {
                    color: 'bg-gray-100 text-gray-800',
                    text: activity.status,
                  };
                }

                const canCancelFitting = activity.type === 'fitting' && ['PENDING', 'CONFIRMED'].includes(activity.status);

                return (
                  <div key={`${activity.type}-${activity.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(activity.date, 'id-ID')}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                          {activity.type === 'rental' ? 'Rental' : 'Fitting'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.text}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 mb-3">
                      <div className="relative w-24 h-20 bg-primary-100 rounded-3xl flex items-end justify-center overflow-visible">
                        <Image
                          width={26}
                          height={26}
                          src={activity.type === 'fitting' ? '/img/fitting.png' : '/img/rental.png'}
                          alt={activity.type === 'fitting' ? 'Fitting' : 'Rental'}
                          className="w-full h-full object-contain mb-1 relative z-10"
                          style={{ transform: 'translateY(28px)' }}
                        />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{activity.ownerName}</h3>
                        {activity.products && activity.products.length > 0 ? (
                          <div className="space-y-1">
                            {activity.products.slice(0, 2).map((product, index) => (
                              <p key={index} className="text-gray-700 text-sm">{product}</p>
                            ))}
                            {activity.products.length > 2 && (
                              <p className="text-gray-500 text-sm">+{activity.products.length - 2} produk lainnya</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            {activity.type === 'fitting' ? 'Konsultasi fitting umum' : 'Tidak ada produk'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        {activity.totalPrice && (
                          <div className="text-left">
                            <p className="text-xs text-gray-500 mb-1">Total Belanja</p>
                            <p className="font-bold text-gray-900">{formatCurrency(activity.totalPrice, 'IDR', 'id-ID')}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {canCancelFitting && (
                          <button
                            onClick={() => openFittingCancelConfirmation(activity.id, activity.ownerName)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            Batalkan
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(activity)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pagination.hasNextPage && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}

          {activities.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Menampilkan {activities.length} dari {pagination.totalActivities} aktivitas
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={fittingCancelConfirmation.isOpen}
        onOpenChange={(open) => !open && cancelFittingCancellation()}
      >
        <AlertDialogOverlay className="bg-black/30 fixed inset-0 z-50 backdrop-blur-sm" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Jadwal Fitting?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan jadwal fitting dengan <b>"{fittingCancelConfirmation.ownerName}"</b>? Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelFittingCancellation}>Tidak</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelFitting}
              disabled={fittingCancelConfirmation.isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {fittingCancelConfirmation.isCanceling ? 'Membatalkan...' : 'Ya, Batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomerActivityPage;
