'use client';
import { useEffect } from 'react';
import { useFittingActions, useScheduleActions } from 'stores/hooks';

export function ScheduleInitializer() {
  const { fetchFittingSchedules, fetchFittingSlots } = useFittingActions();
  const { fetchWeeklySlots, fetchScheduleBlocks } = useScheduleActions();

  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDateString = startOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateString = endOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD

    const loadData = async () => {
      try {
        await Promise.all([
          fetchFittingSchedules(startDateString, endDateString),
          fetchFittingSlots(startDateString, endDateString),

          fetchWeeklySlots(),
          fetchScheduleBlocks(),
        ]);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      }
    };

    loadData();
  }, []); 
  return null;
}