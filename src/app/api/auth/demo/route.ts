import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, createDemoSession, localOrigin, loginDestination, SESSION_COOKIE, SESSION_SECONDS } from "../../../../lib/auth";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
    const origin = localOrigin(req.headers.get("origin") || "");
    const target = localOrigin(req.url);
    const host = req.headers.get("host");
    if (!origin || !target || new URL(origin).port !== new URL(target).port || (host !== null && host !== new URL(origin).host))
        return NextResponse.json({ error: "Demo entry is available only on localhost in development." }, { status: 403 });
    const form = await req.formData();
    const response = NextResponse.redirect(new URL(loginDestination(form.get("next")), origin), 303);
    response.cookies.set(SESSION_COOKIE, createDemoSession(), cookieOptions(SESSION_SECONDS));
    response.headers.set("Cache-Control", "no-store");
    return response;
}
