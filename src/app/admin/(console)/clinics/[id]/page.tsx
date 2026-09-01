import { notFound } from "next/navigation";
import { ClinicForm } from "@/components/admin/ClinicForm";
import { getAdminClinic } from "@/lib/admin-site-cms";
import { listAdminSitePhotos } from "@/lib/admin-site-media";

export default async function AdminEditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinic = await getAdminClinic(id);
  if (!clinic) notFound();
  const photos = await listAdminSitePhotos();
  const images = photos.clinics.find((item) => item.slug === clinic.slug)?.images ?? clinic.images.map((url) => ({ url, alt: clinic.name, storagePath: "" }));
  return <ClinicForm clinic={clinic} images={images} />;
}
