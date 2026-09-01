import { redirect } from "next/navigation";
import { listBrandProfiles } from "@/lib/site-cms";

type LegacyBrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const brandProfiles = await listBrandProfiles();
  return brandProfiles.map((brand) => ({ slug: brand.slug }));
}

export default async function LegacyBrandRedirect({ params }: LegacyBrandPageProps) {
  const { slug } = await params;
  redirect(`/hearing-aids/brands/${slug}`);
}
