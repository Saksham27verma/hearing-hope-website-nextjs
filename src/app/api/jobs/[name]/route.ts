import { runJob } from "@/lib/jobs/run";
import { postJob } from "@/lib/jobs/http";

type RouteContext = { params: Promise<{ name: string }> };
export async function POST(request: Request, context: RouteContext) {
  const { name } = await context.params;
  return postJob(request, name, runJob);
}
