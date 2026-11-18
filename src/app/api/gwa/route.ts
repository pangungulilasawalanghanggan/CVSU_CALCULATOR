import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE } from "../../../lib/auth";
import { findBinary, runCpp, parseResult } from "../../../lib/cpp-engine";
import { isRecord, isSubject, MAX_SUBJECTS } from "../../../lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
    if (!readSession(req.cookies.get(SESSION_COOKIE)?.value))
        return NextResponse.json({ error: "Sign in with your CvSU Google account to calculate." }, { status: 401 });
    let body: unknown;
    try {
        body = await req.json();
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    if (!isRecord(body) || !Array.isArray(body.subjects) || body.subjects.length === 0 || body.subjects.length > MAX_SUBJECTS || !body.subjects.every(isSubject))
        return NextResponse.json({ error: "Provide 1–100 subjects with numeric grades (1–5) and positive finite units." }, { status: 400 });
    const args = ["gwa", ...body.subjects.flatMap(s => [String(s.grade), String(s.units)])];
    try {
        const result = parseResult(await runCpp(findBinary(), args), "gwa");
        return NextResponse.json({ gwa: result.value, honors: result.label, source: "C++" }, { headers: { "Cache-Control": "no-store" } });
    }
    catch {
        return NextResponse.json({ error: "C++ calculation is unavailable. Please contact the site administrator." }, { status: 503 });
    }
}
