'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Store,
  User,
  Camera,
  Star,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';
import { useUserStore } from 'stores/useUserStore';
import { useWorkingHoursStore } from 'stores/useWorkingHoursStore';

const OwnerBusinessProfile = () => {
  const { user, fetchUser, updateBusinessProfile, isLoading } = useUserStore();
  const { workingHours } = useWorkingHoursStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: '',
    businessAddress: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    username: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        email: user.email || '',
        phone: user.phone_numbers || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        imageUrl: user.imageUrl || '',
        description: user.description || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        username: profileData.username,
        businessName: profileData.businessName,
        businessAddress: profileData.businessAddress,
        description: profileData.description,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        email: user.email || '',
        phone: user.phone_numbers || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        imageUrl: user.imageUrl || '',
        description: user.description || '',
      });
    }
    setIsEditing(false);
  };

  const formatTime = (hour: number) => hour.toString().padStart(2, '0') + ':00';

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const categories = [
    'KEBAYA',
    'PAKAIAN_ADAT',
    'GAUN_PENGANTIN',
    'JARIK',
    'SELOP',
    'BESKAP',
    'SELENDANG',
  ];

  const stats = [
    {
      label: 'Total Produk',
      value: '156',
      icon: Store,
      color: 'from-violet-600 to-indigo-600',
    },
    {
      label: 'Rental Aktif',
      value: '23',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      label: 'Total Pelanggan',
      value: '342',
      icon: Users,
      color: 'from-orange-600 to-red-600',
    },
    {
      label: 'Fitting Terjadwal',
      value: '8',
      icon: Calendar,
      color: 'from-pink-600 to-rose-600',
    },
  ];

  return (
    <div className="from-slate-50 min-h-screen bg-gradient-to-br to-gray-100">
      <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
        {/* TOP ROW: Main Profile | Business Info */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Main Profile Card */}
          <Card className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
            <div className="from-black/20 to-transparent absolute inset-0 bg-gradient-to-t" />
            <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full bg-pink-300/20 blur-lg" />

            <CardContent className="relative z-10 p-6 text-white lg:p-8">
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="group relative">
                  <Avatar className="relative h-24 w-24 border-4 border-white/30 shadow-2xl ring-4 ring-white/20 lg:h-28 lg:w-28">
                    <AvatarImage src={profileData.imageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white lg:text-3xl">
                      {profileData.businessName?.charAt(0) || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-orange-500 p-0 shadow-lg lg:h-10 lg:w-10"
                    >
                      <Camera className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  )}
                </div>

                <div className="w-full space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={profileData.businessName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            businessName: e.target.value,
                          })
                        }
                        className="border-white/30 bg-white/20 text-center text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                        placeholder="Nama Bisnis"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
                          className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                          placeholder="Nama Depan"
                        />
                        <Input
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
                          className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                          placeholder="Nama Belakang"
                        />
                      </div>
                      <Input
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                        placeholder="Username"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold lg:text-3xl">
                        {profileData.businessName}
                      </h1>
                      <p className="text-lg">
                        {profileData.firstName} {profileData.lastName}
                      </p>
                      <p className="flex items-center justify-center gap-2 text-white/70">
                        @{profileData.username}
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-yellow-400">4.9</span>
                      </p>
                    </>
                  )}
                </div>

                <div className="flex w-full space-x-3">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full border border-white/30 bg-white/20 text-white hover:bg-white/30"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        className="from-emerald-500 hover:from-emerald-600 w-full bg-gradient-to-r to-teal-500 text-white hover:to-teal-600"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </Button>
                      <Button
                        onClick={handleCancel}
                        className="w-full border border-white/30 bg-white/20 text-white hover:bg-white/30"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Batal
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information Card */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <div className="mr-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
                  <User className="h-5 w-5 text-white" />
                </div>
                Informasi Bisnis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="group flex items-start space-x-4 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50">
                  <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 p-2">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-sm font-semibold text-gray-800">
                      Alamat Bisnis
                    </p>
                    {isEditing ? (
                      <Textarea
                        value={profileData.businessAddress}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            businessAddress: e.target.value,
                          })
                        }
                        placeholder="Alamat lengkap bisnis..."
                        className="border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={2}
                      />
                    ) : (
                      <p className="break-words text-sm leading-relaxed text-gray-600">
                        {profileData.businessAddress}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="group flex items-center space-x-4 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50">
                    <div className="to-emerald-500 flex-shrink-0 rounded-lg bg-gradient-to-br from-green-500 p-2">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-sm font-semibold text-gray-800">
                        Nomor Telepon
                      </p>
                      {isEditing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Nomor telepon"
                          className="border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="break-all text-sm text-gray-600">
                          {profileData.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="group flex items-center space-x-4 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50">
                    <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-sm font-semibold text-gray-800">
                        Email
                      </p>
                      {isEditing ? (
                        <Input
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Email bisnis"
                          className="border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                          type="email"
                        />
                      ) : (
                        <p className="break-all text-sm text-gray-600">
                          {profileData.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Description */}
              <div className="space-y-3">
                <h3 className="border-b border-gray-200 pb-2 text-base font-bold text-gray-800">
                  Deskripsi Bisnis
                </h3>
                <div className="rounded-xl bg-gray-50 p-4">
                  {isEditing ? (
                    <Textarea
                      value={profileData.description}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ceritakan tentang bisnis Anda..."
                      className="min-h-24 border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-gray-700">
                      {profileData.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM ROW: Working Hours | Categories | Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Working Hours Card */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <div className="mr-3 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-2">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Jam Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {Object.entries(workingHours).map(([dayIndex, range]) => (
                  <div
                    key={dayIndex}
                    className="group flex items-center justify-between rounded-xl p-3 transition-all duration-300 hover:bg-gray-50"
                  >
                    <span className="w-20 font-medium text-gray-700">
                      {days[+dayIndex]}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          range.from === 0 && range.to === 0
                            ? 'bg-red-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${
                          range.from === 0 && range.to === 0
                            ? 'to-rose-500 bg-gradient-to-r from-red-500'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                      >
                        {range.from === 0 && range.to === 0
                          ? 'Tutup'
                          : `${formatTime(range.from)} - ${formatTime(
                              range.to,
                            )}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories Card */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <div className="mr-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2">
                  <Store className="h-4 w-4 text-white" />
                </div>
                Kategori Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="cursor-default rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    {category.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Stats */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800">
                Statistik Bisnis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br p-4 shadow-md transition-all duration-500 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`}
                    />
                    <div className="absolute right-2 top-2 opacity-10">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="relative z-10">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-white/90">
                        {stat.label}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerBusinessProfile;
