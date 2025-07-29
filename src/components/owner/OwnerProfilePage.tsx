'use client';

import { Share2, MessageCircle, Calendar, MapPin, Phone, Mail, Clock, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProductCard from 'components/card/ProductCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const OwnerProfilePage = ({ ownerId }) => {
  const router = useRouter();
  const [ownerData, setOwnerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [weeklySlots, setWeeklySlots] = useState({});

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        
        // Fetch owner details
        const ownerResponse = await fetch(`/api/fitting/owner/${ownerId}`);
        if (!ownerResponse.ok) throw new Error('Failed to fetch owner data');
        const ownerData = await ownerResponse.json();
        
        // Fetch owner's products
        const productsResponse = await fetch(`/api/products/owner/${ownerId}`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
        
        // Fetch weekly slots for jam operasional
        const slotsResponse = await fetch(`/api/fitting/weekly-slots?ownerId=${ownerId}`);
        if (slotsResponse.ok) {
          const slotsData = await slotsResponse.json();
          setWeeklySlots(slotsData.workingHours);
        }
        
        setOwnerData(ownerData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchOwnerData();
    }
  }, [ownerId]);

  const handleJadwalkanFitting = () => {
    router.push(`/customer/fitting/schedule?type=owner&ownerId=${ownerId}`);
  };

  const handleChatPenjual = () => {
    if (!ownerData || !ownerData.phone_numbers) {
      toast.error("Nomor telepon tidak tersedia", {
        description: "Pemilik produk tidak memiliki nomor telepon terdaftar",
      });
      return;
    }

    // Clean and format the phone number
    let phoneNumber = ownerData?.phone_numbers.replace(/\D/g, '');
    
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('+62')) {
      phoneNumber = phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }

    const message = `Halo, saya tertarik dengan produk di toko `;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    toast.success("Membuka WhatsApp", {
      description: "Mengarahkan ke WhatsApp untuk menghubungi pemilik",
      className:"text-green-700",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ownerData?.businessName || 'Profile Toko',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link berhasil disalin!');
      } catch (err) {
        console.log('Failed to copy link');
      }
    }
  };

  // Convert UTC hours to WIB (UTC+7 means we subtract 7 from UTC to get local WIB time)
  const formatHour = (hour: number): string => {
    if (hour === 0) return '00:00';
    
    const hours = Math.floor(hour);
    const minutes = Math.floor((hour - hours) * 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get day names in Indonesian
  const getDayName = (dayIndex: number): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex];
  };

  // Define the slot type
  interface TimeSlot {
    from: number;
    to: number;
  }

  // Get today's operational hours
  const getTodayOperationalHours = (): string => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todaySlot = weeklySlots[today.toString()] as TimeSlot;
    
    if (!todaySlot || (todaySlot.from === 0 && todaySlot.to === 0)) {
      return 'Tutup';
    }
    
    const fromTime = formatHour(todaySlot.from);
    const toTime = formatHour(todaySlot.to);
    
    return `${fromTime} - ${toTime}`;
  };

  // Get all weekly hours for the popup
  const getAllWeeklyHours = () => {
    return Object.entries(weeklySlots).map(([dayIndex, slot]) => {
      const timeSlot = slot as TimeSlot;
      return {
        day: getDayName(parseInt(dayIndex)),
        hours: (timeSlot.from === 0 && timeSlot.to === 0) 
          ? 'Tutup' 
          : `${formatHour(timeSlot.from)} - ${formatHour(timeSlot.to)}`,
        isToday: parseInt(dayIndex) === new Date().getDay()
      };
    });
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        const priceA = Math.min(...(a.VariantProducts?.map(v => v.price) || [0]));
        const priceB = Math.min(...(b.VariantProducts?.map(v => v.price) || [0]));
        return priceA - priceB;
      case 'price-high':
        const maxPriceA = Math.max(...(a.VariantProducts?.map(v => v.price) || [0]));
        const maxPriceB = Math.max(...(b.VariantProducts?.map(v => v.price) || [0]));
        return maxPriceB - maxPriceA;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                  <Skeleton className="h-3 sm:h-4 w-40 sm:w-64" />
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
                <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
                <Skeleton className="h-8 sm:h-10 w-8 sm:w-10" />
              </div>
            </div>
            <div className="mt-4 sm:mt-6 space-y-2">
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
              <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 text-center w-full max-w-md">
          <p className="text-red-600 mb-4 text-sm sm:text-base">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm sm:text-base">Toko tidak ditemukan</p>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Profile Card - Matches your image layout */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-none sm:rounded-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Desktop Layout - Horizontal Section */}
          <div className="flex flex-col sm:flex-row items-start justify-between">
            {/* Left Column - Profile Info */}
            <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex-shrink-0">
                <AvatarImage src={ownerData?.imageUrl} alt={ownerData?.businessName} />
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold">
                  {ownerData?.businessName?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1 truncate">
                  {ownerData?.businessName || 'Nama Toko'}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm flex items-start">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {ownerData?.businessAddress || 'Alamat tidak tersedia'}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column - Stats (Matches your image) */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-4 sm:mt-0">
              <div className="flex items-center space-x-4 sm:space-x-6">
                {/* Total Products */}
                <div className="text-center">
                  <div className="font-bold text-foreground text-sm sm:text-base">
                    {products.length}
                  </div>
                  <span className="text-xs text-muted-foreground">Total Produk</span>
                </div>
                
                {/* Operational Hours */}
                <div className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto flex flex-col items-center hover:bg-transparent">
                        <div className="font-bold text-foreground text-sm sm:text-base flex items-center">
                          <span className="max-w-20 sm:max-w-none truncate">
                            {getTodayOperationalHours()}
                          </span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 flex-shrink-0" />
                        </div>
                        <span className="text-xs text-muted-foreground">Jam Operasional</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
                      <DialogHeader>
                        <DialogTitle className="flex items-center text-base sm:text-lg">
                          Jam Operasional Mingguan
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 sm:space-y-3">
                        {getAllWeeklyHours().map((item, index) => (
                          <div 
                            key={index} 
                            className={`flex justify-between items-center p-2 sm:p-3 rounded-lg ${
                              item.isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                            }`}
                          >
                            <span className={`font-medium text-sm sm:text-base ${item.isToday ? 'text-primary-700' : 'text-foreground'}`}>
                              {item.day}
                              {item.isToday && <span className="text-xs ml-1 sm:ml-2 text-primary-600">(Hari Ini)</span>}
                            </span>
                            <span className={`text-sm sm:text-base ${item.isToday ? 'text-primary-700 font-semibold' : 'text-muted-foreground'}`}>
                              {item.hours}
                            </span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {/* Share Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="ml-4 w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons - Bottom Row */}
          <div className="flex flex-row gap-2 mt-4">
            <Button
              onClick={handleJadwalkanFitting}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm px-3 py-2 h-10"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Jadwalkan Fitting
            </Button>
            
            <Button
              variant="outline" 
              onClick={handleChatPenjual}
              className="flex-1 border-primary-500 text-primary-500 hover:bg-primary-50 text-xs sm:text-sm px-3 py-2 h-10"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Chat Penjual
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Semua Produk</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="price-low">Harga Terendah</SelectItem>
              <SelectItem value="price-high">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {products.length === 0 ? (
          <Card className="py-8 sm:py-12">
            <CardContent className="text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Belum ada produk tersedia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfilePage;