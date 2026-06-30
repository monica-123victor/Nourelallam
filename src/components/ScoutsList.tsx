"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Scout = {
  id: number;
  name: string;
  group_name: string | null;
  points_total: number;
};

const GROUPS = ["Group A", "Group B", "Group C", "Group D"];

export default function ScoutsList({ scouts }: { scouts: Scout[] }) {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = useMemo(() => {
    return scouts.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesGroup =
        !groupFilter ||
        (groupFilter === "Unassigned" ? !s.group_name : s.group_name === groupFilter);
      return matchesName && matchesGroup;
    });
  }, [scouts, search, groupFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40 sm:w-64"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest/40"
        >
          <option value="">All groups</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="Unassigned">Unassigned</option>
        </select>
        {(search || groupFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setGroupFilter("");
            }}
            className="text-sm text-charcoal/50 underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/40 p-10 text-center">
          <p className="text-charcoal/60">
            {scouts.length === 0
              ? "No scouts yet. Add the first application to get started."
              : "No scouts match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-khaki/20 text-left text-charcoal/70">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Group</th>
                <th className="px-4 py-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <Link href={`/scouts/${s.id}`} className="font-medium text-forest-dark hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {s.group_name ? (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest-dark">
                        {s.group_name}
                      </span>
                    ) : (
                      <span className="text-xs text-charcoal/40">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-charcoal">{s.points_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
