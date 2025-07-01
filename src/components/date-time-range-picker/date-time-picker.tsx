'use client';

import * as React from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimeSlotPicker } from './time-slot-picker';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  availableSlots: Date[]; 
  disabledDays?: (date: Date) => boolean;
}

export function DateTimePicker({
  value,
  onChange,
  availableSlots, 
  disabledDays,
}: DateTimePickerProps) {
  const availableTimesForSelectedDay = React.useMemo(() => {
    if (!value) return [];
    return availableSlots.filter((slot) => isSameDay(slot, value));
  }, [availableSlots, value]);

  const handleDateSelect = (newDay: Date | undefined) => {
    if (!newDay) {
      onChange(undefined);
      return;
    }
    if (value) {
      newDay.setHours(value.getHours(), value.getMinutes(), value.getSeconds());
    }
    onChange(newDay);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, 'PPP h:mm a')
          ) : (
            <span>Pick a date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={disabledDays}
          initialFocus
        />
        <div className="border-t border-border p-3">
          <TimeSlotPicker
            selected={value}
            onSelect={onChange}
            slots={availableTimesForSelectedDay}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
