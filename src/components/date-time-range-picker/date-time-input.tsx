'use client';

import React, { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { DateInput } from './date-input';
import { TimeInput } from './time-input';

interface DateTimeInputProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  use24HourFormat?: boolean;
  minDate?: Date; 
  maxDate?: Date; 
  'data-invalid'?: boolean;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  label,
  placeholder,
  use24HourFormat = false,
  minDate, // Add this
  maxDate, // Add this
  'data-invalid': dataInvalid,
}) => {
  const [date, setDate] = React.useState<Date>(value || new Date());

  useEffect(() => {
    if (value) {
      setDate(new Date(value));
    }
  }, [value]);

  const handleDateChange = (newDate: Date) => {
    if (disabled) return;

    const updatedDate = new Date(newDate);
    if (date) {
      updatedDate.setHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      );
    }

    setDate(updatedDate);
    onChange(updatedDate);
  };

  const handleTimeChange = (newTime: Date) => {
    if (disabled) return;

    const updatedDate = new Date(date);
    updatedDate.setHours(
      newTime.getHours(),
      newTime.getMinutes(),
      newTime.getSeconds(),
      newTime.getMilliseconds(),
    );

    setDate(updatedDate);
    onChange(updatedDate);
  };

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div
        className={cn(
          'flex flex-col gap-2 sm:flex-row',
          dataInvalid && 'border-destructive',
        )}
      >
        <DateInput
          value={date}
          onChange={handleDateChange}
          disabled={disabled}
          minDate={minDate} 
          maxDate={maxDate} 
          placeholder={{
            day: 'DD',
            month: 'MM',
            year: 'YYYY',
          }}
        />
        <TimeInput
          value={date}
          onChange={handleTimeChange}
          disabled={disabled}
          use24HourFormat={use24HourFormat}
        />
      </div>
    </div>
  );
};

DateTimeInput.displayName = 'DateTimeInput';
