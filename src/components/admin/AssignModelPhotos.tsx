"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { attachProductPhotos } from "@/app/admin/actions";
import { prepareAndUploadProductPhotos } from "@/lib/product-photo-client";
import { productSeriesKey } from "@/lib/product-photo";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function AssignModelPhotos({
  products,
  selectedIds,
  onClear,
  onSelectIds,
  onDone,
}: {
  products: Product[];
  selectedIds: Set<string>;
  onClear: () => void;
  onSelectIds: (ids: string[]) => void;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"replace" | "append">("replace");
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const selected = useMemo(
    () => products.filter((product) => selectedIds.has(product.id)),
    [products, selectedIds],
  );

  const seriesOthers = useMemo(() => {
    if (selected.length === 0) return [];
    const keys = [...new Set(selected.map(productSeriesKey))];
    if (keys.length !== 1) return [];
    return products.filter((product) => productSeriesKey(product) === keys[0] && !selectedIds.has(product.id));
  }, [products, selected, selectedIds]);

  async function handleFiles(list: FileList | File[] | null) {
    const files = list ? Array.from(list) : [];
    if (!files.length || pending) return;
    setPending(true);
    setError(null);
    try {
      const assignments = await prepareAndUploadProductPhotos({
        files,
        products: selected,
        startIndex:
          mode === "append" ? (product) => (selected.find((item) => item.id === product.id)?.images.length ?? 0) + 1 : 1,
        onProgress: setProgress,
      });
      setProgress("Saving to the catalog…");
      const result = await attachProductPhotos({
        mode,
        assignments: assignments
          .filter((item) => item.productId)
          .map((item) => ({ productId: item.productId as string, images: item.images })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
      setProgress(null);
    }
  }

  if (selected.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-4 py-4 shadow-[0_-12px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur md:left-60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:px-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-brand-dark">
              {selected.length} model{selected.length === 1 ? "" : "s"} selected
            </p>
            <p className="mt-0.5 max-w-xl text-xs leading-5 text-brand-muted">
              Drop one studio photo for the whole series. It is converted to WebP, named with the brand and
              model, and applied to every selected hearing aid.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-muted hover:bg-brand-surface"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {seriesOthers.length > 0 ? (
            <button
              type="button"
              onClick={() => onSelectIds([...selectedIds, ...seriesOthers.map((item) => item.id)])}
              className="rounded-full border border-brand-border px-3 py-1.5 text-xs font-semibold hover:bg-brand-surface"
            >
              Select {seriesOthers.length} more in this series
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMode("replace")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
              mode === "replace"
                ? "bg-[#FFF4ED] text-brand-orange ring-brand-orange/20"
                : "bg-white text-brand-muted ring-black/10",
            )}
          >
            Replace photos
          </button>
          <button
            type="button"
            onClick={() => setMode("append")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
              mode === "append"
                ? "bg-[#E7F7F3] text-brand-teal ring-brand-teal/20"
                : "bg-white text-brand-muted ring-black/10",
            )}
          >
            Add to existing
          </button>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            void handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition",
            pending ? "pointer-events-none opacity-70" : "",
            dragOver ? "border-brand-orange bg-[#FFF4ED]" : "border-brand-border bg-brand-surface hover:border-brand-teal/50",
          )}
        >
          {pending ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-brand-orange" />
          ) : (
            <ImagePlus className="h-5 w-5 text-brand-orange" />
          )}
          <span>
            <span className="block text-sm font-semibold text-brand-dark">
              {pending ? progress ?? "Working…" : "Drop PNG or JPG here — or click to browse"}
            </span>
            <span className="mt-0.5 block text-xs text-brand-muted">
              Saved as brand-model-01-1200x1200.webp for each selected aid
            </span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            disabled={pending}
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
