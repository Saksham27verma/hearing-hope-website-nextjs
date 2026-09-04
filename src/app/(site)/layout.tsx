import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { SiteChromeProvider } from "@/components/layout/SiteChrome";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { getSiteChrome } from "@/lib/site-cms";
import { businessSchema, websiteSchema } from "@/lib/schema";

export const revalidate = false;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const chrome = await getSiteChrome();
  return (
    <SiteChromeProvider value={chrome}>
      <div className="flex min-h-dvh flex-col bg-white pb-20 md:pb-0">
        <SchemaScript id="medical-business" data={businessSchema(chrome.settings)} />
        <SchemaScript id="website-schema" data={websiteSchema(chrome.settings)} />
        <Navbar />
        {children}
        <PromoStrip promo={chrome.settings.promo} />
        <Footer settings={chrome.settings} brands={chrome.brands} clinics={chrome.clinics} />
        <FloatingActions settings={chrome.settings} />
      </div>
    </SiteChromeProvider>
  );
}
