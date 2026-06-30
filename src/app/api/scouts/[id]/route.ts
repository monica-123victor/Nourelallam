import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const scoutResult = await pool.query("SELECT * FROM scouts WHERE id = $1", [id]);
  const scout = scoutResult.rows[0];
  if (!scout) return NextResponse.json({ error: "Scout not found" }, { status: 404 });

  const historyResult = await pool.query(
    `SELECT ar.*, s.date as session_date, s.label as session_label
     FROM attendance_records ar
     JOIN sessions s ON s.id = ar.session_id
     WHERE ar.scout_id = $1
     ORDER BY s.date DESC`,
    [id]
  );

  const statsResult = await pool.query(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
       SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
       SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
     FROM attendance_records WHERE scout_id = $1`,
    [id]
  );

  return NextResponse.json({ scout, history: historyResult.rows, stats: statsResult.rows[0] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  const body = await req.json();
  const fields = ["name", "dob", "guardian_name", "guardian_contact", "address", "join_date", "photo_url", "notes", "group_name"];

  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  let i = 1;
  for (const f of fields) {
    if (f in body) {
      updates.push(`${f} = $${i}`);
      values.push(body[f]);
      i++;
    }
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE scouts SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  await pool.query("DELETE FROM scouts WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
