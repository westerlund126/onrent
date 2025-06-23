'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, User } from 'lucide-react';

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

interface BusinessInfoCardProps {
  profileData: ProfileData;
  isEditing: boolean;
  onProfileDataChange: (data: ProfileData) => void;
}

const BusinessInfoCard: React.FC<BusinessInfoCardProps> = ({
  profileData,
  isEditing,
  onProfileDataChange,
}) => {
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    onProfileDataChange({
      ...profileData,
      [field]: value,
    });
  };

  return (
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
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                onChange={(e) => handleInputChange('description', e.target.value)}
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
  );
};

export default BusinessInfoCard;