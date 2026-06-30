import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const result = await pool.query(
    `SELECT s.*,
      (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = s.id) as recorded_count
     FROM sessions s
     ORDER BY s.date DESC`
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const { date, label } = await req.json();
  if (!date) return NextResponse.json({ error: "Date is required." }, { status: 400 });

  const existing = await pool.query("SELECT id FROM sessions WHERE date = $1", [date]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "A session for this date already exists." }, { status: 409 });
  }

  const dayLabel =
    label || new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });

  const result = await pool.query(
    "INSERT INTO sessions (date, label) VALUES ($1, $2) RETURNING *",
    [date, dayLabel]
  );

  return NextResponse.json(result.rows[0]);
}
