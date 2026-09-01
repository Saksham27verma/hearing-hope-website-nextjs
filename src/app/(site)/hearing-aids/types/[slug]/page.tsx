import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HearingAidCollection } from "@/components/hearing-aids/HearingAidCollection";
import { getHearingAidTypeBySlug, typeHref } from "@/data/hearing-aids";
import { productsByType } from "@/lib/catalog";
import { getSiteSettings, getStylePage, listStylePages } from "@/lib/site-cms";

type TypePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const types = await listStylePages();
  return types.map((type) => ({ slug: type.id.toLowerCase() }));
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const { slug } = await params;
  const type = getHearingAidTypeBySlug(slug);
  if (!type) return { title: "Hearing aid type" };
  const [page, settings] = await Promise.all([getStylePage(type.id), getSiteSettings()]);
  if (!page) return { title: "Hearing aid type" };

  return {
    title: page.headline,
    description: page.intro,
    openGraph: {
      title: `${page.headline} | ${settings.name}`,
      description: page.tagline,
    },
  };
}

export default async function HearingAidTypePage({ params }: TypePageProps) {
  const { slug } = await params;
  const type = getHearingAidTypeBySlug(slug);
  if (!type) notFound();

  const [page, models, types] = await Promise.all([
    getStylePage(type.id),
    productsByType(type.id),
    listStylePages(),
  ]);
  if (!page) notFound();

  const related = types
    .filter((item) => item.id !== type.id)
    .map((item) => ({
      href: typeHref(item.id),
      label: `${item.shortName} hearing aids`,
      image: item.image,
    }));

  return (
    <HearingAidCollection
      eyebrow={`${page.shortName} · ${page.name}`}
      title={page.headline}
      tagline={page.tagline}
      intro={page.intro}
      image={page.image}
      imageAlt={`${page.name} hearing aids`}
      wash={page.wash}
      facts={page.facts}
      points={page.points}
      highlights={page.highlights}
      products={models}
      catalogHeading={`All ${page.shortName} hearing aids we trial`}
      relatedEyebrow="Other styles"
      relatedTitle="Other hearing-aid types we fit"
      related={related}
    />
  );
}
