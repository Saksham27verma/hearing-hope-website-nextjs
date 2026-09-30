"use client";

import { useState } from "react";
import { submitPatientQuestion } from "@/app/admin/automation-actions";
import { adminField, adminLabel } from "@/components/admin/ui";

export function PatientQuestionForm({ clinics }: { clinics: { id: string; name: string; city: string }[] }) {
  const [question, setQuestion] = useState("");
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await submitPatientQuestion({ question, clinicId, note });
    setPending(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setQuestion("");
    setNote("");
    setMessage("Saved. The decision engine will see this question.");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-3xl bg-white p-6 ring-1 ring-black/5">
      <label>
        <span className={adminLabel}>Question a patient asked</span>
        <textarea className={adminField} rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} required />
      </label>
      <label>
        <span className={adminLabel}>Clinic</span>
        <select className={adminField} value={clinicId} onChange={(event) => setClinicId(event.target.value)}>
          <option value="">Not sure</option>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
              {clinic.city ? ` · ${clinic.city}` : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={adminLabel}>Note</span>
        <input className={adminField} value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      {message ? <p className="text-sm">{message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white">
        {pending ? "Saving…" : "Save question"}
      </button>
    </form>
  );
}
