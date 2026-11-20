import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE } from "../../../../lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    const session = readSession(req.cookies.get(SESSION_COOKIE)?.value);
    return NextResponse.json({ user: session ? { name: session.name, email: session.email, picture: session.picture || null } : null }, { headers: { "Cache-Control": "no-store" } });
}
