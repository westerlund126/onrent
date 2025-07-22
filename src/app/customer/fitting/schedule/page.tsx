'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useFittingFormStore } from 'stores';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from 'utils/product';
import Image from 'next/image';
import { SingleDatePicker } from 'components/date-time-range-picker/single-date-picker';
import { parse } from 'date-fns';
import { toZonedTime, format} from 'date-fns-tz';
import { id } from 'date-fns/locale'; 
import ImageUpload from 'components/image-upload/image-upload';

const timeZone = 'Asia/Jakarta';

const FittingSchedulePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded: isUserLoaded } = useUser();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const {
    pageType,
    ownerData,
    productData,
    formData,
    availableSlots,
    selectedSlot,
    isPhoneNumberUpdated,
    isSubmitting,
    loadingStates,
    error,
    setPageContext,
    fetchCurrentUserData,
    fetchOwnerData,
    fetchProductData,
    fetchAvailableSlots,
    updateFormField,
    toggleVariant,
    setSelectedSlot,
    submitFittingSchedule,
    setError,
    reset,
  } = useFittingFormStore();

  useEffect(() => {
    const type = (searchParams.get('type') as 'owner' | 'product') || 'owner';
    const productId = searchParams.get('productId');
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      toast.error('Parameter owner ID tidak ditemukan.');
      router.push('/customer/catalog');
      return;
    }
    if (type === 'product' && !productId) {
      toast.error('Parameter product ID tidak ditemukan.');
      router.push('/customer/catalog');
      return;
    }

    setPageContext(type, productId, ownerId);

    if (ownerId) {
      fetchOwnerData(ownerId);
      fetchAvailableSlots(ownerId);
    }
    if (productId) {
      fetchProductData(productId);
    }
    if (isUserLoaded) {
      fetchCurrentUserData();
    }

    return () => {
      reset();
    };
  }, [
    searchParams,
    isUserLoaded,
    router,
    setPageContext,
    fetchOwnerData,
    fetchAvailableSlots,
    fetchProductData,
    fetchCurrentUserData,
    reset,
  ]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null); 
    }
  }, [error, setError]);

  const availableDates = useMemo(() => {
    console.log("🔄 2. Processing 'availableDates'...");
  const dateMap = new Map();
  availableSlots.forEach((slot) => {
    const zonedDate = toZonedTime(slot.dateTime, timeZone);

    const dateKey = format(zonedDate, 'yyyy-MM-dd');
    
    if (!dateMap.has(dateKey)) {
      const label = format(zonedDate, 'eeee, d MMMM yyyy', { 
        locale: id, 
        timeZone 
      });

      dateMap.set(dateKey, {
        value: dateKey,
        label: label,
        slots: [],
        date: zonedDate,
      });
    }
    dateMap.get(dateKey).slots.push(slot);
  });
  return Array.from(dateMap.values()).sort((a, b) => a.value.localeCompare(b.value));
  
}, [availableSlots]);



const getDateFromString = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

