'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

interface MapCardProps {
  businessAddress?: string;
  businessName?: string;
}

const MapCard: React.FC<MapCardProps> = ({
  businessAddress,
  businessName = 'Business Location',
}) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address,
        )}&limit=1`,
      );

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoordinates([lat, lon]);
      } else {
        setError('Address not found');
      }
    } catch (err) {
      setError('Unable to locate address');
      console.error('Geocoding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (businessAddress && businessAddress.trim()) {
      geocodeAddress(businessAddress);
    } else {
      setCoordinates(null);
      setError(null);
    }
  }, [businessAddress]);

  const openInGoogleMaps = () => {
    if (businessAddress) {
      const encodedAddress = encodeURIComponent(businessAddress);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        '_blank',
      );
    } else if (coordinates) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${coordinates[0]},${coordinates[1]}`,
        '_blank',
      );
    }
  };

  const PlaceholderContent = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <MapPin className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-600">
        No Address Added
      </h3>
      <p className="text-sm text-gray-500">
        Add your business address in the profile section to display the location
        map.
      </p>
    </div>
  );

  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-red-600">
        Location Error
      </h3>
      <p className="mb-4 text-sm text-red-500">{error}</p>
      <p className="text-xs text-gray-500">
        Please check your address format and try again.
      </p>
    </div>
  );

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 animate-spin rounded-full bg-blue-100 p-4">
        <Navigation className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-blue-600">
        Loading Location...
      </h3>
      <p className="text-sm text-blue-500">
        Finding your business location on the map.
      </p>
    </div>
  );

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg text-gray-800">
          <div className="flex items-center">
            <div className="mr-3 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 p-2">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Business Location
          </div>
          {businessAddress && (
            <button
              onClick={openInGoogleMaps}
              className="rounded-lg bg-blue-500 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-600"
            >
              View in Maps
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingContent />
        ) : error ? (
          <ErrorContent />
        ) : !businessAddress?.trim() ? (
          <PlaceholderContent />
        ) : coordinates ? (
          <div className="space-y-4">
            {/* Address display */}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-700">
                <MapPin className="mr-2 inline h-4 w-4" />
                {businessAddress}
              </p>
            </div>

            {/* Map container */}
            <div className="h-48 w-full overflow-hidden rounded-lg">
              <MapContainer
                center={coordinates}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coordinates}>
                  <Popup>
                    <div className="text-center">
                      <strong>{businessName}</strong>
                      <br />
                      <span className="text-sm text-gray-600">
                        {businessAddress}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        ) : (
          <PlaceholderContent />
        )}
      </CardContent>
    </Card>
  );
};

export default MapCard;
