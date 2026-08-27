import type { BlogSection } from "@/types";

type BlogTocProps = {
  sections: BlogSection[];
  className?: string;
};

export function BlogToc({ sections, className }: BlogTocProps) {
  return (
    <nav aria-label="On this page" className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">On this page</p>
      <ol className="mt-3 space-y-1.5">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex gap-2 text-sm leading-6 text-brand-muted hover:text-brand-dark"
            >
              <span className="font-semibold text-brand-teal/80 group-hover:text-brand-teal">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
