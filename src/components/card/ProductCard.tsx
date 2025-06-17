import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { useState, useMemo } from 'react';
import Card from 'components/card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    images: string[];
    owner: { id: number; username: string };
    VariantProducts: {
      id: number;
      price: number;
    }[];
  };
  extra?: string;
};

const ProductCard = ({ product, extra }: ProductCardProps) => {
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  const minPrice = useMemo(() => {
    return Math.min(...product.VariantProducts.map((v) => v.price));
  }, [product.VariantProducts]);

  const handleClick = () => {
    router.push(`/customer/catalog/${product.id}`);
  };

  const handleSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/customer/fitting/schedule?type=product&productId=${product.id}&ownerId=${product.owner.id}`);
  };

  return (
    <Card
      extra={`flex flex-col w-full h-full !p-0 bg-white overflow-hidden cursor-pointer ${extra}`}
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-square">
        <Image
          fill
          className="object-cover"
          src={product.images[0]}
          alt={product.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute right-3 top-3 flex items-center justify-center rounded-full bg-white p-2 text-brand-500 hover:text-red-500 transition-colors shadow-md"
        >
          {liked ? (
            <IoHeart className="text-red-500 text-lg" />
          ) : (
            <IoHeartOutline className="text-lg" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-navy-700 line-clamp-2 h-14 overflow-hidden">
          {product.name}
        </h3>
        
        <div className="mt-2">
          <p className="text-lg font-bold text-brand-500 mb-3">
            Rp {minPrice.toLocaleString('id-ID')}
          </p>
          
          <button 
            onClick={handleSchedule}
            className="w-full bg-brand-900 hover:bg-brand-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Jadwalkan Fitting
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;