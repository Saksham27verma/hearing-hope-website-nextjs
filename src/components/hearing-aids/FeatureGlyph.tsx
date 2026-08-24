import {
  BatteryCharging,
  Bluetooth,
  Ear,
  EyeOff,
  Volume2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { FeatureIconName } from "@/data/hearing-aids";

const icons: Record<FeatureIconName, LucideIcon> = {
  battery: BatteryCharging,
  bluetooth: Bluetooth,
  noise: Volume2,
  invisible: EyeOff,
  custom: Ear,
  power: Zap,
};

export function FeatureGlyph({
  icon,
  className,
}: {
  icon: FeatureIconName;
  className?: string;
}) {
  const Icon = icons[icon];
  return <Icon className={className} aria-hidden="true" />;
}
