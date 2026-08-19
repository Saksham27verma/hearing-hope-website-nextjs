import type { Metadata } from "next";
import { TrustStats } from "@/components/sections/TrustStats";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us",
    description:
      "Hearing Hope is India's trusted hearing care brand with 15+ years of experience, 100+ audiologists and 2 lakh+ customers.",
    openGraph: {
      title: `About Us | ${site.name}`,
      description: site.tagline,
    },
  };
}

export default async function AboutPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <h1 className="text-3xl font-bold text-brand-dark">About Hearing Hope</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-brand-muted">
          Hearing Hope helps people across India hear clearly again — with expert audiologists,
          premium global brands and honest pricing. From a free first test to long-term after-care,
          we stay with you through every step of the hearing journey.
        </p>
      </section>
      <TrustStats />
    </main>
  );
}
