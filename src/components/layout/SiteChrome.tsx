"use client";

import { createContext, useContext } from "react";
import type { SiteChrome } from "@/lib/site-cms/types";

const SiteChromeContext = createContext<SiteChrome | null>(null);

export function SiteChromeProvider({ value, children }: { value: SiteChrome; children: React.ReactNode }) {
  return <SiteChromeContext.Provider value={value}>{children}</SiteChromeContext.Provider>;
}

export function useSiteChrome() {
  const value = useContext(SiteChromeContext);
  if (!value) {
    throw new Error("useSiteChrome must be used within SiteChromeProvider");
  }
  return value;
}
