"use client";

import { useState } from "react";

export default function ApplyPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "", dob: "", guardian_name: "", guardian_contact: "", address: "", notes: "",
    scout_type: "جديد", });

    function update(field: string, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) { setError("Full name is required."); return; }
        if (form.guardian_contact && !/^01[0-2,5]{1}[0-9]{8}$/.test(form.guardian_contact)) {
      setError("رقمك لازم يكون رقم مصري صحيح");
      return;
    }
    if (form.address && !/^01[0-2,5]{1}[0-9]{8}$/.test(form.address)) {
      setError("رقم بابا او ماما لازم يكون رقم مصري صحيح");
      return;
    }
    if (form.guardian_contact === form.address) {
      setError("رقمك ورقم بابا او ماما لازم يكونوا مختلفين");
      return;
    }
        setLoading(true);
        const res = await fetch("/api/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setLoading(false);
        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Something went wrong. Please try again.");
            return;
        }
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest text-cream text-3xl">✓</div>
                    <h1 className="font-display text-2xl text-forest-dark">Application submitted!</h1>
                   
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-lg">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream text-xl">⛺</div>
                    <h1 className="font-display text-3xl text-forest-dark">يلا نبدا الصيف </h1>
                    
                </div>

                <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-line bg-white/60 p-6 shadow-sm"
        >
          <div className="flex rounded-xl border border-line overflow-hidden">
            <button
              type="button"
              onClick={() => update("scout_type", "جديد")}
              className={`flex-1 py-2.5 text-sm font-medium transition ${
                form.scout_type === "جديد"
                  ? "bg-forest text-cream"
                  : "bg-white text-charcoal/60 hover:bg-khaki/20"
              }`}
            >
              جديد
            </button>
            <button
              type="button"
              onClick={() => update("scout_type", "قديم")}
              className={`flex-1 py-2.5 text-sm font-medium transition ${
                form.scout_type === "قديم"
                  ? "bg-forest text-cream"
                  : "bg-white text-charcoal/60 hover:bg-khaki/20"
              }`}
            >
              قديم
            </button>
          </div>
                    {error && <div className="rounded-lg bg-ember/10 border border-ember/30 px-3 py-2 text-sm text-ember">{error}</div>}

                    <Field label="اسمك ثلاثي " required>
                        <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="input" placeholder="اسمك" />
                    </Field>
                    <Field label="سنه كام " required>
                      <select
                     value={form.dob}
                      onChange={(e) => update("dob", e.target.value)}
                     className="input"
                      >
                     <option value="">اختار</option>
                     <option value="اولي">اولي</option>
                     <option value="تانيه">تانيه</option>
                     <option value="تالته">تالته</option>
      
                      </select>
                 </Field>
                    <Field label="اسم صاحبك " required>
                        <textarea value={form.guardian_name} onChange={(e) => update("guardian_name", e.target.value)} className="input" placeholder="مين صاحبك " />
                    </Field>
                   <Field label="رقمك " required>
                     <input
                     value={form.guardian_contact}
                      onChange={(e) => {
                         const val = e.target.value.replace(/[^0-9]/g, "");
                          update("guardian_contact", val);
                          }}
                     onBlur={(e) => {
                        if (e.target.value && !/^01[0-2,5]{1}[0-9]{8}$/.test(e.target.value)) {
                         setError("رقمك لازم يكون رقم مصري صحيح مثل 01012345678");
                         } else {
                          setError("");
                          }
                           }}
                     className="input"
                       placeholder="01012345678"
                       maxLength={11}
                      inputMode="numeric"
                       />
                 </Field>

                <Field label="رقم بابا او ماما " required>
                 <input
                 value={form.address}
                onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
              update("address", val);
            }}
    onBlur={(e) => {
      if (e.target.value && !/^01[0-2,5]{1}[0-9]{8}$/.test(e.target.value)) {
        setError("رقم بابا او ماما لازم يكون رقم مصري صحيح مثل 01012345678");
      } else {
        setError("");
      }
    }}
    className="input"
    placeholder="01012345678"
    maxLength={11}
    inputMode="numeric"
  />
</Field>
                    <Field label="لو عايز تقولنا حاجه" >
                        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input min-h-[80px]" placeholder="" />
                    </Field>

                    <button type="submit" disabled={loading} className="w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-cream hover:bg-forest-dark disabled:opacity-60">
                        {loading ? "Submitting…" : "Submit application"}
                    </button>
                </form>
            </div>
            <style jsx global>{`
        .input { width: 100%; border-radius: 0.5rem; border: 1px solid var(--line); background: white; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
        .input:focus { box-shadow: 0 0 0 2px rgba(31, 77, 54, 0.25); }
      `}</style>
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-charcoal/80">{label} {required && <span className="text-ember">*</span>}</label>
            {children}
        </div>
    );
}