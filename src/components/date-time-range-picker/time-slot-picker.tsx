'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  slots: Date[];
  selected?: Date;
  onSelect: (slot: Date) => void;
  className?: string;
}

export function TimeSlotPicker({
  slots,
  selected,
  onSelect,
  className,
}: TimeSlotPickerProps) {
  // If there are no slots, display a message to the user.
  if (slots.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-center text-sm text-muted-foreground">
        No available times on this date.
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4', className)}>
      {slots.map((slot, index) => {
        const isSelected = selected && selected.getTime() === slot.getTime();
        return (
          <Button
            key={index}
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelect(slot)}
          >
            {/* Format the time to a user-friendly format, e.g., "4:30 PM" */}
            {format(slot, 'h:mm a')}
          </Button>
        );
      })}
    </div>
  );
}
