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
import { listPublishedPosts } from "@/lib/blog";
import { listPublishedProducts } from "@/lib/catalog";
import {
  getPage,
  getSiteChrome,
  listAwards,
  listFaqs,
  listHospitals,
  listOpenClinics,
  listTestimonials,
} from "@/lib/site-cms";

export default async function HomePage() {
  const [chrome, page, products, posts, faqs, reviews, awards, hospitals, clinics] = await Promise.all([
    getSiteChrome(),
    getPage("home"),
    listPublishedProducts(),
    listPublishedPosts(),
    listFaqs("home"),
    listTestimonials(),
    listAwards(),
    listHospitals(),
    listOpenClinics(),
  ]);
  const fields = page.fields;

  return (
    <main className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_top,_#fff7f0_0%,_#ffffff_42%,_#f4fbf8_100%)]">
      <FaviconField />
      <div className="relative z-10">
        <SchemaScript id="faq-schema" data={faqSchema(faqs)} />
        <SchemaScript id="product-list-schema" data={productListSchema(products)} />
        <SchemaScript id="clinic-list-schema" data={clinicListSchema(clinics)} />
        <HeroSection fields={fields} settings={chrome.settings} slides={chrome.slides} />
        <BrandMarquee brands={chrome.brands} />
        <ProductCatalog className="bg-transparent" items={products} />
        <HearingAidTypes types={chrome.types} />
        <WhyChooseHearingHope
          eyebrow={fields.whyChooseEyebrow}
          title={fields.whyChooseTitle}
          body={fields.whyChooseBody}
          hopeLabel={fields.whyChooseHopeLabel}
          otherLabel={fields.whyChooseOtherLabel}
          rows={fields.whyChooseRows}
        />
        <ClinicGallery />
        <LocationCenters />
        <TrustStats stats={fields.trustStats} hospitals={hospitals} />
        <PatientReviews
          items={reviews}
          settings={chrome.settings}
          eyebrow={fields.reviewsEyebrow}
          title={fields.reviewsTitle}
        />
        <AwardsCarousel awards={awards} />
        <FaqSection items={faqs} eyebrow={fields.faqEyebrow} title={fields.faqTitle} phoneTel={chrome.settings.phoneTel} />
        <BlogCarousel posts={posts} />
      </div>
    </main>
  );
}
