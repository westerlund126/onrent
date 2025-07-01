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
        return true; // Disable all dates if no available dates
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

  // // Prevent popover from closing when clicking inside the calendar
  // const handleContentClick = React.useCallback((e: React.MouseEvent) => {
  //   e.stopPropagation();
  // }, []);

  // // Only close on outside clicks, but ignore trigger button clicks
  // const handleInteractOutside = React.useCallback((e: Event) => {
  //   const target = e.target as Element;

  //   console.log('🔍 InteractOutside triggered, target:', target);

  //   // Don't close if clicking on the trigger button or its children
  //   if (
  //     triggerRef.current &&
  //     (triggerRef.current === target || triggerRef.current.contains(target))
  //   ) {
  //     console.log('🔘 Ignoring trigger button click');
  //     e.preventDefault();
  //     return;
  //   }

  //   // Don't close if clicking on calendar elements
  //   if (target) {
  //     const isCalendarElement =
  //       target.closest('[role="button"]') ||
  //       target.closest('[role="gridcell"]') ||
  //       target.closest('.rdp') ||
  //       target.closest('[data-radix-popper-content-wrapper]') ||
  //       target.closest('[data-radix-popover-content]') ||
  //       target.hasAttribute('data-radix-popover-content');

  //     if (isCalendarElement) {
  //       console.log('📅 Ignoring calendar interaction');
  //       e.preventDefault();
  //       return;
  //     }
  //   }

  //   console.log('🚪 Closing popover due to outside interaction');
  //   setIsOpen(false);
  // }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        {/* The triggerRef is no longer needed */}
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
      {/* The custom onInteractOutside and onClick handlers are removed */}
      <PopoverContent
        className="w-auto p-0"
        align="start"
        // Prevent auto-focus issues on open
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