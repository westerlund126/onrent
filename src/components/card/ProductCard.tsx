import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { useMemo } from 'react';
import Card from 'components/card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWishlist } from 'hooks/useWishlist';

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    images: string[];
    owner: { 
      id: number; 
      username?: string;
      businessName?: string | null;
      first_name?: string;
      last_name?: string | null;
    };
    VariantProducts: {
      id: number;
      price: number;
    }[];
  };
  extra?: string;
};

const ProductCard = ({ product, extra }: ProductCardProps) => {
  const router = useRouter();
  const { isInWishlist, toggleWishlist, loading } = useWishlist(product.id);

  const minPrice = useMemo(() => {
    return Math.min(...product.VariantProducts.map((v) => v.price));
  }, [product.VariantProducts]);

  // Get owner display name
  const ownerName = useMemo(() => {
    if (product.owner.businessName) {
      return product.owner.businessName;
    }
    if (product.owner.first_name) {
      return `${product.owner.first_name} ${product.owner.last_name || ''}`.trim();
    }
    return product.owner.username || 'Unknown Owner';
  }, [product.owner]);

  const handleClick = () => {
    router.push(`/customer/catalog/${product.id}`);
  };

  const handleSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/customer/fitting/schedule?type=product&productId=${product.id}&ownerId=${product.owner.id}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist();
  };

  return (
    <Card
      extra={`group relative flex flex-col w-full h-full !p-0 bg-white overflow-hidden cursor-pointer 
               transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl 
               border border-gray-100 hover:border-gray-200 ${extra}`}
      onClick={handleClick}
    >
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          src={product.images[0]}
          alt={product.name}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button
          onClick={handleWishlistClick}
          disabled={loading}
          className={`absolute right-3 top-3 flex items-center justify-center rounded-full 
                     bg-white/90 backdrop-blur-sm p-2.5 transition-all duration-200 shadow-lg
                     transform hover:scale-110 active:scale-95 z-10
                     ${loading 
                       ? 'cursor-not-allowed opacity-70' 
                       : 'hover:bg-white hover:shadow-xl cursor-pointer'
                     }`}
        >
          {isInWishlist ? (
            <IoHeart className="text-red-500 text-lg drop-shadow-sm" />
          ) : (
            <IoHeartOutline className="text-lg text-gray-600 hover:text-red-500 transition-colors" />
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full 
                        group-hover:translate-y-0 transition-transform duration-300 ease-out
                        hidden sm:block">
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 
                       leading-tight mb-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {product.name}
        </h3>        
        <div className="mt-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-500 block">Mulai dari</span>
              <p className="text-lg sm:text-xl font-bold text-brand-900 truncate">
                Rp {minPrice.toLocaleString('id-ID')}
              </p>
            </div>
            
            <button 
              onClick={handleSchedule}
              className="flex-shrink-0 bg-gradient-to-r from-brand-900 to-brand-700 hover:from-brand-700 hover:to-brand-800 
                         text-white font-medium py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg transition-all duration-200
                         transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg
                         text-xs sm:text-sm whitespace-nowrap"
            >
              Jadwalkan Fitting
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl border-2 border-transparent 
                      group-hover:border-blue-100 transition-all duration-300 pointer-events-none" />
    </Card>
  );
};

export default ProductCard;