'use client';

import { Settings, CalendarClockIcon } from 'lucide-react';

import { ChangeWorkingHoursInput } from 'components/admin/fitting/calendar/change-working-hours-input';
import { ChangeBadgeVariantInput } from 'components/admin/fitting/calendar/change-badge-variant-input';

const Availability = () => {
  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-4 p-4 md:px-8">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CalendarClockIcon className="size-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Pengaturan Waktu Operasional
              </h2>
            </div>
            <ChangeWorkingHoursInput />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Settings className="size-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Pengaturan Kalender Fitting
              </h2>
            </div>
            <ChangeBadgeVariantInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
