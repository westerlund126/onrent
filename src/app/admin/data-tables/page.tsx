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
import { FaPlus } from 'react-icons/fa';
import AddProductWidget from 'components/addproduct/AddProduct';

const Tables = () => {
  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
      <div className="lg:col-span-3 space-y-5">
          {/* Card widgets */}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-7">
          <div className="md:col-span-3">
            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title={'Total Stok'}
              subtitle={'$340.5'}
            />
            </div>
            <div className="md:col-span-3">
            <Widget
              icon={<MdFactCheck className="h-7 w-7" />}
              title={'Produk'}
              subtitle={'$642.39'}
            />
            </div>
            <div className="md:col-span-1">
            <AddProductWidget/>
            </div>
          </div>
          </div>
        {/* <DevelopmentTable tableData={tableDataDevelopment} />
        <CheckTable tableData={tableDataCheck} /> */}
      </div>

      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <ColumnsTable tableData={tableDataColumns} />
{/* 
        <ComplexTable tableData={tableDataComplex} /> */}
      </div>
    </div>
  );
};

export default Tables;
