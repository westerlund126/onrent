import { BenefitsSection } from "components/customer/layout/sections/benefits";
import { CategoryShowcase } from "components/customer/layout/sections/category";
import { FAQSection } from "components/customer/layout/sections/faq";
import { HeroSection } from "components/customer/layout/sections/hero";
import NewArrivals from "components/customer/layout/sections/newarrivals";
import { SponsorsSection } from "components/customer/layout/sections/sponsors";


export const metadata = {
  title: "Customer Portal - Welcome",
  description: "Welcome to your customer portal - manage your account and services",
  openGraph: {
    type: "website",
    url: "https://yoursite.com/customer",
    title: "Customer Portal - Welcome",
    description: "Welcome to your customer portal - manage your account and services",
    images: [
      {
        url: "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/customer-portal.jpg",
        width: 1200,
        height: 630,
        alt: "Customer Portal - Welcome",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://yoursite.com/customer",
    title: "Customer Portal - Welcome",
    description: "Welcome to your customer portal - manage your account and services",
    images: [
      "https://res.cloudinary.com/dbzv9xfjp/image/upload/v1723499276/og-images/customer-portal.jpg",
    ],
  },
};

export default function CustomerLanding() {
  return (
    <>
      <HeroSection />

      <div className="bg-muted/40 dark:bg-muted/20">
        <SponsorsSection />
      </div>

      <CategoryShowcase/>

      <div className="bg-muted/40 dark:bg-muted/20">
        <BenefitsSection />
      </div>

      <NewArrivals />

      <div className="bg-muted/40 dark:bg-muted/20">
        <FAQSection />
      </div>
    </>
  );
}