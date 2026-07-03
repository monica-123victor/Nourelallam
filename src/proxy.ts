import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/apply", "/api/apply", "/api/auth/login"];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    const authCookie = req.cookies.get("leader_auth")?.value;
    const secret = process.env.AUTH_SECRET || "auth";
    const isAuthenticated = authCookie === secret;

    if (!isAuthenticated) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image).*)"],
};