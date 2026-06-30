export const dynamic = "force-dynamic";

import Link from "next/link";
import pool, { ensureSchema } from "@/lib/db";
import Shell from "@/components/Shell";

type CountRow = { count: string };
type ScoutAtRisk = { id: number; name: string; group_name: string | null };

export default async function DashboardPage() {
  await ensureSchema();

  const scoutCountResult = await pool.query("SELECT COUNT(*) as count FROM scouts");
  const scoutCount = Number((scoutCountResult.rows[0] as CountRow).count);

  const sessionCountResult = await pool.query("SELECT COUNT(*) as count FROM sessions");
  const sessionCount = Number((sessionCountResult.rows[0] as CountRow).count);

  const unreadResult = await pool.query("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0");
  const unreadCount = Number((unreadResult.rows[0] as CountRow).count);

  const ungroupedResult = await pool.query("SELECT COUNT(*) as count FROM scouts WHERE group_name IS NULL");
  const ungrouped = Number((ungroupedResult.rows[0] as CountRow).count);

  const topScoutsResult = await pool.query(
    "SELECT id, name, points_total, group_name FROM scouts ORDER BY points_total DESC LIMIT 5"
  );
  const topScouts = topScoutsResult.rows as { id: number; name: string; points_total: number; group_name: string | null }[];

  const atRiskResult = await pool.query(
    `SELECT DISTINCT ON (s.id) s.id, s.name, s.group_name FROM notifications n
     JOIN scouts s ON s.id = n.scout_id
     WHERE n.is_read = 0
     ORDER BY s.id, n.created_at DESC LIMIT 5`
  );
  const atRisk = atRiskResult.rows as ScoutAtRisk[];

  return (
    <Shell leaderName="Leader">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-forest-dark sm:text-3xl">Welcome back</h1>
          
        </div>
        <div className="hidden gap-2 sm:flex">
          <Link
            href="/scouts/new"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-dark"
          >
            + New scout
          </Link>
          <Link
            href="/attendance"
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-khaki/20"
          >
            Take attendance
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Scouts" value={scoutCount} />
        <StatCard label="Sessions logged" value={sessionCount} />
        <StatCard label="Ungrouped" value={ungrouped} />
        <StatCard label="Unread alerts" value={unreadCount} accent={unreadCount > 0} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/60 p-5">
          <h2 className="mb-3 font-display text-lg text-forest-dark">Top points</h2>
          {topScouts.length === 0 ? (
            <p className="text-sm text-charcoal/50">No points recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {topScouts.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <Link href={`/scouts/${s.id}`} className="flex items-center gap-2 hover:underline">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-khaki/40 text-xs font-semibold text-forest-dark">
                      {i + 1}
                    </span>
                    {s.name}
                    {s.group_name && (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest-dark">
                        {s.group_name}
                      </span>
                    )}
                  </Link>
                  <span className="font-semibold text-forest-dark">{s.points_total} pts</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white/60 p-5">
          <h2 className="mb-3 font-display text-lg text-forest-dark">Needs attention</h2>
          {atRisk.length === 0 ? (
            <p className="text-sm text-charcoal/50">No active alerts — nice work.</p>
          ) : (
            <ul className="space-y-2">
              {atRisk.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/scouts/${s.id}`}
                    className="flex items-center justify-between rounded-lg bg-ember/10 px-3 py-2 text-sm hover:bg-ember/20"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs font-medium text-ember">3 absences in a row</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Shell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-line p-4 ${
        accent && value > 0 ? "bg-ember/10" : "bg-white/60"
      }`}
    >
      <p className={`font-display text-2xl ${accent && value > 0 ? "text-ember" : "text-forest-dark"}`}>
        {value}
      </p>
      <p className="text-xs text-charcoal/60">{label}</p>
    </div>
  );
}
