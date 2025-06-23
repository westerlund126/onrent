import { useMemo } from 'react';
import { formatDate } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFittingStore } from 'stores/useFittingStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getScheduleCount, navigateDate, rangeText } from 'utils/helpers';
import type { IFittingSchedule, TCalendarView } from 'types/fitting';

interface IProps {
  view: TCalendarView;
  schedule: IFittingSchedule[];
}

export function DateNavigator({ view, schedule }: IProps) {
  const { selectedDate, setSelectedDate } = useFittingStore();

  const validDate = useMemo(() => {
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      return selectedDate;
    }
    const now = new Date();
    setSelectedDate(now); 
    return now;
  }, [selectedDate, setSelectedDate]);

  const month = formatDate(validDate, 'MMMM');
  const year = validDate.getFullYear();

  const scheduleCount = useMemo(
    () => getScheduleCount(schedule, validDate, view),
    [schedule, validDate, view],
  );

  const handlePrevious = () => {
    const newDate = navigateDate(validDate, view, 'previous');
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = navigateDate(validDate, view, 'next');
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {month} {year}
        </span>
        <Badge variant="outline" className="px-1.5">
          {scheduleCount} events
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="size-6.5 [&_svg]:size-4.5 px-0"
          onClick={handlePrevious}
        >
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">
          {rangeText(view, validDate)}
        </p>

        <Button
          variant="outline"
          className="size-6.5 [&_svg]:size-4.5 px-0"
          onClick={handleNext}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
