"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/data/media";
import { cn } from "@/lib/utils";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const go = (direction: -1 | 1) => {
    setIndex((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative overflow-hidden bg-transparent">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div key={slide.src} className="relative min-w-full">
              <Image
                src={slide.src}
                alt={slide.alt}
                width={720}
                height={900}
                className="h-[380px] w-full object-contain sm:h-[440px] lg:h-[500px]"
                priority={slide.src === heroSlides[0].src}
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
