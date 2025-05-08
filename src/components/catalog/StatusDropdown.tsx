// components/product/StatusDropdown.tsx
import { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown, MdCheckCircle, MdCancel, MdOutlineError } from 'react-icons/md';
import { ProductVariant, StatusType } from '../../types/product';

interface StatusDropdownProps {
  variant: ProductVariant;
  productId: number;
  onStatusChange: (productId: number, variantId: number, newStatus: StatusType) => Promise<void>;
}

export const StatusDropdown = ({ variant, productId, onStatusChange }: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusOptions: StatusType[] = ["Aktif", "Nonaktif", "Disewa"];
  const currentStatus = determineStatus(variant);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get status icon and color
  const getStatusIcon = (status: StatusType) => {
    if (status === "Aktif") {
      return <MdCheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === "Nonaktif") {
      return <MdCancel className="h-4 w-4 text-red-500" />;
    } else { // Disewa
      return <MdOutlineError className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: StatusType) => {
    if (status === "Aktif") return "text-green-500 border-green-500";
    if (status === "Nonaktif") return "text-red-500 border-red-500";
    return "text-amber-500 border-amber-500"; // Disewa
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="text-xs text-gray-500 mb-1">Status</div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-max pl-8 pr-2 py-1 rounded-md text-sm border ${getStatusColor(currentStatus)}`}
          type="button"
        >
          <span>{currentStatus}</span>
          <MdKeyboardArrowDown className="ml-2" />
        </button>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {getStatusIcon(currentStatus)}
        </div>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
            {statusOptions.map(option => (
              <div
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  currentStatus === option ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  onStatusChange(productId, variant.id, option);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  {getStatusIcon(option)}
                  <span className={`ml-2 ${option === "Aktif" ? "text-green-500" : 
                    option === "Nonaktif" ? "text-red-500" : "text-amber-500"}`}>
                    {option}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine status based on isAvailable and isRented flags
export const determineStatus = (variant: ProductVariant): StatusType => {
  if (variant.isRented) return "Disewa";
  if (!variant.isAvailable) return "Nonaktif";
  return "Aktif";
};