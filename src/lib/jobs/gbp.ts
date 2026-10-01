import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { publishAutomationEvent } from "@/lib/automation/events";
import { fetchWithBackoff } from "@/lib/automation/backoff";

type Fetcher = typeof fetch;

export type GbpLocation = { id: string; name: string };
export type GbpReview = { id: string; rating: number; text: string; authorName: string; createdAt: string };
export type GbpInsight = { date: string; calls: number; directionRequests: number; websiteClicks: number; viewsSearch: number; viewsMaps: number };
export type GbpPost = { summary: string; callToActionType: string; url: string };

function locationName(id: string) {
  return id.startsWith("locations/") ? id : `locations/${id}`;
}

function rating(value: unknown) {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/(ONE|TWO|THREE|FOUR|FIVE|[1-5])/i);
  return match ? ({ ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[match[1].toUpperCase()] ?? Number(match[1])) : 0;
}

export class GoogleBusinessProfileClient {
  private cachedAccessToken: string | null = null;
  private accessTokenExpiresAt = 0;
  constructor(
    private readonly options: { clientId?: string; clientSecret?: string; refreshToken?: string; fetcher?: Fetcher } = {},
  ) {}

  private get fetcher() { return this.options.fetcher ?? fetch; }
  private async accessToken() {
    if (this.cachedAccessToken && Date.now() < this.accessTokenExpiresAt - 60_000) return this.cachedAccessToken;
    const clientId = this.options.clientId ?? process.env.GBP_OAUTH_CLIENT_ID;
    const clientSecret = this.options.clientSecret ?? process.env.GBP_OAUTH_CLIENT_SECRET;
    const refreshToken = this.options.refreshToken ?? process.env.GBP_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) throw new Error("GBP_OAUTH_CLIENT_ID, GBP_OAUTH_CLIENT_SECRET, and GBP_REFRESH_TOKEN are required.");
    const response = await fetchWithBackoff(this.fetcher, "https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }) });
    if (!response.ok) throw new Error(`GBP OAuth refresh failed (${response.status}).`);
    const body = await response.json() as { access_token?: string; expires_in?: number };
    if (!body.access_token) throw new Error("GBP OAuth refresh returned no access token.");
    this.cachedAccessToken = body.access_token;
    this.accessTokenExpiresAt = Date.now() + Number(body.expires_in ?? 3_600) * 1_000;
    return this.cachedAccessToken;
  }
  private async request(path: string, init: RequestInit = {}) {
    const accessToken = await this.accessToken();
    const response = await fetchWithBackoff(this.fetcher, `https://mybusiness.googleapis.com/v4/${path.replace(/^\//, "")}`, { ...init, headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json", ...init.headers } });
    if (!response.ok) throw new Error(`GBP request failed (${response.status}) for ${path}.`);
    return response.json() as Promise<Record<string, unknown>>;
  }
  async listLocations(): Promise<GbpLocation[]> {
    const accounts = await this.request("accounts");
    const locations: GbpLocation[] = [];
    for (const account of (accounts.accounts as Array<{ name?: string }> ?? [])) {
      if (!account.name) continue;
      const body = await this.request(`${account.name}/locations?readMask=name,title`);
      locations.push(...(body.locations as Array<{ name?: string; title?: string }> ?? []).flatMap((location) => location.name ? [{ id: location.name, name: location.title || location.name }] : []));
    }
    return locations;
  }
  async reviews(locationId: string): Promise<GbpReview[]> {
    const body = await this.request(`${locationName(locationId)}/reviews`);
    return (body.reviews as Array<Record<string, unknown>> ?? []).flatMap((review) => {
      const id = String(review.reviewId ?? "");
      if (!id) return [];
      return [{ id, rating: rating(review.starRating), text: String(review.comment ?? ""), authorName: String((review.reviewer as { displayName?: string } | undefined)?.displayName ?? ""), createdAt: String(review.createTime ?? new Date().toISOString()) }];
    });
  }
  async insights(locationId: string): Promise<GbpInsight[]> {
    const body = await this.request(`${locationName(locationId)}:reportInsights`, { method: "POST", body: JSON.stringify({ reportRequests: [{ locationNames: [locationName(locationId)], basicRequest: { metricRequests: ["CALL_CLICKS", "DIRECTION_REQUESTS", "WEBSITE_CLICKS", "QUERIES_DIRECT", "QUERIES_INDIRECT"] } }] }) });
    return (body.locationMetrics as Array<Record<string, unknown>> ?? []).map((row) => {
      const values = Object.fromEntries((row.metricValues as Array<{ metric?: string; totalValue?: { value?: string | number } }> ?? []).map((value) => [value.metric, Number(value.totalValue?.value ?? 0)]));
      return { date: String(row.date ?? new Date().toISOString().slice(0, 10)), calls: values.CALL_CLICKS ?? 0, directionRequests: values.DIRECTION_REQUESTS ?? 0, websiteClicks: values.WEBSITE_CLICKS ?? 0, viewsSearch: values.QUERIES_DIRECT ?? 0, viewsMaps: values.QUERIES_INDIRECT ?? 0 };
    });
  }
  async reply(locationId: string, reviewId: string, comment: string) {
    await this.request(`${locationName(locationId)}/reviews/${reviewId}/reply`, { method: "PUT", body: JSON.stringify({ comment }) });
  }
  async publishPost(locationId: string, post: GbpPost) {
    await this.request(`${locationName(locationId)}/localPosts`, { method: "POST", body: JSON.stringify({ summary: post.summary, callToAction: { actionType: post.callToActionType, url: post.url } }) });
  }
}

export type GbpClinic = { id: string; name: string; gbpLocationId: string; managerId: string | null };
export interface GbpStore {
  clinics(): Promise<GbpClinic[]>;
  upsertReview(clinicId: string, review: GbpReview): Promise<boolean>;
  upsertInsight(clinicId: string, insight: GbpInsight): Promise<void>;
}

export class SupabaseGbpStore implements GbpStore {
  private db() { return createServiceSupabaseClient(); }
  async clinics() {
    const { data, error } = await this.db().from("clinics").select("id,name,gbp_location_id,manager_id").neq("gbp_location_id", "");
    if (error) throw new Error(error.message);
    return (data ?? []).map((clinic) => ({ id: String(clinic.id), name: String(clinic.name), gbpLocationId: String(clinic.gbp_location_id), managerId: clinic.manager_id ? String(clinic.manager_id) : null }));
  }
  async upsertReview(clinicId: string, review: GbpReview) {
    const { data: existing, error: readError } = await this.db().from("signals_gbp_reviews").select("id").eq("gbp_review_id", review.id).maybeSingle();
    if (readError) throw new Error(readError.message);
    const { error } = await this.db().from("signals_gbp_reviews").upsert({ clinic_id: clinicId, gbp_review_id: review.id, rating: review.rating, text: review.text, author_name: review.authorName, created_at: review.createdAt }, { onConflict: "gbp_review_id" });
    if (error) throw new Error(error.message);
    return !existing;
  }
  async upsertInsight(clinicId: string, insight: GbpInsight) {
    const { error } = await this.db().from("signals_gbp_insights").upsert({ clinic_id: clinicId, date: insight.date, calls: insight.calls, direction_requests: insight.directionRequests, website_clicks: insight.websiteClicks, views_search: insight.viewsSearch, views_maps: insight.viewsMaps }, { onConflict: "clinic_id,date" });
    if (error) throw new Error(error.message);
  }
}

export async function syncGbp(store: GbpStore, client: Pick<GoogleBusinessProfileClient, "listLocations" | "reviews" | "insights">) {
  await client.listLocations(); // Validates the OAuth scope and makes account/location discovery observable.
  let reviews = 0;
  let insights = 0;
  for (const clinic of await store.clinics()) {
    for (const review of await client.reviews(clinic.gbpLocationId)) {
      const isNew = await store.upsertReview(clinic.id, review);
      reviews += 1;
      if (isNew) await publishAutomationEvent("review.received", { reviewId: review.id, clinicId: clinic.id, clinic: clinic.name, managerId: clinic.managerId, rating: review.rating, text: review.text, authorName: review.authorName });
    }
    for (const insight of await client.insights(clinic.gbpLocationId)) {
      await store.upsertInsight(clinic.id, insight);
      insights += 1;
    }
  }
  return { reviews, insights };
}
