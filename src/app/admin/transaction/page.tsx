'use client';

import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import { useEffect, useState } from 'react';
import Card from 'components/card';
import RentalForm from 'components/form/owner/RentalForm';
import TransactionTable from 'components/admin/data-tables/TransactionTable';

const Transaction = () => {
  const [stats, setStats] = useState({
    LUNAS: 0,
    BELUM_LUNAS: 0,
    TERLAMBAT: 0,
  });
  const [widgetLoading, setWidgetLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/rentals/summary');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch rental stats', err);
      } finally {
        setWidgetLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <TransactionTable />
      </div>

      <RentalForm isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default Transaction;
