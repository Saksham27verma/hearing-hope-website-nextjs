import { listPublishedPosts } from "@/lib/blog";
import { listPublishedProducts } from "@/lib/catalog";
import { formatInr } from "@/lib/utils";
import { productHref } from "@/lib/urls";
import { brandHref } from "@/data/brands";
import {
  getBrandBySlug,
  getFeaturePage,
  getPage,
  getServiceBySlug,
  getSiteSettings,
  getStylePage,
  listFaqs,
  listOpenClinics,
  listServices,
  listTeam,
} from "@/lib/site-cms";
import type { HearingAidFeatureId, HearingAidStyle } from "@/types";
import { renderLlmsTxt } from "@/lib/agent/llms-txt";
import { developersPageCopy, homeOverview, contactPageCopy, privacyPageCopy } from "@/lib/agent/trust-content";
import { renderNotFoundMarkdown } from "@/lib/agent/not-found-markdown";
import { absoluteUrl, normalizeAgentPath, originOf } from "@/lib/agent/urls";

export type MarkdownResult = {
  status: 200 | 404;
  body: string;
};


function page(title: string, lines: string[]) {
  return [`# ${title}`, "", ...lines].join("\n").trim() + "\n";
}

export async function renderPathMarkdown(pathname: string, origin?: string): Promise<MarkdownResult> {
  const settings = await getSiteSettings();
  const base = originOf(origin || settings.url);
  const path = normalizeAgentPath(pathname);

  if (path === "/llms.txt") {
    return { status: 200, body: renderLlmsTxt(base) };
  }

  switch (path) {
    case "/":
    case "/index":
      return { status: 200, body: await renderHomeMarkdown(base) };
    case "/about":
      return { status: 200, body: await renderAboutMarkdown(base) };
    case "/contact":
      return { status: 200, body: await renderContactMarkdown(base) };
    case "/privacy":
      return { status: 200, body: await renderPrivacyMarkdown(base) };
    case "/developers":
      return { status: 200, body: renderDevelopersMarkdown(base) };
    case "/clinics":
      return { status: 200, body: await renderClinicsMarkdown(base) };
    case "/services":
      return { status: 200, body: await renderServicesMarkdown(base) };
    case "/hearing-aids":
      return { status: 200, body: await renderHearingAidsMarkdown(base) };
    case "/pricing":
      return { status: 200, body: await renderPricingMarkdown(base) };
    case "/blog":
      return { status: 200, body: await renderBlogIndexMarkdown(base) };
    case "/checkout":
      return {
        status: 200,
        body: page("Checkout", [
          "Hearing Hope checkout confirms a hearing-aid model and a callback. Remaining payment happens at the fitting.",
          "",
          `Book a test from [home](${base}/) or see [hearing aids](${base}/hearing-aids). Contact: ${settings.phoneDisplay}, ${settings.email}.`,
        ]),
      };
    default:
      break;
  }

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = await getServiceBySlug(serviceMatch[1]);
    if (!service) return { status: 404, body: renderNotFoundMarkdown(base) };
    return {
      status: 200,
      body: page(service.title, [
        service.excerpt,
        "",
        `Category: ${service.category}. Duration: ${service.duration}.`,
        "",
        "## Who it is for",
        "",
        service.who,
        "",
        "## What we do",
        "",
        service.what,
        "",
        "## What to expect",
        "",
        ...service.expect.map((item) => `- ${item}`),
        "",
        `Book via [contact](${base}/contact) or ${settings.phoneDisplay}.`,
      ]),
    };
  }

  const productMatch = path.match(/^\/hearing-aids\/([^/]+)$/);
  if (productMatch && !["brands", "types", "features"].includes(productMatch[1])) {
    const products = await listPublishedProducts();
    const product = products.find((item) => item.slug === productMatch[1]);
    if (!product) return { status: 404, body: renderNotFoundMarkdown(base) };
    return {
      status: 200,
      body: page(product.name, [
        product.overview || product.feature,
        "",
        `- Brand: ${product.brand}`,
        `- Type: ${product.type}`,
        `- Listed MRP: ${formatInr(product.mrp)}`,
        `- In stock: ${product.inStock ? "yes" : "request availability"}`,
        "",
        ...product.features.flatMap((item) => [`## ${item.title}`, "", item.body, ""]),
        `Product URL: ${absoluteUrl(base, productHref(product.slug))}`,
        `Brand page: ${absoluteUrl(base, brandHref(product.brand))}`,
      ]),
    };
  }

  const brandMatch = path.match(/^\/hearing-aids\/brands\/([^/]+)$/);
  if (brandMatch) {
    const brand = await getBrandBySlug(brandMatch[1]);
    if (!brand) return { status: 404, body: renderNotFoundMarkdown(base) };
    const products = await listPublishedProducts();
    const models = products.filter((item) => item.brandSlug === brand.slug || item.brand.toLowerCase() === brand.name.toLowerCase());
    return {
      status: 200,
      body: page(`${brand.name} hearing aids at Hearing Hope`, [
        brand.intro,
        "",
        ...brand.story.map((paragraph) => paragraph),
        "",
        "## Models",
        "",
        ...models.map((item) => `- [${item.name}](${absoluteUrl(base, productHref(item.slug))}): ${formatInr(item.mrp)} — ${item.feature}`),
      ]),
    };
  }

  const typeMatch = path.match(/^\/hearing-aids\/types\/([^/]+)$/);
  if (typeMatch) {
    const style = typeMatch[1].toUpperCase() as HearingAidStyle;
    const typePage = await getStylePage(style);
    if (!typePage) return { status: 404, body: renderNotFoundMarkdown(base) };
    return {
      status: 200,
      body: page(typePage.headline || typePage.name, [
        typePage.intro || typePage.description,
        "",
        typePage.tagline,
        "",
        ...typePage.points.flatMap((item) => [`## ${item.title}`, "", item.body, ""]),
      ]),
    };
  }

  const featureMatch = path.match(/^\/hearing-aids\/features\/([^/]+)$/);
  if (featureMatch) {
    const feature = await getFeaturePage(featureMatch[1] as HearingAidFeatureId);
    if (!feature) return { status: 404, body: renderNotFoundMarkdown(base) };
    return {
      status: 200,
      body: page(feature.headline || feature.label, [
        feature.body,
        "",
        `Who it is for: ${feature.who}`,
        "",
        ...feature.points.flatMap((item) => [`## ${item.title}`, "", item.body, ""]),
      ]),
    };
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const posts = await listPublishedPosts();
    const post = posts.find((item) => item.slug === blogMatch[1]);
    if (!post) return { status: 404, body: renderNotFoundMarkdown(base) };
    return {
      status: 200,
      body: page(post.title, [
        post.excerpt,
        "",
        `By ${post.author.name} (${post.author.role}). Published ${post.publishedAt}.`,
        "",
        ...post.sections.flatMap((section) => [
          `## ${section.heading}`,
          "",
          ...section.paragraphs,
          "",
          ...(section.list ? section.list.map((item) => `- ${item}`).concat([""]) : []),
        ]),
      ]),
    };
  }

  return { status: 404, body: renderNotFoundMarkdown(base) };
}

