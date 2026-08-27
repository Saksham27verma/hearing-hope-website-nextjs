import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SIZE = 1200;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = path.join(ROOT, "inbox", "product-photos");
const OUT = path.join(ROOT, "public", "images", "products", "models");
const MANIFEST = path.join(ROOT, "src", "data", "product-photos.json");

const PRODUCTS = [
  ["signia-pure-charge-go-ix", "Signia Pure Charge&Go IX"],
  ["phonak-audeo-lumity-l90", "Phonak Audéo Lumity L90-R"],
  ["widex-moment-sheer-s440", "Widex Moment Sheer S440"],
  ["oticon-intent-1", "Oticon Intent 1"],
  ["starkey-genesis-ai-2400", "Starkey Genesis AI 2400"],
  ["signia-styletto-ix", "Signia Styletto IX"],
  ["phonak-naida-lumity-l70", "Phonak Naída Lumity L70"],
  ["widex-unique-440-cic", "Widex Unique 440 CIC"],
  ["oticon-own-2-iic", "Oticon Own 2 IIC"],
  ["signia-insio-charge-go-ix", "Signia Insio Charge&Go IX"],
  ["phonak-virto-paradise-p90", "Phonak Virto Paradise P90"],
  ["resound-nexia-r", "ReSound Nexia R"],
];

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchProduct(filename) {
  const base = slugify(filename);
  const known = PRODUCTS.find(([slug]) => base === slug || base.startsWith(`${slug}-`));
  if (known) return known[0];
  return base.replace(/-(?:0[1-9]|[1-9]\d|front|side|back|charger|case)$/g, "") || base;
}

function angleSuffix(filename, slug) {
  const base = slugify(filename);
  const rest = base.startsWith(`${slug}-`) ? base.slice(slug.length + 1) : "";
  if (!rest || /^(?:0[1-9]|[1-9]\d)$/.test(rest)) return null;
  return rest;
}

function printGuide() {
  console.log(`
Product photos — drop files in inbox/product-photos/, then run: npm run photos

What to photograph
  Studio shot of THAT exact hearing-aid model only (the device, charger is fine).
  White, light grey, or transparent background.
  No people, no lifestyle crop, no other brand's product.

Source files
  PNG is best (transparency is kept). JPG is also fine.
  Square, or close to square. 1200×1200 px or larger. 800×800 is the minimum.

How to name the drop
  Use the product URL slug (the part after /hearing-aids/).
  bernafon-alpha-1-cic-single.png
  bernafon-alpha-1-cic-single-02.png
  signia-pure-charge-go-ix-charger.png

What the script writes
  public/images/products/models/{slug}-01-1200x1200.webp
  WebP, 1200×1200, contain (never cropped). The pixel size is in the filename.
`);
}

const files = (await readdir(INBOX, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && IMAGE_EXT.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => entry.name)
  .sort();

if (files.length === 0) {
  printGuide();
  console.log(`Inbox is empty: ${INBOX}`);
  console.log("Drop PNG/JPG files in that folder (they are gitignored), then run npm run photos again.");
  process.exit(0);
}

await mkdir(OUT, { recursive: true });

const grouped = new Map();
for (const file of files) {
  const slug = matchProduct(file);
  const list = grouped.get(slug) ?? [];
  list.push(file);
  grouped.set(slug, list);
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));

for (const [slug, group] of grouped) {
  const urls = [];
  for (const [index, file] of group.entries()) {
    const src = path.join(INBOX, file);
    const angle = angleSuffix(file, slug);
    const order = String(index + 1).padStart(2, "0");
    const name = angle
      ? `${slug}-${angle}-${SIZE}x${SIZE}.webp`
      : `${slug}-${order}-${SIZE}x${SIZE}.webp`;
    const dest = path.join(OUT, name);
    const image = sharp(src).rotate();
    const { hasAlpha } = await image.metadata();
    await image
      .resize(SIZE, SIZE, {
        fit: "contain",
        background: hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(dest);
    const url = `/images/products/models/${name}`;
    urls.push(url);
    console.log(`${file}  →  ${url}`);
  }
  manifest[slug] = urls;
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nUpdated ${path.relative(ROOT, MANIFEST)}`);
console.log("Refresh the site — those models now use the converted WebP files.");
