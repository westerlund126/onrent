'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from 'stores/useUserStore';
import { useWorkingHoursStore } from 'stores/useWorkingHoursStore';
import MainProfileCard from 'components/owner/profile/MainProfileCard';
import BusinessInfoCard from 'components/owner/profile/BusinessInfoCard';
import WorkingHoursCard from 'components/owner/profile/WorkingHoursCard';
import MapCard from 'components/owner/profile/MapCard';
import { toast } from 'sonner';

interface ProfileData {
  businessName: string;
  businessAddress: string;
  email: string;
  phone_numbers: string;
  first_name: string;
  last_name: string;
  username: string;
  businessBio: string;
  imageUrl: string;
}

const OwnerBusinessProfile = () => {
  const { user, fetchUser, updateBusinessProfile } = useUserStore();
  const { workingHours } = useWorkingHoursStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    businessName: '',
    businessAddress: '',
    email: '',
    phone_numbers: '',
    first_name: '',
    last_name: '',
    username: '',
    businessBio: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setProfileData({
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        email: user.email || '',
        phone_numbers: user.phone_numbers || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        imageUrl: user.imageUrl || '',
        businessBio: user.businessBio || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateBusinessProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        username: profileData.username,
        phone_numbers: profileData.phone_numbers,
        businessName: profileData.businessName,
        businessAddress: profileData.businessAddress,
        businessBio: profileData.businessBio,
      });
      setIsEditing(false);
      toast.success('Profil berhasil disimpan!');
    } catch (error) {
      toast.error('Gagal menyimpan profil. Silakan coba lagi.');
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        email: user.email || '',
        phone_numbers: user.phone_numbers || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        imageUrl: user.imageUrl || '',
        businessBio: user.businessBio || '',
      });
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleProfileDataChange = (newData: Partial<ProfileData>) => {
    setProfileData((prevData) => ({ ...prevData, ...newData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
          <MainProfileCard
            profileData={profileData}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onProfileDataChange={handleProfileDataChange}
          />
          <BusinessInfoCard
            profileData={profileData}
            isEditing={isEditing}
            onProfileDataChange={handleProfileDataChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          <WorkingHoursCard
            workingHours={workingHours}
            className="lg:col-span-1"
          />
          <MapCard
            businessAddress={profileData.businessAddress}
            businessName={profileData.businessName}
            className="lg:col-span-2"
          />
        </div>
      </div>
    </div>
  );
};

export default OwnerBusinessProfile;