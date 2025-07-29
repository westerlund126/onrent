'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CalendarCheck2, Shirt, Undo2 } from "lucide-react";
import { useState, useEffect } from "react";

interface BenefitsProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: Search,
    title: "Cari Pakaian",
    description:
      "Jelajahi ribuan koleksi atau gunakan filter untuk menemukan gaun, kebaya, atau jas impianmu dengan cepat.",
  },
  {
    icon: Shirt,
    title: "Jadwalkan Fitting",
    description:
      "Atur jadwal fitting untuk mencoba pakaian di butik rekanan terdekat agar ukurannya pas dan nyaman.",
  },
  {
    icon: CalendarCheck2,
    title: "Sewa Sekarang",
    description:
      "Sudah pas dan yakin? Konfirmasi sewa dan selesaikan pembayaran langsung di butik untuk mengambil pakaianmu.",
  },
  {
    icon: Undo2,
    title: "Kembalikan Mudah",
    description:
      "Setelah acara selesai, kembalikan pakaian tanpa repot. Antar langsung ke butik atau pilih layanan jemput.",
  },
];

export const BenefitsSection = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Animate items in sequence
    benefitList.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
      }, index * 200);
    });
  }, []);

  return (
    <div className="bg-gradient-to-b from-orange-100 via-orange-50/35 to-transparent dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
      <section id="benefits" className="container py-12 sm:py-16 lg:py-24">
        {/* --- Section Header --- */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 relative px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent blur-3xl -z-10" />
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-orange-100/80 dark:bg-orange-950/50 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50 mb-4 sm:mb-6">
            <h2 className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 tracking-wider font-semibold">
              ON-RENT PROCESS
            </h2>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent px-2">
            Tahapan Sewa Pakaian
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Lakukan tahapan-tahapan berikut untuk menyewa pakaian sesuai dengan
            kebutuhanmu.
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden max-w-md mx-auto px-4">
          <div className="relative">
            {/* Vertical line for mobile */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-orange-200 dark:bg-orange-800 rounded-full">
                <div 
                className="w-full bg-gradient-to-b from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-400 rounded-full transition-all duration-2000 ease-out"
                style={{ 
                  height: `calc(50% * ${visibleItems.length / benefitList.length})`
                }}
              />
            </div>

            <div className="space-y-8 ">
              {benefitList.map(({ icon: Icon, title, description }, index) => {
                const isVisible = visibleItems.includes(index);
                const isHovered = hoveredIndex === index;
                
                return (
                  <div
                    key={title}
                    className={`relative flex items-start gap-4 ${isVisible ? 'animate-in' : 'opacity-0'}`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animationDuration: '600ms',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {/* Timeline Icon for Mobile */}
                    <div className="relative flex-shrink-0 z-10">
                      {/* Pulsing rings */}
                      <div className={`absolute inset-0 rounded-full bg-orange-400/30 animate-ping ${isVisible ? 'block' : 'hidden'}`} style={{ animationDelay: `${index * 200}ms` }} />
                      
                      <div className={`relative bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 p-3 rounded-full ring-2 ring-background shadow-md transform transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${isVisible ? 'animate-bounce' : ''}`} style={{ animationDelay: `${index * 200 + 300}ms`, animationDuration: '1s' }}>
                        <Icon className={`h-5 w-5 text-orange-600 dark:text-orange-300 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} />
                      </div>
                    </div>

                    {/* Content Card for Mobile */}
                    <div
                      className="flex-1"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="group relative">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-xl blur-sm transition-all duration-300 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`} />
                        
                        <Card className={`relative shadow-md hover:shadow-lg transition-all duration-500 dark:bg-slate-900/80 backdrop-blur-sm border group-hover:border-orange-400/60 dark:group-hover:border-orange-500/60 transform group-hover:-translate-y-1 ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <p className="text-xs font-bold text-orange-500 tracking-widest uppercase">
                                Langkah {index + 1}
                              </p>
                            </div>
                            <CardTitle className="text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                              {title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                              {description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block relative max-w-6xl mx-auto">
          {/* Animated Vertical Line */}
          <div 
            className="absolute left-1/2 top-4 -translate-x-1/2 w-1 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden"
            style={{ height: `calc(100% - 2rem)` }}
          >
            <div 
              className="w-full bg-gradient-to-b from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-400 rounded-full transition-all duration-2000 ease-out"
              style={{ 
                height: `calc(100% * ${visibleItems.length / benefitList.length})`,
                animationDelay: '500ms'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          <div className="relative flex flex-col gap-y-20">
            {benefitList.map(({ icon: Icon, title, description }, index) => {
              const isVisible = visibleItems.includes(index);
              const isLeft = index % 2 === 0;
              const isHovered = hoveredIndex === index;
              
              return (
                <div
                  key={title}
                  className={`relative flex items-center ${
                    !isLeft ? "flex-row-reverse" : ""
                  } ${isVisible ? 'animate-in' : 'opacity-0'}`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animationDuration: '600ms',
                    animationFillMode: 'forwards'
                  }}
                >
                  {/* --- Content Card --- */}
                  <div className={`w-1/2 px-8 ${isLeft ? 'pr-16' : 'pl-16'}`}>
                    <div
                      className="group relative"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Glow effect */}
                      <div className={`absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-2xl blur-sm transition-all duration-300 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`} />
                      
                      <Card className={`relative shadow-lg hover:shadow-2xl transition-all duration-500 dark:bg-slate-900/80 backdrop-blur-sm border-2 group-hover:border-orange-400/60 dark:group-hover:border-orange-500/60 transform group-hover:-translate-y-1 ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <p className="text-xs font-bold text-orange-500 tracking-widest uppercase">
                              Langkah {index + 1}
                            </p>
                          </div>
                          <CardTitle className="text-xl md:text-2xl group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                            {title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                            {description}
                          </p>
                        </CardContent>
                        
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-bl-3xl rounded-tr-xl" />
                      </Card>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="w-1/2" />

                  {/* --- Timeline Icon --- */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative group">
                      {/* Pulsing rings */}
                      <div className={`absolute inset-0 rounded-full bg-orange-400/30 animate-ping ${isVisible ? 'block' : 'hidden'}`} style={{ animationDelay: `${index * 200}ms` }} />
                      <div className={`absolute inset-0 rounded-full bg-orange-400/20 animate-pulse ${isVisible ? 'block' : 'hidden'}`} style={{ animationDelay: `${index * 200 + 100}ms` }} />
                      
                      {/* Main icon container */}
                      <div className={`relative bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 p-4 rounded-full ring-4 ring-background shadow-lg transform transition-all duration-500 ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'} ${isVisible ? 'animate-bounce' : ''}`} style={{ animationDelay: `${index * 200 + 300}ms`, animationDuration: '1s' }}>
                        <Icon className={`h-6 w-6 text-orange-600 dark:text-orange-300 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} />
                        
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/40 to-amber-400/40 blur-md transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              {benefitList.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    visibleItems.includes(index)
                      ? 'bg-orange-400 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes animate-in {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .animate-in {
            animation: animate-in 0.6s ease-out forwards;
          }
        `}</style>
      </section>
    </div>
  );
};