const availableDateStrings = useMemo(() => {
  return availableDates.map(date => date.value);
}, [availableDates]);
const parseSlot = (slot: any): any => {
	try {
	  const isBooked = !!slot.fittingSchedule;
	  console.log(
		`🎯 Slot ${slot.id}: dateTime=${slot.dateTime}, isBooked=${isBooked}`,
	  );
	  let dateTime: Date;
	  if (typeof slot.dateTime === 'string') {
		const cleanDateString = slot.dateTime.replace('Z', '');
		dateTime = new Date(cleanDateString);
	  } else {
		dateTime = new Date(slot.dateTime);
	  }
	  return { ...slot, dateTime, isBooked };
	} catch (error) {
	  console.error('Failed to parse slot date:', slot.dateTime, error);
	  return {
		...slot,
		dateTime: new Date(),
		isBooked: !!slot.fittingSchedule,
	  };
	}
};
const availableTimes = useMemo(() => {
  const selectedDateString = formData.selectedDate;
  console.log(`🔄 3. Finding available times for date: "${selectedDateString}"`);
  if (!selectedDateString) return [];
  
  const dateData = availableDates.find((date) => date.value === selectedDateString);
  if (!dateData) return [];
  
  return dateData.slots
  .map((slot) => {
	const parsedSlot = parseSlot(slot);
	const dateTime = parsedSlot.dateTime ? new Date(parsedSlot.dateTime) : new Date();
    const timeString = format(dateTime, 'HH:mm');

    const label = format(dateTime, 'HH:mm');

    return {
      value: timeString,
      label: label,
      slot: slot,
    };
  })
  .sort((a, b) => a.value.localeCompare(b.value));
}, [formData.selectedDate, availableDates]);

  const availableVariants = useMemo(() => {
    if (!productData || !productData.VariantProducts) return [];
    return productData.VariantProducts.filter(
      (variant) => variant.isAvailable && !variant.isRented,
    );
  }, [productData]);


 const handleDateChange = (date: Date | undefined) => {
  const dateString = date ? format(date, 'yyyy-MM-dd') : '';
  updateFormField('selectedDate', dateString);
  updateFormField('selectedTime', ''); 
  setSelectedSlot(null);
};

  const handleTimeChange = (timeValue: string) => {
    updateFormField('selectedTime', timeValue);
    const timeSlot = availableTimes.find((time) => time.value === timeValue);
    if (timeSlot) {
      setSelectedSlot(timeSlot.slot);
    }
  };

  const handleImageUpload = (url: string) => {
    updateFormField('tfProofUrl', url);
  };

  const handleImageRemove = (url: string) => {
    updateFormField('tfProofUrl', '');
  };

  const handleSubmit = async () => {
    if (!formData.customerName.trim()) {
      toast.error('Nama lengkap harus diisi');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error('Nomor telepon harus diisi');
      return;
    }
    if (pageType === 'product' && formData.selectedVariants.length === 0) {
      toast.error('Pilih minimal satu varian produk untuk fitting');
      return;
    }

    const success = await submitFittingSchedule();

    if (success) {
      toast.success('Jadwal fitting berhasil dibuat!');
      router.push('/customer/activities');
    }
  };

  // --- Loading State ---
  const isLoading = 
    loadingStates.owner || 
    loadingStates.product || 
    loadingStates.slots || 
    loadingStates.userData;

  if (!isUserLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="text-lg text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  // --- Render JSX ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-transparent mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-4xl font-bold">
            Jadwalkan Fitting
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Pilih waktu yang tepat untuk fitting pakaian Anda dan dapatkan hasil yang sempurna
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left Side - Form */}
          <div className="space-y-6 lg:col-span-3">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calendar className="h-6 w-6" />
                  Detail Fitting
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Customer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Nama Lengkap *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={formData.customerName}
                        onChange={(e) => updateFormField('customerName', e.target.value)}
                        className="h-12 border-gray-200 pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Nomor Telepon *
                      {isPhoneNumberUpdated && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Akan disimpan otomatis
                        </Badge>
                      )}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Contoh: 08123456789"
                        value={formData.phoneNumber}
                        onChange={(e) => updateFormField('phoneNumber', e.target.value)}
                        className="h-12 border-gray-200 pl-10"
                        required
                      />
                    </div>
                     {isPhoneNumberUpdated && formData.phoneNumber && (
                       <p className="text-xs text-blue-600">
                         Nomor telepon akan disimpan untuk kemudahan booking selanjutnya
                       </p>
                     )}
                  </div>
                  
                  {/* Variant Selection */}
                  {pageType === 'product' && availableVariants.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Pilih Varian Produk *
                      </Label>
                      <div className="grid max-h-60 grid-cols-1 gap-3 overflow-y-auto rounded-lg border bg-gray-50 p-2">
                        {availableVariants.map((variant) => (
                          <div
                            key={variant.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-all ${
                              formData.selectedVariants.includes(variant.id)
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 bg-white hover:border-amber-300'
                            }`}
                            onClick={() => toggleVariant(variant.id)}
                          >
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div
                                   className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                     formData.selectedVariants.includes(variant.id)
                                       ? 'border-amber-500 bg-amber-500'
                                       : 'border-gray-300'
                                   }`}
                                 >
                                   {formData.selectedVariants.includes(variant.id) && (
                                     <CheckCircle className="h-3 w-3 text-white" />
                                   )}
                                 </div>
                                 <div>
                                   <span className="font-medium text-gray-900">
                                     {variant.color} - {variant.size}
                                   </span>
                                 </div>
                               </div>
                               <span className="font-semibold text-amber-600">
                                 {formatCurrency(variant.price)}
                               </span>
                             </div>
                          </div>
                        ))}
                      </div>
                       {formData.selectedVariants.length > 0 && (
                         <p className="text-xs text-green-600">
                           {formData.selectedVariants.length} varian dipilih untuk fitting
                         </p>
                       )}
                    </div>
                  )}

                  {/* Date Selection */}
                  <div className="space-y-2">
  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
    Pilih Tanggal *
  </Label>
  <SingleDatePicker
    value={getDateFromString(formData.selectedDate)}
    onSelect={handleDateChange}
    disabled={loadingStates.slots}
    placeholder={
      loadingStates.slots
        ? 'Memuat jadwal...'
        : 'Pilih tanggal fitting'
    }
    availableDates={availableDateStrings}
    className="w-full"
  />
  {availableDates.length === 0 && !loadingStates.slots && (
    <p className="text-sm text-amber-600">
      Tidak ada jadwal tersedia untuk saat ini
    </p>
  )}
