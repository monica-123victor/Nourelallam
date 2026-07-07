import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
    await ensureSchema();
    const body = await req.json();
    const { name, dob,birth_date, guardian_name, guardian_contact, address, notes , scout_type } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

   const result = await pool.query(
  `INSERT INTO scouts (name, dob, birth_date, guardian_name, guardian_contact, address, notes, scout_type)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
  [name.trim(), dob || null, birth_date || null, guardian_name || null, guardian_contact || null, address || null, notes || null, scout_type || 'لسه اول سنه ليا']
);

    return NextResponse.json({ ok: true, id: result.rows[0].id });
}