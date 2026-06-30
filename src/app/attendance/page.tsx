export const dynamic = "force-dynamic";

import Link from "next/link";
import pool, { ensureSchema } from "@/lib/db";
import Shell from "@/components/Shell";
import NewSessionForm from "@/components/NewSessionForm";

type SessionRow = {
  id: number;
  date: string;
  label: string;
  recorded_count: string;
};

export default async function AttendancePage() {
  await ensureSchema();

  const totalResult = await pool.query("SELECT COUNT(*) as c FROM scouts");
  const totalScouts = Number(totalResult.rows[0].c);

  const sessionsResult = await pool.query(
    `SELECT s.*, (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = s.id) as recorded_count
     FROM sessions s ORDER BY s.date DESC`
  );
  const sessions = sessionsResult.rows as SessionRow[];

  return (
    <Shell leaderName="Leader">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mb-4 font-display text-2xl text-forest-dark">Sessions</h1>
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/40 p-10 text-center">
              <p className="text-charcoal/60">No sessions yet. Create one for Friday or Sunday.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => {
                const recorded = Number(s.recorded_count);
                return (
                  <Link
                    key={s.id}
                    href={`/attendance/${s.id}`}
                    className="flex items-center justify-between rounded-xl border border-line bg-white/60 px-4 py-3 hover:bg-cream"
                  >
                    <div>
                      <p className="font-medium text-charcoal">{s.date}</p>
                      <p className="text-xs text-charcoal/50">{s.label}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        recorded >= totalScouts && totalScouts > 0
                          ? "bg-forest/10 text-forest-dark"
                          : "bg-khaki/40 text-charcoal"
                      }`}
                    >
                      {recorded}/{totalScouts} recorded
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 font-display text-lg text-forest-dark">New session</h2>
          <NewSessionForm />
        </div>
      </div>
    </Shell>
  );
}
