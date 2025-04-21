'use client';
import MiniCalendar from 'components/calendar/MiniCalendar';
import { IoArrowBack } from 'react-icons/io5';
import { MdInventory, MdFactCheck } from 'react-icons/md';

import Widget from 'components/widget/Widget';
import CheckTable from 'components/admin/default/CheckTable';
import ComplexTable from 'components/admin/default/ComplexTable';
import DailyTraffic from 'components/admin/default/DailyTraffic';
import tableDataCheck from 'variables/data-tables/tableDataCheck';
import tableDataComplex from 'variables/data-tables/tableDataComplex';

const Dashboard = () => {
  return (
    <div>
      {/* Main grid container - split into left and right sections */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left column - takes 3 of 5 columns on large screens */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card widgets */}
          <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title={'Inventory'}
              subtitle={'$340.5'}
            />
            <Widget
              icon={<MdFactCheck className="h-7 w-7" />}
              title={'Sewa Aktif'}
              subtitle={'$642.39'}
            />
            <Widget
              icon={<IoArrowBack className="h-7 w-7" />}
              title={'Pengembalian'}
              subtitle={'$574.34'}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DailyTraffic />
            <MiniCalendar />
          </div>

          {/* Activity Table Section */}
          <div>
            <ComplexTable tableData={tableDataComplex} />
          </div>
        </div>

        {/* Right column - takes 2 of 5 columns on large screens */}
        <div className="lg:col-span-2 h-full">
          {/* Agenda Section (using CheckTable as requested) */}
          <div className="mt-3 h-full pb-3">
            <CheckTable tableData={tableDataCheck} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;