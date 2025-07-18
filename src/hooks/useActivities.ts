// hooks/useActivities.js
import { useState, useEffect } from 'react';

export const useActivities = (page = 1, limit = 10) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchActivities = async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/activities?page=${currentPage}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      
      setActivities(data.activities);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, limit]);

  const loadMore = () => {
    if (pagination.hasNextPage) {
      fetchActivities(pagination.currentPage + 1);
    }
  };

  const refresh = () => {
    fetchActivities(1);
  };

  const updateActivityStatus = (activityId, type, newStatus) => {
    setActivities(currentActivities =>
      currentActivities.map(activity =>
        (activity.id === activityId && activity.type === type)
          ? { ...activity, status: newStatus }
          : activity
      )
    );
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
  };
};

export const useActivityDetail = (type, id) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      if (!type || !id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/activities/${type}/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity detail');
        }

        const data = await response.json();
        setActivity(data.activity);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching activity detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [type, id]);

  return { activity, loading, error };
};