"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { EmblaCarouselType } from 'embla-carousel'
import { ShoppingBag } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; 

interface Product {
  id: number;
  name: string;
  images: string[];
  createdAt: string;
}

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch new arrivals');
        }
        const data: Product[] = await response.json();
        
        const sortedProducts = data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setProducts(sortedProducts.slice(0, 12)); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="w-full py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 dark:text-white flex-grow">
            Produk Terbaru Tersedia Tiap Minggu
          </h2>

        </div>

        <div className="relative">
          {loading && <div className="text-center py-10">Memuat Produk...</div>}
          {error && <div className="text-center text-red-500 py-10">Error: {error}</div>}
          
          {!loading && !error && (
            <Carousel
              setApi={setEmblaApi} 
              opts={{
                align: "start",
                loop: false, 
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {products.map((product) => {
                  const displayImage = product.images?.[0] || 'https://placehold.co/400x600/f0f0f0/333?text=No+Image';
                  return (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/6 pl-2">
                      <div className="p-1">
                        <Link 
                          href={`/customer/catalog/${product.id}`} 
                          className="group relative block overflow-hidden rounded-lg"
                        >
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="h-full w-full object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600/f0f0f0/333?text=Error'; }}
                          />
                          <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-75 backdrop-blur-sm transition-opacity duration-300 group-hover:bg-opacity-100">
                            <ShoppingBag className="h-5 w-5 text-gray-700" />
                          </div>
                        </Link>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious 
                className={`transition-opacity ${canScrollPrev ? 'opacity-100' : 'opacity-0'}`} 
              />
              <CarouselNext 
                className={`transition-opacity ${canScrollNext ? 'opacity-100' : 'opacity-0'}`} 
              />
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;