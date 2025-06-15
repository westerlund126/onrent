'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { useCalendar } from 'contexts/calendar-context';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

// New time input component
const TimeInput24 = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (hour: number) => void;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {Array.from({ length: 25 }, (_, i) => (
        <option key={i} value={i}>
          {i.toString().padStart(2, '0')}:00
        </option>
      ))}
    </select>
  );
};

export function ChangeVisibleHoursInput() {
  const { visibleHours, setVisibleHours } = useCalendar();

  const [from, setFrom] = useState<number>(visibleHours.from);
  const [to, setTo] = useState<number>(visibleHours.to);

  const handleApply = () => {
    const toHour = to === 0 ? 24 : to;
    setVisibleHours({ from, to: toHour });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Change visible hours</p>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3" />
            </TooltipTrigger>

            <TooltipContent className="max-w-80 text-center">
              <p>
                If an event falls outside the specified visible hours, the
                visible hours will automatically adjust to include that event.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-4">
        <p>From</p>
        <TimeInput24 value={from} onChange={setFrom} />
        <p>To</p>
        <TimeInput24 value={to} onChange={setTo} />
      </div>

      <Button className="mt-4 w-fit" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
