import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

type ScoutRow = { id: number; name: string; group_name: string | null };
type RecordRow = {
  scout_id: number;
  status: string;
  early: number;
  copybook: number;
  uniform: number;
  points: number;
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const sessionResult = await pool.query("SELECT * FROM sessions WHERE id = $1", [id]);
  if (sessionResult.rows.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const scoutsResult = await pool.query("SELECT * FROM scouts ORDER BY name ASC");
  const scouts = scoutsResult.rows as ScoutRow[];

  const recordsResult = await pool.query(
    "SELECT * FROM attendance_records WHERE session_id = $1",
    [id]
  );
  const records = recordsResult.rows as RecordRow[];

  const recordMap = new Map(records.map((r) => [r.scout_id, r]));
  const combined = scouts.map((s) => ({
    scout: s,
    record: recordMap.get(s.id) || null,
  }));

  return NextResponse.json({ session: sessionResult.rows[0], scouts: combined });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const sessionResult = await pool.query("SELECT * FROM sessions WHERE id = $1", [id]);
  if (sessionResult.rows.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { entries } = await req.json();
  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: "entries must be an array." }, { status: 400 });
  }

  const notifications: { scout_id: number; session_id: number; message: string }[] = [];

  for (const entry of entries) {
    const { scout_id, status, early, copybook, uniform } = entry;
    if (!scout_id || !["present", "late", "absent"].includes(status)) continue;

    const e = early ? 1 : 0;
    const c = copybook ? 1 : 0;
    const u = uniform ? 1 : 0;
    const points = status === "absent" ? 0 : e + c + u;

    await pool.query(
      `INSERT INTO attendance_records (scout_id, session_id, status, early, copybook, uniform, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (scout_id, session_id) DO UPDATE SET
         status = EXCLUDED.status,
         early = EXCLUDED.early,
         copybook = EXCLUDED.copybook,
         uniform = EXCLUDED.uniform,
         points = EXCLUDED.points`,
      [scout_id, id, status, e, c, u, points]
    );

    const totalResult = await pool.query(
      "SELECT COALESCE(SUM(points), 0) as total FROM attendance_records WHERE scout_id = $1",
      [scout_id]
    );
    const total = totalResult.rows[0].total;
    await pool.query("UPDATE scouts SET points_total = $1 WHERE id = $2", [total, scout_id]);

    const lastThreeResult = await pool.query(
      `SELECT ar.status, s.date FROM attendance_records ar
       JOIN sessions s ON s.id = ar.session_id
       WHERE ar.scout_id = $1
       ORDER BY s.date DESC
       LIMIT 3`,
      [scout_id]
    );
    const lastThree = lastThreeResult.rows as { status: string; date: string }[];

    if (lastThree.length === 3 && lastThree.every((r) => r.status === "absent")) {
      const nameResult = await pool.query("SELECT name FROM scouts WHERE id = $1", [scout_id]);
      const scoutName = nameResult.rows[0].name;
      notifications.push({
        scout_id,
        session_id: Number(id),
        message: `${scoutName} has missed 3 sessions in a row.`,
      });
    }
  }

  for (const n of notifications) {
    await pool.query(
      `INSERT INTO notifications (scout_id, session_id, message)
       VALUES ($1, $2, $3)
       ON CONFLICT (scout_id, session_id) DO NOTHING`,
      [n.scout_id, n.session_id, n.message]
    );
  }

  return NextResponse.json({ ok: true, notificationsCreated: notifications.length });
}
