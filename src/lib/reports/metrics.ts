export type ReportInput = {
  gsc: Array<{ date: string; query: string; pageUrl: string; clicks: number; impressions: number }>;
  insights: Array<{ clinic: string; date: string; calls: number; directions: number; websiteClicks: number }>;
  reviews: Array<{ clinic: string; createdAt: string; rating: number }>;
  visibility: Array<{ date: string; engine: string; cited: boolean; competitors: string[] }>;
  vitals: Array<{ url: string; strategy: string; lcp: number | null; inp: number | null; cls: number | null }>;
  tickets: Array<{ createdAt: string; publishedAt: string | null; status: string }>;
  reviewEdits: Array<{ createdAt: string; field: string }>;
  llmUsage: Array<{ date: string; requests: number }>;
  attribution: Array<{ createdAt: string; howDidYouHear: string }>;
};
export type Change = { name: string; current: number; previous: number; change: number };
const day = (value: string) => value.slice(0, 10);
const inRange = (date: string, start: string, end: string) => day(date) >= start && day(date) <= end;
const sum = (rows: Array<{ clicks: number; impressions: number }>) => rows.reduce((total, row) => ({ clicks: total.clicks + row.clicks, impressions: total.impressions + row.impressions }), { clicks: 0, impressions: 0 });
function changes(rows: Array<{ date: string; key: string; value: number }>, start: string, end: string, previousStart: string) {
  const current = new Map<string, number>(); const previous = new Map<string, number>();
  for (const row of rows) { const bucket = inRange(row.date, start, end) ? current : inRange(row.date, previousStart, dayBefore(start)) ? previous : null; if (bucket) bucket.set(row.key, (bucket.get(row.key) ?? 0) + row.value); }
  return [...new Set([...current.keys(), ...previous.keys()])].map((name) => ({ name, current: current.get(name) ?? 0, previous: previous.get(name) ?? 0, change: (current.get(name) ?? 0) - (previous.get(name) ?? 0) }));
}
function dayBefore(value: string) { const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() - 1); return day(date.toISOString()); }
function priorStart(start: string, days: number) { const date = new Date(`${start}T00:00:00Z`); date.setUTCDate(date.getUTCDate() - days); return day(date.toISOString()); }
export function computeReport(input: ReportInput, periodEnd: string, days: number, cap = Number(process.env.LLM_DAILY_REQUEST_CAP ?? 40)) {
  const endDate = new Date(`${periodEnd}T00:00:00Z`); endDate.setUTCDate(endDate.getUTCDate() - (days - 1)); const start = day(endDate.toISOString()); const previousStart = priorStart(start, days);
  const currentGsc = input.gsc.filter((row) => inRange(row.date, start, periodEnd)); const previousGsc = input.gsc.filter((row) => inRange(row.date, previousStart, dayBefore(start)));
  const organic = { current: sum(currentGsc), previous: sum(previousGsc) };
  const queryChanges = changes(input.gsc.map((row) => ({ date: row.date, key: row.query, value: row.clicks })), start, periodEnd, previousStart).sort((a, b) => b.change - a.change);
  const pageChanges = changes(input.gsc.map((row) => ({ date: row.date, key: row.pageUrl, value: row.clicks })), start, periodEnd, previousStart).sort((a, b) => b.change - a.change);
  const gbp = input.insights.filter((row) => inRange(row.date, start, periodEnd)).reduce<Record<string, { calls: number; directions: number; websiteClicks: number }>>((out, row) => { const item = out[row.clinic] ?? { calls: 0, directions: 0, websiteClicks: 0 }; item.calls += row.calls; item.directions += row.directions; item.websiteClicks += row.websiteClicks; out[row.clinic] = item; return out; }, {});
  const reviewRows = input.reviews.filter((row) => inRange(row.createdAt, start, periodEnd)); const reviews = Object.entries(reviewRows.reduce<Record<string, number[]>>((out, row) => ({ ...out, [row.clinic]: [...(out[row.clinic] ?? []), row.rating] }), {})).map(([clinic, ratings]) => ({ clinic, count: ratings.length, averageRating: Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) }));
  const visibility = input.visibility.filter((row) => inRange(row.date, start, periodEnd)); const byEngine = Object.entries(visibility.reduce<Record<string, { cited: number; total: number }>>((out, row) => { const metric = out[row.engine] ?? { cited: 0, total: 0 }; metric.total += 1; metric.cited += Number(row.cited); out[row.engine] = metric; return out; }, {})).map(([engine, value]) => ({ engine, rate: value.total ? Math.round(value.cited / value.total * 100) : 0 }));
  const competitors = Object.entries(visibility.flatMap((row) => row.competitors).reduce<Record<string, number>>((out, value) => ({ ...out, [value]: (out[value] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([domain, count]) => ({ domain, count }));
  const cwv = input.vitals.map((row) => ({ ...row, status: row.lcp !== null && row.lcp > 2.5 || row.inp !== null && row.inp > 200 || row.cls !== null && row.cls > 0.1 ? "needs_attention" : "passing" }));
  const relevantTickets = input.tickets.filter((row) => inRange(row.createdAt, start, periodEnd)); const durations = relevantTickets.flatMap((row) => row.publishedAt ? [(new Date(row.publishedAt).getTime() - new Date(row.createdAt).getTime()) / 3_600_000] : []).sort((a, b) => a - b); const medianReviewHours = durations.length ? durations[Math.floor(durations.length / 2)] : null;
  const edits = input.reviewEdits.filter((row) => inRange(row.createdAt, start, periodEnd)); const attribution = input.attribution.filter((row) => inRange(row.createdAt, start, periodEnd)).reduce<Record<string, number>>((out, row) => ({ ...out, [row.howDidYouHear]: (out[row.howDidYouHear] ?? 0) + 1 }), {});
  return { period: { start, end: periodEnd, days }, organic, gainingQueries: queryChanges.slice(0, 10), losingQueries: queryChanges.slice(-10).reverse(), gainingPages: pageChanges.slice(0, 10), losingPages: pageChanges.slice(-10).reverse(), gbp, reviews, aiCitationRate: visibility.length ? Math.round(visibility.filter((row) => row.cited).length / visibility.length * 100) : 0, byEngine, competitors, cwv, tickets: { created: relevantTickets.length, published: relevantTickets.filter((row) => row.status === "published").length, pending: input.tickets.filter((row) => !["published", "dismissed"].includes(row.status)).length, medianReviewHours }, reviewEdits: { count: edits.length, byField: edits.reduce<Record<string, number>>((out, row) => ({ ...out, [row.field]: (out[row.field] ?? 0) + 1 }), {}) }, llm: { requests: input.llmUsage.filter((row) => inRange(row.date, start, periodEnd)).reduce((total, row) => total + row.requests, 0), cap }, attribution };
}
