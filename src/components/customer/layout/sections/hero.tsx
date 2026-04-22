"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  const { theme } = useTheme();
  return (
    <section className="container w-full">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
        <div className="text-center space-y-8">
          <Badge variant="outline" className="text-sm py-2">
            <span className="mr-2 text-primary">
              <Badge>New</Badge>
            </span>
            <span> Pakaian dengan desain terbaru! </span>
          </Badge>

          <div className="max-w-screen-md mx-auto text-center">
            <Image
              src={"/img/logo-1.png"}
              alt="On-Rent Logo"
              width={400}
              height={200}
              className="mx-auto w-48 md:w-80 h-auto"
              priority
            />
          </div>

          <p className="max-w-screen-sm mx-auto text-xl text-muted-foreground md:text-lg">
            {`Tampil memukau di setiap acara tanpa boros! Sewa gaun, kebaya, hingga tuxedo terbaik dengan mudah.`}
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/customer/catalog/">
            <Button className="w-5/6 md:w-1/3 font-bold group/arrow bg-primary-500 hover:bg-primary-600">
              Sewa Sekarang!
              <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
            </Button>
            </Link>
          </div>
        </div>

        <div className="relative group mt-14">
          <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary-300 rounded-full blur-3xl"></div>
          <Image
            width={1200}
            height={1200}
            className="w-full md:w-[1200px] mx-auto rounded-lg relative rouded-lg leading-none flex items-center border border-t-2 border-secondary  border-t-primary/30"
            src={"/img/hero.png"}
            alt="dashboard"
          />

          <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};