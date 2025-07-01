import Link from 'next/link';
import {
  Columns,
  Grid3x3,
  List,
  Plus,
  Grid2x2,
  CalendarRange,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TodayButton } from 'components/admin/fitting/calendar/header/today-button';
import { DateNavigator } from 'components/admin/fitting/calendar/header/date-navigator';
import { AddEventDialog } from 'components/admin/fitting/calendar/dialogs/add-event-dialog';

import type { IFittingSchedule, TCalendarView } from 'types/fitting';
interface IProps {
  view: TCalendarView;
  schedule: IFittingSchedule[];
}

export function CalendarHeader({ view, schedule }: IProps) {
  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} schedule={schedule} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button
              asChild
              aria-label="View by day"
              size="icon"
              variant={view === 'day' ? 'default' : 'outline'}
              className="rounded-r-none [&_svg]:size-5"
            >
              <Link href="/owner/fitting/schedule/day-view">
                <List strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by week"
              size="icon"
              variant={view === 'week' ? 'default' : 'outline'}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/owner/fitting/schedule/week-view">
                <Columns strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by month"
              size="icon"
              variant={view === 'month' ? 'default' : 'outline'}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/owner/fitting/schedule/month-view">
                <Grid2x2 strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by agenda"
              size="icon"
              variant={view === 'agenda' ? 'default' : 'outline'}
              className="-ml-px rounded-l-none [&_svg]:size-5"
            >
              <Link href="/owner/fitting/schedule/agenda-view">
                <CalendarRange strokeWidth={1.8} />
              </Link>
            </Button>
          </div>
        </div>

        <AddEventDialog>
          <Button className="w-full sm:w-auto">
            <Plus />
            Add Event
          </Button>
        </AddEventDialog>
      </div>
    </div>
  );
}
