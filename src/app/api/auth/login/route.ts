import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { password } = await req.json();
    const correctPassword = process.env.LEADER_PASSWORD;

    if (!correctPassword) {
        return NextResponse.json({ error: "Server not configured." }, { status: 500 });
    }
    if (password !== correctPassword) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("leader_auth", process.env.AUTH_SECRET || "auth", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
    return res;
}