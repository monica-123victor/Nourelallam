"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Scout = { id: number; name: string; group_name: string | null };
type Record = {
    status: string;
    early: number;
    copybook: number;
    uniform: number;
};
type Combined = { scout: Scout; record: Record | null };

const STATUS_OPTIONS = [
    { value: "present", label: "Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
];

export default function AttendanceEntry({ sessionId }: { sessionId: number }) {
    const router = useRouter();
    const [rows, setRows] = useState<Combined[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState("");
    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState("");

    useEffect(() => {
        fetch(`/api/sessions/${sessionId}/attendance`)
            .then((r) => r.json())
            .then((data) => {
                setRows(data.scouts || []);
                setLoading(false);
            });
    }, [sessionId]);

    const groups = useMemo(
        () => Array.from(new Set(rows.map((r) => r.scout.group_name).filter(Boolean))) as string[],
        [rows]
    );

    const filteredRows = useMemo(() => {
        return rows.filter((r) => {
            const matchesName = r.scout.name.toLowerCase().includes(search.trim().toLowerCase());
            const matchesGroup =
                !groupFilter ||
                (groupFilter === "Unassigned" ? !r.scout.group_name : r.scout.group_name === groupFilter);
            return matchesName && matchesGroup;
        });
    }, [rows, search, groupFilter]);

    function setStatus(scoutId: number, status: string) {
        setRows((prev) =>
            prev.map((row) =>
                row.scout.id === scoutId
                    ? {
                        ...row,
                        record: {
                            status,
                            early: row.record?.early ?? 0,
                            copybook: row.record?.copybook ?? 0,
                            uniform: row.record?.uniform ?? 0,
                        },
                    }
                    : row
            )
        );
    }

    function toggleCheck(scoutId: number, field: "early" | "copybook" | "uniform") {
        setRows((prev) =>
            prev.map((row) => {
                if (row.scout.id !== scoutId) return row;
                const current = row.record || { status: "present", early: 0, copybook: 0, uniform: 0 };
                return { ...row, record: { ...current, [field]: current[field] ? 0 : 1 } };
            })
        );
    }

    async function handleSave() {
        setSaving(true);
        setSavedMsg("");
        const entries = rows
            .filter((r) => r.record)
            .map((r) => ({
                scout_id: r.scout.id,
                status: r.record!.status,
                early: r.record!.early,
                copybook: r.record!.copybook,
                uniform: r.record!.uniform,
            }));

        const res = await fetch(`/api/sessions/${sessionId}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries }),
        });

        setSaving(false);
        if (res.ok) {
            const data = await res.json();
            setSavedMsg(
                data.notificationsCreated > 0
                    ? `Saved. ${data.notificationsCreated} new alert(s) sent to leaders.`
                    : "Saved."
            );
            router.refresh();
        } else {
            setSavedMsg("Something went wrong while saving.");
        }
    }

    if (loading) {
        return <p className="text-sm text-charcoal/50">Loading scouts…</p>;
    }

    if (rows.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-line bg-white/40 p-10 text-center">
                <p className="text-charcoal/60">No scouts to mark yet. Add scouts first.</p>
            </div>
        );
    }

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
                    {groups.map((g) => (
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

            {filteredRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-white/40 p-10 text-center">
                    <p className="text-charcoal/60">No scouts match your search.</p>
                </div>
            ) : (
                    <div className="overflow-x-auto rounded-2xl border border-line bg-white/60">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-line bg-khaki/20 text-left text-charcoal/70">
                                <th className="px-4 py-3 font-medium">Scout</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-center">Early</th>
                                <th className="px-4 py-3 font-medium text-center">Copybook</th>
                                <th className="px-4 py-3 font-medium text-center">Uniform</th>
                                <th className="px-4 py-3 font-medium text-center">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map(({ scout, record }) => {
                                const status = record?.status || "";
                                const isAbsent = status === "absent";
                                const points = isAbsent
                                    ? 0
                                    : (record?.early ? 1 : 0) + (record?.copybook ? 1 : 0) + (record?.uniform ? 1 : 0);
                                return (
                                    <tr key={scout.id} className="border-b border-line/60 last:border-0">
                                        <td className="px-4 py-2.5 font-medium text-charcoal">
                                            {scout.name}
                                            {scout.group_name && (
                                                <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest-dark">
                                                    {scout.group_name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex gap-1">
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setStatus(scout.id, opt.value)}
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${status === opt.value
                                                                ? opt.value === "absent"
                                                                    ? "bg-ember text-white"
                                                                    : opt.value === "late"
                                                                        ? "bg-khaki text-charcoal"
                                                                        : "bg-forest text-cream"
                                                                : "bg-cream text-charcoal/50 hover:bg-khaki/30"
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        {(["early", "copybook", "uniform"] as const).map((field) => (
                                            <td key={field} className="px-4 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    disabled={isAbsent || !status}
                                                    checked={Boolean(record?.[field])}
                                                    onChange={() => toggleCheck(scout.id, field)}
                                                    className="h-4 w-4 accent-[var(--forest)] disabled:opacity-30"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-4 py-2.5 text-center font-medium text-forest-dark">
                                            {status ? points : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-dark disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Save attendance"}
                </button>
                {savedMsg && <span className="text-sm text-charcoal/60">{savedMsg}</span>}
            </div>
        </div>
    );
}