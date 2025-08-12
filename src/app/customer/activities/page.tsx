"use client";
import { Calendar, Package, Eye, AlertCircle, X, Star, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
  onSubmitReview: (reviewData: any) => Promise<void>;
}

const ReviewModal = ({ isOpen, onClose, activity, onSubmitReview }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Rating diperlukan", {
        description: "Silakan berikan rating untuk produk ini"
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review terlalu pendek", {
        description: "Review minimal harus 10 karakter"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview({
        rentalId: activity.id,
        rating,
        comment: comment.trim(),
        products: activity.parentProductIds || []
      });
      
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setComment('');
      onClose();
      
      toast.success("Review berhasil dikirim", {
        description: "Terima kasih atas review Anda!"
      });
    } catch (error: any) {
      toast.error("Gagal mengirim review", {
        description: error.message || "Terjadi kesalahan, silakan coba lagi"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogOverlay className="bg-black/30 fixed inset-0 z-50 backdrop-blur-sm" />
      <AlertDialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">
            Beri Review
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Bagaimana pengalaman Anda dengan rental dari <strong>{activity?.ownerName}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    {rating} dari 5 bintang
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Products List */}
          {activity?.products && activity.products.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Produk yang direview</label>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {activity.products.map((product: string, index: number) => (
                  <p key={index} className="text-sm text-gray-700 py-1">
                    • {product}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda dengan produk ini..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Minimal 10 karakter</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel 
              type="button" 
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Batal
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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

  // Review state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    activity: null as any
  });

  const handleViewDetail = (activity: any) => {
    router.push(`/customer/activities/${activity.type}/${activity.id}`);
  };

  const handleOpenReview = (activity: any) => {
    setReviewModal({
      isOpen: true,
      activity
    });
  };

  const handleCloseReview = () => {
    setReviewModal({
      isOpen: false,
      activity: null
    });
  };

  const handleSubmitReview = async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengirim review');
      }

      const result = await response.json();
      
      // Refresh activities to update review status
      refresh();
      
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  // Check if rental can be reviewed (completed and not yet reviewed)
  const canReviewRental = (activity: any) => {
    return (
      activity.type === 'rental' && 
      activity.status === 'SELESAI' && 
      !activity.hasReview
    );
  };

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

          {activities.length === 0 && !loading ? (
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
                const canReview = canReviewRental(activity);

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
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.text}
                        </span>
                        {activity.hasReview && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Sudah Review
                          </span>
                        )}
                      </div>
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
                            {activity.products.slice(0, 2).map((product: string, index: number) => (
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
                        {canReview && (
                          <button
                            onClick={() => handleOpenReview(activity)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Beri Review
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

      {/* Fitting Cancel Confirmation Dialog */}
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleCloseReview}
        activity={reviewModal.activity}
        onSubmitReview={handleSubmitReview}
      />
    </>
  );
};

export default CustomerActivityPage;