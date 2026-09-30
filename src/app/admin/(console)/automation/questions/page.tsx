import { PatientQuestionForm } from "@/components/admin/PatientQuestionForm";
import { loadQuestionClinics } from "@/lib/automation/admin-data";

export default async function PatientQuestionsPage() {
  const clinics = await loadQuestionClinics();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Automation</p>
        <h1 className="mt-2 text-3xl font-bold">Patient questions</h1>
        <p className="mt-2 text-sm text-brand-muted">Write down a question a patient asked in clinic.</p>
      </div>
      <PatientQuestionForm clinics={clinics} />
    </div>
  );
}
