import type { HearingAidStyle } from "@/types";
import type { HearingAidFeatureId } from "@/data/hearing-aids";

export type CollectionPoint = { title: string; body: string };
export type CollectionFact = { label: string; value: string };

export const hearingAidTypePages: Record<
  HearingAidStyle,
  {
    headline: string;
    tagline: string;
    intro: string;
    facts: CollectionFact[];
    points: CollectionPoint[];
    highlights: string[];
  }
> = {
  RIC: {
    headline: "RIC hearing aids",
    tagline: "The speaker sits in the canal. The brain of the aid sits behind the ear.",
    intro:
      "Receiver-in-canal is the style Hearing Hope trials most often. A thin wire carries a tiny speaker into the ear; the microphone, battery and Bluetooth live in a small case behind the pinna. It is not a fashion choice first — it is how we get rechargeable power, streaming and speech-in-noise into an aid people will actually wear.",
    facts: [
      { label: "Sits", value: "Behind the ear + canal" },
      { label: "Typical loss", value: "Mild to severe" },
      { label: "Usually", value: "Rechargeable + Bluetooth" },
    ],
    points: [
      {
        title: "Who a RIC is for",
        body: "Everyday wearers who need speech in offices, traffic and family dinners, and who will accept a small case behind the ear in exchange for all-day charge and phone streaming. Glasses and masks still need a fit check — the wire and dome are part of the prescription.",
      },
      {
        title: "How we fit it here",
        body: "Dome or custom mould, venting, and real-ear measures. We do not leave the receiver ‘one size’. Own-voice, feedback and a week of fine-tuning decide whether this RIC stays on your ear or we move you to a BTE or a custom shell.",
      },
      {
        title: "When we will not push a RIC",
        body: "If you refuse anything visible behind the ear, if the loss needs more headroom than a slim receiver can give, or if the canal cannot hold a dome without pain. Vanity and power both beat a RIC that you will leave in a drawer.",
      },
    ],
    highlights: [
      "Most common trial at Hearing Hope",
      "Open or closed domes, or a custom mould",
      "Streaming and rechargeable on most models we stock",
      "Programmed to your audiogram, not a default ‘speech’ preset",
    ],
  },
  BTE: {
    headline: "BTE hearing aids",
    tagline: "The full instrument sits behind the ear — including the power you cannot hide in a canal.",
    intro:
      "Behind-the-ear aids keep the receiver in the case, then send sound down a tube or hook into an earmould or slim tube. That extra body is why we reach for a BTE when the loss is severe, the ear is small, or a slim RIC keeps running out of gain. Slim designer BTEs (like Styletto) sit in this family too — style without pretending they are invisible.",
    facts: [
      { label: "Sits", value: "Fully behind the ear" },
      { label: "Typical loss", value: "Mild to profound" },
      { label: "Strength", value: "Headroom and battery" },
    ],
    points: [
      {
        title: "Who a BTE is for",
        body: "Severe-to-profound loss, frequent mould changes, children, or anyone a RIC cannot drive cleanly. Also people who want a slim rechargeable silhouette and will not wear a classic beige brick — we trial those as BTE/slim-RIC hybrids, still verified with real-ear.",
      },
      {
        title: "How we fit it here",
        body: "Hook or slim tube, earmould when you need seal, and enough venting that you do not live in a barrel. Power BTEs get Roger or a partner microphone when volume alone still loses speech at a noisy table.",
      },
      {
        title: "When a BTE is the wrong hero",
        body: "If the audiogram is mild and you only care about cosmetics, a RIC or custom ITE usually wins. A huge BTE on a mild loss is not ‘safer’ — it is just more hardware.",
      },
    ],
    highlights: [
      "Power models for severe-to-profound loss",
      "Slim designer BTEs when you want a thinner look",
      "Earmoulds we remake as the ear changes",
      "Still sold at listed MRP after a proper trial",
    ],
  },
  ITC: {
    headline: "ITC hearing aids",
    tagline: "Custom in-the-canal — more discreet than a RIC, more wearable than a deep IIC.",
    intro:
      "In-the-canal hearing aids are moulded to your ear and fill part of the canal and bowl. Someone looking closely can see them; most conversational distances cannot. We trial ITC when you want custom cosmetics but still need a battery and wireless that a tiny CIC cannot hold.",
    facts: [
      { label: "Sits", value: "In the canal / bowl" },
      { label: "Made from", value: "Your ear impression" },
      { label: "Trade-off", value: "Size vs streaming" },
    ],
    points: [
      {
        title: "Who an ITC is for",
        body: "People who hate a wire over the ear, wear glasses or helmets, and whose audiogram still fits in a custom shell with room for a wireless chip. Phone calls matter — this is often a better custom than a non-streaming CIC.",
      },
      {
        title: "How we fit it here",
        body: "Impression, colour, venting and a removal notch you can actually use. Sweat, varnish and Indian summers are part of the conversation. We still run real-ear; a pretty shell that is under-fit is an expensive earplug.",
      },
      {
        title: "When we steer you away",
        body: "Very severe loss, frequent infections, or a canal that cannot hold a shell. If you need maximum invisibility and will accept no Bluetooth, we talk IIC instead — only if anatomy allows.",
      },
    ],
    highlights: [
      "Custom shell from your impression",
      "More features than a deep IIC typically allows",
      "Easier glasses and masks than a RIC wire",
      "Maintenance we teach you before you leave",
    ],
  },
  CIC: {
    headline: "CIC hearing aids",
    tagline: "Completely in the canal — nearly hidden, with honest limits on power and wireless.",
    intro:
      "A CIC sits deep enough that there is little or nothing over the ear. Friends on a video call often miss it. Physics still wins: smaller batteries, less streaming, and only if your loss and canal can take the shell. Hearing Hope will not sell ‘invisible’ at the cost of hearing the people you live with.",
    facts: [
      { label: "Sits", value: "Deep in the canal" },
      { label: "Look", value: "Nearly hidden" },
      { label: "Limits", value: "Battery and Bluetooth" },
    ],
    points: [
      {
        title: "Who a CIC is for",
        body: "Mild-to-moderate loss, vanity-first wearers, and ears that can hold a custom canal aid without chronic infection. Makeup, helmets and glasses stay simpler because nothing sits on the pinna.",
      },
      {
        title: "How we fit it here",
        body: "Impressions that lock without rubbing. A CIC that is ‘almost right’ will whistle or hurt. We teach insertion and wax care — this style fails in drawers more than RICs do.",
      },
      {
        title: "The no we will say out loud",
        body: "Severe loss, need for all-day streaming, or a canal that cannot seat the shell. Then we trial a RIC or ITE and explain why invisible would be a worse hearing aid, not a better one.",
      },
    ],
    highlights: [
      "Custom canal cosmetics",
      "Your pinna still shapes sound",
      "Honest about no or limited Bluetooth",
      "Only recommended after we see the audiogram and the ear",
    ],
  },
  IIC: {
    headline: "IIC hearing aids",
    tagline: "Invisible in the canal — the deepest custom fit we will only recommend if the ear allows it.",
    intro:
      "Invisible-in-canal aids sit in the second bend when anatomy allows. Even a CIC can look obvious next to a well-fitted IIC. They are not a prize for paying more. They are a small medical device with tiny batteries and no streaming, for the right graph and the right canal.",
    facts: [
      { label: "Sits", value: "Deepest custom fit" },
      { label: "Look", value: "Out of sight in conversation" },
      { label: "Not for", value: "Every ear or every loss" },
    ],
    points: [
      {
        title: "Who an IIC is for",
        body: "People who will not wear anything visible, whose thresholds still fit a deep shell, and who will practise insertion. Video calls, close conversation and hair-up days are the usual reasons — not a magazine headline.",
      },
      {
        title: "How we fit it here",
        body: "Deep impression, a handling line or removal filament, and training until you can insert it without a clinic visit every morning. We check wax and infections; an IIC in an angry ear is a bad idea.",
      },
      {
        title: "When invisible is the wrong promise",
        body: "Need Bluetooth, severe loss, or a canal that cannot take the depth. We would rather you hear with a RIC than own an IIC you cannot wear.",
      },
    ],
    highlights: [
      "Deepest cosmetics we offer",
      "Custom medical-grade shell",
      "No streaming on the models we trial in this size",
      "Anatomy vetoes the sale — we will say no",
    ],
  },
  ITE: {
    headline: "ITE hearing aids",
    tagline: "Custom in-the-ear — rechargeable and Bluetooth in a shell made around your ear.",
    intro:
      "In-the-ear custom aids fill more of the bowl than a CIC. That extra room is why Signia Insio Charge&Go and similar models can charge without contacts and still stream. ITE is the middle path: more discreet than a RIC, more features than a tiny canal aid.",
    facts: [
      { label: "Sits", value: "Custom in the ear" },
      { label: "Often", value: "Rechargeable + wireless" },
      { label: "Made from", value: "Your impression" },
    ],
    points: [
      {
        title: "Who an ITE is for",
        body: "People who want custom cosmetics and will not give up charging or phone streaming. Glasses and masks are easier than a RIC wire. The concha has to have room — we check that before we promise the shell.",
      },
      {
        title: "How we fit it here",
        body: "Impression, colour, contactless charging where the model allows, and a wax system you can maintain. Custom only works if after-care is as serious as the first visit.",
      },
      {
        title: "When we pick something else",
        body: "If you need a deep invisible look, CIC/IIC. If you need maximum power or the smallest behind-the-ear package, RIC or BTE. ITE is not a default upgrade.",
      },
    ],
    highlights: [
      "Custom shell with room for a modern chip",
      "Rechargeable options without a RIC wire",
      "Bluetooth on selected models",
      "Fitted and sold at listed MRP after trial",
    ],
  },
};