async function renderHomeMarkdown(base: string) {
  const [pageDoc, products, faqs, clinics, settings] = await Promise.all([
    getPage("home"),
    listPublishedProducts(),
    listFaqs("home"),
    listOpenClinics(),
    getSiteSettings(),
  ]);
  const fields = pageDoc.fields;
  return page(`${fields.heroTitle} ${fields.heroHighlight}`.replace(/\s+/g, " ").trim(), [
    fields.heroBody,
    "",
    `## ${homeOverview.title}`,
    "",
    ...homeOverview.paragraphs,
    "",
    "## Services",
    "",
    ...(fields.heroServices ?? []).map((item) => `- [${item.label}](${base}/services/${item.slug}): ${item.hint}`),
    "",
    `## ${fields.whyChooseTitle}`,
    "",
    fields.whyChooseBody,
    "",
    ...fields.whyChooseRows.map((row) => `- ${row.feature}`),
    "",
    "## Open clinics",
    "",
    ...clinics.map((clinic) => `- ${clinic.name}, ${clinic.city}: ${clinic.address}`),
    "",
    "## Hearing aids",
    "",
    ...products.slice(0, 20).map((item) => `- [${item.name}](${absoluteUrl(base, productHref(item.slug))}): ${formatInr(item.mrp)} — ${item.feature}`),
    "",
    "## FAQs",
    "",
    ...faqs.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    `Contact ${settings.phoneDisplay} or ${settings.email}. Full NAP: [contact](${base}/contact).`,
  ]);
}

async function renderAboutMarkdown(base: string) {
  const [pageDoc, team, settings] = await Promise.all([getPage("about"), listTeam(), getSiteSettings()]);
  const fields = pageDoc.fields;
  return page(`${fields.title} ${fields.highlight} ${fields.titleAfter}`.replace(/\s+/g, " ").trim(), [
    fields.body,
    "",
    `## ${fields.storyTitle}`,
    "",
    fields.storyBody1,
    "",
    fields.storyBody2,
    "",
    ...fields.principles.flatMap((item) => [`## ${item.title}`, "", item.body, ""]),
    "## Team",
    "",
    ...team.map((member) => `- ${member.honorific} ${member.name}, ${member.role}: ${member.bio}`),
    "",
    `Parent company: ${settings.parentCompany}. More: [contact](${base}/contact).`,
  ]);
}

