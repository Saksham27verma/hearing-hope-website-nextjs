import { HeroSection } from "@/components/sections/HeroSection";
import { BrandMarquee } from "@/components/sections/BrandMarquee";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { HearingAidTypes } from "@/components/sections/HearingAidTypes";
import { WhyChooseHearingHope } from "@/components/sections/WhyChooseHearingHope";
import { ClinicGallery } from "@/components/sections/ClinicGallery";
import { LocationCenters } from "@/components/sections/LocationCenters";
import { TrustStats } from "@/components/sections/TrustStats";
import { PatientReviews } from "@/components/sections/PatientReviews";
import { AwardsCarousel } from "@/components/sections/AwardsCarousel";
import { FaqSection } from "@/components/sections/FaqSection";
import { BlogCarousel } from "@/components/sections/BlogCarousel";
import { FaviconField } from "@/components/ui/FaviconField";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { faqSchema, productListSchema, clinicListSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_top,_#fff7f0_0%,_#ffffff_42%,_#f4fbf8_100%)]">
      <FaviconField />
      <div className="relative z-10">
        <SchemaScript id="faq-schema" data={faqSchema()} />
        <SchemaScript id="product-list-schema" data={productListSchema()} />
        <SchemaScript id="clinic-list-schema" data={clinicListSchema()} />
        <HeroSection />
        <BrandMarquee />
        <ProductCatalog className="bg-transparent" />
        <HearingAidTypes />
        <WhyChooseHearingHope />
        <ClinicGallery />
        <LocationCenters />
        <TrustStats />
        <PatientReviews />
        <AwardsCarousel />
        <FaqSection />
        <BlogCarousel />
      </div>
    </main>
  );
}
