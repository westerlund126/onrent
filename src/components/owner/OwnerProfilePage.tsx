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
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Toko tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Profile Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Avatar */}
              <Avatar className="w-24 h-24 rounded-2xl">
                <AvatarImage src={ownerData.imageUrl} alt={ownerData.businessName} />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white text-xl font-bold">
                  {ownerData.businessName?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
              
              {/* Business Info */}
              <div>
                <h1 className="text-xl font-semibold text-foreground mb-1">
                  {ownerData.businessName || 'Nama Toko'}
                </h1>
                <p className="text-muted-foreground text-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {ownerData.businessAddress || 'Alamat tidak tersedia'}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                  <Button
                    onClick={handleJadwalkanFitting}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Jadwalkan Fitting
                  </Button>
                  
                  <Button
                    variant="outline" 
                    onClick={handleChatPenjual}
                    className="border-primary-500 text-primary-500 hover:bg-primary-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Penjual
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats - Right Side */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-center">
                  <div className="font-bold text-foreground text-lg pb-2">
                    {products.length}
                  </div>
                  <span className="text-sm text-muted-foreground">Total Produk</span>
                </div>    
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto flex flex-col items-center hover:bg-transparent">
                        <div className="font-bold text-foreground text-lg flex items-center">
                          {getTodayOperationalHours()}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                        <span className="text-sm text-muted-foreground">Jam Operasional</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Jam Operasional Mingguan
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        {getAllWeeklyHours().map((item, index) => (
                          <div 
                            key={index} 
                            className={`flex justify-between items-center p-3 rounded-lg ${
                              item.isToday ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                            }`}
                          >
                            <span className={`font-medium ${item.isToday ? 'text-primary-700' : 'text-foreground'}`}>
                              {item.day}
                              {item.isToday && <span className="text-xs ml-2 text-primary-600">(Hari Ini)</span>}
                            </span>
                            <span className={`${item.isToday ? 'text-primary-700 font-semibold' : 'text-muted-foreground'}`}>
                              {item.hours}
                            </span>
                          </div>
                        ))}
                      </div>

                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Semua Produk</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
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
          <Card className="py-12">
            <CardContent className="text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada produk tersedia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
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