</div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-semibold text-gray-700">
                      Pilih Waktu *
                    </Label>
                    <Select
                      value={formData.selectedTime}
                      onValueChange={handleTimeChange}
                      disabled={!formData.selectedDate || loadingStates.slots}
                    >
                      <SelectTrigger className="h-12 border-gray-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Pilih waktu fitting" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
  <SelectItem key={time.value} value={time.value}>
    {time.label}
  </SelectItem>
))}
                      </SelectContent>
                    </Select>
                    {formData.selectedDate && availableTimes.length === 0 && (
                       <p className="text-sm text-amber-600">
                         Tidak ada waktu tersedia untuk tanggal ini
                       </p>
                    )}
                  </div>

                  <div className="space-y-2">
                <Label htmlFor="transferProof" className="text-sm font-semibold text-gray-700">
                  Bukti Transfer
                </Label>
                <ImageUpload
                  onChange={handleImageUpload}
                  onRemove={handleImageRemove}
                  value={formData.tfProofUrl ? [formData.tfProofUrl] : []}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Unggah bukti transfer jika diperlukan oleh penyedia jasa.
                </p>
              </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                      Catatan Khusus (Opsional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan khusus..."
                      value={formData.notes}
                      onChange={(e) => updateFormField('notes', e.target.value)}
                      rows={3}
                      className="resize-none border-gray-200"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="h-12 w-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg transition-all"
                    disabled={!selectedSlot || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Membuat Jadwal...
                      </>
                    ) : (
                      'Konfirmasi Jadwal Fitting'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Side - Details (largely unchanged, just uses store data) */}
          <div className="space-y-6 lg:col-span-2">
             {/* Owner Details */}
             {ownerData && (
               <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                 <CardHeader className="rounded-t-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <User className="h-5 w-5" />
                     Detail Penyedia
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={ownerData.imageUrl || '/api/placeholder/120/120'}
                          alt={ownerData.businessName}
                          className="h-20 w-20 rounded-xl object-cover shadow-md"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-3 text-xl font-bold text-gray-900">
                          {ownerData.businessName}
                        </h3>
                        <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                          <span className="text-gray-700">
                            {ownerData.businessAddress}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {ownerData.phone_numbers}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {ownerData.email}
                          </span>
                        </div>
                        </div>
                      </div>
                    </div>
                 </CardContent>
               </Card>
             )}
            
             {/* Product Details */}
             {pageType === 'product' && productData && (
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                    <CardHeader className="rounded-t-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Detail Produk
                  </CardTitle>
                </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                       {productData.images && productData.images.length > 0 && (
  <div className="flex flex-col gap-4">
    {/* Main Image */}
    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
      <Image
        src={productData.images[selectedImageIndex]}
        width={300}
        height={300}
        alt={`${productData.name} main view`}
        className="h-full w-full object-cover"
      />
    </div>

    {/* Thumbnail Gallery */}
    {productData.images.length > 1 && (
      <div className="flex gap-2 overflow-x-auto py-1">
        {productData.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`shrink-0 rounded-lg border transition-all ${
              selectedImageIndex === index
                ? 'border-primary-500 ring-2 ring-primary-300'
                : 'border-gray-200 hover:border-primary-300'
            }`}
            aria-label={`View ${productData.name} image ${index + 1}`}
          >
            <Image
              src={image}
              width={80}
              height={80}
              alt={`${productData.name} thumbnail ${index + 1}`}
              className="h-20 w-20 object-cover"
            />
          </button>
        ))}
      </div>
    )}
  </div>
)}

                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {productData.name}
                      </h3>

                      {productData.description && (
                        <p className="text-sm text-gray-600">
                          {productData.description}
                        </p>
                      )}
                       {formData.selectedVariants.length > 0 && (
                         <div className="border-t pt-3">
                           <h4 className="mb-2 font-semibold text-gray-700">
                             Varian Dipilih ({formData.selectedVariants.length})
                           </h4>
                           <div className="space-y-2">
                             {formData.selectedVariants.map((variantId) => {
                               const variant = availableVariants.find((v) => v.id === variantId);
                               return variant ? (
                                <div key={variantId} className="flex items-center justify-between rounded border border-amber-200 bg-amber-50 p-2">
                                  <span className="text-sm font-medium">
                                      {variant.color} - {variant.size}
                                  </span>
                                  <span className="text-sm font-semibold text-amber-600">
                                      {formatCurrency(variant.price)}
                                  </span>
                                </div>
                               ) : null;
                             })}
                           </div>
                         </div>
                       )}
                       </div>
                       </div>
                    </CardContent>
                </Card>
             )}

            {/* Fitting Guidelines (unchanged) */}
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="text-lg">Panduan Fitting</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    'Datang tepat waktu sesuai jadwal yang dipilih',
                    'Kenakan pakaian yang mudah diganti',
                    'Bawa perlengkapan tambahan jika diperlukan',
                    'Fitting berlangsung sekitar 30-45 menit',
                    'Hubungi penyedia jika ada perubahan jadwal',
                  ].map((guideline, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"></div>
                      <span className="text-sm text-gray-700">{guideline}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FittingSchedulePage;