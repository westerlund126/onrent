'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const FittingSchedulePage = () => {
  // Props that would come from routing/API - mock for now
  const [pageType] = useState('product'); // 'product' or 'owner'
  const [productId] = useState(1); // from URL params
  const [ownerId] = useState(1); // from URL params or product data
  
  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isPhoneNumberUpdated, setIsPhoneNumberUpdated] = useState(false);

  // Mock current user data (would come from auth/context)
  const currentUser = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    phone_numbers: null, // User hasn't filled phone number yet
    email: "john.doe@email.com"
  };

  // Mock owner data
  const ownerData = {
    id: 1,
    businessName: "Kebaya Elegant Surabaya",
    businessAddress: "Jl. Raya Darmo No. 123, Surabaya, Jawa Timur 60264",
    phone_numbers: "+62 812-3456-7890",
    email: "info@kebayaelegant.com",
    imageUrl: "/api/placeholder/120/120"
  };

  // Mock product data (only shown when pageType is 'product')
  const productData = {
    id: 1,
    name: "Kebaya Brokat Mewah",
    images: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
    variant: "Premium",
    color: "Merah Marun",
    size: "M",
    price: "Rp 450.000",
    description: "Kebaya brokat dengan detail bordir emas yang elegan"
  };

  // Mock fitting slots data - this would come from API based on ownerId
  const fittingSlots = [
    {
      id: 1,
      ownerId: 1,
      dateTime: "2025-06-10T09:00:00",
      endTime: "2025-06-10T17:00:00",
      isAutoConfirm: true,
      isBooked: false
    },
    {
      id: 2,
      ownerId: 1,
      dateTime: "2025-06-11T10:00:00",
      endTime: "2025-06-11T16:00:00",
      isAutoConfirm: false,
      isBooked: false
    },
    {
      id: 3,
      ownerId: 1,
      dateTime: "2025-06-12T08:00:00",
      endTime: "2025-06-12T18:00:00",
      isAutoConfirm: true,
      isBooked: false
    },
    {
      id: 4,
      ownerId: 1,
      dateTime: "2025-06-15T09:00:00",
      endTime: "2025-06-15T15:00:00",
      isAutoConfirm: false,
      isBooked: true // This slot is booked
    }
  ];

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser.first_name && currentUser.last_name) {
      setCustomerName(`${currentUser.first_name} ${currentUser.last_name}`);
    }
    if (currentUser.phone_numbers) {
      setPhoneNumber(currentUser.phone_numbers);
    }
  }, []);

  // Get available dates from fitting slots
  const getAvailableDates = () => {
    return fittingSlots
      .filter(slot => !slot.isBooked)
      .map(slot => {
        const date = new Date(slot.dateTime);
        return {
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          slot: slot
        };
      })
      .filter((date, index, self) => 
        index === self.findIndex(d => d.value === date.value)
      );
  };

  // Get available times for selected date
  const getAvailableTimesForDate = (selectedDate) => {
    if (!selectedDate) return [];
    
    const slotsForDate = fittingSlots.filter(slot => {
      const slotDate = new Date(slot.dateTime).toISOString().split('T')[0];
      return slotDate === selectedDate && !slot.isBooked;
    });

    const timeSlots = [];
    slotsForDate.forEach(slot => {
      const startTime = new Date(slot.dateTime);
      const endTime = new Date(slot.endTime);
      
      // Generate hourly slots between start and end time
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        timeSlots.push({
          value: currentTime.toTimeString().slice(0, 5),
          label: `${currentTime.toTimeString().slice(0, 5)} WIB`,
          isAutoConfirm: slot.isAutoConfirm,
          slotId: slot.id
        });
        currentTime.setHours(currentTime.getHours() + 1);
      }
    });

    return timeSlots;
  };

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
    if (!currentUser.phone_numbers && value.trim() !== '') {
      setIsPhoneNumberUpdated(true);
    }
  };

  const handleSubmit = async () => {
    try {
      // If phone number was updated and user didn't have one before, save it
      if (isPhoneNumberUpdated) {
        // TODO: API call to update user phone number
        console.log('Updating user phone number:', phoneNumber);
      }

      const fittingData = {
        userId: currentUser.id,
        ownerId: ownerId,
        customerName,
        phoneNumber,
        selectedDate,
        selectedTime,
        notes,
        productId: pageType === 'product' ? productId : null
      };

      console.log('Submitting fitting schedule:', fittingData);
      // TODO: Submit to API
      alert('Jadwal fitting berhasil dibuat!');
    } catch (error) {
      console.error('Error submitting fitting schedule:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimesForDate(selectedDate);
  const selectedTimeSlot = availableTimes.find(time => time.value === selectedTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
            Jadwalkan Fitting
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih waktu yang tepat untuk fitting pakaian Anda dan dapatkan hasil yang sempurna
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
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
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Nomor Telepon
                      {!currentUser.phone_numbers && (
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
                        onChange={(e) => handlePhoneNumberChange(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-primary-500"
                        required
                      />
                    </div>
                    {!currentUser.phone_numbers && phoneNumber && (
                      <p className="text-xs text-blue-600">
                        Nomor telepon akan disimpan untuk kemudahan booking selanjutnya
                      </p>
                    )}
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                      Pilih Tanggal
                    </Label>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-primary-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Pilih tanggal fitting" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableDates.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{date.label}</span>
                              {date.slot.isAutoConfirm && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Auto Konfirmasi
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-semibold text-gray-700">
                      Pilih Waktu
                    </Label>
                    <Select 
                      value={selectedTime} 
                      onValueChange={setSelectedTime}
                      disabled={!selectedDate}
                    >
                      <SelectTrigger className="h-12 border-gray-200 focus:border-primary-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Pilih waktu fitting" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{time.label}</span>
                              {time.isAutoConfirm && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Auto Konfirmasi
                                </Badge>
                              )}
                            </div>
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
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                      Catatan Khusus (Opsional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan khusus untuk fitting Anda (contoh: ukuran khusus, preferensi waktu, dll)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-gray-200 focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* Confirmation Status */}
                  {selectedTimeSlot && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2">
                        {selectedTimeSlot.isAutoConfirm ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-primary-500">
                              Jadwal akan otomatis dikonfirmasi
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-sm font-medium text-primary-500">
                              Jadwal memerlukan konfirmasi dari penyedia
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmit}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!customerName || !phoneNumber || !selectedDate || !selectedTime}
                  >
                    Konfirmasi Jadwal Fitting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Owner Details */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Detail Penyedia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={ownerData.imageUrl}
                      alt={ownerData.businessName}
                      className="w-20 h-20 rounded-xl object-cover shadow-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {ownerData.businessName}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{ownerData.businessAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{ownerData.phone_numbers}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{ownerData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details - Only show when pageType is 'product' */}
            {pageType === 'product' && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Detail Produk
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Product Images */}
                    <div className="grid grid-cols-2 gap-3">
                      {productData.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${productData.name} ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg shadow-sm"
                        />
                      ))}
                    </div>
                    
                    {/* Product Info */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {productData.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {productData.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-700">Varian:</span>
                          <p className="text-gray-600">{productData.variant}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-700">Warna:</span>
                          <p className="text-gray-600">{productData.color}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-700">Ukuran:</span>
                          <p className="text-gray-600">{productData.size}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-gray-700">Harga:</span>
                          <p className="text-blue-600 font-bold text-base">{productData.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fitting Guidelines */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="text-lg">Panduan Fitting</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    "Datang tepat waktu sesuai jadwal yang dipilih",
                    "Kenakan pakaian yang mudah diganti",
                    "Bawa perlengkapan tambahan jika diperlukan",
                    "Fitting berlangsung sekitar 30-45 menit",
                    "Hubungi penyedia jika ada perubahan jadwal"
                  ].map((guideline, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
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