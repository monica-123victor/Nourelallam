export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import pool, { ensureSchema } from "@/lib/db";
import Shell from "@/components/Shell";
import AttendanceEntry from "@/components/AttendanceEntry";

export default async function AttendanceSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureSchema();
  const { id } = await params;
  const result = await pool.query("SELECT * FROM sessions WHERE id = $1", [id]);
  const sessionRow = result.rows[0] as { id: number; date: string; label: string } | undefined;
  if (!sessionRow) notFound();

  return (
    <Shell leaderName="Leader">
      <h1 className="mb-1 font-display text-2xl text-forest-dark">{sessionRow.date}</h1>
      <p className="mb-5 text-sm text-charcoal/60">{sessionRow.label} session — mark attendance below.</p>
      <AttendanceEntry sessionId={sessionRow.id} />
    </Shell>
  );
}
