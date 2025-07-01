// components/product/ProductVariantCard.tsx
import Card from 'components/card';
import { FaCircle } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ProductVariant, StatusType } from '../../types/product';

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

  
        </div>

      </div>
    </Card>
  );
};
