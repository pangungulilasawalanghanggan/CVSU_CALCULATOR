import { NextRequest, NextResponse } from "next/server";
import { authConfig, cookieOptions, FLOW_COOKIE, SESSION_COOKIE } from "../../../../lib/auth";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
    try {
        const config = authConfig();
        if (req.headers.get("origin") !== config.origin)
            return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
        const response = NextResponse.redirect(new URL("/", config.origin), 303);
        response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
        response.cookies.set(FLOW_COOKIE, "", cookieOptions(0));
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
    catch {
        return NextResponse.json({ error: "Login is not configured." }, { status: 503 });
    }
}
