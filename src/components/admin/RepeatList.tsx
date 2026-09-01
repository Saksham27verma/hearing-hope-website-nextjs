"use client";

import { Plus, Trash2 } from "lucide-react";

export function RepeatList<T>({
  items,
  onChange,
  create,
  render,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, index: number, update: (next: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="relative rounded-2xl bg-brand-surface p-4 ring-1 ring-black/5">
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-red-600 ring-1 ring-black/5"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {render(item, index, (next) => onChange(items.map((current, i) => (i === index ? next : current))))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-teal hover:bg-[#E7F7F3]"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
