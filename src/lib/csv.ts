export type CsvRow = Record<string, string>;

function normalizeText(text: string): string {
  let normalized = text;
  if (normalized.charCodeAt(0) === 0xfeff) {
    normalized = normalized.slice(1);
  }
  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized;
}

export function parseCsv(text: string): CsvRow[] {
  const normalized = normalizeText(text);
  const rows = splitCsvRows(normalized);
  const header = rows.shift();
  if (!header?.length) return [];
  const keys = header.map((key) => key.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => {
      const record: CsvRow = {};
      keys.forEach((key, index) => {
        record[key] = (row[index] ?? "").trim();
      });
      return record;
    });
}

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.replace(/\r$/, ""));
  if (row.some((item) => item.length)) rows.push(row);
  return rows;
}

export function parseCsvPreview(text: string): { columns: string[]; rows: number; preview: string[][] } {
  const normalized = normalizeText(text);
  const allRows = splitCsvRows(normalized);
  const header = allRows.shift();
  if (!header?.length) return { columns: [], rows: 0, preview: [] };
  
  const columns = header.map((key) => key.trim().toLowerCase().replace(/\s+/g, "_"));
  const dataRows = allRows.filter((row) => row.some((cell) => cell.trim()));
  const preview = dataRows.slice(0, 3).map((row) => row.map((cell) => cell.trim()));
  
  return { columns, rows: dataRows.length, preview };
}

export const CSV_TEMPLATE = `slug,name,brand,style,badge,tagline,overview,mrp,in_stock,published,rating,review_count,features,highlights,colors,image_urls
signia-pure-charge-go-ix,Signia Pure Charge&Go IX,Signia,RIC,36 Hours Battery,AI-powered speech clarity in noisy environments,"Everyday RIC for speech in motion.",245000,true,true,5,412,rechargeable|bluetooth|noise-cancellation,Speech in motion::Tracks more than one talker.||Own Voice Processing::Keeps your voice natural.,Beige|#C4A574|default,https://example.com/photo-1.jpg
`;

export const CSV_COLUMNS = [
  "slug",
  "name",
  "brand",
  "style",
  "badge",
  "tagline",
  "overview",
  "mrp",
  "in_stock",
  "published",
  "rating",
  "review_count",
  "features",
  "highlights",
  "colors",
  "image_urls",
] as const;
