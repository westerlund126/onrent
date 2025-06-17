// /app/owner/fitting/schedule/layout.tsx
import { Settings } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { CalendarProvider } from 'contexts/calendar-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  getSchedule,
  getUsers,
} from 'components/admin/fitting/calendar/requests';

export default async function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [schedule, users] = await Promise.all([getSchedule(), getUsers()]);

  return (
    <CalendarProvider users={users} schedule={schedule}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4 ">
        {children}
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="flex-none gap-2 py-0 hover:no-underline">
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
      </div>
    </CalendarProvider>
  );
}
