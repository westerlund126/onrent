'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Share2, Package, Info, Sparkles, User, MessageCircle, ArrowLeft, X, ZoomIn, Star, StarHalf } from 'lucide-react';
import { Product, ProductVariant } from 'types/product';
import { formatCurrency, CATEGORY_LABELS, CategoryType } from 'utils/product';
import ProductCard from 'components/card/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { useWishlist } from 'hooks/useWishlist';
import { useProductReviews } from 'hooks/useActivities';
import { formatDateTime } from 'utils/rental';

interface ProductDetailProps {}

const ProductDetail: React.FC<ProductDetailProps> = () => {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist(productId);
  const { reviews, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useProductReviews(parseInt(productId));
  const modalRef = useRef<HTMLDivElement>(null);

  // Reviews statistics
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        if (data.VariantProducts && data.VariantProducts.length > 0) {
          const availableVariant = data.VariantProducts.find((v: ProductVariant) => v.isAvailable && !v.isRented);
          setSelectedVariant(availableVariant || data.VariantProducts[0]);
        }
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const filtered = data
              .filter((p: Product) => p.id !== parseInt(productId))
              .slice(0, 5);
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    };

    const fetchReviewStats = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/reviews?page=1&limit=1`);
        if (response.ok) {
          const data = await response.json();
          setReviewStats(data.statistics);
        }
      } catch (err) {
        console.error('Failed to fetch review stats:', err);
      }
    };

    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
      fetchReviewStats();
    }
  }, [productId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isImageModalOpen]);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleBack = () => {
    router.back();
  };

  const handleImageClick = () => {
    setIsImageModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsImageModalOpen(false);
  };

  const handleLike = async () => {
    const wasInWishlist = isInWishlist;
    try {
      await toggleWishlist();
      toast.success(
        wasInWishlist ? "Produk dihapus dari wishlist" : "Produk ditambahkan ke wishlist",
      );
    } catch (error) {
      toast.error("Terjadi kesalahan", {
        description: "Tolong coba lagi nanti",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: `Check out this amazing ${product?.name}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!", {
          description: "Product link has been copied to clipboard",
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      toast.error("Failed to share", {
        description: "There was an error sharing this product",
      });
    }
  };

  const handleBookingSchedule = () => {
    if (!selectedVariant || !product) return;
    if (!selectedVariant.isAvailable || selectedVariant.isRented) {
      toast.error("Variant not available", {
        description: "This variant is currently not available for booking",
      });
      return;
    }
    router.push(
      `/customer/fitting/schedule?type=product&productId=${product.id}&ownerId=${product.ownerId}`
    );
  };

  const handleWhatsAppContact = () => {
    if (!product || !product.owner?.phone_numbers) {
      toast.error("Nomor telepon tidak tersedia", {
        description: "Pemilik produk tidak memiliki nomor telepon terdaftar",
      });
      return;
    }
    let phoneNumber = product.owner.phone_numbers.replace(/\D/g, '');
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('+62')) {
      phoneNumber = phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }
    const message = `Halo, saya tertarik dengan produk ${product.name}. Apakah masih tersedia?`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success("Membuka WhatsApp", {
      description: "Mengarahkan ke WhatsApp untuk menghubungi pemilik",
      className: "text-green-700",
    });
  };

  // Review helper functions
  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className={`${sizeClass} text-yellow-400 fill-yellow-400`} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${sizeClass} text-yellow-400 fill-yellow-400`} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />
      );
    }

    return stars;
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-red-500">{error || 'Product not found'}</p>
      </div>
    );
  }

  const allVariants = product.VariantProducts || [];
  const availableVariants = allVariants.filter(v => v.isAvailable && !v.isRented);
  const uniqueSizes = [...new Set(allVariants.map(v => v.size))];
  const uniqueColors = [...new Set(allVariants.map(v => v.color))];

  const getVariantsForSize = (size: string) => allVariants.filter(v => v.size === size);
  const getVariantsForColor = (color: string) => allVariants.filter(v => v.color === color);
  const isVariantAvailable = (variant: ProductVariant) => variant.isAvailable && !variant.isRented;

  const getOwnerDisplayName = () => {
    if (product.owner?.firstName || product.owner?.lastName) {
      return `${product.owner.firstName || ''} ${product.owner.lastName || ''}`.trim();
    }
    return product.owner?.username || 'Unknown Owner';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mb-4 border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 rounded-xl px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-3 md:space-y-4">
                <div className="group relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-xl cursor-pointer">
                  {product.images && product.images.length > 0 ? (
                    <div onClick={handleImageClick} className="relative h-full w-full">
                      <Image
                        src={product.images[selectedImageIndex]}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                          <ZoomIn className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Package className="h-16 md:h-24 w-16 md:w-24 text-muted-foreground/30" />
                    </div>
                  )}
                  {selectedVariant && !isVariantAvailable(selectedVariant) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <Badge variant="destructive" className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">
                        {selectedVariant.isRented ? 'Currently Rented' : 'Not Available'}
                      </Badge>
                    </div>
                  )}
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 md:space-x-3 overflow-x-auto px-2 py-2 scrollbar-hide">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square w-12 sm:w-14 md:w-16 lg:w-20 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl border-2 md:border-3 transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'border-orange-500 ring-2 md:ring-4 ring-orange-200 scale-105'
                            : 'border-border hover:border-orange-300 hover:scale-105'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 md:space-y-6 lg:space-y-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-2 md:mb-3 text-xs md:text-sm px-2 md:px-3 py-1 bg-primary-100 text-primary-700 border-primary-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {CATEGORY_LABELS[product.category as CategoryType] || product.category}
                      </Badge>
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">
                        {product.name}
                      </h1>
                      
                      {/* Rating Section */}
                      {reviewStats.totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {renderStars(reviewStats.averageRating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {reviewStats.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                      
                      <p className="mt-2 md:mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-primary-600">
                        {selectedVariant ? formatCurrency(selectedVariant.price) : 'Select variant'}
                      </p>
                    </div>
                    <div className="flex space-x-2 self-start sm:self-auto flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleLike}
                        disabled={wishlistLoading}
                        className={`h-10 w-10 sm:h-12 sm:w-12 border-2 transition-all duration-300 ${
                          isInWishlist
                            ? 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100'
                            : 'border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:scale-105'
                        } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isInWishlist ? 'fill-current' : ''} ${wishlistLoading ? 'animate-pulse' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                        className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:scale-105 transition-all duration-300"
                      >
                        <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {uniqueSizes.length > 0 && (
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold">Ukuran</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {uniqueSizes.map((size) => {
                        const sizeVariants = getVariantsForSize(size);
                        const isSelected = selectedVariant?.size === size;
                        const hasAvailable = sizeVariants.some(v => isVariantAvailable(v));
                        return (
                          <Button
                            key={size}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const variant = sizeVariants.find(v => isVariantAvailable(v)) || sizeVariants[0];
                              if (variant) handleVariantSelect(variant);
                            }}
                            className={`min-w-[50px] md:min-w-[60px] h-9 md:h-10 text-sm border-2 transition-all duration-300 ${
                              isSelected 
                                ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' 
                                : hasAvailable 
                                  ? 'border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:scale-105' 
                                  : 'opacity-50 border-gray-200'
                            }`}
                          >
                            {size}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {uniqueColors.length > 0 && (
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold">Warna</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {uniqueColors.map((color) => {
                        const colorVariants = getVariantsForColor(color);
                        const isSelected = selectedVariant?.color === color;
                        const hasAvailable = colorVariants.some(v => isVariantAvailable(v));
                        return (
                          <Button
                            key={color}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              let variant = colorVariants.find(v => selectedVariant ? v.size === selectedVariant.size : true);
                              if (!variant) {
                                variant = colorVariants.find(v => isVariantAvailable(v)) || colorVariants[0];
                              }
                              if (variant) handleVariantSelect(variant);
                            }}
                            className={`h-9 md:h-10 text-sm border-2 transition-all duration-300 ${
                              isSelected 
                                ? 'bg-primary-600 hover:bg-primary-700 border-primary-600' 
                                : hasAvailable 
                                  ? 'border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:scale-105' 
                                  : 'opacity-50 border-gray-200'
                            }`}
                          >
                            {color}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3 md:space-y-4 pt-4 md:pt-6 lg:pt-8">
                  <Button
                    onClick={handleBookingSchedule}
                    disabled={!selectedVariant || !isVariantAvailable(selectedVariant)}
                    className="w-full h-12 md:h-14 text-sm md:text-lg transition-all duration-300 hover:scale-105 rounded-xl md:rounded-2xl shadow-xl bg-primary-600 hover:bg-primary-500"
                    size="lg"
                  >
                    {!selectedVariant
                      ? 'Pilih Varian Terlebih Dahulu'
                      : !isVariantAvailable(selectedVariant)
                      ? 'Varian Tidak Tersedia'
                      : 'Jadwalkan Fitting Sekarang'}
                  </Button>
                  <Button
                    onClick={handleWhatsAppContact}
                    variant="outline"
                    disabled={!product.owner?.phone_numbers}
                    className="w-full h-12 md:h-14 text-sm md:text-lg border-2 transition-all duration-300 hover:scale-105 rounded-xl md:rounded-2xl text-white hover:bg-green-800 shadow-xl bg-green-700 hover:text-white border-green-700"
                    size="lg"
                  >
                    <Image
                      src="/img/whatsapp.png"
                      alt="WhatsApp Icon"
                      width={20}
                      height={20}
                      className="mr-2 w-5 h-5 md:w-6 md:h-6"
                    />
                    Kontak via WhatsApp
                  </Button>
                </div>

                <Card className="bg-gradient-to-r from-orange-50/90 via-orange-100/80 to-amber-50/90 border-2 border-orange-200/60 rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
                  <CardContent className="p-3 md:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 lg:gap-5">
                       <div className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shadow-lg ring-2 md:ring-4 ring-white flex-shrink-0">
                        {product.owner?.imageUrl ? (
                          <Image
                            src={product.owner.imageUrl}
                            alt={product.owner.username || 'Owner'}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <h4 className="font-bold text-base md:text-lg lg:text-xl text-gray-900 truncate">
                          {product.owner?.businessName || 'Business Name'}
                        </h4>
                        <p className="text-gray-700 mt-1 text-sm md:text-base truncate">
                          {getOwnerDisplayName()}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start mt-2 space-x-4">
                          <div className="flex items-center text-xs md:text-sm text-gray-600">
                            <Package className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {product.owner?.totalProducts || 0} Produk
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!product?.ownerId) {
                            toast.error("Owner ID tidak ditemukan"); return;
                          }
                          router.push(`/customer/owner/profile/${product.ownerId}`);
                        }}
                        className="border-2 hover:scale-105 transition-all duration-300 rounded-lg md:rounded-xl px-4 md:px-6 py-2 font-semibold border-orange-300 text-orange-700 hover:bg-orange-50 w-full sm:w-auto text-sm"
                      >
                        Lihat Profil
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-4 md:my-6 lg:my-8" />

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="variant-details">
                    <AccordionTrigger className="text-sm md:text-base lg:text-lg font-semibold hover:text-orange-600 transition-colors">
                      Detail Varian
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {selectedVariant && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Info className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                              <h4 className="font-semibold text-sm md:text-base lg:text-lg">Varian Dipilih</h4>
                              <Badge
                                variant={isVariantAvailable(selectedVariant) ? "default" : "destructive"}
                                className={`ml-auto ${isVariantAvailable(selectedVariant) ? 'bg-orange-100 text-orange-700 border-orange-200' : ''}`}
                              >
                                {isVariantAvailable(selectedVariant) ? "Tersedia" :
                                 selectedVariant.isRented ? "Disewa" : "Tidak Tersedia"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                              <div className="space-y-2">
                                <p><span className="font-medium">Ukuran:</span> {selectedVariant.size}</p>
                                <p><span className="font-medium">Warna:</span> {selectedVariant.color}</p>
                                <p><span className="font-medium">Harga:</span> {formatCurrency(selectedVariant.price)}</p>
                              </div>
                              <div className="space-y-2">
                                {selectedVariant.bustlength && <p><span className="font-medium">Lingkar Dada:</span> {selectedVariant.bustlength}cm</p>}
                                {selectedVariant.waistlength && <p><span className="font-medium">Lingkar Pinggang:</span> {selectedVariant.waistlength}cm</p>}
                                {selectedVariant.length && <p><span className="font-medium">Panjang:</span> {selectedVariant.length}cm</p>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {product.description && (
                   // Continuation of the accordion description section
                    <AccordionItem value="description">
                      <AccordionTrigger className="text-sm md:text-base lg:text-lg font-semibold hover:text-orange-600 transition-colors">
                        Deskripsi
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">{product.description}</p>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Reviews Section */}
                  {reviewStats.totalReviews > 0 && (
                    <AccordionItem value="reviews">
                      <AccordionTrigger className="text-sm md:text-base lg:text-lg font-semibold hover:text-orange-600 transition-colors">
                        Reviews ({reviewStats.totalReviews})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6">
                          {/* Rating Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Overall Rating */}
                            <div className="text-center">
                              <div className="text-4xl font-bold text-primary-600 mb-2">
                                {reviewStats.averageRating.toFixed(1)}
                              </div>
                              <div className="flex items-center justify-center mb-2">
                                {renderStars(reviewStats.averageRating, 'lg')}
                              </div>
                              <p className="text-sm text-gray-600">
                                Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                              </p>
                            </div>

                            {/* Rating Distribution */}
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const count = reviewStats.ratingDistribution[rating] || 0;
                                const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                                
                                return (
                                  <div key={rating} className="flex items-center gap-2 text-sm">
                                    <span className="w-3 text-gray-600">{rating}</span>
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <div className="flex-1">
                                      <Progress value={percentage} className="h-2" />
                                    </div>
                                    <span className="w-8 text-xs text-gray-500">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Individual Reviews */}
                          {reviewsLoading ? (
                            <div className="flex justify-center py-8">
                              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-orange-500"></div>
                            </div>
                          ) : reviews.length > 0 ? (
                            <div className="space-y-4">
                              {displayedReviews.map((review) => (
                                <Card key={review.id} className="border border-gray-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h5 className="font-medium text-sm truncate">
                                            {review.user.first_name} {review.user.last_name || ''}
                                          </h5>
                                          <div className="flex items-center">
                                            {renderStars(review.rating)}
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2 break-words">
                                          {review.comment}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDateTime(review.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}

                              {/* Show More/Less Button */}
                              {reviews.length > 3 && (
                                <div className="text-center">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                  >
                                    {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">No reviews yet</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Products Section - same as before */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-4 md:mb-6 lg:mb-8 text-xl md:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Anda Mungkin Juga Suka
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal - same as before */}
      {isImageModalOpen && product.images && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div ref={modalRef} className="relative flex h-full w-full max-w-4xl items-center justify-center">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 transition-all duration-300 hover:bg-white/20"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                width={1200}
                height={1200}
                className="max-h-full max-w-full object-contain"
                sizes="100vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2 rounded-full bg-black/50 px-4 py-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      selectedImageIndex === index ? 'bg-orange-500' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;