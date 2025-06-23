'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Edit, Save, X, Camera, Star } from 'lucide-react';

interface ProfileData {
  businessName: string;
  businessAddress: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  description: string;
  imageUrl: string;
}

interface MainProfileCardProps {
  profileData: ProfileData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onProfileDataChange: (data: ProfileData) => void;
}

const MainProfileCard: React.FC<MainProfileCardProps> = ({
  profileData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onProfileDataChange,
}) => {
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    onProfileDataChange({
      ...profileData,
      [field]: value,
    });
  };

  return (
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
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="border-white/30 bg-white/20 text-center text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                  placeholder="Nama Bisnis"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                    placeholder="Nama Depan"
                  />
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="border-white/30 bg-white/20 text-white placeholder:text-white/70 focus:border-white/50 focus:bg-white/30"
                    placeholder="Nama Belakang"
                  />
                </div>
                <Input
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
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
                onClick={onEdit}
                className="w-full border border-white/30 bg-white/20 text-white hover:bg-white/30"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profil
              </Button>
            ) : (
              <>
                <Button
                  onClick={onSave}
                  className="from-emerald-500 hover:from-emerald-600 w-full bg-gradient-to-r to-teal-500 text-white hover:to-teal-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
                <Button
                  onClick={onCancel}
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
  );
};

export default MainProfileCard;