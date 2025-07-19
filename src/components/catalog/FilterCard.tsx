'use client';

import { useState, useEffect } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { FiAlignJustify, FiX } from 'react-icons/fi';
import Card from 'components/card';
import { Product } from 'types/product';
import { getAvailableSizes, getAvailableColors, formatPrice, getAvailableCategories } from 'utils/filter';

export interface FilterState {
  selectedCategory: string | null;
  selectedSize: string | null;
  selectedColor: string | null;
  selectedPriceRange: { min: number; max: number } | null;
}

interface FilterCardProps {
  products: Product[];
  activeFilters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
}
const priceRanges = [
  { label: 'Rp 0 - Rp 100.000', min: 0, max: 100000 },
  { label: 'Rp 100.000 - Rp 500.000', min: 100000, max: 500000 },
  { label: 'Rp 500.000 - Rp 1.000.000', min: 500000, max: 1000000 },
  { label: 'Rp 1.000.000 - Rp 3.000.000', min: 1000000, max: 3000000 },
  { label: 'Rp 3.000.000 - Rp 5.000.000', min: 3000000, max: 5000000 },
  { label: 'Rp 5.000.000+', min: 5000000, max: Infinity },
];

export default function FilterCard({ products, activeFilters, onFilterChange }: FilterCardProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { selectedCategory, selectedSize, selectedColor, selectedPriceRange } = activeFilters;
  
  const availableCategories = getAvailableCategories(products);
  const availableSizes = getAvailableSizes(products);
  const availableColors = getAvailableColors(products);

  const handleCategoryClick = (newCategory: string) => {
    onFilterChange({ selectedCategory: selectedCategory === newCategory ? null : newCategory });
  };

  const handleSizeClick = (newSize: string) => {
    onFilterChange({ selectedSize: selectedSize === newSize ? null : newSize });
  };

  const handleColorClick = (newColor: string) => {
    onFilterChange({ selectedColor: selectedColor === newColor ? null : newColor });
  };

  const handlePriceClick = (newPriceRange: { min: number; max: number }) => {
    onFilterChange({ 
      selectedPriceRange: selectedPriceRange?.min === newPriceRange.min ? null : newPriceRange 
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      selectedCategory: null,
      selectedSize: null,
      selectedColor: null,
      selectedPriceRange: null,
    });
  };

  const hasActiveFilters = selectedCategory || selectedSize || selectedColor || selectedPriceRange;

  const activeFilterCount = [selectedCategory, selectedSize, selectedColor, selectedPriceRange].filter(Boolean).length;

useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen && window.innerWidth < 768) {
        const target = event.target as HTMLElement;
        if (!target.closest('.filter-card') && !target.closest('.filter-toggle-container')) {
          setIsFilterOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const FilterToggle = () => (
    <div className="md:hidden mb-4">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 flex-1 hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
        >
          <FiAlignJustify className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-1 hover:bg-gray-50 rounded transition-colors"
          >
            <FiX className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-0' : 'rotate-45'}`} />
          </button>
        </div>
      </div>
    </div>
  );

  const FilterContent = () => (
    <div className="filter-card">
      <Card extra="w-full p-4 sm:p-6">
        <div className="hidden md:flex items-center justify-between mb-4">
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

        <div className="md:hidden flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900"></h2>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Category</h3>
          <ul className="space-y-1 sm:space-y-2">
            {availableCategories.map((cat) => (
              <li
                key={cat}
                className={`cursor-pointer text-sm font-medium transition-colors capitalize py-1 px-2 rounded hover:bg-gray-50 ${
                  selectedCategory === cat
                    ? 'text-gray-900 font-semibold bg-gray-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.replace(/_/g, ' ').toLowerCase()}
              </li>
            ))}
          </ul>
        </div>

        {availableSizes.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Size</h3>
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3">
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

        {availableColors.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Colors</h3>
            <div className="grid grid-cols-8 sm:flex sm:flex-wrap gap-2 sm:gap-3">
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

        <div className="mb-4 sm:mb-0">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Price Range</h3>
          <ul className="space-y-1 sm:space-y-2">
            {priceRanges.map((priceRange) => (
              <li
                key={priceRange.label}
                className={`cursor-pointer text-sm font-medium transition-colors py-1 px-2 rounded hover:bg-gray-50 ${
                  selectedPriceRange?.min === priceRange.min && selectedPriceRange?.max === priceRange.max
                    ? 'text-gray-900 font-semibold bg-gray-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handlePriceClick({ min: priceRange.min, max: priceRange.max })}
              >
                {priceRange.label}
              </li>
            ))}
          </ul>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 capitalize">
                  {selectedCategory.replace(/_/g, ' ').toLowerCase()}
                  <button
                    onClick={() => onFilterChange({ selectedCategory: null })}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSize && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  Size: {selectedSize}
                  <button
                    onClick={() => onFilterChange({ selectedSize: null })}
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
                    onClick={() => onFilterChange({ selectedColor: null })}
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
                    onClick={() => onFilterChange({ selectedPriceRange: null })}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Apply Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="relative">
      <div className="filter-toggle-container">
        <FilterToggle />
      </div>

      <div className="hidden md:block">
        <FilterContent />
      </div>

      {isFilterOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />          
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto">
            <FilterContent />
          </div>
        </>
      )}
    </div>
  );
}