import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, localOrigin, SESSION_COOKIE } from "../../../../lib/auth";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
    const origin = localOrigin(req.headers.get("origin") || "");
    const target = localOrigin(req.url);
    const host = req.headers.get("host");
    if (!origin || !target || new URL(origin).port !== new URL(target).port || (host !== null && host !== new URL(origin).host))
        return NextResponse.json({ error: "Invalid local demo request." }, { status: 403 });
    const response = NextResponse.redirect(new URL("/", origin), 303);
    response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
    response.headers.set("Cache-Control", "no-store");
    return response;
}
