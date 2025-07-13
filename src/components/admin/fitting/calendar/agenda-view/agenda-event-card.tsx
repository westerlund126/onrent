'use client';

import { format } from 'date-fns';
import { cva } from 'class-variance-authority';
import { Clock, Text, User, Check, X } from 'lucide-react';
import { EventDetailsDialog } from 'components/admin/fitting/calendar/dialogs/event-details-dialog';
import type { IFittingSchedule } from 'types/fitting';
import type { VariantProps } from 'class-variance-authority';
import { useSettingsStore, useFittingStore } from 'stores';

const agendaEventCardVariants = cva(
  'flex select-none items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  {
    variants: {
      color: {
        // Colored variants
        blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600',
        green:
          'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600',
        red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600',
        yellow:
          'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600',
        purple:
          'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600',
        orange:
          'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600',
        gray: 'border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600',

        // Dot variants
        'blue-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600',
        'green-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600',
        'red-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600',
        'orange-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600',
        'purple-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600',
        'yellow-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600',
        'gray-dot':
          'bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600',
      },
    },
    defaultVariants: {
      color: 'blue-dot',
    },
  },
);

interface IProps {
  schedule: IFittingSchedule;
  scheduleCurrentDay?: number;
  scheduleTotalDays?: number;
}

export function AgendaEventCard({
  schedule,
  scheduleCurrentDay,
  scheduleTotalDays,
}: IProps) {
  const { badgeVariant } = useSettingsStore();
  const {
    confirmFittingSchedule,
    rejectFittingSchedule,
    scheduleLoadingStates,
    error,
  } = useFittingStore();

  const startDate = schedule.startTime;
  const endDate = schedule.endTime;

  const color = (
    badgeVariant === 'dot' ? `${schedule.color}-dot` : schedule.color
  ) as VariantProps<typeof agendaEventCardVariants>['color'];

  const agendaEventCardClasses = agendaEventCardVariants({ color });

  const isLoading = scheduleLoadingStates[schedule.id] || false;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const trigger = e.currentTarget.querySelector('[role="button"]');
      if (trigger instanceof HTMLElement) trigger.click();
    }
  };

  const handleApprove = async () => {
    if (isLoading) return;

    try {
      await confirmFittingSchedule(schedule.id);
      console.log('Fitting approved successfully');
    } catch (error) {
      console.error('Failed to approve fitting:', error);
    }
  };

  const handleReject = async () => {
    if (isLoading) return;

    try {
      await rejectFittingSchedule(schedule.id);
      console.log('Fitting rejected successfully');
    } catch (error) {
      console.error('Failed to reject fitting:', error);
    }
  };

  const showActionButtons =
    schedule.status === 'PENDING' &&
    schedule.fittingSlot?.isAutoConfirm === false;
  return (
    <div
      className={agendaEventCardClasses}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <EventDetailsDialog schedule={schedule}>
        <div
          role="button"
          tabIndex={0}
          className="flex flex-col gap-2 focus-visible:outline-none"
        >
          <div className="flex items-center gap-1.5">
            {['mixed', 'dot'].includes(badgeVariant) && (
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className="event-dot shrink-0"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
            )}
            <p className="font-medium">
              {scheduleCurrentDay && scheduleTotalDays && (
                <span className="mr-1 text-xs">
                  Day {scheduleCurrentDay} of {scheduleTotalDays} •{' '}
                </span>
              )}
              {schedule.title}
            </p>
          </div>

          <div className="mt-1 flex items-center gap-1">
            <User className="size-3 shrink-0" />
            <p className="text-xs text-foreground">{schedule.user.username}</p>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="size-3 shrink-0" />
            <p className="text-xs text-foreground">
              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Text className="size-3 shrink-0" />
            <p className="text-xs text-foreground">{schedule.note}</p>
          </div>

          {!showActionButtons && (
            <div className="flex items-center gap-1">
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  schedule.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : schedule.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : schedule.status === 'CANCELED'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {schedule.status === 'CONFIRMED' && (
                  <Check className="size-3" />
                )}
                {schedule.status === 'REJECTED' && <X className="size-3" />}
                {schedule.status}
              </div>
            </div>
          )}
        </div>
      </EventDetailsDialog>

      {showActionButtons && (
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
          >
            <Check className="size-4" />
            {isLoading ? 'Loading...' : 'Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
          >
            <X className="size-4" />
            {isLoading ? 'Loading...' : 'Reject'}
          </button>
        </div>
      )}

      {error && isLoading && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-md bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
