// components/owner/profile/MainProfileCard.jsx
'use client';

import React from 'react';
import Image from 'next/image';
import { FiEdit, FiSave, FiX, FiMail, FiUser } from 'react-icons/fi';

const MainProfileCard = ({
  profileData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onProfileDataChange,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onProfileDataChange({ ...profileData, [name]: value });
  };

  return (
    <div className="h-full flex flex-col w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header Section */}
      <div className="relative h-32 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shrink-0">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <Image
              src={profileData.imageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${profileData.username || 'Owner'}`}
              alt={profileData.username || 'Profile Picture'}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-between pt-16 pb-8 px-8 text-center">
        <div>
          {/* Name Section */}
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-3">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="username"
                    value={profileData.username || ''}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-center font-semibold"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData.username || 'Owner'}
                </h2>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <FiMail className="w-4 h-4 mr-2" />
                  <span>{profileData.email || 'No email provided'}</span>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="mb-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Online Sekarang</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={onSave}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <FiSave className="w-4 h-4" />
                <span>Simpan</span>
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FiX className="w-4 h-4" />
                <span>Batal</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onEdit}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <FiEdit className="w-4 h-4" />
              <span>Edit Profil</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainProfileCard;