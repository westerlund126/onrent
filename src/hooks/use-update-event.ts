import { useCalendar } from 'contexts/calendar-context';

import type { IFittingSchedule } from 'types/fitting';

export function useUpdateEvent() {
  const { setLocalSchedule } = useCalendar();

  // This is just and example, in a real scenario
  // you would call an API to update the event
  const updateEvent = (event: IFittingSchedule) => {
    const newEvent: IFittingSchedule = event;

    newEvent.startTime = new Date(event.startTime);
    newEvent.endTime = new Date(event.endTime);

    setLocalSchedule((prev) => {
      const index = prev.findIndex((e) => e.id === event.id);
      if (index === -1) return prev;
      return [...prev.slice(0, index), newEvent, ...prev.slice(index + 1)];
    });
  };

  return { updateEvent };
}
