import type { BlogAuthor, BlogPost } from "@/types";

const authors = {
  payal: {
    name: "Payal Soni",
    role: "Senior Audiologist",
    image: "/images/team/payal-soni.jpg",
  },
  harshi: {
    name: "Dr. Harshi Verma",
    role: "ENT & Audiologist",
    image: "/images/team/harshi-verma.jpg",
  },
  neelam: {
    name: "Neelam Verma",
    role: "Director · Audiologist",
    image: "/images/team/neelam-verma.jpg",
  },
  mithlesh: {
    name: "Mithlesh Kumar",
    role: "Assistant Audiologist",
    image: "/images/team/mithlesh-kumar.jpg",
  },
  bhawna: {
    name: "Bhawna Sharma",
    role: "Hearing Care Counsellor",
    image: "/images/team/bhawna-sharma.jpg",
  },
} satisfies Record<string, BlogAuthor>;

export const BLOGS_PER_PAGE = 6;

export const blogs: BlogPost[] = [
  {
    slug: "signs-you-need-a-hearing-test",
    title: "7 signs it’s time for a hearing test",
    excerpt:
      "Turning the TV up, missing doorbells, or asking people to repeat themselves are early clues. Here’s when a 30-minute test is the safest next step.",
    category: "Hearing health",
    publishedAt: "2026-08-12",
    readTime: "8 min",
    image: "/images/blog/signs-hearing-test.svg",
    imageAlt: "Illustration of a free 30-minute hearing test checklist",
    author: authors.payal,
    sections: [
      {
        id: "why-early-testing-matters",
        heading: "Why early testing matters",
        paragraphs: [
          "Hearing loss rarely arrives overnight. It creeps in — a missed punchline, a doorbell you did not hear, a family dinner that feels more tiring than it used to. Most adults wait years after the first signs before they book a test. In that gap, conversations get shorter, confidence dips, and the brain has to work harder to fill in missing sounds.",
          "A diagnostic hearing test at Hearing Hope takes about 30 minutes. There is no obligation to buy a device. You leave with a clear picture of both ears, explained in plain language, and a next step that matches your lifestyle — whether that is monitoring, a trial, or simply peace of mind.",
        ],
      },
      {
        id: "seven-signs",
        heading: "Seven signs you should not ignore",
        paragraphs: [
          "You do not need every sign on this list. Two or three that keep repeating are already a reason to get both ears checked. Family members often notice the pattern before you do — that is information, not criticism.",
        ],
        list: [
          "You turn the TV or phone volume higher than others in the room prefer.",
          "You ask people to repeat themselves, especially in restaurants or family gatherings.",
          "Doorbells, phone rings, or the cooker whistle are easy to miss.",
          "Speech sounds mumbled; you hear that someone is talking but not the words.",
          "You avoid calls or group conversations because they feel exhausting.",
          "Tinnitus — ringing, buzzing, or hissing — is more noticeable in quiet rooms.",
          "A parent, partner, or colleague has asked whether you have had a hearing test.",
        ],
      },
      {
        id: "what-the-test-includes",
        heading: "What the 30-minute test includes",
        paragraphs: [
          "We start with a short history: when you first noticed a change, noise exposure at work, medicines, and which ear feels weaker. Then we look in the ear canal to rule out wax or infection that can mimic hearing loss.",
          "Pure-tone audiometry maps the quietest sounds you can hear at different pitches. Speech testing checks how clearly you understand words, not just beeps. Together they form an audiogram — a chart your audiologist will walk through without jargon.",
        ],
      },
      {
        id: "home-or-clinic",
        heading: "Home visit or clinic: which to choose",
        paragraphs: [
          "If travel is hard for an elderly parent, a home test is often the kinder first step. We bring calibrated equipment, test both ears, and explain results at the dining table. Clinic visits at Rohini, Green Park, Indirapuram or Sanjay Nagar suit people who want a booth environment or a same-day look at device styles.",
          "Either way, the clinical standard is the same. You are not choosing a ‘lesser’ test by staying home — you are choosing convenience.",
        ],
      },
      {
        id: "after-the-results",
        heading: "What happens after the results",
        paragraphs: [
          "If hearing is within normal limits, we tell you so and suggest when to retest. If there is a loss, we discuss whether a hearing aid trial, medical referral, or simply monitoring is appropriate. Pricing is shown as MRP. There is no pressure to decide on the same day.",
          "Book a free test when the signs above feel familiar. Catching a change early makes every later option — including a trial — simpler.",
        ],
      },
    ],
  },
  {
    slug: "ric-vs-bte-vs-cic",
    title: "RIC vs BTE vs CIC: which hearing aid style fits you?",
    excerpt:
      "A clear guide to hearing aid types used in Indian clinics — from nearly invisible custom shells to powerful behind-the-ear devices.",
    category: "Guides",
    publishedAt: "2026-08-04",
    readTime: "9 min",
    image: "/images/blog/hearing-aid-styles.svg",
    imageAlt: "Comparison of RIC, BTE and CIC hearing aid styles",
    author: authors.harshi,
    sections: [
      {
        id: "style-is-not-the-first-decision",
        heading: "Style is not the first decision",
        paragraphs: [
          "Catalogues lead with how a hearing aid looks. Clinically, we start with your audiogram, ear anatomy, and daily life. A nearly invisible shell that cannot deliver the power you need is a poor fit. A larger device that you will actually wear all day is a good one.",
          "At Hearing Hope we fit after a proper evaluation, not from a brochure. The styles below are the ones Indian patients ask about most: RIC, BTE, and custom canal devices (CIC and IIC).",
        ],
      },
      {
        id: "ric",
        heading: "RIC: the everyday workhorse",
        paragraphs: [
          "Receiver-in-canal (RIC) models sit behind the ear with a thin wire to a speaker in the canal. They balance power and discretion, handle mild to severe loss, and most modern RICs are rechargeable with Bluetooth.",
          "They suit people who want a slim profile, all-day battery, and the option to stream calls. They are less ideal if you have very small canals, chronic drainage, or need a fully hidden look for work.",
        ],
      },
      {
        id: "bte",
        heading: "BTE: power and reliability",
        paragraphs: [
          "Behind-the-ear (BTE) devices keep the electronics in a case behind the ear, with sound delivered through a tube and earmould. They remain the best choice for severe to profound loss, children’s fittings, and ears that need frequent medical care.",
          "A well-made earmould is comfortable. Many patients who expected to ‘hate the look’ prefer BTE once they hear how much clearer speech becomes in noise.",
        ],
      },
      {
        id: "cic-iic",
        heading: "CIC and IIC: the hidden option",
        paragraphs: [
          "Completely-in-canal (CIC) and invisible-in-canal (IIC) shells are custom-made from an ear impression. They sit deeper in the canal, so little or nothing shows from the outside. They are popular with professionals who want a discreet fit.",
          "They are not for everyone. Severe loss, very narrow canals, or a need for maximum Bluetooth features can rule them out. Some deep-fit shells still use disposable batteries because there is no room for a rechargeable cell.",
        ],
      },
      {
        id: "how-we-choose",
        heading: "How we choose with you",
        paragraphs: [
          "We match style to: degree of loss, ear-canal size, dexterity (can you handle a tiny battery?), work and social noise, and whether you want streaming. A short trial in your own home tells you more than any comparison chart.",
          "If you are comparing RIC vs BTE vs CIC, book a test first. The right style is the one your audiogram and your week can actually support.",
        ],
      },
    ],
  },
  {
    slug: "hearing-aid-prices-india-2026",
    title: "Hearing aid prices in India: what to expect in 2026",
    excerpt:
      "From entry devices to premium AI rechargeable pairs — how MRP, after-care, and real-world quotes actually work.",
    category: "Pricing",
    publishedAt: "2026-07-28",
    readTime: "8 min",
    image: "/images/blog/prices-india.svg",
    imageAlt: "Hearing aid price ranges in India for 2026",
    author: authors.neelam,
    sections: [
      {
        id: "why-prices-vary",
        heading: "Why two quotes can look so different",
        paragraphs: [
          "Hearing aid prices in India span a wide range because you are not buying a single gadget. You are buying a medical device, programming, follow-up visits, and often a warranty pack. A number quoted on a marketplace without an audiogram is not a clinical quote.",
          "Hearing Hope shows MRP on every model we list. Final quotes depend on your audiogram, whether you need one ear or both, accessories, and the after-care package you choose. We explain that before you trial anything.",
        ],
      },
      {
        id: "price-bands",
        heading: "Typical price bands in 2026",
        paragraphs: [
          "Entry devices may begin around ₹25,000 per ear for basic digital amplification. Mid-range RIC and BTE models with rechargeable batteries and Bluetooth commonly sit in the ₹80,000–₹1.5 lakh band per pair, depending on brand and features.",
          "Premium AI rechargeable pairs from Signia, Phonak, Widex, Oticon and others can exceed ₹2 lakh per pair. Those prices reflect automatic noise handling, streaming, and longer manufacturer support — not a ‘better ear’ in a moral sense. Many patients do exceptionally well on a mid-range fit.",
        ],
      },
      {
        id: "what-mrp-includes",
        heading: "What MRP should include",
        paragraphs: [
          "Ask what is inside the number: the devices themselves, custom earmoulds or domes, chargers, programming sessions, follow-up visits, and warranty length. A lower headline price that excludes after-care is not cheaper; it is incomplete.",
        ],
        list: [
          "Device MRP for one ear or a pair — confirm which.",
          "Fitting, programming, and at least the first follow-up.",
          "Warranty (standard vs extended, up to four years on eligible models).",
          "Accessories: charger, drying kit, remote app support.",
        ],
      },
      {
        id: "one-ear-or-two",
        heading: "One ear or two?",
        paragraphs: [
          "If both ears have a loss, two devices usually give better direction, balance, and ease in noise. We still discuss budget honestly. Starting with the poorer ear and adding the second later is sometimes a practical plan — we will tell you if that would compromise the result.",
          "Never buy a pair online to ‘save the test’. Programming to your audiogram is the clinical step that makes the price worthwhile.",
        ],
      },
      {
        id: "next-step-on-price",
        heading: "A sensible next step",
        paragraphs: [
          "Compare models on our price list, then book a free test. A quote after an audiogram is the only number that applies to you. We would rather you leave with a clear range than a rushed decision.",
        ],
      },
    ],
  },
  {
    slug: "free-home-hearing-test",
    title: "What happens in a free home hearing test?",
    excerpt:
      "An audiologist visits, tests both ears, and walks you through results in about half an hour — with no pressure to purchase.",
    category: "Services",
    publishedAt: "2026-07-18",
    readTime: "7 min",
    image: "/images/blog/home-test.svg",
    imageAlt: "Audiologist carrying out a home hearing test",
    author: authors.mithlesh,
    sections: [
      {
        id: "who-home-tests-help",
        heading: "Who home tests are for",
        paragraphs: [
          "Home tests are built for families who find clinic travel hard: elderly parents, people recovering from illness, or households in Delhi NCR who simply want the first appointment at the dining table. The clinical goal is identical to a booth test — a reliable picture of both ears.",
          "We bring calibrated equipment. You do not need a quiet studio; a reasonably calm room is enough. Neighbours’ traffic is everyday life in Indian cities, and we work with it.",
        ],
      },
      {
        id: "visit-timeline",
        heading: "How the visit usually runs",
        paragraphs: [
          "After a short introduction, we ask about your hearing history, medicines, and which situations feel hardest. Then we examine the ear canal. If wax is blocking the view, we explain whether it should be cleared before testing continues.",
          "Headphones or insert earphones play tones and speech. You respond when you hear a sound. The whole diagnostic block is typically around 30 minutes. We then sit with the audiogram and translate it into everyday language: which pitches are missing, and what that means for TV, calls, and family dinners.",
        ],
      },
      {
        id: "what-we-will-not-do",
        heading: "What we will not do",
        paragraphs: [
          "A home test is not a sales visit. If a device is not indicated, we say so. If it is, you can book a trial, visit a clinic to see styles, or take time to talk it over with family. Fitting, counselling, and remaining payment happen at a later appointment — not as a surprise on the sofa.",
        ],
      },
      {
        id: "after-the-home-test",
        heading: "After the home test",
        paragraphs: [
          "You keep a clear summary of results. If you want to see RIC, BTE or custom styles, our clinics in Rohini, Green Park, Indirapuram and Sanjay Nagar — plus hospital desks — make the next visit easy to keep.",
          "To schedule a free home hearing test, share your city and a phone number. We confirm a slot that works for the person being tested, not only for the family member who called.",
        ],
      },
    ],
  },
  {
    slug: "rechargeable-hearing-aids",
    title: "Why rechargeable hearing aids are winning in India",
    excerpt:
      "All-day charge, fewer tiny batteries, and Bluetooth streaming — who should choose rechargeable, and who should still consider disposables.",
    category: "Technology",
    publishedAt: "2026-07-09",
    readTime: "8 min",
    image: "/images/blog/rechargeable.svg",
    imageAlt: "Rechargeable hearing aids in a charging case",
    author: authors.payal,
    sections: [
      {
        id: "the-practical-shift",
        heading: "The practical shift",
        paragraphs: [
          "Tiny zinc-air batteries were once a weekly ritual. For many Indian families, that ritual is the reason devices end up in a drawer. Rechargeable hearing aids sit in a compact case overnight and last a full day for typical use — calls, TV, and a noisy market included.",
          "Most modern RIC and BTE ranges from the brands we fit are now rechargeable by default. That is why they are ‘winning’: not because batteries are obsolete, but because charging is easier to keep up with.",
        ],
      },
      {
        id: "who-should-choose-them",
        heading: "Who should choose rechargeable",
        paragraphs: [
          "Choose rechargeable if dexterity is an issue, if you dislike handling small cells, or if you want Bluetooth streaming without swapping batteries twice as often. They also suit people who already charge a phone every night — the habit transfers.",
        ],
        list: [
          "Parents managing a device for someone else — one charger, one routine.",
          "Professionals who stream calls and meetings through the aids.",
          "Anyone who has abandoned a previous pair because batteries felt fiddly.",
        ],
      },
      {
        id: "who-might-not",
        heading: "Who might still prefer batteries",
        paragraphs: [
          "Very small CIC or IIC shells may still use disposable batteries because there is no space for a rechargeable cell. Some people who travel for days without reliable power prefer a strip of batteries in the bag.",
          "If you forget chargers, we talk through spares and travel cases. A rechargeable pair is only convenient if charging actually happens.",
        ],
      },
      {
        id: "all-day-reality",
        heading: "All-day charge in real life",
        paragraphs: [
          "Manufacturer ‘hours’ assume a mix of quiet and streaming. Heavy Bluetooth use shortens the day. We set expectations on the trial: wear the pair through your actual week, including a long family function, then tell us if the case needs to come to work.",
          "Book a free test and we will recommend rechargeable or battery based on ear size, loss, and daily routine — not on what is trending in a catalogue.",
        ],
      },
    ],
  },
  {
    slug: "helping-a-parent-with-hearing-loss",
    title: "How to talk to a parent about hearing loss",
    excerpt:
      "A gentle approach that leads to a free test — without arguments about ‘I can hear just fine’.",
    category: "Family care",
    publishedAt: "2026-07-01",
    readTime: "8 min",
    image: "/images/blog/family-care.svg",
    imageAlt: "Adult child supporting a parent with hearing loss",
    author: authors.bhawna,
    sections: [
      {
        id: "why-this-conversation-stalls",
        heading: "Why this conversation stalls",
        paragraphs: [
          "Hearing loss in a parent is rarely just about ears. It is about independence, ageing, and the fear that a device means ‘I am old’. Starting with ‘you need a hearing aid’ almost always produces ‘I can hear just fine’.",
          "A better opening is a specific moment, not a diagnosis. Missed phone calls, the TV volume, or a grandchild who stopped trying to talk at dinner are facts you both lived. Offer a free test as information, not as a sales visit.",
        ],
      },
      {
        id: "what-to-say",
        heading: "What to say (and what to skip)",
        paragraphs: [
          "Skip jokes about being deaf. Skip comparing them to a neighbour who ‘refuses to wear theirs’. Those lines shame people into delay.",
        ],
        list: [
          "Name one recent moment: ‘On Sunday you missed the doorbell twice.’",
          "Own the worry: ‘I want you safe when someone is at the door.’",
          "Offer a low-stakes next step: ‘It is a free 30-minute test. You can say no to any device.’",
          "Offer to go with them, or to book a home visit so they do not have to travel.",
        ],
      },
      {
        id: "make-the-first-appointment-easy",
        heading: "Make the first appointment easy to keep",
        paragraphs: [
          "Our clinics in Delhi NCR and hospital desks are set up for first visits that do not feel like a showroom. Home tests exist so a parent does not have to navigate traffic or stairs for information they are already anxious about.",
          "Go with them if you can. Take notes. The audiologist will speak to your parent, not only to you — that respect matters as much as the audiogram.",
        ],
      },
      {
        id: "after-they-agree",
        heading: "After they agree to a test",
        paragraphs: [
          "Celebrate the appointment, not a purchase. If a trial is recommended, frame it as a few weeks of clearer conversation, with the right to stop. After-care — programming, follow-up, a familiar face at the clinic — is what makes a device stay in the ear instead of a drawer.",
          "If you are ready to help a parent take that first step, book a free hearing test and tell us it is for an elder. We will pace the visit accordingly.",
        ],
      },
    ],
  },
  {
    slug: "tinnitus-and-hearing-aids",
    title: "Tinnitus and hearing aids: what actually helps",
    excerpt:
      "Ringing in the ears is common with hearing loss. Here is how assessment, sound therapy, and hearing aids fit together — without miracle claims.",
    category: "Hearing health",
    publishedAt: "2026-06-22",
    readTime: "9 min",
    image: "/images/blog/tinnitus.svg",
    imageAlt: "Illustration representing tinnitus assessment and sound therapy",
    author: authors.harshi,
    sections: [
      {
        id: "what-tinnitus-is",
        heading: "What tinnitus is — and is not",
        paragraphs: [
          "Tinnitus is the perception of sound with no external source: ringing, buzzing, hissing, or a pulse-like whoosh. It is a symptom, not a disease. In adults it often travels with hearing loss, noise exposure, ear wax, or jaw tension. It is rarely a sign of something immediately dangerous — but sudden tinnitus with dizziness or one-sided loss should be checked promptly.",
          "There is no honest ‘cure in a bottle’. There is a clinical path: rule out medical red flags, measure hearing, and reduce how intrusive the sound feels in daily life.",
        ],
      },
      {
        id: "why-hearing-loss-and-ringing-link",
        heading: "Why hearing loss and ringing often travel together",
        paragraphs: [
          "When the ear sends a thinner signal, the brain can turn up internal gain. That extra ‘searching’ is one reason tinnitus is louder in a quiet bedroom than in a busy market. Restoring missing frequencies with a well-fitted hearing aid often makes the ringing less noticeable — not because the aid deletes tinnitus, but because the brain has real sound to work with again.",
        ],
      },
      {
        id: "what-we-assess",
        heading: "What we assess in clinic",
        paragraphs: [
          "We take a history (onset, one ear or both, sleep, stress, medicines), examine the canal, and complete an audiogram. If the pattern suggests an ENT review — sudden onset, pulsatile tinnitus, or asymmetric loss — we refer. Hearing aids are not a substitute for medical care when medical care is indicated.",
        ],
      },
      {
        id: "hearing-aids-and-sound",
        heading: "Hearing aids, sound, and expectations",
        paragraphs: [
          "Many modern devices include gentle sound-therapy options for quiet moments. Combined with counselling — how to stop checking the ringing every few minutes — people often report better sleep and less daytime distress.",
          "We will not promise that tinnitus will vanish. We will tell you if a trial is reasonable, and we will not sell a premium pair solely because tinnitus is frightening. Book a test if ringing is stealing sleep or making conversation harder.",
        ],
      },
    ],
  },
  {
    slug: "bluetooth-hearing-aids",
    title: "Bluetooth hearing aids: calls, TV and what to expect",
    excerpt:
      "Streaming is useful when it is set up well. A practical guide to connectivity, apps, and who actually benefits in Indian homes.",
    category: "Technology",
    publishedAt: "2026-06-14",
    readTime: "8 min",
    image: "/images/blog/bluetooth.svg",
    imageAlt: "Hearing aids streaming a phone call over Bluetooth",
    author: authors.payal,
    sections: [
      {
        id: "what-bluetooth-really-means",
        heading: "What Bluetooth really means in a hearing aid",
        paragraphs: [
          "Bluetooth in a hearing aid is not the same as wireless earbuds. The first job of the device is still amplification matched to your audiogram. Streaming is an extra: phone calls in both ears, navigation prompts, and TV dialogue without turning the living room into a cinema.",
          "Most RIC and many BTE models we fit now stream from iPhone and a growing set of Android phones. Custom CIC shells may offer less connectivity because of size. Always check the exact model, not the brand slogan.",
        ],
      },
      {
        id: "where-it-helps",
        heading: "Where it helps day to day",
        paragraphs: [
          "Calls become private and clearer in traffic. TV streamers send dialogue straight to the aids so the rest of the family can keep a normal volume. Video meetings are less exhausting when speech is in both ears instead of a laptop speaker across the desk.",
        ],
        list: [
          "Phone calls and WhatsApp voice notes without holding the handset up.",
          "TV or meeting audio without shouting over the room.",
          "Manufacturer apps for volume, programmes, and find-my-aid features.",
        ],
      },
      {
        id: "where-it-frustrates",
        heading: "Where it frustrates people",
        paragraphs: [
          "Pairing can confuse anyone who does not already live on a smartphone. Some Android versions are fussier than others. Streaming also uses more battery, which matters on a long travel day.",
          "We set devices up in clinic and write down the two or three taps you will actually use. If a parent will never open the app, we programme the aids to work well without it. Connectivity should serve the person, not the other way around.",
        ],
      },
      {
        id: "trial-it-on-your-phone",
        heading: "Trial it on your own phone",
        paragraphs: [
          "Bring your phone to the fitting. We pair, test a call, and check TV if you use a streamer. That is more useful than any spec sheet. Book a free test first — Bluetooth features only matter on a pair that already fits your hearing loss.",
        ],
      },
    ],
  },
  {
    slug: "child-hearing-test",
    title: "Hearing tests for children: when to worry and what to expect",
    excerpt:
      "Missed words, loud TV, or delayed speech can be hearing — not ‘just inattention’. How paediatric testing works, gently, in clinic.",
    category: "Family care",
    publishedAt: "2026-06-05",
    readTime: "8 min",
    image: "/images/blog/child-hearing.svg",
    imageAlt: "Child-friendly hearing test in an audiology clinic",
    author: authors.harshi,
    sections: [
      {
        id: "early-signs-in-children",
        heading: "Early signs in children",
        paragraphs: [
          "Children cannot always tell you that speech sounds muffled. Watch behaviour instead: not startling to loud sounds as a baby, sitting very close to the TV, frequent ‘what?’, turning one ear toward the speaker, or speech that is unclear compared with peers.",
          "Repeated ear infections, a family history of hearing loss, or newborn-screening concerns are also reasons to test — even if the child seems ‘fine’ at home. Quiet homes hide a lot.",
        ],
      },
      {
        id: "how-paediatric-tests-differ",
        heading: "How paediatric tests differ from adult tests",
        paragraphs: [
          "We do not expect a five-year-old to sit still with a button like an adult. Age-appropriate methods include visual reinforcement, play audiometry, and speech testing that feels like a game. Tympanometry checks middle-ear function, which matters after colds and infections.",
          "The appointment is unhurried. Parents stay in the room. We explain each step before we do it. The goal is a trustworthy result, not a rushed one.",
        ],
      },
      {
        id: "if-a-loss-is-found",
        heading: "If a loss is found",
        paragraphs: [
          "Some childhood hearing issues are temporary — fluid behind the eardrum that an ENT can treat. Others need amplification, school support, or further medical work. We coordinate rather than guess. Hearing aids for children, when indicated, are programmed for developing brains and growing ears; earmoulds are remade as the child grows.",
        ],
      },
      {
        id: "book-without-guilt",
        heading: "Book without guilt",
        paragraphs: [
          "A test is not an accusation that you missed something. It is how families get a clear answer. If a teacher, paediatrician, or your own instinct has raised a question, book a child-friendly hearing test and we will take it from there.",
        ],
      },
    ],
  },
  {
    slug: "how-long-do-hearing-aids-last",
    title: "How long do hearing aids last — and when to replace them?",
    excerpt:
      "Most pairs work well for several years. Wear, technology, and changing hearing decide when a repair is enough and when a new fitting is kinder.",
    category: "Guides",
    publishedAt: "2026-05-27",
    readTime: "7 min",
    image: "/images/blog/hearing-aid-lifespan.svg",
    imageAlt: "Hearing aid care, servicing and typical lifespan",
    author: authors.neelam,
    sections: [
      {
        id: "typical-lifespan",
        heading: "Typical lifespan in daily Indian use",
        paragraphs: [
          "A well-cared-for pair often serves four to six years. Heat, humidity, sweat, and ear wax are hard on microphones and receivers — which is why a drying kit and regular clinic checks matter more here than in a brochure from a cooler climate.",
          "Lifespan is not a countdown clock. Some devices fail earlier because of moisture. Others are still working but no longer match a hearing loss that has changed, or they lack features (rechargeable batteries, better noise handling) that would make the user wear them more.",
        ],
      },
      {
        id: "repair-or-replace",
        heading: "Repair or replace?",
        paragraphs: [
          "Repair first when the shell is sound, parts are available, and the audiogram has not shifted much. Replace when repairs are frequent, the manufacturer has ended support, or a trial of a newer pair clearly reduces listening effort.",
        ],
        list: [
          "Warranty still active — start with authorised service, not a local ‘opening’ of the case.",
          "Feedback, weak output, or a dead side after cleaning — book a check before buying new.",
          "You stopped wearing them because of noise or comfort — that is a fitting issue as much as a hardware one.",
        ],
      },
      {
        id: "care-that-extends-life",
        heading: "Care that actually extends life",
        paragraphs: [
          "Wipe them at night, store in a dry case, keep wax guards fresh, and never use surgical spirit on the microphones. Bring them in when sound seems ‘not like before’ instead of turning the volume up for months.",
          "Eligible models at Hearing Hope include extended warranty and follow-up programming. After-care is how a four-year-old pair stays honest — and how you know when it is time to move on.",
        ],
      },
    ],
  },
  {
    slug: "hearing-aid-home-trial",
    title: "How a hearing aid home trial works",
    excerpt:
      "Wear the pair in your kitchen, market and living room before you decide. What a trial includes, how long it lasts, and how we judge success.",
    category: "Services",
    publishedAt: "2026-05-18",
    readTime: "7 min",
    image: "/images/blog/home-trial.svg",
    imageAlt: "Patient trying hearing aids at home during a trial",
    author: authors.mithlesh,
    sections: [
      {
        id: "why-trial-beats-showroom",
        heading: "Why a trial beats a showroom demo",
        paragraphs: [
          "A clinic is a controlled room. Your life is not. A home trial lets you hear the doorbell, a grandchild, a scooter, and a TV serial in the mix you actually live with. That is the only fair test of whether a pair is worth buying.",
          "We fit after an audiogram, programme the devices to your loss, and send you home with a simple care routine. You are not ‘borrowing a gadget’; you are evaluating a medical fit.",
        ],
      },
      {
        id: "what-the-days-look-like",
        heading: "What the days look like",
        paragraphs: [
          "Wear the aids most of the waking day, even in quiet. The brain needs hours, not ten minutes in a cabin. Note three moments that felt better and three that still felt hard — a temple, a market, a phone call. Bring those notes to the follow-up.",
          "If something hurts, whistles, or feels too loud, contact us. Fine-tuning is normal. Pushing through pain is not.",
        ],
      },
      {
        id: "how-we-decide-together",
        heading: "How we decide together",
        paragraphs: [
          "Success is not ‘perfect hearing’. It is easier conversation, safer awareness of the environment, and a pair you will actually put on tomorrow. If the trial is not right, we say so — a different style, a different programme, or no device yet.",
          "Fitting, counselling, and remaining payment happen at the appointment when you choose to go ahead. A trial is information. Book a free test first; the trial only makes sense after we know both ears.",
        ],
      },
    ],
  },
  {
    slug: "sudden-hearing-loss",
    title: "Sudden hearing loss: when it is an emergency",
    excerpt:
      "A blocked, muffled, or silent ear that appears over hours or a few days needs same-day medical care. What to do, what not to wait for, and how we help afterwards.",
    category: "Hearing health",
    publishedAt: "2026-05-08",
    readTime: "8 min",
    image: "/images/blog/sudden-hearing-loss.svg",
    imageAlt: "Urgent care guidance for sudden hearing loss",
    author: authors.harshi,
    sections: [
      {
        id: "treat-it-as-urgent",
        heading: "Treat it as urgent",
        paragraphs: [
          "Sudden sensorineural hearing loss (SSNHL) is a drop in hearing in one ear, sometimes with tinnitus or dizziness, over hours to three days. It is a medical emergency. Steroid treatment, when appropriate, works best early. Waiting a week ‘to see if it is wax’ can close that window.",
          "Go to ENT or emergency care the same day if an ear that was normal is now muffled, distorted, or silent — especially with spinning, new tinnitus, or facial weakness.",
        ],
      },
      {
        id: "wax-vs-nerve",
        heading: "Wax versus nerve: do not self-diagnose",
        paragraphs: [
          "Wax and middle-ear fluid can also make an ear feel blocked. Only an examination and a hearing test can tell the difference. Do not put oil, ear buds, or leftover antibiotic drops in the ear while you wait. Do not fly if a doctor has not cleared you.",
        ],
        list: [
          "Same-day ENT if hearing dropped suddenly in one ear.",
          "Mention dizziness, tinnitus, recent infection, or head injury.",
          "Avoid home remedies that delay a proper look at the eardrum.",
        ],
      },
      {
        id: "after-the-acute-phase",
        heading: "After the acute phase",
        paragraphs: [
          "Some people recover fully; some recover partly; some need rehabilitation. That is not a failure of will. Audiology after ENT care can include monitoring, counselling, and, when the hearing that remains would benefit, a hearing aid trial on that ear.",
          "Hearing Hope works alongside ENT, not instead of it. If the urgent episode has already been treated and you need a clear audiogram or a rehabilitation plan, book a diagnostic test and bring your medical notes.",
        ],
      },
      {
        id: "if-you-are-unsure",
        heading: "If you are unsure right now",
        paragraphs: [
          "If this is happening today, seek ENT or emergency care first — not a routine hearing-aid appointment. If you are reading this after the scare, a structured test and an honest conversation about next steps is the right follow-up.",
        ],
      },
    ],
  },
];

export function getBlogBySlug(slug: string) {
  return blogs.find((post) => post.slug === slug);
}

export function searchBlogs(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return blogs;
  return blogs.filter((post) => {
    const haystack = [
      post.title,
      post.excerpt,
      post.category,
      post.author.name,
      post.author.role,
      ...post.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
        ...(section.list ?? []),
      ]),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function paginateBlogs(posts: BlogPost[], page: number, perPage = BLOGS_PER_PAGE) {
  const total = posts.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * perPage;
  return {
    posts: posts.slice(start, start + perPage),
    page: current,
    pageCount,
    total,
    perPage,
  };
}

export function getRelatedBlogs(slug: string, limit = 3) {
  const current = getBlogBySlug(slug);
  const others = blogs.filter((post) => post.slug !== slug);
  if (!current) return others.slice(0, limit);
  const sameCategory = others.filter((post) => post.category === current.category);
  const rest = others.filter((post) => post.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function formatBlogDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${iso}T00:00:00+05:30`));
}

export function blogIndexHref(options?: { q?: string; page?: number }) {
  const params = new URLSearchParams();
  const query = options?.q?.trim();
  if (query) params.set("q", query);
  if (options?.page && options.page > 1) params.set("page", String(options.page));
  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
}
