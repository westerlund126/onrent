'use client';

import React from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeInputProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  use24HourFormat?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  use24HourFormat = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const formatTime = (date: Date) => {
    if (use24HourFormat) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    const newDate = new Date(value || new Date());
    newDate.setHours(hour, minute, 0, 0);
    onChange(newDate);
    setOpen(false);
  };

  const generateTimeOptions = () => {
    const options = [];
    const maxHours = use24HourFormat ? 24 : 12;
    const startHour = use24HourFormat ? 0 : 1;

    for (let hour = startHour; hour < (use24HourFormat ? 24 : 13); hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const displayHour = hour;
        const timeString = use24HourFormat
          ? `${hour.toString().padStart(2, '0')}:${minute
              .toString()
              .padStart(2, '0')}`
          : `${hour}:${minute.toString().padStart(2, '0')} ${
              hour < 12 ? 'AM' : 'PM'
            }`;

        options.push({
          hour: displayHour,
          minute,
          display: timeString,
        });
      }
    }

    if (!use24HourFormat) {
      for (let hour = 1; hour < 13; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const actualHour = hour === 12 ? 12 : hour + 12;
          const timeString = `${hour}:${minute.toString().padStart(2, '0')} PM`;

          options.push({
            hour: actualHour,
            minute,
            display: timeString,
          });
        }
      }
    }

    return options;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value) : 'Select time'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <ScrollArea className="h-60">
          <div className="p-2">
            {generateTimeOptions().map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => handleTimeSelect(option.hour, option.minute)}
              >
                {option.display}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

TimeInput.displayName = 'TimeInput';
