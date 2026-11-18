import { NextRequest, NextResponse } from "next/server";
import { authorizationUrl, cookieOptions, createFlow, FLOW_COOKIE, signValue } from "../../../../lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    try {
        const flow = createFlow(req.nextUrl.searchParams.get("next"));
        const response = NextResponse.redirect(authorizationUrl(flow));
        response.headers.set("Cache-Control", "no-store");
        response.cookies.set(FLOW_COOKIE, signValue(flow, "flow"), cookieOptions(600));
        return response;
    }
    catch {
        return NextResponse.json({ error: "Google login is not configured. Ask the site administrator to complete setup." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
}
