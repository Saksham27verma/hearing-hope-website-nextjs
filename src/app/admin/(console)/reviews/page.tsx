import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { listAdminTestimonials } from "@/lib/admin-site-cms";

export default async function AdminReviewsPage() {
  const items = await listAdminTestimonials();
  return <ReviewsManager items={items} />;
}
