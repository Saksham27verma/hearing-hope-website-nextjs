import { bearerMatches } from "@/lib/automation/content-rules";
import { JOB_NAMES, type JobName, type JobSummary } from "./types";

export type JobRunner = (name: JobName) => Promise<JobSummary>;

export async function postJob(request: Request, name: string, run: JobRunner): Promise<Response> {
  if (!bearerMatches(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  if (!JOB_NAMES.includes(name as JobName)) {
    return Response.json({ ok: false, error: "Unknown job." }, { status: 404 });
  }

  const summary = await run(name as JobName);
  return Response.json({ ok: summary.status === "success", summary }, { status: summary.status === "success" ? 200 : 503 });
}
