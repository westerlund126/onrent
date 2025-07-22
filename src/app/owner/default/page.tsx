'use client';

import { useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { MdInventory, MdFactCheck } from 'react-icons/md';
import MiniCalendar from 'components/calendar/MiniCalendar';
import Widget from 'components/widget/Widget';
import DailyTraffic from 'components/admin/default/DailyTraffic';
import CheckTable from 'components/admin/default/CheckTable';
import ComplexTable, {
  RowObj,
  rentalStatusMap,
  trackingProgressMap,
} from 'components/admin/default/ComplexTable';

import tableDataCheck from 'variables/data-tables/tableDataCheck';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import TestNotificationButton from 'components/TestNotificationButton';
import Link from 'next/link';

const Dashboard = () => {
  const [productStats, setProductStats] = useState({ totalStock: 0 });
  const [productsLoading, setProductsLoading] = useState(true);

  const [rentalData, setRentalData] = useState<RowObj[]>([]);
  const [rentalStats, setRentalStats] = useState({
    activeRentals: 0,
    pendingReturns: 0,
  });
  const [rentalsLoading, setRentalsLoading] = useState(true);

  useEffect(() => {
    const fetchProductStats = async () => {
      setProductsLoading(true);
      try {
        const response = await fetch('/api/products/owner');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const products = await response.json();

        let totalStock = 0;
        products.forEach((product: any) => {
          if (
            product.VariantProducts &&
            Array.isArray(product.VariantProducts)
          ) {
            totalStock += product.VariantProducts.length;
          }
        });

        setProductStats({ totalStock });
      } catch (err) {
        console.error('Failed to fetch product stats:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProductStats();
  }, []);

  useEffect(() => {
    const fetchRentalData = async () => {
      setRentalsLoading(true);
      try {
        const response = await fetch('/api/rentals?userType=owner');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.success) {
          const allRentals = result.data;

          let activeRentals = 0;
          let pendingReturns = 0;

          allRentals.forEach((rental: any) => {
            const latestTrackingStatus = rental.Tracking[0]?.status;
            if (latestTrackingStatus === 'RENTAL_ONGOING') {
              activeRentals++;
            } else if (latestTrackingStatus === 'RETURN_PENDING') {
              pendingReturns++;
            }
          });

          setRentalStats({ activeRentals, pendingReturns });

          const formattedData: RowObj[] = allRentals
            .slice(0, 4) 
            .map((rental: any) => {
              const statusInfo = rentalStatusMap[rental.status] || {
                text: 'Unknown',
              };

              const latestTracking = rental.Tracking[0];
              const progressValue =
                trackingProgressMap[latestTracking?.status] || 0;

              return {
                nama: `${rental.user.first_name} ${rental.user.last_name}`,
                status: statusInfo.text,
                tanggal: new Date(rental.startDate).toLocaleDateString('id-ID'),
                progres: progressValue,
              };
            });
          setRentalData(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch rental data:', error);
      } finally {
        setRentalsLoading(false);
      }
    };

    fetchRentalData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Widget
              icon={<MdInventory className="h-7 w-7" />}
              title={'Total Stok'}
              subtitle={
                productsLoading ? 'Loading...' : `${productStats.totalStock}`
              }
            />
            <Widget
              icon={<MdFactCheck className="h-7 w-7" />}
              title={'Sewa Aktif'}
              subtitle={
                rentalsLoading ? 'Loading...' : `${rentalStats.activeRentals}`
              }
            />
            <Widget
              icon={<IoArrowBack className="h-7 w-7" />}
              title={'Pengembalian'}
              subtitle={
                rentalsLoading ? 'Loading...' : `${rentalStats.pendingReturns}`
              }
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DailyTraffic />
            <MiniCalendar />
          </div>

          {/* Activity Table Section */}
          <div>
            <ComplexTable tableData={rentalData} />
          </div>
        </div>

        <div className="h-full lg:col-span-2">
          <div className="mt-3 h-full pb-3">
            <CheckTable tableData={tableDataCheck} />
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <main>
                <SignedIn>
                  {/* This content is only visible to signed-in users */}
                  <TestNotificationButton />
                </SignedIn>
                <SignedOut>
                  {/* This content is only visible to signed-out users */}
                  <div className="text-center p-6 border rounded-lg shadow-md bg-white">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <p className="mb-6">You need to be signed in to test push notifications.</p>
                    <Link href="/sign-in" className="px-6 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Go to Sign In
                    </Link>
                  </div>
                </SignedOut>
              </main>
            </div>
      </div>
    </div>
  );
};

export default Dashboard;
