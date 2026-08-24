import type { HearingAidStyle } from "@/types";
import type { HearingAidFeatureId, Product } from "@/types";

type RawProduct = Omit<Product, "id" | "brandSlug" | "featureIds" | "images" | "colors" | "published">;

const rawProducts: RawProduct[] = [
  {
    slug: "signia-pure-charge-go-ix",
    brand: "Signia",
    type: "RIC",
    name: "Signia Pure Charge&Go IX",
    badge: "36 Hours Battery",
    rating: 5,
    reviewCount: 412,
    feature: "AI-powered speech clarity in noisy environments",
    overview:
      "Pure Charge&Go IX is Signia’s everyday RIC for people who move through noise — offices, traffic, family dinners. Integrated Xperience tracks more than one talker so speech does not collapse the moment you turn your head. Lithium-ion charging is built in; a full charge is aimed at a long waking day plus a buffer.",
    features: [
      {
        title: "Speech in motion, not only in a still room",
        body: "IX analyses several moving speakers at once. That matters in a clinic corridor, a wedding hall or a shop floor — places where older ‘speech focus’ programs lock onto one spot and lose everyone else.",
      },
      {
        title: "Own Voice Processing",
        body: "Your voice is handled on a separate path so it does not boom or sound hollow while other people are amplified. First-time users often notice this within the first hour of a trial.",
      },
      {
        title: "All-day rechargeable wear",
        body: "The Charge&Go case tops the aids overnight. We check real wearing hours at the fitting so you are not left short on a long day out.",
      },
      {
        title: "Bluetooth streaming and the Signia app",
        body: "Calls and media stream to both ears. The app lets us nudge programs remotely after you have lived with the sound for a week — without another full clinic visit unless you want one.",
      },
    ],
    mrp: 245000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ric.svg",
  },
  {
    slug: "phonak-audeo-lumity-l90",
    brand: "Phonak",
    type: "RIC",
    name: "Phonak Audéo Lumity L90-R",
    badge: "AutoSense OS 5.0",
    rating: 4.9,
    reviewCount: 386,
    feature: "Adaptive noise reduction for conversations in motion",
    overview:
      "Audéo Lumity L90-R is Phonak’s premium rechargeable RIC. AutoSense OS 5.0 switches scenes for you so you are not hunting through programs. It is the model we trial when speech in a car, a classroom or a restaurant is the main complaint — and when a Roger microphone may be added later.",
    features: [
      {
        title: "AutoSense OS 5.0",
        body: "The aid recognises quiet, noise, music, wind and speech-in-noise, then blends programs instead of making you tap a button every time the room changes.",
      },
      {
        title: "Speech from the side and behind",
        body: "Lumity is tuned for conversation that is not always in front of you — a partner in the passenger seat, a grandchild tugging your sleeve, a colleague walking beside you.",
      },
      {
        title: "Universal Bluetooth and hands-free calls",
        body: "Pairs widely across phones. Hands-free calling on supported models means the phone can stay in a bag or on the table.",
      },
      {
        title: "Ready for Roger when you need more",
        body: "If a spouse’s voice still disappears at a noisy table, we can add a Roger microphone later without changing the whole fitting philosophy.",
      },
    ],
    mrp: 265000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ric.svg",
  },
  {
    slug: "widex-moment-sheer-s440",
    brand: "Widex",
    type: "RIC",
    name: "Widex Moment Sheer S440",
    badge: "PureSound™",
    rating: 4.8,
    reviewCount: 254,
    feature: "Zero-delay sound for a more natural listening experience",
    overview:
      "Moment Sheer is the Widex people describe as ‘less processed’. PureSound cuts the lag that makes some aids sound like a loudspeaker next to your ear. We put it on the trial board for musicians, first-time wearers, and anyone who has rejected other brands for sounding fake.",
    features: [
      {
        title: "PureSound / ZeroDelay path",
        body: "Processing delay is cut so your brain is less likely to hear that classic echo against your own footsteps, crockery or piano. Music and room tone stay textured instead of flattened.",
      },
      {
        title: "SoundSense Learn",
        body: "You choose between two sound samples in the app. Over a few days the aid learns whether you prefer a warmer or more speech-forward mix — useful if you cannot describe sound in clinic jargon.",
      },
      {
        title: "Sheer RIC comfort",
        body: "A smaller RIC housing that sits closer to the ear. We still verify with real-ear measures so ‘natural’ does not mean under-amplified.",
      },
      {
        title: "Rechargeable everyday wear",
        body: "Dock overnight. Widex sound plus lithium-ion is the combination most of our Sheer patients actually live with, not a demo-only setting.",
      },
    ],
    mrp: 198000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ric.svg",
  },
  {
    slug: "oticon-intent-1",
    brand: "Oticon",
    type: "RIC",
    name: "Oticon Intent 1",
    badge: "AI Speech Clarity",
    rating: 5,
    reviewCount: 301,
    feature: "4D sensor technology that follows your listening intent",
    overview:
      "Intent 1 is Oticon’s flagship BrainHearing RIC. Instead of shrinking the world to a narrow beam, it keeps more of the scene and uses 4D sensors — conversation, motion, head and body — to guess what you are trying to hear. It is the trial we run when people hate ‘tunnel hearing’.",
    features: [
      {
        title: "4D sensors for listening intent",
        body: "The aid notices if you turn toward a talker, lean in, or start walking. Support for speech follows that intent rather than staying glued to whichever noise is loudest.",
      },
      {
        title: "On-chip deep neural network",
        body: "A DNN trained on real-world sound separates speech from noise without the dead, boxed-in character of aggressive older noise reduction.",
      },
      {
        title: "BrainHearing scene access",
        body: "Oticon’s bet is that your brain still wants spatial cues — a waiter at the side, traffic behind — so you stay oriented, not just ‘in speech mode’.",
      },
      {
        title: "Rechargeable with Companion app",
        body: "Charge overnight, stream from the phone, and let us fine-tune after a week of real meals and commutes, not only the quiet booth.",
      },
    ],
    mrp: 275000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ric.svg",
  },
  {
    slug: "starkey-genesis-ai-2400",
    brand: "Starkey",
    type: "RIC",
    name: "Starkey Genesis AI 2400",
    badge: "Edge Mode+",
    rating: 4.8,
    reviewCount: 198,
    feature: "On-device AI that boosts speech in restaurants and traffic",
    overview:
      "Genesis AI 2400 puts a neural processor on the chip so speech is lifted while you are still in the noise. Edge Mode+ is a tap when a restaurant or gust of wind overwhelms the automatic program. Optional wellness tools stay off unless you ask for them.",
    features: [
      {
        title: "On-device Genesis AI",
        body: "Machine learning runs on the aid, not in the cloud. Speech in a canteen or on a flyover is boosted without waiting for a phone connection.",
      },
      {
        title: "Edge Mode+",
        body: "When the automatic scene is not enough, a tap asks the aid for a short, aggressive clean-up — a rescue, not a new default that makes every room sound thin.",
      },
      {
        title: "My Starkey / Thrive app",
        body: "Streaming, volume and program control from the phone. Fall-alert and activity features exist on this family; we enable only what you actually want.",
      },
      {
        title: "Rechargeable RIC comfort",
        body: "Lithium-ion receivers-in-canal with overnight charging. We set physical fit and venting so AI processing is not fighting an uncomfortable shell.",
      },
    ],
    mrp: 230000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ric.svg",
  },
  {
    slug: "signia-styletto-ix",
    brand: "Signia",
    type: "BTE",
    name: "Signia Styletto IX",
    badge: "Designer Slim RIC",
    rating: 4.9,
    reviewCount: 167,
    feature: "Slim rechargeable design with all-day Bluetooth streaming",
    overview:
      "Styletto IX is the Signia people pick when they refuse a ‘medical’ look. The slim stick sits behind the ear, charges in a compact case, and still runs Integrated Xperience for speech in motion. It is a style choice that does not have to mean a weak prescription.",
    features: [
      {
        title: "Designer slim housing",
        body: "A narrow silhouette that reads closer to an earbud stem than a classic BTE. Hair and glasses still need a proper fit check — slim is not the same as invisible.",
      },
      {
        title: "IX speech processing in a small body",
        body: "You keep moving-talker support and Own Voice Processing, not a stripped ‘fashion’ program. We verify gain with real-ear so the look does not cost audibility.",
      },
      {
        title: "Portable rechargeable case",
        body: "The case is designed to live in a bag or on a nightstand. We show you a realistic on-ear time so the slimmer battery is not a surprise on a wedding day.",
      },
      {
        title: "Bluetooth and discreet controls",
        body: "Stream calls and media; use the app or a tap for volume. Good for people who will not wear a larger RIC for vanity reasons but still work in noise.",
      },
    ],
    mrp: 175000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/bte.svg",
  },
  {
    slug: "phonak-naida-lumity-l70",
    brand: "Phonak",
    type: "BTE",
    name: "Phonak Naída Lumity L70",
    badge: "Power BTE",
    rating: 4.7,
    reviewCount: 142,
    feature: "High-power amplification for severe-to-profound loss",
    overview:
      "Naída Lumity L70 is a power BTE for severe-to-profound loss. It is built to stay clean at high gain — feedback, headroom and a robust hook or slim tube — and it still talks to AutoSense and Roger when a partner’s voice needs a microphone, not just more volume.",
    features: [
      {
        title: "Headroom for severe-to-profound loss",
        body: "Enough amplification without the aid screaming into feedback the moment you hug someone or wear a helmet. Earmould choice is part of the fitting, not an afterthought.",
      },
      {
        title: "Lumity speech tools at high gain",
        body: "Power does not mean a 1990s ‘loud all the time’ sound. AutoSense still shifts for noise, wind and speech so shouting environments are not unbearable.",
      },
      {
        title: "Roger-ready when volume is not enough",
        body: "Distance and noise still beat raw gain. A Roger mic for a spouse or teacher is often the difference between ‘I hear noise’ and ‘I hear words’.",
      },
      {
        title: "Rechargeable power users",
        body: "Lithium-ion in a larger BTE body typically outlasts slim RICs. We confirm charger habits so a profound loss is never paired with a dead battery at 4 pm.",
      },
    ],
    mrp: 185000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/bte.svg",
  },
  {
    slug: "widex-unique-440-cic",
    brand: "Widex",
    type: "CIC",
    name: "Widex Unique 440 CIC",
    badge: "Nearly Invisible",
    rating: 4.6,
    reviewCount: 98,
    feature: "Custom canal fit with discreet everyday wear",
    overview:
      "Unique 440 CIC is a custom canal aid for people who will not wear anything behind the ear. It sits in the canal, uses your own ear acoustics, and stays off Bluetooth so there is no radio in a tiny shell. Best when the audiogram and ear canal can actually take a CIC.",
    features: [
      {
        title: "Custom shell from your ear impression",
        body: "We take impressions so the aid locks in without rubbing. A CIC that is ‘almost right’ will whistle or hurt — the shell is the product as much as the chip.",
      },
      {
        title: "Discreet in conversation and on camera",
        body: "Little to no hardware over the pinna. Glasses, masks and helmets do not fight a RIC wire. Makeup and hair stay simpler.",
      },
      {
        title: "Widex sound in a small package",
        body: "The goal is still a natural, less processed tone. Battery size and venting limit how much wireless we can add — we are honest about that before you commit.",
      },
      {
        title: "When CIC is the wrong choice",
        body: "Very severe loss, frequent ear infections, or a canal that cannot hold a shell — we will steer you to a RIC instead of forcing invisible at the cost of hearing.",
      },
    ],
    mrp: 125000,
    inStock: true,
    rechargeable: false,
    bluetooth: false,
    image: "/images/products/cic.svg",
  },
  {
    slug: "oticon-own-2-iic",
    brand: "Oticon",
    type: "IIC",
    name: "Oticon Own 2 IIC",
    badge: "Invisible In Canal",
    rating: 4.7,
    reviewCount: 121,
    feature: "Deep-fit custom shell that stays out of sight",
    overview:
      "Oticon Own 2 sits deep in the canal so even a CIC looks obvious by comparison. It is for vanity-first wearers whose audiogram and anatomy allow an IIC. BrainHearing ideas still apply, but physics wins: tiny batteries, no streaming, careful insertion.",
    features: [
      {
        title: "Deep invisible fit",
        body: "Placed in the second bend of the canal when anatomy allows. Friends and colleagues typically do not see it in normal conversation or on a video call.",
      },
      {
        title: "Your pinna does the spatial work",
        body: "Because nothing sits over the ear, the folds of the outer ear keep doing their job. Direction often feels more ‘in the world’ than a closed RIC.",
      },
      {
        title: "Custom medical-grade shell",
        body: "Impression, scan and a handling line or removal filament we teach you to use. IICs that are too deep without training get left in a drawer.",
      },
      {
        title: "Clear limits, said up front",
        body: "No Bluetooth, smaller battery, not for every loss or every canal. If you need streaming or severe-loss power, Own is the wrong hero — we will say so.",
      },
    ],
    mrp: 145000,
    inStock: true,
    rechargeable: false,
    bluetooth: false,
    image: "/images/products/iic.svg",
  },
  {
    slug: "signia-insio-charge-go-ix",
    brand: "Signia",
    type: "ITE",
    name: "Signia Insio Charge&Go IX",
    badge: "Custom Rechargeable",
    rating: 4.8,
    reviewCount: 88,
    feature: "Custom ITE with contactless charging and Bluetooth",
    overview:
      "Insio Charge&Go IX is a custom in-the-ear aid that charges without metal contacts and still runs IX processing plus Bluetooth. It is the middle path: more discreet than a RIC, more features than a tiny CIC, for people who want custom and rechargeable.",
    features: [
      {
        title: "Contactless custom charging",
        body: "Drop the shells in the charger — no pins to corrode with sweat or humidity, a real issue in Indian summers for older contact-charge customs.",
      },
      {
        title: "IX in a custom shell",
        body: "Moving-speech support and Own Voice Processing in a device that fills the concha or canal, not a tube over the ear. Glasses and masks stay easier.",
      },
      {
        title: "Bluetooth without a behind-the-ear radio",
        body: "Streaming from a custom ITE is the reason many patients step up from CIC. We check ear size so the antenna and battery still fit comfortably.",
      },
      {
        title: "Made around your ear, not a one-size RIC",
        body: "Impression, colour options, and a wax system we teach you to maintain. Custom only works if after-care is as serious as the first fit.",
      },
    ],
    mrp: 165000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ite.svg",
  },
  {
    slug: "phonak-virto-paradise-p90",
    brand: "Phonak",
    type: "ITC",
    name: "Phonak Virto Paradise P90",
    badge: "Custom ITC",
    rating: 4.6,
    reviewCount: 76,
    feature: "In-the-canal custom fit tuned for speech in noise",
    overview:
      "Virto Paradise P90 is a custom in-the-canal Phonak: more visible than an IIC, far less hardware than a RIC. Paradise-era wireless and speech tools sit in a shell that uses your canal. We trial it when someone wants custom cosmetics but still needs phone streaming.",
    features: [
      {
        title: "ITC custom cosmetics",
        body: "Fills part of the canal and bowl — noticeable if someone looks, invisible from most conversational distances. A practical compromise versus deep IIC.",
      },
      {
        title: "Paradise speech in noise",
        body: "Phonak’s speech-in-noise DNA in a custom form. We still run real-ear; a pretty shell that is under-fit is just an expensive earplug.",
      },
      {
        title: "Wireless without a RIC wire",
        body: "Selected Virto Paradise models stream. If calls are daily life, this is often a better custom than a non-wireless CIC.",
      },
      {
        title: "Moulded for Indian wear conditions",
        body: "Sweat, glasses and helmets are part of the impression conversation. We pick varnish, venting and a removal notch you can actually use.",
      },
    ],
    mrp: 155000,
    inStock: true,
    rechargeable: false,
    bluetooth: true,
    image: "/images/products/itc.svg",
  },
  {
    slug: "resound-nexia-r",
    brand: "ReSound",
    type: "RIC",
    name: "ReSound Nexia R",
    badge: "Auracast Ready",
    rating: 4.7,
    reviewCount: 134,
    feature: "Next-gen Bluetooth LE Audio with organic sound quality",
    overview:
      "Nexia R is ReSound’s rechargeable RIC with Bluetooth LE Audio and Auracast on the roadmap for venues and TVs. M&RIE — a microphone in the ear canal — uses your pinna so direction does not feel ‘inside the processor’. We trial it for iPhone-heavy lives and for people who want spatial, organic sound.",
    features: [
      {
        title: "M&RIE third microphone",
        body: "A mic in the canal lets the folds of your outer ear shape sound before the chip sees it. Depth and ‘out of my head’ location are the usual comments after a side-by-side with a standard RIC.",
      },
      {
        title: "Bluetooth LE Audio and Auracast",
        body: "Newer wireless than classic Bluetooth streaming. Auracast is the public-broadcast standard arriving in airports, halls and TVs — Nexia is built to join that, not only pair to one phone.",
      },
      {
        title: "Organic Hearing tuning",
        body: "ReSound’s brief is to keep your own ear in the loop. We still match prescription targets; organic is not an excuse for a weak first fit.",
      },
      {
        title: "GN / Jabra call quality",
        body: "Same group as Jabra headsets. If your day is calls on iPhone or Android, this is often the cleanest wireless demo we run next to Signia or Phonak.",
      },
    ],
    mrp: 215000,
    inStock: true,
    rechargeable: true,
    bluetooth: true,
    image: "/images/products/ric.svg",
  },
];

