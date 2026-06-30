import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const result = await pool.query("SELECT * FROM scouts ORDER BY name ASC");
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();
  const { name, dob, guardian_name, guardian_contact, address, join_date, photo_url, notes } = body;

  if (!name) {
    return NextResponse.json({ error: "Scout name is required." }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO scouts (name, dob, guardian_name, guardian_contact, address, join_date, photo_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      name,
      dob || null,
      guardian_name || null,
      guardian_contact || null,
      address || null,
      join_date || null,
      photo_url || null,
      notes || null,
    ]
  );

  return NextResponse.json(result.rows[0]);
}
