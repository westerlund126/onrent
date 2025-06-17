'use client';

import { Share2, MessageCircle, Calendar, MapPin, Phone, Mail, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ProductCard from 'components/card/ProductCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const OwnerProfilePage = ({ ownerId }) => {
  const router = useRouter();
  const [ownerData, setOwnerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [weeklySlots, setWeeklySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

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
          setWeeklySlots(slotsData);
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
    let phoneNumber = ownerData?.phone_numbers.replace(/\D/g, ''); // Remove non-digit characters
    
    // Convert to WhatsApp format (62xxxxxxxxxx)
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('+62')) {
      phoneNumber = phoneNumber.substring(1); // Remove the '+'
    } else if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }

    const message = `Halo, saya tertarik dengan produk di toko `;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    console.log("WhatsApp URL:", url);
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
        // You might want to show a toast here
        alert('Link berhasil disalin!');
      } catch (err) {
        console.log('Failed to copy link');
      }
    }
  };

  const formatOperationalHours = (slots) => {
    if (!slots || slots.length === 0) return 'Tidak tersedia';
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const enabledSlots = slots.filter(slot => slot.isEnabled);
    
    if (enabledSlots.length === 0) return 'Tutup';
    
    // Find the most common operating hours
    const timeRanges = enabledSlots.map(slot => `${slot.startTime} - ${slot.endTime}`);
    const mostCommonTime = timeRanges.reduce((a, b, i, arr) =>
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
    
    return mostCommonTime;
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
    default: // newest
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
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
      {/* <div className="bg-white border-b"> */}
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

            {/* Stats */}
            <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                <div className="font-bold text-foreground text-center text-lg">
                  {products.length}
                </div>
                <span className="text-sm text-muted-foreground">Total Produk</span>
                </div>    
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  <div className="font-bold text-foreground text-center text-lg">
                    {formatOperationalHours(weeklySlots)}
                  </div>
                  <span className="text-muted-foreground">Jam Operasional Toko</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </Card>
      {/* </div> */}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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