export const hearingAidFeaturePages: Record<
  HearingAidFeatureId,
  {
    headline: string;
    facts: CollectionFact[];
    points: CollectionPoint[];
    highlights: string[];
    heroImage: string;
  }
> = {
  rechargeable: {
    headline: "Rechargeable hearing aids",
    facts: [
      { label: "Charge", value: "Case overnight" },
      { label: "Aim", value: "A full waking day" },
      { label: "We check", value: "Real wearing hours" },
    ],
    points: [
      {
        title: "What rechargeable actually means",
        body: "Lithium-ion cells in the aids, a dock or contactless case at night. No weekly hunt for 312 batteries — unless we have put you in a tiny CIC that physically cannot hold the cell. Brochure ‘36 hours’ is not a promise until we match it to your stream-and-talk day.",
      },
      {
        title: "How Hearing Hope fits them",
        body: "We time a realistic day with you: commute, calls, TV. If a slim RIC dies at 6 pm, we change the model or the streaming habits — we do not shrug. Remaining payment is at the fitting, listed MRP.",
      },
      {
        title: "When batteries still win",
        body: "Deep CIC and IIC shells often cannot take a rechargeable pack. If invisible is the priority, we say so before you fall in love with a charging case on Instagram.",
      },
    ],
    highlights: [
      "Overnight dock, like a phone",
      "Portable cases on slim models",
      "Custom ITE contactless charging on selected lines",
      "Hours verified against your actual day",
    ],
    heroImage: "/images/products/ric.svg",
  },
  bluetooth: {
    headline: "Bluetooth hearing aids",
    facts: [
      { label: "Streams", value: "Calls, maps, media" },
      { label: "We pair", value: "Your phone in clinic" },
      { label: "Not in", value: "Most deep CIC / IIC" },
    ],
    points: [
      {
        title: "What streaming is for",
        body: "Phone calls in both ears, maps without a speaker blasting the car, TV at a volume that does not punish the family. Hands-free on supported models means the handset can stay on the table.",
      },
      {
        title: "How we set it up",
        body: "We pair iPhone or Android before you leave. If it will not hold a pair, that model is the wrong trial — not ‘your phone is weird’. Auracast-ready aids (like ReSound Nexia) are built for venues and TVs that are only now arriving.",
      },
      {
        title: "The size tax",
        body: "A radio and antenna need volume. Invisible canal aids usually skip Bluetooth. If calls are daily life, we will not hide the aid at the cost of you missing them.",
      },
    ],
    highlights: [
      "Paired in clinic, not a PDF",
      "Calls and media in both ears",
      "App fine-tuning after a week of real use",
      "Honest when a custom shell cannot stream",
    ],
    heroImage: "/images/products/ric.svg",
  },
  "noise-cancellation": {
    headline: "Noise-cancelling hearing aids",
    facts: [
      { label: "Goal", value: "Speech in noise" },
      { label: "Not", value: "Mute the world" },
      { label: "Set from", value: "Your audiogram + taste" },
    ],
    points: [
      {
        title: "What ‘noise cancellation’ means in a hearing aid",
        body: "Chips lift speech while the room stays noisy — restaurants, traffic, offices. It is not a headphone mute. Too aggressive and the world goes thin and dead; too soft and you still miss the person beside you. That mix is a fitting, not a spec sheet.",
      },
      {
        title: "How we choose the chip",
        body: "After the audiogram we trial two or three speech-in-noise RICs — Signia IX, Phonak Lumity, Oticon Intent, Starkey Genesis and similar — in a real room, not only a booth. You tell us which conversation you can follow.",
      },
      {
        title: "When noise tools are the wrong fix",
        body: "If the prescription is under-fit, no AI saves it. If the loss is profound, a Roger microphone may matter more than a smarter noise program. We say that in clinic.",
      },
    ],
    highlights: [
      "Speech in motion, not only in a still booth",
      "Trialled in a noisy room when we can",
      "Fine-tuned after a week of real meals",
      "Never a substitute for a correct audiogram fit",
    ],
    heroImage: "/images/products/ric.svg",
  },
  invisible: {
    headline: "Invisible hearing aids",
    facts: [
      { label: "Styles", value: "CIC and IIC" },
      { label: "Look", value: "Out of sight if anatomy allows" },
      { label: "Cost of size", value: "Power and streaming" },
    ],
    points: [
      {
        title: "Invisible is a fitting, not a filter",
        body: "CIC and IIC sit in the canal so there is nothing over the ear. They only work if your loss and ear anatomy allow it. Hearing Hope will not sell a deep shell that cannot carry your audiogram just because the photo looks clean.",
      },
      {
        title: "How we decide",
        body: "Audiogram, otoscopy, impression. If the canal or the thresholds say no, we trial a discreet RIC or custom ITE instead and explain the trade. Friends not noticing the aid is useless if you still cannot hear them.",
      },
      {
        title: "What you give up",
        body: "Usually Bluetooth, usually rechargeable, always some headroom. We list those limits before you commit — not after the shell is made.",
      },
    ],
    highlights: [
      "CIC and IIC only when the ear allows",
      "Custom impression, not a one-size dome",
      "We will refuse the sale if audibility loses",
      "Listed MRP, trial first where we can",
    ],
    heroImage: "/images/products/iic.svg",
  },
  "custom-fit": {
    headline: "Custom-fit hearing aids",
    facts: [
      { label: "Styles", value: "ITC, CIC, IIC, ITE" },
      { label: "Starts with", value: "Your ear impression" },
      { label: "Also", value: "Venting, colour, wax system" },
    ],
    points: [
      {
        title: "The shell is the product",
        body: "Custom hearing aids are moulded to your ear. Fit, venting and colour are not accessories. A chip in a shell that rubs or whistles is a failed fit, however premium the brand on the invoice.",
      },
      {
        title: "How Hearing Hope makes them",
        body: "Impression or scan, medical-grade materials, and a removal path you can use. Indian heat and sweat change varnish and charging contacts — we pick the construction for that, then teach wax care before you go home.",
      },
      {
        title: "When custom is the wrong first trial",
        body: "If we still need to compare sound signatures across brands, a RIC dome is faster. Custom comes when cosmetics, glasses or a stable mould are the point — after we know the prescription.",
      },
    ],
    highlights: [
      "ITC, CIC, IIC and custom ITE",
      "Made around your ear, not a stock size",
      "Rechargeable custom on selected ITE lines",
      "After-care is part of the product",
    ],
    heroImage: "/images/products/ite.svg",
  },
  power: {
    headline: "High-power hearing aids",
    facts: [
      { label: "For", value: "Severe to profound loss" },
      { label: "Usually", value: "Power BTE + mould" },
      { label: "More than gain", value: "Seal, feedback, Roger" },
    ],
    points: [
      {
        title: "Louder is not automatically better",
        body: "Power BTEs exist because a slim RIC runs out of headroom. We still program to your audiogram. A whistling mould or a distorted peak is not ‘more hearing’ — it is a bad fit. Naída-class instruments are the usual trial when thresholds demand it.",
      },
      {
        title: "How we fit power here",
        body: "Earmould seal, feedback management, and enough battery for a long day at high gain. If a partner’s voice still disappears at a noisy table, we add a Roger microphone rather than only turning the aid up.",
      },
      {
        title: "When power BTE is too much iron",
        body: "Mild-to-moderate loss does not need a brick behind the ear. We will not upsell headroom you will never use.",
      },
    ],
    highlights: [
      "Headroom for severe-to-profound loss",
      "Moulds remade as the ear changes",
      "Roger-ready when volume is not enough",
      "Verified with real-ear, not a maxed volume wheel",
    ],
    heroImage: "/images/products/bte.svg",
  },
};
