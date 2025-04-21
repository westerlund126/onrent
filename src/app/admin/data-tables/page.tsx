'use client';
import tableDataDevelopment from 'variables/data-tables/tableDataDevelopment';
import tableDataCheck from 'variables/data-tables/tableDataCheck';
import CheckTable from 'components/admin/data-tables/CheckTable';
import tableDataColumns from 'variables/data-tables/tableDataColumns';
import tableDataComplex from 'variables/data-tables/tableDataComplex';
import DevelopmentTable from 'components/admin/data-tables/DevelopmentTable';
import ColumnsTable from 'components/admin/data-tables/ColumnsTable';
import ComplexTable from 'components/admin/data-tables/ComplexTable';
import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import { IoArrowBack } from 'react-icons/io5';

const Tables = () => {
  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
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
          </div>
        <DevelopmentTable tableData={tableDataDevelopment} />
        <CheckTable tableData={tableDataCheck} />
      </div>

      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <ColumnsTable tableData={tableDataColumns} />

        <ComplexTable tableData={tableDataComplex} />
      </div>
    </div>
  );
};

export default Tables;
