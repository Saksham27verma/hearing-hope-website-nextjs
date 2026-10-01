/* Fetch the permitted 16 months of GSC data and UPSERT the five-dimensional
 * signals. Run: node --env-file=.env.local scripts/backfill-gsc.mjs */
import { createSign } from "node:crypto";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rawAccount = process.env.GSC_SERVICE_ACCOUNT_JSON;
const siteUrl = process.env.GSC_SITE_URL;
if (!supabaseUrl || !serviceKey || !rawAccount || !siteUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GSC_SERVICE_ACCOUNT_JSON, and GSC_SITE_URL are required.");
const account = JSON.parse(rawAccount); const b64 = (value) => Buffer.from(value).toString("base64url"); const now = Math.floor(Date.now() / 1000);
const header = b64(JSON.stringify({ alg: "RS256", typ: "JWT" })); const payload = b64(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: account.token_uri ?? "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
const signer = createSign("RSA-SHA256"); signer.update(`${header}.${payload}`); signer.end(); const assertion = `${header}.${payload}.${signer.sign(account.private_key, "base64url")}`;
const tokenResponse = await fetch(account.token_uri ?? "https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
if (!tokenResponse.ok) throw new Error(`GSC authentication failed (${tokenResponse.status}).`); const accessToken = (await tokenResponse.json()).access_token;
const end = new Date(); end.setUTCDate(end.getUTCDate() - 3); const start = new Date(end); start.setUTCMonth(start.getUTCMonth() - 16);
const dates = (date) => date.toISOString().slice(0, 10);
const result = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, { method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" }, body: JSON.stringify({ startDate: dates(start), endDate: dates(end), dimensions: ["date", "page", "query", "country", "device"], rowLimit: 25_000 }) });
if (!result.ok) throw new Error(`GSC backfill failed (${result.status}): ${await result.text()}`);
const rows = ((await result.json()).rows ?? []).map((row) => ({ date: row.keys[0], page_url: row.keys[1], query: row.keys[2], country: row.keys[3], device: row.keys[4], clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }));
const write = await fetch(`${supabaseUrl}/rest/v1/signals_gsc?on_conflict=date,page_url,query,country,device`, { method: "POST", headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, "content-type": "application/json", prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
if (!write.ok) throw new Error(`Supabase GSC write failed (${write.status}): ${await write.text()}`); console.log(JSON.stringify({ startDate: dates(start), endDate: dates(end), rows: rows.length, dimensions: ["date", "page", "query", "country", "device"] }, null, 2));
