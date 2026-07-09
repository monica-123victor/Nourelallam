"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewScoutForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    guardian_name: "",
    guardian_contact: "",
    address: "",
    join_date: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Scout name is required.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/scouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }
    const scout = await res.json();
    router.push(`/scouts/${scout.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-line bg-white/60 p-6">
      {error && (
        <div className="rounded-lg bg-ember/10 border border-ember/30 px-3 py-2 text-sm text-ember">
          {error}
        </div>
      )}

      <Field label="Full name" required>
        <input
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="input"
          placeholder="Scout's full name"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <Field label="Join date">
          <input
            type="date"
            value={form.join_date}
            onChange={(e) => update("join_date", e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Friend name">
          <input
            value={form.guardian_name}
            onChange={(e) => update("friend_name", e.target.value)}
            className="input"
            placeholder="Parent / guardian"
          />
        </Field>
        <Field label="Parent contact">
          <input
            value={form.guardian_contact}
            onChange={(e) => update("guardian_contact", e.target.value)}
            className="input"
            placeholder="Phone or email"
          />
        </Field>
      </div>

      <Field label="Address">
        <input
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="input"
          placeholder="Home address"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="input min-h-[80px]"
          placeholder="Anything else worth noting — allergies, special needs, etc."
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-forest py-2.5 text-sm font-medium text-cream hover:bg-forest-dark disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save scout"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--line);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          box-shadow: 0 0 0 2px rgba(31, 77, 54, 0.25);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-charcoal/80">
        {label} {required && <span className="text-ember">*</span>}
      </label>
      {children}
    </div>
  );
}
