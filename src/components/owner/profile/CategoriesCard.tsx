'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';

interface CategoriesCardProps {
  categories?: string[];
}

const CategoriesCard: React.FC<CategoriesCardProps> = ({ 
  categories = [
    'KEBAYA',
    'PAKAIAN_ADAT',
    'GAUN_PENGANTIN',
    'JARIK',
    'SELOP',
    'BESKAP',
    'SELENDANG',
  ]
}) => {
  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg text-gray-800">
          <div className="mr-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 p-2">
            <Store className="h-4 w-4 text-white" />
          </div>
          Kategori Produk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
          {categories.map((category, index) => (
            <span
              key={index}
              className="cursor-default rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              {category.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesCard;