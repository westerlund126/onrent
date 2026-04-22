import { IoHeart, IoHeartOutline } from 'react-icons/io5';
import { Star } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Card from 'components/card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWishlist } from 'hooks/useWishlist';
import { useActivitiesStore } from 'stores/useActivitiesStore';

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
    // Optional rating data - you might want to add this to your Product type
    averageRating?: number;
    totalReviews?: number;
  };
  extra?: string;
};

const ProductCard = ({ product, extra }: ProductCardProps) => {
  const router = useRouter();
  const { isInWishlist, toggleWishlist, loading } = useWishlist(product.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use Zustand store for reviews
  const { reviews, reviewsLoading, fetchProductReviews } = useActivitiesStore();
  const productReviews = reviews[product.id] || [];
  const [productRating, setProductRating] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);

  const minPrice = useMemo(() => {
    return Math.min(...product.VariantProducts.map((v) => v.price));
  }, [product.VariantProducts]);

  // Calculate rating from reviews data or fetch if not available
  useEffect(() => {
    if (productReviews.length > 0) {
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      setProductRating({
        averageRating,
        totalReviews: productReviews.length
      });
    } else {
      // Fetch reviews if not in store yet
      fetchProductReviews(product.id);
    }
  }, [product.id, productReviews, fetchProductReviews]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovered && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % product.images.length
        );
      }, 1000);
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3 h-3 sm:w-3.5 sm:h-3.5">
            <Star className="absolute inset-0 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300" />
        );
      }
    }

    return stars;
  };

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
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={loading}
          className={`absolute right-2 top-2 flex items-center justify-center rounded-full
                     bg-white/95 backdrop-blur-sm p-1.5 sm:p-2 transition-all duration-200 shadow-md
                     transform hover:scale-110 active:scale-95 z-10
                     ${loading
                       ? 'cursor-not-allowed opacity-70'
                       : 'hover:bg-white hover:shadow-lg cursor-pointer'
                     }`}
        >
          {isInWishlist ? (
            <IoHeart className="text-red-500 text-sm sm:text-base" />
          ) : (
            <IoHeartOutline className="text-sm sm:text-base text-gray-600 hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Rating Badge */}
        {productRating && (
          <div className="absolute left-2 top-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm
                         rounded-full px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-md">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {productRating.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 hidden sm:inline">
              ({productRating.totalReviews})
            </span>
          </div>
        )}

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Hover Overlay with Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 flex items-end justify-center pb-3 sm:pb-4">
          <button
            onClick={handleSchedule}
            className="bg-white text-gray-900 font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg
                       transition-all duration-200 transform translate-y-4 group-hover:translate-y-0
                       hover:bg-gray-50 shadow-lg text-xs sm:text-sm"
          >
            Jadwalkan Fitting
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-grow">
        {/* Owner Name */}
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium truncate mb-1">
          {ownerName}
        </p>
        
        {/* Product Name */}
        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-2
                       leading-tight mb-2 flex-grow min-h-[2rem] sm:min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* Rating Display for Mobile */}
        {productRating && (
          <div className="flex items-center gap-1 mb-2 sm:hidden">
            <div className="flex items-center">
              {renderStars(productRating.averageRating)}
            </div>
            <span className="text-xs text-gray-600 ml-1">
              {productRating.averageRating.toFixed(1)} ({productRating.totalReviews})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-auto">
          <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            Rp {minPrice.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;