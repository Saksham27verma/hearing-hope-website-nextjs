function LoadingMark({ label }: { label: string }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1.5 text-xs font-semibold text-brand-orange">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      {label}
    </div>
  );
}

export function SitePageLoading() {
  return (
    <main className="flex-1 px-4 py-10 lg:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="mx-auto max-w-7xl space-y-6">
        <LoadingMark label="Loading page" />
        <div className="h-8 w-40 animate-pulse rounded-full bg-brand-surface" />
        <div className="h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-brand-surface" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-brand-surface" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-brand-surface" />
          ))}
        </div>
      </div>
    </main>
  );
}

export function AdminPageLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading CMS page</span>
      <LoadingMark label="Loading" />
      <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />
      <div className="mt-3 h-9 w-56 animate-pulse rounded-2xl bg-black/10" />
      <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded-full bg-black/10" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-3xl bg-white ring-1 ring-black/5" />
        ))}
      </div>
    </div>
  );
}
