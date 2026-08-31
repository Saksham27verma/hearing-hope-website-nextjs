import { notFound } from "next/navigation";
import { BlogForm } from "@/app/admin/(console)/blog/blog-form";
import { getAdminPost } from "@/lib/admin-blog";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: EditPageProps) {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();
  return <BlogForm post={post} />;
}
