'use client';

import React, { useState } from 'react';
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

const OwnerBusinessProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: 'Elegant Traditional Wear',
    businessAddress: 'Jl. Malioboro No. 123, Yogyakarta 55271',
    email: 'contact@eleganttradional.com',
    phone: '+62 812-3456-7890',
    firstName: 'Sari',
    lastName: 'Ningrum',
    username: 'sari_elegantstore',
    description:
      'Spesialis penyewaan pakaian tradisional Indonesia untuk berbagai acara istimewa. Kami menyediakan kebaya, pakaian adat, gaun pengantin, dan aksesoris tradisional dengan kualitas terbaik.',
    imageUrl: '/api/placeholder/150/150',
  });

  const workingHours = [
    { day: 'Senin', hours: '11.00-21.00' },
    { day: 'Selasa', hours: '11.00-21.00' },
    { day: 'Rabu', hours: '11.00-21.00' },
    { day: 'Kamis', hours: '11.00-21.00' },
    { day: 'Jumat', hours: '15.00-21.00' },
    { day: 'Sabtu', hours: '11.00-21.00' },
    { day: 'Minggu', hours: '11.00-21.00' },
  ];

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

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="from-slate-50 to-slate-100 min-h-screen bg-gradient-to-br via-white">
      {/* Hero Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-purple-900/5 to-pink-900/5" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-6">
        {/* Header with floating cards */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main Profile Card */}
          <div className="xl:col-span-5">
            <Card className="relative overflow-hidden border-0 bg-white/80 shadow-2xl backdrop-blur-xl">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
              <div className="from-black/20 to-transparent absolute inset-0 bg-gradient-to-t" />

              {/* Floating orbs for visual interest */}
              <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
              <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full bg-pink-300/20 blur-lg" />

              <CardContent className="relative z-10 p-8 text-white">
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="group relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 opacity-75 blur transition duration-1000 group-hover:opacity-100" />
                    <Avatar className="relative h-28 w-28 border-4 border-white/30 shadow-2xl ring-4 ring-white/20">
                      <AvatarImage
                        src={profileData.imageUrl}
                        alt="Business Profile"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white">
                        {profileData.businessName?.charAt(0) || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-orange-500 p-0 shadow-lg transition-all duration-300 hover:scale-110 hover:from-pink-600 hover:to-orange-600"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="w-full space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <Input
                          value={profileData.businessName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              businessName: e.target.value,
                            })
                          }
                          className="border-white/30 bg-white/20 text-center text-lg font-bold text-white placeholder:text-white/70 focus:bg-white/30"
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
                            placeholder="Nama Depan"
                            className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30"
                          />
                          <Input
                            value={profileData.lastName || ''}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Nama Belakang"
                            className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:bg-white/30"
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
                          className="border-white/30 bg-white/20 text-center text-white placeholder:text-white/70 focus:bg-white/30"
                          placeholder="Username"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h1 className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-3xl font-bold">
                          {profileData.businessName}
                        </h1>
                        <p className="text-lg text-white/90">
                          {profileData.firstName} {profileData.lastName}
                        </p>
                        <p className="flex items-center justify-center gap-2 text-white/70">
                          @{profileData.username}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-yellow-400">
                              4.9
                            </span>
                          </div>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full space-x-3">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:shadow-xl"
                        variant="outline"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profil
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSave}
                          className="from-emerald-500 hover:from-emerald-600 flex-1 border-0 bg-gradient-to-r to-teal-500 text-white shadow-lg transition-all duration-300 hover:to-teal-600 hover:shadow-xl"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Simpan
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1 border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
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
          </div>

          {/* Working Hours Card */}
          <div className="xl:col-span-4">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <div className="mr-3 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 p-2">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workingHours.map((schedule, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between rounded-xl p-3 transition-all duration-300 hover:bg-gray-50"
                    >
                      <span className="w-20 font-medium text-gray-700">
                        {schedule.day}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-400 h-2 w-2 rounded-full" />
                        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
                          {schedule.hours}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Card */}
          <div className="xl:col-span-3">
            <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <div className="mr-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  Kategori Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <span
                      key={index}
                      className="cursor-default rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-2 text-xs font-semibold text-gray-800 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {category.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Business Details */}
          <div className="xl:col-span-8">
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <div className="mr-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Informasi Bisnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
                    Kontak & Alamat
                  </h3>

                  <div className="space-y-6">
                    <div className="group flex items-start space-x-4 rounded-xl p-4 transition-all duration-300 hover:bg-gray-50">
                      <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 p-2">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-2 font-semibold text-gray-800">
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
                            className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            rows={2}
                          />
                        ) : (
                          <p className="leading-relaxed text-gray-600">
                            {profileData.businessAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="group flex items-center space-x-4 rounded-xl p-4 transition-all duration-300 hover:bg-gray-50">
                        <div className="to-emerald-500 flex-shrink-0 rounded-lg bg-gradient-to-br from-green-500 p-2">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 font-semibold text-gray-800">
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
                              className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          ) : (
                            <p className="text-gray-600">{profileData.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="group flex items-center space-x-4 rounded-xl p-4 transition-all duration-300 hover:bg-gray-50">
                        <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 font-semibold text-gray-800">
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
                              className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              type="email"
                            />
                          ) : (
                            <p className="text-gray-600">{profileData.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Description */}
                <div className="space-y-4">
                  <h3 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
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
                        className="min-h-32 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        rows={4}
                      />
                    ) : (
                      <p className="leading-relaxed text-gray-700">
                        {profileData.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Stats */}
          <div className="xl:col-span-4">
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl transition-all duration-500 hover:shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-gray-800">
                  Statistik Bisnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl"
                      style={{
                        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                        backgroundImage: `linear-gradient(135deg, rgb(99 102 241), rgb(168 85 247))`,
                      }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`}
                      />
                      <div className="absolute right-2 top-2 opacity-10">
                        <Icon className="h-12 w-12" />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-3xl font-bold text-white">
                            {stat.value}
                          </div>
                        </div>
                        <div className="font-medium text-white/90">
                          {stat.label}
                        </div>
                      </div>
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerBusinessProfile;
