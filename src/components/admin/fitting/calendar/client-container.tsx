'use client';

import { useMemo } from 'react';
import {
  useSelectedDate,
  useFittingSchedules,
} from 'stores';
import { DndProviderWrapper } from './dnd/dnd-provider';
import { CalendarHeader } from './header/calendar-header';
import { CalendarMonthView } from './month-view/calendar-month-view';
import { CalendarDayView } from './week-and-day-view/calendar-day-view';
import { CalendarWeekView } from './week-and-day-view/calendar-week-view';

import type { TCalendarView } from 'types/fitting';

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: IProps) {
  const selectedDate = useSelectedDate();
  const fittingSchedules = useFittingSchedules();

  const filteredSchedule = useMemo(() => {
    return fittingSchedules.filter((schedule) => {
      const scheduleStartTime = schedule.startTime;

      if (view === 'year') {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(
          selectedDate.getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999,
        );
        const isInSelectedYear =
          scheduleStartTime >= yearStart && scheduleStartTime <= yearEnd;
        return isInSelectedYear;
      }

      if (view === 'month' || view === 'agenda') {
        const monthStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1,
        );
        const monthEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        const isInSelectedMonth =
          scheduleStartTime >= monthStart && scheduleStartTime <= monthEnd;
        return isInSelectedMonth;
      }

      if (view === 'week') {
        const dayOfWeek = selectedDate.getDay();

        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const isInSelectedWeek =
          scheduleStartTime >= weekStart && scheduleStartTime <= weekEnd;
        return isInSelectedWeek;
      }

      if (view === 'day') {
        const dayStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0,
        );
        const dayEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
        );
        const isInSelectedDay =
          scheduleStartTime >= dayStart && scheduleStartTime <= dayEnd;
        return isInSelectedDay;
      }

      return false;
    });
  }, [selectedDate, fittingSchedules, view]);

  const singleDaySchedule = filteredSchedule;


  return (
    <div className="overflow-hidden rounded-xl border-2 bg-white px-5">
      <CalendarHeader view={view} schedule={filteredSchedule} />

      <DndProviderWrapper>
        {view === 'day' && (
          <CalendarDayView />
        )}
        {view === 'month' && (
          <CalendarMonthView singleDaySchedule={singleDaySchedule} />
        )}
      </DndProviderWrapper>
    </div>
  );
}