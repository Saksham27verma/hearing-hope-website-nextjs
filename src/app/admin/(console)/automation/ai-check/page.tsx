import { AiCheckForm } from "@/components/admin/AiCheckForm";
import { loadProbeQuestions } from "@/lib/automation/admin-data";

export default async function AiCheckPage() {
  const { missingTable, questions } = await loadProbeQuestions();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Automation</p>
        <h1 className="mt-2 text-3xl font-bold">Monthly AI check</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Copy each question into ChatGPT, Perplexity, Google AI Mode, and Claude. Record whether Hearing Hope was cited.
        </p>
      </div>
      {missingTable ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm">Apply the SEO automation migration, then reload this page.</p>
      ) : (
        <AiCheckForm questions={questions} />
      )}
    </div>
  );
}
