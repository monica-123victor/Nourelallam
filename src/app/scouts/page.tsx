export const dynamic = "force-dynamic";

import Link from "next/link";
import pool, { ensureSchema } from "@/lib/db";
import Shell from "@/components/Shell";
import ScoutsList from "@/components/ScoutsList";

type ScoutRow = {
  id: number;
  name: string;
  group_name: string | null;
  points_total: number;
};

export default async function ScoutsPage() {
  await ensureSchema();
  const result = await pool.query(
    "SELECT id, name, group_name, points_total FROM scouts ORDER BY name ASC"
  );
  const scouts = result.rows as ScoutRow[];

  return (
    <Shell leaderName="Leader">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl text-forest-dark">Scouts</h1>
        <Link
          href="/scouts/new"
          className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-dark"
        >
          + New scout
        </Link>
      </div>

      <ScoutsList scouts={scouts} />
    </Shell>
  );
}
