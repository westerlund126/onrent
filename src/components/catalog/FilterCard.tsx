'use client';

import { useState, useEffect } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import Card from 'components/card';
import { Product } from 'types/product';
import { getAvailableSizes, getAvailableColors, formatPrice } from 'utils/filter';

export interface FilterState {
  selectedSize: string | null;
  selectedColor: string | null;
  selectedPriceRange: { min: number; max: number } | null;
}

interface FilterCardProps {
  products: Product[];
  onFilterChange: (filters: FilterState) => void;
}

// Predefined price ranges
const priceRanges = [
  { label: 'Rp 0 - Rp 100.000', min: 0, max: 100000 },
  { label: 'Rp 100.000 - Rp 500.000', min: 100000, max: 500000 },
  { label: 'Rp 500.000 - Rp 1.000.000', min: 500000, max: 1000000 },
  { label: 'Rp 1.000.000 - Rp 3.000.000', min: 1000000, max: 3000000 },
  { label: 'Rp 3.000.000 - Rp 5.000.000', min: 3000000, max: 5000000 },
  { label: 'Rp 5.000.000+', min: 5000000, max: Infinity },
];

export default function FilterCard({ products, onFilterChange }: FilterCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);

  // Get dynamic data from products
  const availableSizes = getAvailableSizes(products);
  const availableColors = getAvailableColors(products);

  // Update parent component when filters change
  useEffect(() => {
    const filters: FilterState = {
      selectedSize,
      selectedColor,
      selectedPriceRange,
    };
    onFilterChange(filters);
  }, [selectedSize, selectedColor, selectedPriceRange, onFilterChange]);

  const handleSizeClick = (size: string) => {
    setSelectedSize(selectedSize === size ? null : size);
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(selectedColor === color ? null : color);
  };

  const handlePriceClick = (priceRange: { min: number; max: number }) => {
    setSelectedPriceRange(
      selectedPriceRange?.min === priceRange.min && selectedPriceRange?.max === priceRange.max
        ? null
        : priceRange
    );
  };

  const clearAllFilters = () => {
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedPriceRange(null);
  };

  const hasActiveFilters = selectedSize || selectedColor || selectedPriceRange;

  return (
    <Card extra="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Size</h3>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeClick(size)}
                className={`w-10 h-10 border rounded-md text-sm font-medium transition-colors
                  ${selectedSize === size
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'text-gray-700 border-gray-300 hover:border-gray-500'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Colors</h3>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <div
                key={color}
                className="relative w-7 h-7 rounded-full cursor-pointer border-2 hover:ring-2 hover:ring-gray-300 transition-all"
                style={{ 
                  backgroundColor: color,
                  borderColor: color === '#ffffff' || color === 'white' ? '#d1d5db' : 'white'
                }}
                onClick={() => handleColorClick(color)}
                title={color}
              >
                {selectedColor === color && (
                  <MdCheckCircle className="absolute -top-1.5 -right-1.5 text-white bg-black rounded-full text-xs" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Filter */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-600">Price Range</h3>
        <ul className="space-y-2">
          {priceRanges.map((priceRange) => (
            <li
              key={priceRange.label}
              className={`cursor-pointer text-sm font-medium transition-colors ${
                selectedPriceRange?.min === priceRange.min && selectedPriceRange?.max === priceRange.max
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handlePriceClick({ min: priceRange.min, max: priceRange.max })}
            >
              {priceRange.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSize && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Size: {selectedSize}
                <button
                  onClick={() => setSelectedSize(null)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {selectedColor && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Color: {selectedColor}
                <button
                  onClick={() => setSelectedColor(null)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
            {selectedPriceRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Price: {formatPrice(selectedPriceRange.min)} - {selectedPriceRange.max === Infinity ? '∞' : formatPrice(selectedPriceRange.max)}
                <button
                  onClick={() => setSelectedPriceRange(null)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}