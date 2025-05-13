import React from 'react';
import Card from 'components/card';
import { FaUser } from 'react-icons/fa';

type RowObj = {
  name: [string, boolean];
  progress: string;
  quantity: number;
  date: string;
  info: boolean;
};

const iconColors = [
  'bg-indigo-500',
  'bg-lime-400',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
];

function AgendaList({ tableData }: { tableData: RowObj[] }) {
  return (
    <Card extra="w-full px-4 py-6 rounded-3xl bg-white">
      <h2 className="mb-4 text-xl font-bold text-navy-700">Agenda Mendatang</h2>
      <div className="flex flex-col gap-4">
        {tableData.slice(0, 5).map((item, index) => {
          const [title] = item.name;
          // const isActive = index === 2;
          const iconBg = iconColors[index % iconColors.length];

          return (
            <div
              key={index}
              className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-navy-700
    shadow-md transition hover:border-orange-500 hover:bg-orange-500 hover:text-white`}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white
      ${
        iconColors[index % iconColors.length]
      } transition hover:bg-white hover:text-orange-500`}
              >
                <FaUser size={18} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-sm font-bold transition-colors">
                  {' '}
                  {title}{' '}
                </h3>
                <p className="mt-1 text-xs text-gray-500 transition hover:text-white">
                  {' '}
                  {item.date} – 18.00{' '}
                </p>
                <p className="mt-1 text-sm transition"> Tri Susanti </p>
              </div>

              {/* Arrow */}
              <div>
                <span className="text-xl text-gray-400 transition hover:text-white">
                  &#8250;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default AgendaList;
