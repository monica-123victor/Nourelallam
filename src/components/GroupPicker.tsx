"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GROUPS = ["Group A", "Group B", "Group C", "Group D"];

export default function GroupPicker({
  scoutId,
  currentGroup,
}: {
  scoutId: number;
  currentGroup: string | null;
}) {
  const router = useRouter();
  const [group, setGroup] = useState(currentGroup || "");
  const [saving, setSaving] = useState(false);

  async function handleChange(value: string) {
    setGroup(value);
    setSaving(true);
    await fetch(`/api/scouts/${scoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_name: value || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={group}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-forest/40"
      >
        <option value="">Unassigned</option>
        {GROUPS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-charcoal/40">Saving…</span>}
    </div>
  );
}
