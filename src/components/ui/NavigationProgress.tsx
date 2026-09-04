"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function isInAppNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const anchor = (event.target as Element | null)?.closest("a");
  if (!anchor) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const activeRef = useRef(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isInAppNavigation(event)) return;
      activeRef.current = true;
      setActive(true);
      setWidth(16);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setWidth((current) => (current >= 88 ? current : current + Math.max(0.8, (90 - current) * 0.07)));
    }, 180);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setWidth(100);
    const timeout = window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 260);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!active && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden"
      role="progressbar"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div
        className="h-full origin-left bg-linear-to-r from-brand-orange via-[#ff8a3d] to-brand-teal shadow-[0_0_12px_rgba(255,101,3,0.65)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
