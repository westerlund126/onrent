'use client';

import Widget from 'components/widget/Widget';
import { MdFactCheck, MdInventory } from 'react-icons/md';
import { useEffect, useState } from 'react';
import Card from 'components/card';
import RentalForm from 'components/form/owner/RentalForm';
import TransactionTable from 'components/owner/data-tables/TransactionTable';

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
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-5 lg:col-span-3">
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-4">
            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title="Lunas"
              subtitle={widgetLoading ? 'Loading…' : `${stats.LUNAS}`}
            />

            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title="Belum Lunas"
              subtitle={widgetLoading ? 'Loading…' : `${stats.BELUM_LUNAS}`}
            />

            <Widget
              icon={<MdFactCheck className="h-7 w-7" />}
              title="Terlambat"
              subtitle={widgetLoading ? 'Loading…' : `${stats.TERLAMBAT}`}
            />

            <div
              onClick={() => setDialogOpen(true)}
              className="cursor-pointer md:col-span-1"
            >
              <Card extra="!flex-row flex-grow items-center rounded-[20px] h-[90px] bg-orange-500">
                <div className="flex w-full items-center justify-center text-white">
                  <p className="text-lg font-bold">+ Tambah Transaksi</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-1">
        <TransactionTable />
      </div>

      <RentalForm isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default Transaction;
