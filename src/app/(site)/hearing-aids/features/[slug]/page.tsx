import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HearingAidCollection } from "@/components/hearing-aids/HearingAidCollection";
import { hearingAidFeaturePages } from "@/data/hearing-aid-collections";
import {
  featureHref,
  getHearingAidFeature,
  hearingAidFeatures,
} from "@/data/hearing-aids";
import { productsByFeature } from "@/lib/catalog";
import { site } from "@/lib/site";

type FeaturePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return hearingAidFeatures.map((feature) => ({ slug: feature.id }));
}

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getHearingAidFeature(slug);
  if (!feature) return { title: "Hearing aid feature" };
  const page = hearingAidFeaturePages[feature.id];

  return {
    title: page.headline,
    description: feature.body,
    openGraph: {
      title: `${page.headline} | ${site.name}`,
      description: feature.tagline,
    },
  };
}

export default async function HearingAidFeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const feature = getHearingAidFeature(slug);
  if (!feature) notFound();

  const page = hearingAidFeaturePages[feature.id];
  const models = await productsByFeature(feature.id);
  const related = hearingAidFeatures
    .filter((item) => item.id !== feature.id)
    .map((item) => ({
      href: featureHref(item.id),
      label: item.navLabel,
    }));

  return (
    <HearingAidCollection
      eyebrow="By feature"
      title={page.headline}
      tagline={feature.tagline}
        intro={feature.body}
      image={page.heroImage}
      imageAlt={page.headline}
      wash={feature.wash}
      facts={page.facts}
      points={page.points}
      highlights={page.highlights}
      products={models}
      catalogHeading={`${feature.label} hearing aids we trial`}
      relatedEyebrow="Other features"
      relatedTitle="Other ways to choose a hearing aid"
      related={related}
    />
  );
}
