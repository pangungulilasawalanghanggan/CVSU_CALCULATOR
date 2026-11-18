import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE } from "../../../lib/auth";
import { findBinary, runCpp, parseResult } from "../../../lib/cpp-engine";
import { isRecord, isPercentage } from "../../../lib/validation";
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
    if (!isRecord(body) || !isPercentage(body.percentage))
        return NextResponse.json({ error: "Percentage must be a finite number from 0 to 100." }, { status: 400 });
    const args = ["grade", String(body.percentage)];
    try {
        const result = parseResult(await runCpp(findBinary(), args), "grade");
        return NextResponse.json({ grade: result.value, remark: result.label, source: "C++" }, { headers: { "Cache-Control": "no-store" } });
    }
    catch {
        return NextResponse.json({ error: "C++ calculation is unavailable. Please contact the site administrator." }, { status: 503 });
    }
}
