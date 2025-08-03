'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, User, Building2, Search, Navigation } from 'lucide-react';

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

interface AddressSuggestion {
  display_name: string;
  place_id: number;
  lat: string;
  lon: string;
  type: string;
}

const AddressAutocomplete: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
}> = ({ value, onChange, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.results) {
          setSuggestions(data.results);
          setShowSuggestions(data.results.length > 0);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
  if (suggestionsRef.current?.contains(e.relatedTarget as Node)) {
    return;
  }
  
  setTimeout(() => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, 200);
};

  const handleFocus = () => {
    if (suggestions.length > 0 && value.length >= 3) {
      setShowSuggestions(true);
    }
  };

  const formatSuggestion = (suggestion: AddressSuggestion) => {
    const parts = suggestion.display_name.split(',');
    const main = parts.slice(0, 2).join(',').trim();
    const secondary = parts.slice(2).join(',').trim();
    return { main, secondary };
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={className}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Navigation className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        {!isLoading && showSuggestions && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const { main, secondary } = formatSuggestion(suggestion);
              return (
                <div
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`cursor-pointer px-4 py-3 transition-colors ${
                    index === selectedIndex
                      ? 'bg-indigo-50 text-indigo-900'
                      : 'hover:bg-gray-50'
                  } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {main}
                      </p>
                      {secondary && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {secondary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 px-4 py-2">
            <p className="text-xs text-gray-400 text-center">
              Powered by OpenStreetMap
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

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
        {/* Business Name */}
        <div className="group flex items-center space-x-4 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50">
          <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 p-2">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-semibold text-gray-800">
              Nama Bisnis
            </p>
            {isEditing ? (
              <Input
                value={profileData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Nama bisnis Anda"
                className="border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            ) : (
              <p className="break-words text-sm text-gray-600">
                {profileData.businessName}
              </p>
            )}
          </div>
        </div>

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
                <AddressAutocomplete
                  value={profileData.businessAddress}
                  onChange={(value) => handleInputChange('businessAddress', value)}
                  placeholder="Ketik alamat lengkap bisnis..."
                  className="border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : (
                <p className="break-words text-sm leading-relaxed text-gray-600">
                  {profileData.businessAddress}
                </p>
              )}
              {isEditing && (
                <p className="mt-1 text-xs text-gray-400">
                  Ketik minimal 3 karakter untuk mendapatkan saran alamat
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