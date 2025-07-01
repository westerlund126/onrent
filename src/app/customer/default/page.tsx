import { BenefitsSection } from "components/customer/layout/sections/benefits";
import { CategoryShowcase } from "components/customer/layout/sections/category";
import { CommunitySection } from "components/customer/layout/sections/community";
import { ContactSection } from "components/customer/layout/sections/contact";
import { FAQSection } from "components/customer/layout/sections/faq";
import { FeaturesSection } from "components/customer/layout/sections/features";
import { FooterSection } from "components/customer/layout/sections/footer";
import { HeroSection } from "components/customer/layout/sections/hero";
import { PricingSection } from "components/customer/layout/sections/pricing";
import { ServicesSection } from "components/customer/layout/sections/services";
import { SponsorsSection } from "components/customer/layout/sections/sponsors";
import { TeamSection } from "components/customer/layout/sections/team";
import { TestimonialSection } from "components/customer/layout/sections/testimonial";

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
      <SponsorsSection />
      <BenefitsSection />
      <CategoryShowcase/>
      <FeaturesSection />
      <ServicesSection />
      <TestimonialSection />
      <TeamSection />
      <CommunitySection />
      <PricingSection />
      <ContactSection />
      <FAQSection />
      <FooterSection />
    </>
  );
}