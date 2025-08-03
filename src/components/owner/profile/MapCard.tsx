'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const redMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 41 12.5 41S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#EF4444"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <circle cx="12.5" cy="12.5" r="3" fill="#EF4444"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const MapComponent = ({ coordinates, businessName, businessAddress }: {
  coordinates: [number, number];
  businessName: string;
  businessAddress: string;
}) => {
  const mapRef = React.useRef<L.Map>(null);

  React.useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [coordinates]);

  return (
    <MapContainer
      center={coordinates}
      zoom={16}
      style={{ 
        height: '100%', 
        width: '100%',
        borderRadius: '0.5rem'
      }}
      className="z-10"
      dragging={true}
      touchZoom={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      boxZoom={false}
      keyboard={true}
      zoomControl={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker 
        position={coordinates} 
        icon={redMarkerIcon}
      >
        <Popup>
          <div className="text-center">
            <strong className="text-red-600">{businessName}</strong>
            <br />
            <span className="text-sm text-gray-600">
              {businessAddress}
            </span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

interface MapCardProps {
  businessAddress?: string;
  businessName?: string;
  className?: string;
}

const MapCard: React.FC<MapCardProps> = ({
  businessAddress,
  businessName = 'Business Location',
  className,
}) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0); // Force re-render

  const geocodeAddress = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        const result = data.results[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setCoordinates([lat, lon]);
        setMapKey(prev => prev + 1);
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

  useEffect(() => {
    if (coordinates) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [coordinates, mapKey]);

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
        Periksa kembali alamat yang Anda masukkan atau coba lagi nanti.
      </p>
    </div>
  );

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 animate-spin rounded-full bg-blue-100 p-4">
        <Navigation className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-blue-600">
        Memuat Lokasi...
      </h3>
      <p className="text-sm text-blue-500">
        Mencari lokasi bisnis Anda di peta.
      </p>
    </div>
  );

  return (
    <Card className={`h-full flex flex-col border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg text-gray-800">
          <div className="flex items-center">
            <div className="mr-3 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 p-2">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Lokasi Bisnis
          </div>
          {businessAddress && (
            <button
              onClick={openInGoogleMaps}
              className="rounded-lg bg-blue-500 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-600"
            >
              Lihat di Peta
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {isLoading ? (
          <LoadingContent />
        ) : error ? (
          <ErrorContent />
        ) : !businessAddress?.trim() ? (
          <PlaceholderContent />
        ) : coordinates ? (
          <div className="flex-grow flex flex-col space-y-4">
            {/* Address display */}
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-700">
                <MapPin className="mr-2 inline h-4 w-4" />
                {businessAddress}
              </p>
            </div>
            <div className="relative flex-grow">
              <div 
                key={mapKey}
                className="h-64 w-full overflow-hidden rounded-lg border border-gray-200"
                style={{ height: '256px' }}
              >
                <MapComponent
                  coordinates={coordinates}
                  businessName={businessName}
                  businessAddress={businessAddress}
                />
              </div>
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