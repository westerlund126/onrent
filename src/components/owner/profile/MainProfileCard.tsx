'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Edit, Save, X, Camera } from 'lucide-react';

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
    <Card className="relative w-full overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Curved green top */}
      <div className="relative h-32 rounded-b-[40%] bg-gradient-to-tr from-green-400 to-teal-500" />

      {/* Avatar - overlapping */}
      <div className="-mt-12 flex justify-center">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={profileData.imageUrl} />
            <AvatarFallback className="bg-teal-600 text-2xl text-white">
              {profileData.firstName?.charAt(0) || 'N'}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-orange-500 p-0 shadow-lg"
            >
              <Camera className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 px-6 py-6 text-center">
        {isEditing ? (
          <>
            <Input
              value={profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="First Name"
            />
            <Input
              value={profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
            <Input
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email"
            />
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600">{profileData.email}</p>
            <p className="text-gray-500">{profileData.businessAddress}</p>
            <p className="text-gray-500">{profileData.phone}</p>
          </>
        )}

        {isEditing ? (
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              className="w-full bg-teal-500 text-white hover:bg-teal-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
            <Button
              onClick={onCancel}
              className="w-full border border-gray-300"
            >
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
          </div>
        ) : (
          <Button onClick={onEdit} className="bg-orange-400 hover:bg-orange-600">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MainProfileCard;
