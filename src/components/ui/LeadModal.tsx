"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { LeadForm } from "@/components/sections/LeadForm";

type LeadModalProps = {
  open: boolean;
  onClose: () => void;
  productName?: string;
};

export function LeadModal({ open, onClose, productName }: LeadModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-brand-dark/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-brand-border bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
              Get best price
            </p>
            <h2 id="lead-modal-title" className="text-lg font-semibold text-brand-dark">
              {productName ? `Price for ${productName}` : "Request a callback"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-dark"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <LeadForm key={productName ?? "lead"} productName={productName} compact />
      </div>
    </div>
  );
}
