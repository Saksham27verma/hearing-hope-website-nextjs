import { BlogCatalogClient } from "@/components/admin/BlogCatalogClient";
import { listAdminPosts } from "@/lib/admin-blog";

export default async function AdminBlogPage() {
  const posts = await listAdminPosts();
  return <BlogCatalogClient posts={posts} />;
}
