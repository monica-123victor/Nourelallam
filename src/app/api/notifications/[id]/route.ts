import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await params;
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
