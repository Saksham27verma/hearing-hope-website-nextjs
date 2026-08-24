import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { businessSchema } from "@/lib/schema";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white pb-20 md:pb-0">
      <SchemaScript id="medical-business" data={businessSchema()} />
      <Navbar />
      {children}
      <PromoStrip />
      <Footer />
      <FloatingActions />
    </div>
  );
}
