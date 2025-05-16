// components/product/ProductVariantCard.tsx
import Card from 'components/card';
import { FaCircle } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ProductVariant, StatusType } from '../../types/product';
import { StatusDropdown } from './StatusDropdown';

interface ProductVariantCardProps {
  variant: ProductVariant;
  productId: number;
  onStatusChange: (
    productId: number,
    variantId: number,
    newStatus: StatusType,
  ) => Promise<void>;
  onDeleteClick: (variantId: number, productId: number) => void;
}

export const ProductVariantCard = ({
  variant,
  productId,
  onStatusChange,
  onDeleteClick,
}: ProductVariantCardProps) => {
  const sizeDetails = [
    variant.bustlength && `${variant.bustlength}`,
    variant.waistlength && `${variant.waistlength}`,
    variant.length && `${variant.length}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card extra="w-full p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-grow items-center justify-between">
          {/* Product Code */}
          <div className="w-1/5">
            <div className="mb-1 text-xs text-gray-500">Kode Produk</div>
            <div className="font-medium">{variant.sku}</div>
          </div>

          {/* Size */}
          <div className="w-1/5">
            <div className="mb-1 text-xs text-gray-500">Ukuran</div>
            <div className="font-medium">{variant.size || '-'}</div>
          </div>

          {/* Size Details */}
          <div className="w-1/5">
            <div className="mb-1 text-xs text-gray-500">Detail Ukuran</div>
            <div className="font-medium">{sizeDetails || '-'}</div>
          </div>

          {/* Color */}
          <div className="w-1/5">
            <div className="mb-1 text-xs text-gray-500">Warna</div>
            <div className="flex items-center font-medium">
              {variant.color && (
                <FaCircle
                  style={{ color: variant.color }}
                  className="mr-2 text-lg"
                />
              )}
              <span>{variant.color || '-'}</span>
            </div>
          </div>

          {/* Price */}
          <div className="w-1/5">
            <div className="mb-1 text-xs text-gray-500">Harga</div>
            <div className="font-medium">
              {variant.price.toLocaleString('id-ID')}
            </div>
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
          className="ml-3 pt-2 text-red-500 transition-colors hover:text-red-700"
        >
          <MdDelete size={20} />
        </button>
      </div>
    </Card>
  );
};
