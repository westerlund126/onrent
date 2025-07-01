import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

/**
 * An array defining the categories to be displayed.
 * I've added more items to demonstrate the carousel functionality.
 */
const categoryData = [
  {
    name: 'Kebaya',
    imageSrc: '/img/kebaya.jpg', // Make sure you have this image in /public/img/
    href: '/products?category=KEBAYA',
  },
  {
    name: 'Jas',
    imageSrc: '/img/jas.jpg', // Make sure you have this image in /public/img/
    href: '/products?category=GAUN_PENGANTIN', // Mapping "Dress" to your GAUN_PENGANTIN enum
  },
  {
    name: 'Pakaian Adat',
    imageSrc: '/img/adat.jpg', // Make sure you have this image in /public/img/
    href: '/products?category=PAKAIAN_ADAT', // You can map "Set" to any relevant category
  },
  {
    name: 'Jas',
    imageSrc: '/img/jas.jpg', // Add a corresponding image
    href: '/products?category=JAS',
  },
  {
    name: 'Selendang',
    imageSrc: '/img/selendang.jpg', // Add a corresponding image
    href: '/products?category=SELENDANG',
  },
  {
    name: 'Beskap',
    imageSrc: '/img/beskap.jpg', // Add a corresponding image
    href: '/products?category=BESKAP',
  },
];

export function CategoryShowcase() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {categoryData.map((category, index) => (
              <CarouselItem
                key={index}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Link
                    href={category.href}
                    className="group relative block h-80 w-full overflow-hidden rounded-lg shadow-lg"
                  >
                    {/* Background Image */}
 <Image
                      src={category.imageSrc}
                      alt={`Image of ${category.name}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"

                    />

                    {/* Additional dark overlay using pseudo-element approach */}
                    <div 
                      className="absolute inset-0 transition-all duration-300 group-hover:bg-opacity-30"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      }}
                    />
                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                      <h3 className="text-3xl font-medium text-white">
                        {category.name}
                      </h3>
                      <Button
                        variant="secondary"
                        className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-label={`See more ${category.name}`}
                      >
                        SEE MORE
                      </Button>
                    </div>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}