'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { EmblaCarouselType } from 'embla-carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const categoryData = [
  {
    name: 'Kebaya',
    imageSrc: '/img/kebaya.jpg',
    href: '/customer/catalog?category=KEBAYA',
  },
  {
    name: 'Gaun Pengantin',
    imageSrc: '/img/wedding.jpg',
    href: '/customer/catalog?category=GAUN_PENGANTIN',
  },
  {
    name: 'Pakaian Adat',
    imageSrc: '/img/adat.jpg',
    href: '/customer/catalog?category=PAKAIAN_ADAT',
  },
  {
    name: 'Jas',
    imageSrc: '/img/jas.jpg',
    href: '/customer/catalog?category=JAS',
  },
  {
    name: 'Selendang',
    imageSrc: '/img/selendang.jpg',
    href: '/customer/catalog?category=SELENDANG',
  },
  {
    name: 'Beskap',
    imageSrc: '/img/beskap.jpg',
    href: '/customer/catalog?category=BESKAP',
  },
];

export function CategoryShowcase() {
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap()); // <-- Add this
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Carousel
          setApi={setEmblaApi}
          opts={{
            align: 'start',
            loop: false,
            dragFree: true,
            containScroll: 'trimSnaps',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 sm:-ml-4">
            {categoryData.map((category, index) => (
              <CarouselItem
                key={index}
                className="pl-2 sm:pl-4 basis-4/5 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="p-1">
                  <Link
                    href={category.href}
                    className="group relative block h-48 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl"
                  >
                    <Image
                      src={category.imageSrc}
                      alt={`Image of ${category.name}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      sizes="(max-width: 576px) 80vw, (max-width: 768px) 50vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/30" style={{

                        backgroundColor: 'rgba(0, 0, 0, 0.4)',

                      }}/>
                    <div className="relative z-10 flex h-full flex-col items-center justify-center p-3 sm:p-4 text-center">
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white leading-tight">
                        {category.name}
                      </h3>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2 sm:mt-4 text-xs sm:text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 px-3 py-1 sm:px-4 sm:py-2"
                        aria-label={`See more ${category.name}`}
                      >
                        Lihat Lebih
                      </Button>
                    </div>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation buttons - hidden on mobile, shown on larger screens */}
          <CarouselPrevious
            className={`hidden md:flex transition-opacity duration-300 ${
              canScrollPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
          <CarouselNext
            className={`hidden md:flex transition-opacity duration-300 ${
              canScrollNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        </Carousel>

       <div className="flex justify-center mt-6 md:hidden">
        <div className="flex space-x-2">
          {categoryData.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}