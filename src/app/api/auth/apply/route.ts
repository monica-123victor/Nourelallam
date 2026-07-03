import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
    await ensureSchema();
    const body = await req.json();
    const { name, dob, guardian_name, guardian_contact, address, notes } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    const result = await pool.query(
        `INSERT INTO scouts (name, dob, guardian_name, guardian_contact, address, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [name.trim(), dob || null, guardian_name || null, guardian_contact || null, address || null, notes || null]
    );

    return NextResponse.json({ ok: true, id: result.rows[0].id });
}