async function renderContactMarkdown(base: string) {
  const [settings, clinics] = await Promise.all([getSiteSettings(), listOpenClinics()]);
  const copy = contactPageCopy(settings, clinics);
  return page(copy.title, [
    copy.body,
    "",
    "## How to reach Hearing Hope",
    "",
    ...copy.howToReach.map((item) => `- ${item}`),
    "",
    "## NAP",
    "",
    `- Name: ${copy.nap.name}`,
    `- Legal name: ${copy.nap.legalName}`,
    `- Phone: ${copy.nap.phoneDisplay}`,
    `- Email: ${copy.nap.email}`,
    `- WhatsApp: ${copy.nap.whatsapp}`,
    `- Locality: ${copy.nap.street}, ${copy.nap.locality}, ${copy.nap.region} ${copy.nap.postalCode}, ${copy.nap.country}`,
    "",
    "## Clinics",
    "",
    ...copy.clinics.map((clinic) => `- ${clinic.name}: ${clinic.address} (${clinic.phoneDisplay}, ${clinic.hours})`),
    "",
    copy.closing,
    "",
    `[Home](${base}/) · [Privacy](${base}/privacy)`,
  ]);
}

async function renderPrivacyMarkdown(base: string) {
  const settings = await getSiteSettings();
  const copy = privacyPageCopy(settings);
  return page(copy.title, [
    copy.body,
    "",
    ...copy.sections.flatMap((section) => [`## ${section.title}`, "", section.body, ""]),
    `[Contact](${base}/contact) for privacy requests.`,
  ]);
}

function renderDevelopersMarkdown(base: string) {
  const copy = developersPageCopy(base);
  return page(copy.title, [
    copy.body,
    "",
    copy.intro,
    "",
    "## Resources",
    "",
    ...copy.resources.map((item) => `- [${item.name}](${absoluteUrl(base, item.href)}): ${item.notes}`),
    "",
    "## How to integrate",
    "",
    ...copy.howTo.map((item) => `- ${item}`),
  ]);
}

async function renderClinicsMarkdown(base: string) {
  const [pageDoc, clinics] = await Promise.all([getPage("clinics"), listOpenClinics()]);
  const fields = pageDoc.fields;
  return page(fields.title, [
    fields.body,
    "",
    ...fields.bullets.map((item) => `- ${item}`),
    "",
    "## Walk-in clinics",
    "",
    ...clinics.map((clinic) => `- **${clinic.name}** (${clinic.city}): ${clinic.address}. ${clinic.hours}. ${clinic.phoneDisplay}. ${clinic.blurb}`),
    "",
    `Book from [contact](${base}/contact).`,
  ]);
}

async function renderServicesMarkdown(base: string) {
  const [pageDoc, services] = await Promise.all([getPage("services"), listServices()]);
  const fields = pageDoc.fields;
  return page(fields.title, [
    fields.body,
    "",
    ...services.map((service) => `- [${service.title}](${base}/services/${service.slug}): ${service.excerpt}`),
  ]);
}

async function renderHearingAidsMarkdown(base: string) {
  const [pageDoc, products] = await Promise.all([getPage("hearing-aids"), listPublishedProducts()]);
  const fields = pageDoc.fields;
  return page(fields.title, [
    fields.body,
    "",
    ...products.map((item) => `- [${item.name}](${absoluteUrl(base, productHref(item.slug))}): ${item.brand} ${item.type}, ${formatInr(item.mrp)} — ${item.feature}`),
  ]);
}

async function renderPricingMarkdown(base: string) {
  const [pageDoc, products] = await Promise.all([getPage("pricing"), listPublishedProducts()]);
  return page(pageDoc.fields.title, [
    pageDoc.fields.body,
    "",
    ...products.map((item) => `- [${item.name}](${absoluteUrl(base, productHref(item.slug))}): listed MRP ${formatInr(item.mrp)}`),
    "",
    "Final price is confirmed after the diagnostic test. Request a callback from the product page or [contact](" + base + "/contact).",
  ]);
}

async function renderBlogIndexMarkdown(base: string) {
  const [pageDoc, posts] = await Promise.all([getPage("blog"), listPublishedPosts()]);
  const indexable = posts.filter((post) => post.robotsIndex);
  return page(pageDoc.fields.title, [
    pageDoc.fields.body,
    "",
    ...indexable.map((post) => `- [${post.title}](${base}/blog/${post.slug}): ${post.excerpt}`),
  ]);
}
