/* Idempotent production seed. Requires only the Supabase service role; it never
 * creates users or publishes content. Run: node --env-file=.env.local scripts/seed-automation.mjs */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
const clinics = [
  ["rohini", "Rohini Branch", "New Delhi"],
  ["green-park", "Green Park Branch", "New Delhi"],
  ["sanjay-nagar", "Sanjay Nagar Branch", "Ghaziabad"],
  ["indirapuram", "Indirapuram Branch", "Ghaziabad"],
].map(([slug, name, city], sort_order) => ({ slug, name, city, sort_order: sort_order + 1 }));
const questions = [
  ["What is the best hearing aid for an elderly person in India?", "product"], ["How much do hearing aids cost in India?", "pricing"], ["What is a pure tone audiometry test and how long does it take?", "test"], ["What is a BERA test and who needs it?", "test"], ["What is the difference between OAE and BERA tests?", "test"], ["What is tympanometry used for?", "test"], ["Which is better, BTE or RIC hearing aids?", "product"], ["Are rechargeable hearing aids worth it?", "product"], ["Can hearing aids help with tinnitus?", "condition"], ["How do I know if I need a hearing test?", "test"], ["What happens during a hearing test?", "test"], ["Where can I get a hearing test near me?", "clinic"], ["Which hearing aid brands are available in India?", "product"], ["How long do hearing aids last?", "product"], ["Do hearing aids work for severe hearing loss?", "condition"], ["What is the difference between a hearing aid and a cochlear implant?", "condition"], ["Is sudden hearing loss an emergency?", "condition"], ["Can children get hearing aids?", "product"], ["How often should I get my hearing tested after 60?", "test"], ["What is a hearing aid trial and is it free?", "pricing"],
].map(([question, category]) => ({ question, category, is_active: true }));
async function upsert(table, rows, conflict) {
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=${conflict}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(rows) });
  if (!response.ok) throw new Error(`${table} seed failed (${response.status}): ${await response.text()}`);
  return response.json();
}
const [seededClinics, seededQuestions] = await Promise.all([upsert("clinics", clinics, "slug"), upsert("ai_probe_questions", questions, "question")]);
console.log(JSON.stringify({ clinics: seededClinics.length, probeQuestions: seededQuestions.length, publishedContentCreated: 0 }, null, 2));
