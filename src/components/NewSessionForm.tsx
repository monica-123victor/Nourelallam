"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSessionForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!date) {
      setError("Pick a date.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }
    const created = await res.json();
    router.push(`/attendance/${created.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-line bg-white/60 p-4">
      {error && (
        <div className="rounded-lg bg-ember/10 border border-ember/30 px-3 py-2 text-xs text-ember">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal/80">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
        />
        <p className="mt-1 text-xs text-charcoal/40">Usually a Friday or Sunday session.</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-forest py-2 text-sm font-medium text-cream hover:bg-forest-dark disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create session"}
      </button>
    </form>
  );
}
