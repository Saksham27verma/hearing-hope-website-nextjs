import type { CSSProperties } from "react";

const marks = [
  { top: "1.8%", left: "3%", size: 168, rotate: -18, opacity: 0.07, duration: 18 },
  { top: "4.2%", left: "78%", size: 108, rotate: 16, opacity: 0.055, duration: 22 },
  { top: "9.4%", left: "41%", size: 72, rotate: -8, opacity: 0.04, duration: 16 },
  { top: "13.6%", left: "9%", size: 96, rotate: 22, opacity: 0.05, duration: 20 },
  { top: "17.8%", left: "88%", size: 148, rotate: -12, opacity: 0.045, duration: 24 },
  { top: "23.5%", left: "19%", size: 84, rotate: 9, opacity: 0.05, duration: 17 },
  { top: "27.2%", left: "61%", size: 190, rotate: 14, opacity: 0.035, duration: 26 },
  { top: "32.8%", left: "2%", size: 124, rotate: -24, opacity: 0.06, duration: 19 },
  { top: "37.4%", left: "82%", size: 88, rotate: 7, opacity: 0.05, duration: 21 },
  { top: "42.1%", left: "36%", size: 64, rotate: -14, opacity: 0.04, duration: 15 },
  { top: "47.6%", left: "13%", size: 156, rotate: 11, opacity: 0.045, duration: 23 },
  { top: "51.8%", left: "70%", size: 102, rotate: -20, opacity: 0.05, duration: 18 },
  { top: "57.4%", left: "48%", size: 76, rotate: 18, opacity: 0.04, duration: 16 },
  { top: "62.9%", left: "5%", size: 132, rotate: -6, opacity: 0.055, duration: 22 },
  { top: "67.2%", left: "86%", size: 164, rotate: 12, opacity: 0.04, duration: 25 },
  { top: "73.5%", left: "28%", size: 92, rotate: -16, opacity: 0.05, duration: 19 },
  { top: "78.8%", left: "64%", size: 114, rotate: 8, opacity: 0.045, duration: 20 },
  { top: "84.4%", left: "10%", size: 78, rotate: 20, opacity: 0.04, duration: 17 },
  { top: "89.6%", left: "76%", size: 140, rotate: -10, opacity: 0.05, duration: 21 },
  { top: "94.2%", left: "42%", size: 98, rotate: 15, opacity: 0.04, duration: 18 },
] as const;

export function FaviconField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -left-24 top-[8%] h-80 w-80 rounded-full bg-brand-orange/6 blur-3xl" />
      <div className="absolute right-[-6%] top-[36%] h-96 w-96 rounded-full bg-brand-teal/8 blur-3xl" />
      <div className="absolute bottom-[12%] left-[28%] h-72 w-72 rounded-full bg-brand-orange/5 blur-3xl" />

      {marks.map((mark, index) => (
        <img
          key={`${mark.top}-${mark.left}`}
          src="/favicon.svg"
          alt=""
          width={mark.size}
          height={mark.size}
          className="absolute max-w-none origin-center animate-favicon-float select-none"
          style={
            {
              top: mark.top,
              left: mark.left,
              width: mark.size,
              height: mark.size,
              opacity: mark.opacity,
              transform: `rotate(${mark.rotate}deg)`,
              animationDuration: `${mark.duration}s`,
              animationDelay: `${index * -0.85}s`,
              "--favicon-rotate": `${mark.rotate}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
