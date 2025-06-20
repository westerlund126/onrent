// CalendarMonthView.tsx
import { useMemo, useEffect } from 'react';
import { DayCell } from 'components/admin/fitting/calendar/month-view/day-cell';
import {
  getCalendarCells,
  calculateMonthSchedulePositions,
  getStatusColor
} from 'utils/helpers';
import type { IFittingSchedule } from 'types/fitting';
import { useFittingStore } from 'stores';
import { format, startOfMonth, endOfMonth } from 'date-fns';


const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarMonthView() {
  const { selectedDate } = useFittingStore();

  const {
    fittingSchedules,
    fittingSlots,
    isLoading,
    error,
    fetchFittingSchedules,
    fetchFittingSlots,
  } = useFittingStore();

  const monthStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const monthEnd = useMemo(() => endOfMonth(selectedDate), [selectedDate]);

  useEffect(() => {
    const dateFrom = format(monthStart, 'yyyy-MM-dd');
    const dateTo = format(monthEnd, 'yyyy-MM-dd');

    fetchFittingSchedules(dateFrom, dateTo);
    fetchFittingSlots(dateFrom, dateTo);
  }, [monthStart, monthEnd, fetchFittingSchedules, fetchFittingSlots]);

  const { singleDaySchedule, multiDaySchedule } = useMemo(() => {
    const schedule: IFittingSchedule[] = [];

    fittingSchedules.forEach((fittingSchedule) => {
      const slot = fittingSlots.find(
        (s) => s.id === fittingSchedule.fittingSlotId,
      );

      if (slot) {
        const startDateTime = new Date(slot.dateTime);
        const endDateTime = new Date(
          startDateTime.getTime() + fittingSchedule.duration * 60000,
        );

        const customerName = fittingSchedule.user
          ? `${fittingSchedule.user.first_name} ${fittingSchedule.user.last_name}`.trim()
          : 'Unknown Customer';

        schedule.push({
          ...fittingSchedule,
          startTime: startDateTime,
          endTime: endDateTime,
          title: `Fitting appointment with ${customerName}`,
          color: getStatusColor(fittingSchedule.status),
          note: fittingSchedule.note || 'No additional notes',
          fittingSlot: slot,
        });
      }
    });

    const singleDay: IFittingSchedule[] = [];
    const multiDay: IFittingSchedule[] = [];

    schedule.forEach((scheduleItem) => {
      const startDate = scheduleItem.startTime.toISOString().split('T')[0];
      const endDate = scheduleItem.endTime.toISOString().split('T')[0];

      if (startDate === endDate) {
        singleDay.push(scheduleItem);
      } else {
        multiDay.push(scheduleItem);
      }
    });

    return { singleDaySchedule: singleDay, multiDaySchedule: multiDay };
  }, [fittingSchedules, fittingSlots]);

  const allSchedule = [...multiDaySchedule, ...singleDaySchedule];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const schedulePositions = useMemo(
    () =>
      calculateMonthSchedulePositions(
        multiDaySchedule,
        singleDaySchedule,
        selectedDate,
      ),
    [multiDaySchedule, singleDaySchedule, selectedDate],
  );

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error loading calendar: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell) => (
          <DayCell
            key={cell.date.toISOString()}
            cell={cell}
            schedule={allSchedule}
            schedulePositions={schedulePositions}
          />
        ))}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div>Loading...</div>
        </div>
      )}
    </div>
  );
}


