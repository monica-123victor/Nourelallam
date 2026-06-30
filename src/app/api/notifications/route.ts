import { NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const result = await pool.query(
    `SELECT n.*, s.name as scout_name FROM notifications n
     JOIN scouts s ON s.id = n.scout_id
     ORDER BY n.created_at DESC LIMIT 50`
  );
  return NextResponse.json(result.rows);
}
