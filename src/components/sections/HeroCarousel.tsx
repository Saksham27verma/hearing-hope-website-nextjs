"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/data/media";
import { cn } from "@/lib/utils";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const count = heroSlides.length;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const updateWidth = () => setWidth(node.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [count, index]);

  const go = (direction: -1 | 1) => {
    setIndex((current) => (current + direction + count) % count);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div ref={viewportRef} className="relative w-full overflow-hidden bg-transparent">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: width ? `translateX(-${index * width}px)` : undefined }}
        >
          {heroSlides.map((slide, slideIndex) => (
            <div
              key={slide.src}
              className="relative shrink-0 grow-0"
              style={{ width: width ? `${width}px` : "100%", flexBasis: width ? `${width}px` : "100%" }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                width={720}
                height={900}
                className="h-[380px] w-full object-contain sm:h-[440px] lg:h-[500px]"
                priority={slideIndex === 0}
                unoptimized
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-brand-dark shadow-sm hover:bg-white"
          aria-label="Previous product image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-brand-dark shadow-sm hover:bg-white"
          aria-label="Next product image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Product images">
        {heroSlides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={slideIndex === index}
            aria-label={`Show image ${slideIndex + 1}`}
            onClick={() => setIndex(slideIndex)}
            className={cn(
              "h-2 rounded-full transition-all",
              slideIndex === index ? "w-6 bg-brand-orange" : "w-2 bg-brand-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
