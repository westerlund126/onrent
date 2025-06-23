// components/ContactProfile.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from 'stores/useUserStore';
import { Loader2, Check, X } from 'lucide-react';

export default function ContactProfile() {
  const { user, isLoading, error, fetchUser, updatePhoneNumber, clearError } =
    useUserStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.phone_numbers) {
      setPhoneNumber(user.phone_numbers);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePhoneNumber(phoneNumber);
      setIsEditing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error updating phone number:', error);
    }
  };

  const handleCancel = () => {
    setPhoneNumber(user?.phone_numbers || '');
    setIsEditing(false);
    clearError();
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-black-500 text-lg font-semibold">Detail Kontak</h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center space-x-2 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          <span>Nomor telepon berhasil diperbarui</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Phone Number Section - Clerk Style Row Alignment */}
      <div className="space-y-4">
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-black-500 mb-2 text-sm font-semibold">
                Phone number
              </span>
              <span className="text-sm text-gray-900">
                {user?.phone_numbers || (
                  <span className="italic text-gray-400">
                    No phone number set
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-black-500 hover:text-black-600 rounded px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
            >
              Update phone number
            </button>
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nomor telepon
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Masukkan nomor telepon"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center rounded bg-gray-900 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Simpan
                  </>
                ) : (
                  'Simpan'
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Phone Number Verified Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-black-500 text-sm font-semibold">
            Nomor telepon terdaftar
          </span>
          <span className="text-sm text-gray-900">
            {user?.phone_numbers ? (
              <span className="flex items-center space-x-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>Terdaftar</span>
              </span>
            ) : user?.phone_numbers ? (
              <span className="text-amber-600">Tidak Terdaftar</span>
            ) : (
              <span className="text-gray-400">Nomor Telepon Tidak Ada</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
