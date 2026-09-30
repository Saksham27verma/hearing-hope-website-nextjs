import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_PAGES_TAG, contentPagePath } from "@/lib/content-pages";

export function revalidateContentSeo(slug?: string) {
  if (slug) revalidatePath(contentPagePath(slug));
  for (const path of ["/", "/services", "/hearing-aids", "/blog", "/sitemap.xml", "/llms.txt"]) {
    revalidatePath(path);
  }
  revalidateTag(CONTENT_PAGES_TAG, "max");
}
