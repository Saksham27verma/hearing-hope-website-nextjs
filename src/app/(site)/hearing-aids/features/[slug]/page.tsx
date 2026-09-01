import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HearingAidCollection } from "@/components/hearing-aids/HearingAidCollection";
import { featureHref, getHearingAidFeature } from "@/data/hearing-aids";
import { productsByFeature } from "@/lib/catalog";
import { getFeaturePage, getSiteSettings, listFeaturePages } from "@/lib/site-cms";

type FeaturePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const features = await listFeaturePages();
  return features.map((feature) => ({ slug: feature.id }));
}

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getHearingAidFeature(slug);
  if (!feature) return { title: "Hearing aid feature" };
  const [page, settings] = await Promise.all([getFeaturePage(feature.id), getSiteSettings()]);
  if (!page) return { title: "Hearing aid feature" };

  return {
    title: page.headline,
    description: page.body,
    openGraph: {
      title: `${page.headline} | ${settings.name}`,
      description: page.tagline,
    },
  };
}

export default async function HearingAidFeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const feature = getHearingAidFeature(slug);
  if (!feature) notFound();

  const [page, models, features] = await Promise.all([
    getFeaturePage(feature.id),
    productsByFeature(feature.id),
    listFeaturePages(),
  ]);
  if (!page) notFound();

  const related = features
    .filter((item) => item.id !== feature.id)
    .map((item) => ({
      href: featureHref(item.id),
      label: item.navLabel,
    }));

  return (
    <HearingAidCollection
      eyebrow="By feature"
      title={page.headline}
      tagline={page.tagline}
      intro={page.body}
      image={page.heroImage}
      imageAlt={page.headline}
      wash={page.wash}
      facts={page.facts}
      points={page.points}
      highlights={page.highlights}
      products={models}
      catalogHeading={`${page.label} hearing aids we trial`}
      relatedEyebrow="Other features"
      relatedTitle="Other ways to choose a hearing aid"
      related={related}
    />
  );
}
