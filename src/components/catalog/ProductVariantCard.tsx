// components/product/ProductVariantCard.tsx
import Card from 'components/card';
import { FaCircle } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ProductVariant, StatusType } from '../../types/product';
import { StatusDropdown } from './StatusDropdown';

interface ProductVariantCardProps {
  variant: ProductVariant;
  productId: number;
  onStatusChange: (productId: number, variantId: number, newStatus: StatusType) => Promise<void>;
  onDeleteClick: (variantId: number, productId: number) => void;
}

export const ProductVariantCard = ({ 
  variant, 
  productId, 
  onStatusChange, 
  onDeleteClick 
}: ProductVariantCardProps) => {
  const sizeDetails = [
    variant.bustlength && `${variant.bustlength}`,
    variant.waistlength && `${variant.waistlength}`,
    variant.length && `${variant.length}`
  ].filter(Boolean).join(', ');

  return (
    <Card extra="w-full p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between flex-grow">
          {/* Size */}
          <div className="w-1/5">
            <div className="text-xs text-gray-500 mb-1">Ukuran</div>
            <div className="font-medium">{variant.size || '-'}</div>
          </div>
          
          {/* Size Details */}
          <div className="w-1/5">
            <div className="text-xs text-gray-500 mb-1">Detail Ukuran</div>
            <div className="font-medium">{sizeDetails || '-'}</div>
          </div>
          
          {/* Color */}
          <div className="w-1/5">
            <div className="text-xs text-gray-500 mb-1">Warna</div>
            <div className="font-medium flex items-center">
              {variant.color && (
                <FaCircle style={{ color: variant.color }} className="mr-2 text-lg" />
              )}
              <span>{variant.color || '-'}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="w-1/5">
            <div className="text-xs text-gray-500 mb-1">Harga</div>
            <div className="font-medium">{variant.price.toLocaleString('id-ID')}</div>
          </div>
          
          {/* Status with Dropdown */}
          <div className="w-1/5">
            <StatusDropdown 
              variant={variant} 
              productId={productId}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
        
        {/* Delete Button */}
        <button 
          onClick={() => onDeleteClick(variant.id, productId)}
          className="text-red-500 hover:text-red-700 transition-colors ml-3 pt-2"
        >
          <MdDelete size={20} />
        </button>
      </div>
    </Card>
  );
};