"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";

import { cn } from "@/lib/utils";

import type { IEvent, IFittingSchedule } from 'types/fitting';

export const ItemTypes = {
  EVENT: "event",
};

interface DraggableEventProps {
  schedule: IFittingSchedule;
  children: React.ReactNode;
}

export function DraggableEvent({ schedule, children }: DraggableEventProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { schedule },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  }));

  drag(ref);

  return (
    <div ref={ref} className={cn(isDragging && "opacity-40")}>
      {children}
    </div>
  );
}
