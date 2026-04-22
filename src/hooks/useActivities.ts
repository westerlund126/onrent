import { useEffect } from 'react';
import { useActivitiesStore } from 'stores/useActivitiesStore';
export const useActivities = (page = 1, limit = 10) => {
  const {
    activities,
    loading,
    error,
    pagination,
    fittingCancelConfirmation,
    fetchActivities,
    refreshActivities,
    updateActivityStatus,
    openFittingCancelConfirmation,
    cancelFittingCancellation,
    confirmCancelFitting,
    submitReview
  } = useActivitiesStore();
  useEffect(() => {
    fetchActivities(page, limit);
  }, [page, limit, fetchActivities]);
  const loadMore = () => {
    if (pagination.hasNextPage) {
      fetchActivities(pagination.currentPage + 1, limit);
    }
  };
  const refresh = () => {
    refreshActivities();
  };
  const handleConfirmCancelFitting = async () => {
    await confirmCancelFitting();
  };
  return {
    activities,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    fetchActivities,
    updateActivityStatus,
    fittingCancelConfirmation,
    openFittingCancelConfirmation,
    cancelFittingCancellation,
    handleConfirmCancelFitting,
    submitReview,
  };
};
export const useProductReviews = (productId: number) => {
  const {
    reviews,
    reviewsLoading,
    reviewsError,
    fetchProductReviews
  } = useActivitiesStore();
  useEffect(() => {
    if (productId) {
      fetchProductReviews(productId);
    }
  }, [productId, fetchProductReviews]);
  return {
    reviews: reviews[productId] || [],
    loading: reviewsLoading[productId] || false,
    error: reviewsError[productId] || null,
    refetch: () => fetchProductReviews(productId)
  };
};
export const useActivityDetail = (type: string, id: string) => {
  const { activities } = useActivitiesStore();
 
  const activityFromStore = activities.find(
    activity => activity.type === type && activity.id.toString() === id
  );
 
  return {
    activity: activityFromStore,
    loading: false,
    error: null
  };
};