import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import TestimonialsCarousel from "@/components/landing/TestimonialsCarousel";
import LogosSection from "@/components/landing/LogosSection";
import FaqSection from "@/components/landing/FaqSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsCarousel />
      <LogosSection />
      <FaqSection />
      <FooterSection />
    </div>
  );
};

export default Index;
