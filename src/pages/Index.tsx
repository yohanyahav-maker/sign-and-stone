import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import LogosSection from "@/components/landing/LogosSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsCarousel from "@/components/landing/TestimonialsCarousel";
import PricingSection from "@/components/landing/PricingSection";
import CtaSection from "@/components/landing/CtaSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <LogosSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsCarousel />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
};

export default Index;
