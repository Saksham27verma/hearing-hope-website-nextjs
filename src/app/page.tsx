import { HeroSection } from "@/components/sections/HeroSection";
import { BrandMarquee } from "@/components/sections/BrandMarquee";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { HearingAidTypes } from "@/components/sections/HearingAidTypes";
import { ClinicGallery } from "@/components/sections/ClinicGallery";
import { LocationCenters } from "@/components/sections/LocationCenters";
import { TrustStats } from "@/components/sections/TrustStats";
import { PatientReviews } from "@/components/sections/PatientReviews";
import { AwardsCarousel } from "@/components/sections/AwardsCarousel";
import { FaqSection } from "@/components/sections/FaqSection";
import { BlogCarousel } from "@/components/sections/BlogCarousel";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { faqSchema, productListSchema, clinicListSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <main>
      <SchemaScript id="faq-schema" data={faqSchema()} />
      <SchemaScript id="product-list-schema" data={productListSchema()} />
      <SchemaScript id="clinic-list-schema" data={clinicListSchema()} />
      <HeroSection />
      <BrandMarquee />
      <ProductCatalog />
      <HearingAidTypes />
      <ClinicGallery />
      <LocationCenters />
      <TrustStats />
      <PatientReviews />
      <AwardsCarousel />
      <FaqSection />
      <BlogCarousel />
    </main>
  );
}
