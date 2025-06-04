// components/product/ProductDetails.tsx
import Image from 'next/image';
import { Product, StatusType } from '../../types/product';
import { ProductVariantCard } from './ProductVariantCard';

interface ProductDetailsProps {
  product: Product;
  onStatusChange: (productId: number, variantId: number, newStatus: StatusType) => Promise<void>;
  onDeleteClick: (variantId: number, productId: number) => void;
}

export const ProductDetails = ({ product, onStatusChange, onDeleteClick }: ProductDetailsProps) => {
  return (
    <div className="bg-gray-50 p-6 rounded-b-lg">
      <div className="grid grid-cols-5 gap-4">
        {/* Product Images */}
        <div className="col-span-4 grid grid-cols-4 gap-4">
          {product.images.length > 0 ? (
            product.images.slice(0, 4).map((img, idx) => (
              <div key={idx}>
                <div className="w-24 h-36 bg-gray-200 rounded flex items-center justify-center">
                  <Image 
                    src={img} 
                    alt="..." 
                    className="w-full h-full object-cover rounded" 
                  />
                </div>
              </div>
            ))
          ) : (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="bg-white rounded-md p-2 flex items-center justify-center h-32">
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Product Description */}
        <div className="col-span-1">
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Deskripsi</h3>
            <p className="text-sm text-gray-600">{product.description || "Tidak ada deskripsi."}</p>
          </div>
        </div>
      </div>
      
      {/* Size and Color Summary */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Ukuran</h3>
          <div className="flex flex-wrap gap-2">
            {[...new Set(product.VariantProducts.filter(v => v.size).map(v => v.size))].map((size, idx, arr) => (
              <span key={idx} className="text-sm">{size}{idx < arr.length - 1 ? ',' : ''}</span>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Warna</h3>
          <div className="flex flex-wrap gap-2">
            {[...new Set(product.VariantProducts.filter(v => v.color).map(v => v.color))].map((color, idx, arr) => (
              <span key={idx} className="text-sm">{color}{idx < arr.length - 1 ? ',' : ''}</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Variants Section - Card Layout */}
      <div className="mt-4">
        <h3 className="font-medium text-gray-800 mb-3">Variants</h3>
        <div className="grid grid-cols-1 gap-3">
          {product.VariantProducts.map((variant) => (
            <ProductVariantCard
              key={variant.id}
              variant={variant}
              productId={product.id}
              onStatusChange={onStatusChange}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};