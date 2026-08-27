"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageItem = { url: string; alt: string };

export function ImageDropzone({
  images,
  uploading,
  emptyLabel,
  onUpload,
  onChange,
}: {
  images: ImageItem[];
  uploading: boolean;
  emptyLabel: string;
  onUpload: (files: FileList) => void;
  onChange: (images: ImageItem[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function takeFiles(files: FileList | null) {
    if (files?.length) onUpload(files);
  }

  return (
    <div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          takeFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
          dragOver ? "border-brand-orange bg-[#FFF4ED]" : "border-brand-border bg-brand-surface hover:border-brand-teal/50",
        )}
      >
        <ImagePlus className="h-6 w-6 text-brand-orange" />
        <p className="mt-2 text-sm font-semibold text-brand-dark">
          {uploading ? "Preparing WebP photos…" : "Drop photos here, or click to browse"}
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-brand-muted">{emptyLabel}</p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            takeFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {images.length ? (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex == null || dragIndex === index) return;
                const next = [...images];
                const [moved] = next.splice(dragIndex, 1);
                next.splice(index, 0, moved);
                onChange(next);
                setDragIndex(null);
              }}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-contain p-2" />
              {index === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-brand-dark px-2 py-0.5 text-[10px] font-semibold text-white">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-red-600 opacity-0 shadow-sm ring-1 ring-black/5 transition group-hover:opacity-100"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                aria-label="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
