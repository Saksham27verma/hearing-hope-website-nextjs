import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HearingAidCollection } from "@/components/hearing-aids/HearingAidCollection";
import { hearingAidTypePages } from "@/data/hearing-aid-collections";
import { getHearingAidTypeBySlug, hearingAidTypeVisuals, typeHref } from "@/data/hearing-aids";
import { productsByType } from "@/lib/catalog";
import { hearingAidTypes } from "@/data/content";
import { site } from "@/lib/site";

type TypePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return hearingAidTypes.map((type) => ({ slug: type.id.toLowerCase() }));
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const { slug } = await params;
  const type = getHearingAidTypeBySlug(slug);
  if (!type) return { title: "Hearing aid type" };
  const page = hearingAidTypePages[type.id];

  return {
    title: page.headline,
    description: page.intro,
    openGraph: {
      title: `${page.headline} | ${site.name}`,
      description: page.tagline,
    },
  };
}

export default async function HearingAidTypePage({ params }: TypePageProps) {
  const { slug } = await params;
  const type = getHearingAidTypeBySlug(slug);
  if (!type) notFound();

  const page = hearingAidTypePages[type.id];
  const visual = hearingAidTypeVisuals[type.id];
  const models = await productsByType(type.id);
  const related = hearingAidTypes
    .filter((item) => item.id !== type.id)
    .map((item) => ({
      href: typeHref(item.id),
      label: `${item.shortName} hearing aids`,
      image: hearingAidTypeVisuals[item.id].image,
    }));

  return (
    <HearingAidCollection
      eyebrow={`${type.shortName} · ${type.name}`}
      title={page.headline}
      tagline={page.tagline}
      intro={page.intro}
      image={visual.image}
      imageAlt={`${type.name} hearing aids`}
      wash={visual.wash}
      facts={page.facts}
      points={page.points}
      highlights={page.highlights}
      products={models}
      catalogHeading={`All ${type.shortName} hearing aids we trial`}
      relatedEyebrow="Other styles"
      relatedTitle="Other hearing-aid types we fit"
      related={related}
    />
  );
}