const styleGallery: Record<HearingAidStyle, string[]> = {
  RIC: ["/images/hero/slide-02.webp", "/images/hero/slide-01.webp", "/images/products/ric.svg"],
  BTE: ["/images/hero/slide-03.webp", "/images/hero/slide-01.webp", "/images/products/bte.svg"],
  ITC: ["/images/hero/slide-04.webp", "/images/products/itc.svg", "/images/hero/slide-05.webp"],
  CIC: ["/images/hero/slide-04.webp", "/images/products/cic.svg", "/images/hero/slide-05.webp"],
  IIC: ["/images/hero/slide-04.webp", "/images/products/iic.svg", "/images/hero/slide-05.webp"],
  ITE: ["/images/hero/slide-05.webp", "/images/products/ite.svg", "/images/hero/slide-04.webp"],
};

function seedFeatureIds(product: RawProduct): import("@/types").HearingAidFeatureId[] {
  const ids: import("@/types").HearingAidFeatureId[] = [];
  if (product.rechargeable) ids.push("rechargeable");
  if (product.bluetooth) ids.push("bluetooth");
  if (product.type !== "CIC" && product.type !== "IIC") ids.push("noise-cancellation");
  if (product.type === "CIC" || product.type === "IIC") ids.push("invisible");
  if (product.type === "ITC" || product.type === "CIC" || product.type === "IIC" || product.type === "ITE") {
    ids.push("custom-fit");
  }
  if (
    /na[ií]da/i.test(`${product.slug} ${product.name}`) ||
    /\bpower bte\b/i.test(product.badge) ||
    /high-power|severe-to-profound/i.test(`${product.badge} ${product.feature} ${product.overview}`)
  ) {
    ids.push("power");
  }
  return [...new Set(ids)];
}

export const fallbackProducts: Product[] = rawProducts.map((product) => {
  const extras = styleGallery[product.type].filter((src) => src !== product.image);
  return {
    ...product,
    id: `seed-${product.slug}`,
    brandSlug: product.brand.toLowerCase(),
    featureIds: seedFeatureIds(product),
    images: [product.image, ...extras],
    colors: [],
    published: true,
  };
});

export const products = fallbackProducts;
