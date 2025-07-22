'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

export interface SingleDatePickerProps {
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  availableDates?: string[];
  locale?: string;
}

const formatDate = (date: Date, locale = 'id-ID'): string => {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const dateToString = (date: Date): string => {
  return [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('-');
};

export const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  value,
  onSelect,
  disabled = false,
  placeholder = 'Pilih tanggal',
  className,
  availableDates = [],
  locale = 'id-ID',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  console.log('🗓️ SingleDatePicker render:', {
    value,
    availableDatesLength: availableDates.length,
    availableDates: availableDates.slice(0, 5),
    disabled,
    isOpen,
  });

  const handleDateSelect = React.useCallback(
    (date: Date | undefined) => {
      console.log('📅 Date selected in picker:', date);
      onSelect?.(date);
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleOpenChange = React.useCallback((open: boolean) => {
    console.log('🔄 Popover open change:', open);
    setIsOpen(open);
  }, []);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      if (availableDates.length === 0) {
        return true; 
      }

      const dateString = dateToString(date);
      const isDisabled = !availableDates.includes(dateString);

      if (!isDisabled) {
        console.log('✅ Date enabled:', dateString);
      }

      return isDisabled;
    },
    [availableDates],
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-12 w-full justify-start border-gray-200 text-left font-normal',
            !value && 'text-muted-foreground',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          disabled={disabled}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value, locale) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          initialFocus 
          className="rounded-md border"
          fromDate={new Date()}
          captionLayout="dropdown"
          showOutsideDays={false}
        />
      </PopoverContent>
    </Popover>
  );
};