import type { Brand, BrandProfile } from "@/types";

export const brandProfiles: BrandProfile[] = [
  {
    slug: "signia",
    name: "Signia",
    logo: "/images/brands/signia.svg",
    tagline: "Augmented hearing, designed in Germany",
    country: "Germany",
    founded: "2016 (Siemens heritage from 1878)",
    headquarters: "Erlangen, Germany",
    parent: "WS Audiology",
    intro:
      "Signia is the modern face of Siemens hearing instruments — German engineering with a design-led range from the slim Styletto to custom rechargeable Insio. At Hearing Hope you can trial Signia with an audiologist, not a brochure.",
    story: [
      "Siemens began building hearing devices more than a century ago. In 2016 the hearing division was reborn as Signia, keeping the German R&D culture while pushing a new look: slimmer RICs, own-voice processing, and chargers that feel like consumer electronics.",
      "Today Signia sits inside WS Audiology, sharing a global manufacturing network with Widex while keeping its own sound signature. Integrated Xperience (IX) is the current platform — focused on speech in motion, not only speech in a still room.",
      "Hearing Hope is a Signia certified centre. We program Own Voice Processing, streamer accessories and CROS/BiCROS fittings on the same visit as your audiogram.",
    ],
    technologies: [
      {
        title: "Integrated Xperience (IX)",
        body: "Real-time analysis of moving talkers so speech stays clear when you walk, turn or sit in a busy café.",
      },
      {
        title: "Own Voice Processing",
        body: "Keeps your own voice natural while amplifying everyone else — a common reason people stick with Signia.",
      },
      {
        title: "Styletto design language",
        body: "A slim, rechargeable silhouette that looks closer to a modern gadget than a medical device.",
      },
      {
        title: "Contactless custom charging",
        body: "Insio Charge&Go brings lithium-ion power to custom ITE shells without exposed contacts.",
      },
    ],
    highlights: [
      "RIC, slim-RIC, BTE and custom ITE",
      "Bluetooth streaming to iPhone and Android",
      "CROS / BiCROS for single-sided deafness",
      "Signia app for remote fine-tuning",
      "Tinnitus therapy programs",
      "Rechargeable and disposable-battery options",
    ],
  },
  {
    slug: "phonak",
    name: "Phonak",
    logo: "/images/brands/phonak.svg",
    tagline: "Swiss sound for real life, not a sound booth",
    country: "Switzerland",
    founded: "1947",
    headquarters: "Stäfa, Switzerland",
    parent: "Sonova",
    intro:
      "Phonak is Sonova’s flagship brand — known for AutoSense operating systems, Roger wireless microphones and power BTEs that still sound clean at high gain. If you live in noise, travel, or need paediatric power, Phonak is often the first trial we run.",
    story: [
      "Founded in Stäfa on Lake Zurich in 1947, Phonak grew from a small Swiss workshop into the hearing arm of Sonova. The brief has stayed the same: make speech easy in the situations people actually live in — cars, classrooms, restaurants, worship halls.",
    "AutoSense OS listens to the scene and switches programs for you. Roger microphones put a teacher’s or partner’s voice directly into the aids. Lumity and Infinio platforms add motion sensors so the beam follows conversation, not just the loudest noise.",
      "Phonak also builds Naída for severe-to-profound loss and Virto custom shells for people who want less showing behind the ear. Hearing Hope fits the full range and pairs Roger accessories when a family needs them.",
    ],
    technologies: [
      {
        title: "AutoSense OS",
        body: "Automatically recognises environments and blends programs so you are not tapping a button all day.",
      },
      {
        title: "Roger wireless mics",
        body: "Industry-standard remote microphones for classrooms, meetings and noisy family tables.",
      },
      {
        title: "Universal Bluetooth",
        body: "Connects broadly across phones and media devices, including hands-free calls on many models.",
      },
      {
        title: "Naída power platform",
        body: "High-gain BTEs designed for severe-to-profound loss without giving up speech clarity.",
      },
    ],
    highlights: [
      "Audéo RIC, Naída power BTE, Virto custom",
      "Paediatric and adult fittings",
      "Roger and TV connectors",
      "Rechargeable lithium-ion options",
      "CROS systems",
      "myPhonak app support",
    ],
  },
  {
    slug: "widex",
    name: "Widex",
    logo: "/images/brands/widex.svg",
    tagline: "Danish PureSound — as close to real as delay allows",
    country: "Denmark",
    founded: "1956",
    headquarters: "Lynge, Denmark",
    parent: "WS Audiology",
    intro:
      "Widex is the brand people describe as ‘more natural’. Zero-delay PureSound and a fluid, uncompressed character make it a favourite for musicians, first-time users and anyone tired of ‘processed’ hearing-aid tone.",
    story: [
      "Widex was founded in Denmark in 1956 by the Tøpholm and Westermann families. The company stayed independent for decades, obsessed with sound quality rather than the loudest marketing claim.",
      "MOMENT and Sheer platforms introduced PureSound: a processing path so fast that the brain is less likely to hear that classic hearing-aid echo. SoundSense Learn lets wearers teach the aid their taste with simple A/B choices.",
      "Widex now shares a group with Signia under WS Audiology, but the Danish sound philosophy is intact. We often demo Widex side-by-side with a more ‘speech-aggressive’ brand so you can hear the difference yourself.",
    ],
    technologies: [
      {
        title: "PureSound / ZeroDelay",
        body: "Cuts processing lag that makes some aids sound hollow or out of sync with lip movement.",
      },
      {
        title: "SoundSense Learn",
        body: "You pick between two sound samples; the aid learns a personal preference over time.",
      },
      {
        title: "Fluid sound philosophy",
        body: "Widex aims to preserve the texture of rooms and music, not flatten everything into ‘speech mode’.",
      },
      {
        title: "Custom CIC craft",
        body: "Discreet canal devices for people who want performance without a visible RIC.",
      },
    ],
    highlights: [
      "MOMENT Sheer RIC",
      "Custom CIC and ITE",
      "Rechargeable and battery models",
      "Widex Moment app",
      "Tinnitus options",
      "Natural music and own-voice character",
    ],
  },
  {
    slug: "oticon",
    name: "Oticon",
    logo: "/images/brands/oticon.svg",
    tagline: "BrainHearing — more of the scene, not less",
    country: "Denmark",
    founded: "1904",
    headquarters: "Smørum, Denmark",
    parent: "Demant",
    intro:
      "Oticon argues that the brain needs access to the full sound scene — not a narrow beam that cuts the world away. Deep neural networks on the More, Real and Intent platforms try to support that idea in everyday noise.",
    story: [
      "Hans Demant founded Oticon in Denmark in 1904 after his wife’s hearing loss. More than a century later the company is the centrepiece of the Demant group, with research that sits as much in neuroscience as in acoustics.",
      "BrainHearing is the name they give that approach: keep more of the environment so the brain can choose what to attend to. OpenSound Navigator and on-chip DNN processing are the tools. Intent adds 4D sensors that watch head and body movement to guess what you are trying to hear.",
      "Oticon Own takes the same thinking into invisible custom shells. Hearing Hope programs Oticon with real-ear measures so the ‘open’ philosophy still hits prescription targets.",
    ],
    technologies: [
      {
        title: "BrainHearing",
        body: "Gives the brain a richer scene instead of aggressively deleting ‘background’ that you may still need.",
      },
      {
        title: "Deep Neural Network",
        body: "Onboard AI trained on real-world sound to separate speech from noise without a dead, tunnelled feel.",
      },
      {
        title: "4D sensor Intent",
        body: "Conversation, motion and head orientation help the aid decide whose voice to support.",
      },
      {
        title: "Oticon Own custom",
        body: "Invisible-in-canal shells for people who refuse a behind-the-ear look.",
      },
    ],
    highlights: [
      "Intent, Real and More RIC families",
      "Own IIC / CIC custom",
      "Bluetooth and hands-free on selected models",
      "Oticon Companion app",
      "Paediatric options in the wider Demant range",
      "Rechargeable lithium-ion",
    ],
  },
  {
    slug: "resound",
    name: "ReSound",
    logo: "/images/brands/resound.svg",
    tagline: "Organic Hearing from GN in Denmark",
    country: "Denmark",
    founded: "1943 (Danavox) · ReSound brand worldwide",
    headquarters: "Ballerup, Denmark",
    parent: "GN Hearing (GN Store Nord)",
    intro:
      "ReSound comes from GN, the same Danish group behind Jabra. That consumer-audio DNA shows up in Bluetooth (they helped pioneer Made for iPhone hearing aids) and in M&RIE — a third microphone in the ear canal for a more ‘you are there’ spatial sense.",
    story: [
      "The story starts with Danavox in 1943 and becomes ReSound as GN Hearing’s global brand. Because GN also builds Jabra, wireless and app design tend to feel closer to a headset than to a 1990s hearing aid.",
      "Organic Hearing is their phrase for using the ear’s own shape. M&RIE places a microphone in the canal so pinna cues — the folds of your outer ear — are not thrown away. Nexia adds Bluetooth LE Audio and Auracast, the next public-broadcast standard for venues and TVs.",
      "If you live on iPhone, take calls all day, or want a RIC that still sounds like your own ear, ReSound is a strong comparison trial next to Signia or Phonak.",
    ],
    technologies: [
      {
        title: "M&RIE microphone",
        body: "A mic in the ear canal uses your pinna so direction and ‘out of my head’ sound feel more natural.",
      },
      {
        title: "Bluetooth LE Audio & Auracast",
        body: "Next-generation wireless for phones and, increasingly, public Auracast transmitters.",
      },
      {
        title: "Organic Hearing",
        body: "Preserve the acoustics of your own ear rather than replacing them with a fully closed digital scene.",
      },
      {
        title: "GN / Jabra wireless heritage",
        body: "Call quality and streaming sit in a company that already lives in headsets and unified communications.",
      },
    ],
    highlights: [
      "Nexia rechargeable RIC",
      "iPhone and Android streaming",
      "ReSound Smart 3D app",
      "Tinnitus sound generator",
      "CROS options in the wider range",
      "Auracast-ready models",
    ],
  },
  {
    slug: "starkey",
    name: "Starkey",
    logo: "/images/brands/starkey.svg",
    tagline: "American AI, built around the person wearing it",
    country: "United States",
    founded: "1967",
    headquarters: "Eden Prairie, Minnesota",
    parent: "Starkey Hearing Technologies (privately held)",
    intro:
      "Starkey is the major independently owned American hearing-aid maker. Genesis AI puts a neural network on the chip, Edge Mode gives you a ‘rescue’ boost in sudden noise, and the Thrive / My Starkey apps fold in wellness features the clinic can switch on if you want them.",
    story: [
      "William F. Austin founded Starkey in Minnesota in 1967. Unlike the European groups, Starkey remains privately held, with a large custom-manufacturing culture in the United States and a long history of charitable hearing missions.",
      "Genesis AI is the current flagship: on-device machine learning for speech in noise, rechargeable RICs, and Edge Mode+ when a restaurant or wind gust overwhelms the automatic program. Starkey has also pushed ‘healthable’ extras — activity tracking and fall alerts on selected generations — which some families find useful and others ignore. We set only what you need.",
      "If you want a US brand, strong custom work, or an AI demo next to Signia IX or Oticon Intent, we keep Starkey on the trial board at Hearing Hope.",
    ],
    technologies: [
      {
        title: "Genesis AI",
        body: "A dedicated neural processor that boosts speech while you are still in the noise, not after you leave it.",
      },
      {
        title: "Edge Mode+",
        body: "A user-triggered scene optimiser when the automatic program is not enough — a tap instead of a clinic visit.",
      },
      {
        title: "Custom American manufacturing",
        body: "Deep experience in ITE, ITC and CIC shells for people who want the aid in the ear, not behind it.",
      },
      {
        title: "Thrive / My Starkey app",
        body: "Fine-tuning, streaming and optional wellness tools from your phone.",
      },
    ],
    highlights: [
      "Genesis AI RIC",
      "Custom in-ear options",
      "Rechargeable lithium-ion",
      "Bluetooth streaming",
      "Edge Mode for tough environments",
      "Fall-alert and health features on selected models",
    ],
  },
];

export function getBrandBySlug(slug: string) {
  return brandProfiles.find((brand) => brand.slug === slug);
}

export function brandHref(name: Brand | string) {
  return `/hearing-aids/brands/${name.toLowerCase()}`;
}

export function brandLogoSrc(slug: string, logoUrl?: string | null) {
  const custom = logoUrl?.trim();
  if (custom) return custom;
  return `/images/brands/${slug.toLowerCase().replace(/\s+/g, "")}.svg`;
}
