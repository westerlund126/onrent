// components/CustomerActivityPage.js
"use client";
import { Calendar, Package, Eye, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useActivities } from 'hooks/useActivities';
import { 
  formatDateTime,
  formatCurrency,
  getStatusBadgeConfig,
  getStatusDisplayText,
  isValidStatus as isValidRentalStatus,
  RentalStatus
} from 'utils/rental';
import {
  getFittingStatusConfig,
  isValidFittingStatus,
  FittingStatus
} from 'utils/fitting';

const CustomerActivityPage = () => {
  const router = useRouter();
  const { activities, loading, error, pagination, loadMore, refresh } = useActivities();

  const handleViewDetail = (activity) => {
    router.push(`/activities/${activity.type}/${activity.id}`);
  };

  // Error state
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

  // Loading state
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Aktivitas Saya</h1>
          <p className="text-gray-600">Riwayat rental dan fitting Anda</p>
        </div>

        {/* Activities List */}
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Aktivitas</h3>
            <p className="text-gray-600">Aktivitas rental dan fitting Anda akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              // Determine status config based on activity type
              let statusConfig;
              
              if (activity.type === 'rental' && isValidRentalStatus(activity.status)) {
                statusConfig = getStatusBadgeConfig(activity.status as RentalStatus);
              } else if (activity.type === 'fitting' && isValidFittingStatus(activity.status)) {
                statusConfig = getFittingStatusConfig(activity.status as FittingStatus);
              } else {
                // Fallback for unknown status
                statusConfig = {
                  color: 'bg-gray-100 text-gray-800',
                  text: activity.status,
                };
              }
                
              return (
                <div key={`${activity.type}-${activity.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Header with Date and Status */}
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

                  {/* Owner Name with Activity Icon */}
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
                      {/* Products */}
                      {activity.products && activity.products.length > 0 ? (
                        <div className="space-y-1">
                          {activity.products.slice(0, 2).map((product, index) => (
                            <p key={index} className="text-gray-700 text-sm">
                              {product}
                            </p>
                          ))}
                          {activity.products.length > 2 && (
                            <p className="text-gray-500 text-sm">
                              +{activity.products.length - 2} produk lainnya
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          {activity.type === 'fitting' ? 'Konsultasi fitting umum' : 'Tidak ada produk'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      {activity.totalPrice && (
                        <div className="text-left">
                          <p className="text-xs text-gray-500 mb-1">Total Belanja</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(activity.totalPrice, 'IDR', 'id-ID')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleViewDetail(activity)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
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

        {/* Activity count info */}
        {activities.length > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Menampilkan {activities.length} dari {pagination.totalActivities} aktivitas
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerActivityPage;