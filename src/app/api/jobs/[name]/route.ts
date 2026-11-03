import { runJob } from "@/lib/jobs/run";
import { postJob } from "@/lib/jobs/http";

// Vercel Hobby's ceiling; the PageSpeed sync relies on most of it.
export const maxDuration = 300;

type RouteContext = { params: Promise<{ name: string }> };
export async function POST(request: Request, context: RouteContext) {
  const { name } = await context.params;
  return postJob(request, name, runJob);
}
