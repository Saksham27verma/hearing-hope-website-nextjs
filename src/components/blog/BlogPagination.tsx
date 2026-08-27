import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { blogIndexHref } from "@/data/blogs";
import { cn } from "@/lib/utils";

type BlogPaginationProps = {
  page: number;
  pageCount: number;
  q?: string;
};

export function BlogPagination({ page, pageCount, q = "" }: BlogPaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Blog pagination" className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={blogIndexHref({ q, page: page - 1 })}
        aria-disabled={page <= 1}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full border px-3 text-sm font-semibold",
          page <= 1
            ? "pointer-events-none border-brand-border text-brand-muted/50"
            : "border-brand-border text-brand-dark hover:border-brand-teal",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Link>
      <ol className="flex items-center gap-1">
        {pages.map((number) => (
          <li key={number}>
            <Link
              href={blogIndexHref({ q, page: number })}
              aria-current={number === page ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold",
                number === page
                  ? "bg-brand-dark text-white"
                  : "text-brand-dark hover:bg-brand-surface",
              )}
            >
              {number}
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href={blogIndexHref({ q, page: page + 1 })}
        aria-disabled={page >= pageCount}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full border px-3 text-sm font-semibold",
          page >= pageCount
            ? "pointer-events-none border-brand-border text-brand-muted/50"
            : "border-brand-border text-brand-dark hover:border-brand-teal",
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
