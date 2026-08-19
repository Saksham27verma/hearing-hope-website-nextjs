import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  inverted?: boolean;
};

export function BrandLogo({ className, inverted = false }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center overflow-hidden",
        inverted && "rounded-md bg-white px-2 py-1",
        className,
      )}
    >
      <img
        src="/logo.svg"
        alt="Hearing Hope"
        width={240}
        height={72}
        className="h-full w-auto max-h-full object-contain object-left"
      />
    </span>
  );
}
