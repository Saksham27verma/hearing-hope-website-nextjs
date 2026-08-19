"use client";

import { Phone } from "lucide-react";
import { site, whatsappHref } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function FloatingActions() {
  return (
    <>
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand-teal px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-teal/30 transition hover:bg-[#14967a] bottom-24 md:bottom-6"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Chat Now
      </a>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
          <a
            href={toTelHref(site.phoneTel)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-teal px-3 py-3 text-sm font-semibold text-white"
          >
            <Phone className="h-4 w-4" />
            Call Audiologist
          </a>
          <a
            href="#book-test"
            className="inline-flex items-center justify-center rounded-full bg-brand-orange px-3 py-3 text-sm font-semibold text-white"
          >
            Book Free Test
          </a>
        </div>
      </div>
    </>
  );
}
