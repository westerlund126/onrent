// src/components/OwnerCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Package } from 'lucide-react';

interface OwnerCardProps {
  owner: {
    id: number;
    businessName: string | null;
    first_name: string;
    last_name: string | null;
    imageUrl: string | null;
    businessAddress: string | null;
    businessBio: string | null;
    _count?: {
      Products: number;
    };
  };
  showProductCount?: boolean;
}

export default function OwnerCard({ owner, showProductCount = true }: OwnerCardProps) {
  const ownerName = `${owner.first_name} ${owner.last_name || ''}`.trim();
  const displayName = owner.businessName || ownerName;
  
  return (
    <Link href={`/customer/owner/profile/${owner.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
        <div className="flex items-start space-x-4">
          {/* Owner Image */}
          <div className="flex-shrink-0">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              {owner.imageUrl ? (
                <Image
                  src={owner.imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Owner Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {displayName}
            </h3>
            
            {owner.businessName && (
              <p className="text-sm text-gray-600 mt-1">
                by {ownerName}
              </p>
            )}

            {owner.businessAddress && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{owner.businessAddress}</span>
              </div>
            )}

            {showProductCount && owner._count && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Package className="h-4 w-4 mr-1" />
                <span>{owner._count.Products} products available</span>
              </div>
            )}

            {owner.businessBio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {owner.businessBio}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}