"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

export interface SingleDatePickerProps {
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  availableDates?: string[]; // Array of date strings in YYYY-MM-DD format
  locale?: string;
}

const formatDate = (date: Date, locale = "id-ID"): string => {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === "string") {
    const parts = dateInput.split("-").map((part) => Number.parseInt(part, 10));
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return dateInput;
};

const dateToString = (date: Date): string => {
  return [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0')
  ].join('-');
};

export const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  value,
  onSelect,
  disabled = false,
  placeholder = "Pilih tanggal",
  className,
  availableDates = [],
  locale = "id-ID",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);

  // Update internal state when value prop changes
  React.useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (disabled) return;
    
    setSelectedDate(date);
    onSelect?.(date);
    setIsOpen(false);
  };

  // Custom matcher function to disable dates not in availableDates
  const isDateDisabled = React.useCallback((date: Date) => {
    if (availableDates.length === 0) return false;
    
    const dateString = dateToString(date);
    return !availableDates.includes(dateString);
  }, [availableDates]);

  // Custom modifier for available dates styling
  const modifiers = React.useMemo(() => ({
    available: (date: Date) => {
      if (availableDates.length === 0) return false;
      const dateString = dateToString(date);
      return availableDates.includes(dateString);
    }
  }), [availableDates]);

  const modifiersStyles = {
    available: {
      backgroundColor: '#fcdbcc',
      color: '#300f00',
      fontWeight: '600'
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-12 border-gray-200",
            !selectedDate && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            {selectedDate ? (
              formatDate(selectedDate, locale)
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          initialFocus
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
};