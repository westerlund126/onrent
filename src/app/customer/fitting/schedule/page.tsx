'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Loader2,
  Ruler,
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
import { toast } from 'sonner';
import { Product } from 'types/product';
import { formatCurrency } from 'utils/product';
import Image from 'next/image';

const showDelayedToast = (
  message: string,
  isError: boolean = true,
  delay: number = 500,
) => {
  setTimeout(() => {
    if (isError) {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }, delay);
};

const FittingSchedulePage = () => {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageType = searchParams.get('type') || 'owner';
  const productId = searchParams.get('productId');
  const ownerId = searchParams.get('ownerId');

  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isPhoneNumberUpdated, setIsPhoneNumberUpdated] = useState(false);

  const [selectedVariants, setSelectedVariants] = useState([]);

  const [ownerData, setOwnerData] = useState(null);
  const [productData, setProductData] = useState<Product | null>(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (!isLoaded || !user) return;

      setLoadingUserData(true);
      try {
        const response = await fetch(`/api/user/profile`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserData(userData);

          if (userData.first_name || userData.last_name) {
            const fullName = `${userData.first_name || ''} ${
              userData.last_name || ''
            }`.trim();
            setCustomerName(fullName);
          }

          if (userData.phone_numbers) {
            setPhoneNumber(userData.phone_numbers);
          }
        } else {
          showDelayedToast('Gagal memuat data profil pengguna');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showDelayedToast('Terjadi kesalahan saat memuat profil');
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchCurrentUserData();
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && user && !currentUserData && !loadingUserData) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      if (firstName || lastName) {
        setCustomerName(`${firstName} ${lastName}`.trim());
      }
    }
  }, [isLoaded, user, currentUserData, loadingUserData]);

  useEffect(() => {
    if (!ownerId) {
      showDelayedToast('Parameter owner ID tidak ditemukan');
      router.push('/customer/catalog');
      return;
    }

    if (pageType === 'product' && !productId) {
      showDelayedToast('Parameter product ID tidak ditemukan');
      router.push('/customer/catalog');
      return;
    }
  }, [ownerId, productId, pageType, router]);

  const fetchWithRetry = async (url: string, options = {}, retries = 2) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
    throw new Error(`Failed after ${retries} retries`);
  };

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!ownerId) return;

      setLoadingOwner(true);
      try {
        const data = await fetchWithRetry(`/api/fitting/owner/${ownerId}`);
        setOwnerData(data);
      } catch (error) {
        console.error('Error fetching owner data:', error);
        showDelayedToast('Gagal memuat data penyedia');
      } finally {
        setLoadingOwner(false);
      }
    };

    fetchOwnerData();
  }, [ownerId]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (pageType !== 'product' || !productId) return;

      setLoadingProduct(true);
      try {
        const data = await fetchWithRetry(`/api/products/${productId}`);
        setProductData(data);
      } catch (error) {
        console.error('Error fetching product data:', error);
        showDelayedToast('Gagal memuat data produk');
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductData();
  }, [pageType, productId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!ownerId) return;

      console.log('Fetching slots for ownerId:', ownerId);
      setLoadingSlots(true);

      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        const url = `/api/fitting/available-slots?ownerId=${ownerId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Received slots data:', data);
        console.log('Number of slots:', data.length);

        setAvailableSlots(data);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        showDelayedToast('Gagal memuat jadwal tersedia');
      } finally {
        setLoadingSlots(false);
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [ownerId]);

  const getAvailableDates = () => {
    console.log('Processing available slots:', availableSlots);

    const dateMap = new Map();

    availableSlots.forEach((slot) => {
      console.log('Processing slot:', slot);
      const date = new Date(slot.dateTime);
      const dateKey = date.toISOString().split('T')[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          value: dateKey,
          label: date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          slots: [],
        });
      }

      dateMap.get(dateKey).slots.push(slot);
    });

    const result = Array.from(dateMap.values()).sort((a, b) =>
      a.value.localeCompare(b.value),
    );
    console.log('Available dates processed:', result);
    return result;
  };

  const getAvailableTimesForDate = (selectedDate) => {
    if (!selectedDate) return [];

    const availableDates = getAvailableDates();
    const dateData = availableDates.find((date) => date.value === selectedDate);

    if (!dateData) return [];

    return dateData.slots
      .map((slot) => {
        const time = new Date(slot.dateTime);
        return {
          value: time.toTimeString().slice(0, 5),
          label: `${time.toTimeString().slice(0, 5)} WIB`,
          slot: slot,
        };
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
    const currentPhone = currentUserData?.phone_numbers;
    if (value.trim() !== '' && value !== currentPhone) {
      setIsPhoneNumberUpdated(true);
    } else {
      setIsPhoneNumberUpdated(false);
    }
  };

  const handleTimeChange = (timeValue) => {
    setSelectedTime(timeValue);

    const availableTimes = getAvailableTimesForDate(selectedDate);
    const timeSlot = availableTimes.find((time) => time.value === timeValue);
    if (timeSlot) {
      setSelectedSlot(timeSlot.slot);
    }
  };

  const handleVariantToggle = (variantId) => {
    setSelectedVariants((prev) => {
      if (prev.includes(variantId)) {
        return prev.filter((id) => id !== variantId);
      } else {
        return [...prev, variantId];
      }
    });
  };

  const getAvailableVariants = () => {
    if (!productData || !productData.VariantProducts) return [];

    return productData.VariantProducts.filter(
      (variant) => variant.isAvailable && !variant.isRented,
    );
  };

  const handleSubmit = async () => {
    if (!user || !selectedSlot) {
      toast.error('Data tidak lengkap');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Nama lengkap harus diisi');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Nomor telepon harus diisi');
      return;
    }

    if (pageType === 'product' && selectedVariants.length === 0) {
      toast.error('Pilih minimal satu varian produk untuk fitting');
      return;
    }

    setSubmitting(true);

    try {
      const fittingData = {
        fittingSlotId: selectedSlot.id,
        duration: 60,
        note: notes.trim() || null,
        phoneNumber: phoneNumber.trim(),
        customerName: customerName.trim(),
        variantIds: pageType === 'product' ? selectedVariants : [],
      };

      console.log('Sending fitting data:', fittingData);

      const response = await fetch('/api/fitting/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fittingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create fitting schedule');
      }

      const result = await response.json();
      console.log('Fitting schedule created:', result);

      toast.success('Jadwal fitting berhasil dibuat!');

      router.push('/customer/fitting/history');
    } catch (error) {
      console.error('Error submitting fitting schedule:', error);
      toast.error(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (
    !isLoaded ||
    loading ||
    loadingOwner ||
    (pageType === 'product' && loadingProduct)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="text-lg text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimesForDate(selectedDate);
  const availableVariants = getAvailableVariants();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-transparent mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-4xl font-bold">
            Jadwalkan Fitting
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Pilih waktu yang tepat untuk fitting pakaian Anda dan dapatkan hasil
            yang sempurna
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
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Nama Lengkap *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-12 border-gray-200 pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-gray-700"
                    >
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
                        value={phoneNumber}
                        onChange={(e) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                        className="h-12 border-gray-200 pl-10"
                        required
                      />
                    </div>
                    {isPhoneNumberUpdated && phoneNumber && (
                      <p className="text-xs text-blue-600">
                        Nomor telepon akan disimpan untuk kemudahan booking
                        selanjutnya
                      </p>
                    )}
                  </div>

                  {/* NEW: Variant Selection - Only show for product bookings */}
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
                              selectedVariants.includes(variant.id)
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 bg-white hover:border-amber-300'
                            }`}
                            onClick={() => handleVariantToggle(variant.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                    selectedVariants.includes(variant.id)
                                      ? 'border-amber-500 bg-amber-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedVariants.includes(variant.id) && (
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
                      {selectedVariants.length > 0 && (
                        <p className="text-xs text-green-600">
                          {selectedVariants.length} varian dipilih untuk fitting
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Pilih Tanggal *
                    </Label>
                    <Select
                      value={selectedDate}
                      onValueChange={setSelectedDate}
                      disabled={loadingSlots}
                    >
                      <SelectTrigger className="h-12 border-gray-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <SelectValue
                            placeholder={
                              loadingSlots
                                ? 'Memuat jadwal...'
                                : 'Pilih tanggal fitting'
                            }
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableDates.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            {date.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableDates.length === 0 && !loadingSlots && (
                      <p className="text-sm text-amber-600">
                        Tidak ada jadwal tersedia untuk saat ini
                      </p>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="time"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Pilih Waktu *
                    </Label>
                    <Select
                      value={selectedTime}
                      onValueChange={handleTimeChange}
                      disabled={!selectedDate || loadingSlots}
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
                    {selectedDate && availableTimes.length === 0 && (
                      <p className="text-sm text-amber-600">
                        Tidak ada waktu tersedia untuk tanggal ini
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="notes"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Catatan Khusus (Opsional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan khusus untuk fitting Anda (contoh: ukuran khusus, preferensi waktu, dll)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="resize-none border-gray-200"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="h-12 w-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
                    disabled={
                      !customerName.trim() ||
                      !phoneNumber.trim() ||
                      !selectedDate ||
                      !selectedTime ||
                      (pageType === 'product' &&
                        selectedVariants.length === 0) ||
                      submitting
                    }
                  >
                    {submitting ? (
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

          {/* Right Side - Details */}
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

            {/* Product Details - Only show when pageType is 'product' */}
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
                      <div className="grid grid-cols-2 gap-3">
                        {productData.images.slice(0, 2).map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            width={200}
                            height={400}
                            alt={`${productData.name} ${index + 1}`}
                            className="h-full w-full rounded-lg object-cover shadow-sm"
                          />
                        ))}
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

                      {/* Show selected variants summary */}
                      {selectedVariants.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="mb-2 font-semibold text-gray-700">
                            Varian Dipilih ({selectedVariants.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedVariants.map((variantId) => {
                              const variant = availableVariants.find(
                                (v) => v.id === variantId,
                              );
                              return variant ? (
                                <div
                                  key={variantId}
                                  className="flex items-center justify-between rounded border border-amber-200 bg-amber-50 p-2"
                                >
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

            {/* Fitting Guidelines */}
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
