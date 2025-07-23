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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title={'Total Stok'}
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
          <div>{/* <ComplexTable tableData={tableDataComplex} /> */}</div>
        </div>

        <div className="h-full lg:col-span-2">
          <div className="mt-3 h-full pb-3">
            <CheckTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
