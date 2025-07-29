import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { useMemo, useState, useEffect } from 'react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const minPrice = useMemo(() => {
    return Math.min(...product.VariantProducts.map((v) => v.price));
  }, [product.VariantProducts]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovered && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % product.images.length
        );
      }, 1000); // You can adjust the interval duration here
    } else {
      setCurrentImageIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, product.images.length]);

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
              transform transition-all duration-300 ease-in-out hover:shadow-lg
              border-0 shadow-sm hover:shadow-xl ${extra}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-xl">
        
        {product.images.map((src, index) => (
          <Image
            key={src} 
            fill
            priority={index === 0} 
            className={`
              object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105
              ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}
            `}
            src={src}
            alt={`${product.name} image ${index + 1}`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ))}
        {/* --- CHANGE END --- */}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={loading}
          className={`absolute right-2 top-2 flex items-center justify-center rounded-full
                     bg-white/95 backdrop-blur-sm p-2 transition-all duration-200 shadow-md
                     transform hover:scale-110 active:scale-95 z-10
                     ${loading
                       ? 'cursor-not-allowed opacity-70'
                       : 'hover:bg-white hover:shadow-lg cursor-pointer'
                     }`}
        >
          {isInWishlist ? (
            <IoHeart className="text-red-500 text-base" />
          ) : (
            <IoHeartOutline className="text-base text-gray-600 hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Hover Overlay with Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 flex items-end justify-center pb-4">
          <button
            onClick={handleSchedule}
            className="bg-white text-gray-900 font-medium py-2.5 px-6 rounded-lg
                       transition-all duration-200 transform translate-y-4 group-hover:translate-y-0
                       hover:bg-gray-50 shadow-lg text-sm"
          >
            Jadwalkan Fitting
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Owner Name */}
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium truncate mb-1">
          {ownerName}
        </p>
        
        {/* Product Name */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2
                       leading-tight mb-2 flex-grow">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="mt-auto">
          <p className="text-base sm:text-lg font-bold text-gray-900">
            Rp {minPrice.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;