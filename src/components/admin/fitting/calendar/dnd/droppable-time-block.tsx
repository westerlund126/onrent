'use client';

import { useDrop } from 'react-dnd';
import { parseISO, differenceInMilliseconds } from 'date-fns';

import { useUpdateEvent } from 'hooks/use-update-event';

import { cn } from '@/lib/utils';
import { ItemTypes } from 'components/admin/fitting/calendar/dnd/draggable-event';

import type { IEvent } from 'types/fitting';

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({
  date,
  hour,
  minute,
  children,
}: DroppableTimeBlockProps) {
  const { updateEvent } = useUpdateEvent();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: (item: { event: IEvent }) => {
        const droppedEvent = item.event;

        const eventStartDate = parseISO(droppedEvent.startDate);
        const eventEndDate = parseISO(droppedEvent.endDate);

        const eventDurationMs = differenceInMilliseconds(
          eventEndDate,
          eventStartDate,
        );

        const newStartDate = new Date(date);
        newStartDate.setHours(hour, minute, 0, 0);
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);

        updateEvent({
          ...droppedEvent,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        });

        return { moved: false };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, hour, minute, updateEvent],
  );

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={cn('h-[24px]', isOver && canDrop && 'bg-accent/50')}
    >
      {children}
    </div>
  );
}
