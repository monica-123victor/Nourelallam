export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import pool, { ensureSchema } from "@/lib/db";
import Shell from "@/components/Shell";
import GroupPicker from "@/components/GroupPicker";
import ScoutQRCode from "@/components/ScoutQRCode";

type Scout = {
  id: number;
  name: string;
  dob: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  address: string | null;
  join_date: string | null;
  notes: string | null;
  group_name: string | null;
  points_total: number;
};

type HistoryRow = {
  id: number;
  session_date: string;
  session_label: string;
  status: string;
  early: number;
  copybook: number;
  uniform: number;
  points: number;
};

export default async function ScoutProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureSchema();
  const { id } = await params;

  const scoutResult = await pool.query("SELECT * FROM scouts WHERE id = $1", [id]);
  const scout = scoutResult.rows[0] as Scout | undefined;
  if (!scout) notFound();

  const historyResult = await pool.query(
    `SELECT ar.*, s.date as session_date, s.label as session_label
     FROM attendance_records ar
     JOIN sessions s ON s.id = ar.session_id
     WHERE ar.scout_id = $1
     ORDER BY s.date DESC`,
    [id]
  );
  const history = historyResult.rows as HistoryRow[];

  const presentCount = history.filter((h) => h.status === "present").length;
  const lateCount = history.filter((h) => h.status === "late").length;
  const absentCount = history.filter((h) => h.status === "absent").length;

  let streak = 0;
  for (const h of history) {
    if (h.status === "absent") streak++;
    else break;
  }

  return (
    <Shell leaderName="Leader">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-forest-dark sm:text-3xl">{scout.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-charcoal/60">
            {scout.dob && <span>DOB: {scout.dob}</span>}
            {scout.join_date && <span>Joined: {scout.join_date}</span>}
            {scout.guardian_name && <span>Guardian: {scout.guardian_name}</span>}
            {scout.guardian_contact && <span>Contact: {scout.guardian_contact}</span>}
            {scout.address && <span>Address: {scout.address}</span>}
          </div>
          {scout.notes && <p className="mt-2 text-sm italic text-charcoal/50">{scout.notes}</p>}
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs font-medium text-charcoal/60">Group</span>
            <GroupPicker scoutId={scout.id} currentGroup={scout.group_name} />
          </div>
         
        </div>
      </div>

      {streak >= 3 && (
        <div className="mb-5 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          ⚠️ {scout.name} has missed the last {streak} sessions in a row.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Points" value={scout.points_total} highlight />
        <Stat label="Present" value={presentCount} />
        <Stat label="Late" value={lateCount} />
        <Stat label="Absent" value={absentCount} />
        <Stat label="Sessions" value={history.length} />
      </div>

      <div className="rounded-2xl border border-line bg-white/60">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-lg text-forest-dark">Attendance history</h2>
        </div>
        {history.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-charcoal/50">
            No attendance recorded yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-khaki/20 text-left text-charcoal/70">
                <th className="px-4 py-2 font-medium">Session</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Checklist</th>
                <th className="px-4 py-2 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2">
                    {h.session_date} <span className="text-charcoal/40">· {h.session_label}</span>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="px-4 py-2 text-charcoal/70">
                    {h.status === "absent"
                      ? "—"
                      : [h.early && "Early", h.copybook && "Copybook", h.uniform && "Uniform"]
                          .filter(Boolean)
                          .join(", ") || "None checked"}
                  </td>
                  <td className="px-4 py-2 font-medium">{h.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border border-line p-4 ${highlight ? "bg-forest/10" : "bg-white/60"}`}>
      <p className={`font-display text-2xl ${highlight ? "text-forest-dark" : "text-charcoal"}`}>
        {value}
      </p>
      <p className="text-xs text-charcoal/60">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    present: "bg-forest/10 text-forest-dark",
    late: "bg-khaki/40 text-charcoal",
    absent: "bg-ember/10 text-ember",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
