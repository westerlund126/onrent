'use client';

import React, { useEffect, useState } from 'react';
import BarChart from 'components/charts/BarChart';
import { MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';
import Card from 'components/card';

// Helper to get the start of the week (Sunday)
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const DailyTraffic = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState({});
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFittingData = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const startOfThisWeek = getStartOfWeek(now);
        const endOfThisWeek = new Date(startOfThisWeek);
        endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

        const response = await fetch(
          `/api/fitting/schedule?dateFrom=${startOfLastWeek.toISOString()}&dateTo=${endOfThisWeek.toISOString()}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const schedules = await response.json();

        const confirmedSchedules = schedules.filter(
          (s: any) => s.status === 'CONFIRMED',
        );

        const thisWeekData = new Array(7).fill(0);
        let thisWeekTotal = 0;
        confirmedSchedules.forEach((schedule: any) => {
          const scheduleDate = new Date(schedule.fittingSlot.dateTime);
          if (scheduleDate >= startOfThisWeek && scheduleDate < endOfThisWeek) {
            const dayOfWeek = scheduleDate.getDay(); // Sunday = 0, Monday = 1, etc.
            thisWeekData[dayOfWeek]++;
            thisWeekTotal++;
          }
        });

        let lastWeekTotal = 0;
        confirmedSchedules.forEach((schedule: any) => {
            const scheduleDate = new Date(schedule.fittingSlot.dateTime);
            if (scheduleDate >= startOfLastWeek && scheduleDate < startOfThisWeek) {
                lastWeekTotal++;
            }
        });

        setTotalVisitors(thisWeekTotal);

        if (lastWeekTotal > 0) {
          const change =
            ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
          setPercentageChange(change);
        } else if (thisWeekTotal > 0) {
          setPercentageChange(100); // If last week was 0 and this week has fittings
        } else {
            setPercentageChange(0);
        }

        setChartData([
          {
            name: 'Confirmed Fittings',
            data: thisWeekData,
          },
        ]);

        setChartOptions({
          chart: {
            toolbar: {
              show: false,
            },
          },
          tooltip: {
            style: {
              fontSize: '12px',
              fontFamily: undefined,
            },
            theme: 'dark',
          },
          xaxis: {
            categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            show: false,
            labels: {
              show: true,
              style: {
                colors: '#A3AED0',
                fontSize: '14px',
                fontWeight: '500',
              },
            },
            axisBorder: {
              show: false,
            },
            axisTicks: {
              show: false,
            },
          },
          yaxis: {
            show: false,
            color: 'black',
            labels: {
              show: true,
              style: {
                colors: '#CBD5E0',
                fontSize: '14px',
              },
            },
          },
          grid: {
            show: false,
            strokeDashArray: 5,
            yaxis: {
              lines: {
                show: true,
              },
            },
            xaxis: {
              lines: {
                show: false,
              },
            },
          },
          fill: {
            type: 'gradient',
            gradient: {
              type: 'vertical',
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.9,
              colorStops: [
                [
                  {
                    offset: 0,
                    color: '#4318FF',
                    opacity: 1,
                  },
                  {
                    offset: 100,
                    color: 'rgba(67, 24, 255, 1)',
                    opacity: 0.28,
                  },
                ],
              ],
            },
          },
          dataLabels: {
            enabled: false,
          },
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '40px',
            },
          },
        });
      } catch (error) {
        console.error('Error fetching fitting data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFittingData();
  }, []);

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Weekly Fittings
          </p>
          <p className="text-[28px] font-bold text-navy-700 dark:text-white">
            {isLoading ? '...' : totalVisitors}{' '}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Confirmed
            </span>
          </p>
        </div>
        {!isLoading && (
          <div className="mt-2 flex items-start">
            <div
              className={`flex items-center text-sm ${
                percentageChange >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {percentageChange >= 0 ? (
                <MdArrowDropUp className="h-5 w-5" />
              ) : (
                <MdArrowDropDown className="h-5 w-5" />
              )}
              <p className="font-bold"> {percentageChange.toFixed(1)}% </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-[200px] w-full pt-0 pb-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading Chart...</p>
          </div>
        ) : (
          <BarChart chartData={chartData} chartOptions={chartOptions} />
        )}
      </div>
    </Card>
  );
};

export default DailyTraffic;
