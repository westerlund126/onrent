"use client";

import { useDrop } from "react-dnd";
import { differenceInMilliseconds } from "date-fns";
import { useUpdateEvent } from "hooks/use-update-event";
import { cn } from "@/lib/utils";
import { ItemTypes } from 'components/admin/fitting/calendar/dnd/draggable-event';
import type { ICalendarCell, IFittingSchedule } from 'types/fitting';

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const { updateEvent } = useUpdateEvent();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: (item: { schedule: IFittingSchedule }) => {
        const droppedEvent = item.schedule;

        const eventStartDate = droppedEvent.startTime;
        const eventEndDate = droppedEvent.endTime;

        const eventDurationMs = differenceInMilliseconds(eventEndDate, eventStartDate);

        const newStartDate = new Date(cell.date);
        newStartDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), eventStartDate.getSeconds(), eventStartDate.getMilliseconds());
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);

        updateEvent({
          ...droppedEvent,
          startTime: newStartDate,
          endTime: newEndDate,
        });

        return { moved: false };
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [cell.date, updateEvent]
  );

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className={cn(isOver && canDrop && "bg-accent/50")}>
      {children}
    </div>
  );
}
