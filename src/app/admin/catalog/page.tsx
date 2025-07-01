'use client';
import { useEffect, useState } from 'react';
import ColumnsTable from 'components/admin/data-tables/CatalogTable';

const Tables = () => {
  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <ColumnsTable />
      </div>
    </div>
  );
};

export default Tables;