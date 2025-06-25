'use client';

import { useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import Card from 'components/card';

const sizes = ['S', 'M', 'L', 'XL'];
const colors = [
  '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#66d9e8',
  '#74c0fc', '#a5d8ff', '#d0bfff', '#e599f7', '#f783ac',
];
const prices = [
  'Rp 0-Rp 100.000', 'Rp 100.000-Rp 500.000', 'Rp 500.000-Rp 1.000.000', 'Rp 1.000.000-Rp 3.000.000', 'Rp 3.000.000-Rp 5.000.000',
];

export default function FilterCard() {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  return (
    <Card extra="w-full p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>

      {/* Size Filter */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-600">Size</h3>
        <div className="flex flex-wrap gap-3">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-10 h-10 border rounded-md text-sm font-medium
                ${selectedSize === size
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'text-gray-700 border-gray-300 hover:border-gray-500'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-600">Colors</h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <div
              key={color}
              className="relative w-7 h-7 rounded-full cursor-pointer border-2 border-white hover:ring-2 hover:ring-gray-300"
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <MdCheckCircle className="absolute -top-1.5 -right-1.5 text-white bg-black rounded-full text-xs" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-600">Prices</h3>
        <ul className="space-y-2">
          {prices.map((price) => (
            <li
              key={price}
              className={`cursor-pointer text-sm font-medium ${
                selectedPrice === price
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedPrice(price)}
            >
              {price}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
