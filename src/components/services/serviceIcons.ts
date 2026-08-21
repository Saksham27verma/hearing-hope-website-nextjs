import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AudioLines,
  AudioWaveform,
  Baby,
  Brain,
  Ear,
  Headphones,
  Radio,
  Speech,
  Waves,
} from "lucide-react";
import type { ClinicalServiceIcon } from "@/types";

export const serviceIcons: Record<ClinicalServiceIcon, LucideIcon> = {
  activity: Activity,
  ear: Ear,
  brain: Brain,
  headphones: Headphones,
  "audio-lines": AudioLines,
  baby: Baby,
  radio: Radio,
  waves: Waves,
  "audio-waveform": AudioWaveform,
  speech: Speech,
};
