import { redirect } from "next/navigation";
import { brandProfiles } from "@/data/brands";

type LegacyBrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return brandProfiles.map((brand) => ({ slug: brand.slug }));
}

export default async function LegacyBrandRedirect({ params }: LegacyBrandPageProps) {
  const { slug } = await params;
  redirect(`/hearing-aids/brands/${slug}`);
}
