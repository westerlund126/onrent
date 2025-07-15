'use client';

import { Settings, CalendarClockIcon } from 'lucide-react';

import { ChangeWorkingHoursInput } from 'components/admin/fitting/calendar/change-working-hours-input';
import { ChangeBadgeVariantInput } from 'components/admin/fitting/calendar/change-badge-variant-input';
import { ChangeAutoConfirm } from 'components/admin/fitting/calendar/change-auto-confirm';

const Availability = () => {
  return (
    // Use responsive padding for the main container
    <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-4 p-4 md:px-8">
      {/* - Removed min-w-[1000px]
        - Set to full-width on mobile and a max-width for larger screens
        - Used responsive padding (p-6, md:p-8)
      */}
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-8">
          {/* Section 1: Working Hours */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CalendarClockIcon className="size-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Pengaturan Waktu Operasional
              </h2>
            </div>
            <ChangeWorkingHoursInput />
          </div>

          {/* Section 2: Confirmation Settings */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Settings className="size-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Pengaturan Konfirmasi Permintaan Fitting
              </h2>
            </div>
            <ChangeAutoConfirm />
          </div>

          {/* Section 3: Calendar Settings */}
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
