import { NextRequest, NextResponse } from "next/server";
import { authConfig, cookieOptions, FLOW_COOKIE, loginDestination, readValue, SESSION_COOKIE, SESSION_SECONDS, signValue, verifyGoogleToken, WorkspaceAccountError } from "../../../../lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
    let config: ReturnType<typeof authConfig>;
    try {
        config = authConfig();
    }
    catch {
        return NextResponse.json({ error: "Google login is not configured." }, { status: 503 });
    }
    let response: NextResponse;
    let destination = "/grade";
    let failure = "signin";
    try {
        const flow = readValue(req.cookies.get(FLOW_COOKIE)?.value, "flow");
        const code = req.nextUrl.searchParams.get("code");
        if (!flow || typeof flow.state !== "string" || typeof flow.nonce !== "string" || typeof flow.verifier !== "string" || flow.state !== req.nextUrl.searchParams.get("state"))
            throw new Error("Invalid sign-in attempt.");
        destination = loginDestination(flow.destination);
        if (req.nextUrl.searchParams.get("error") === "access_denied") {
            failure = "cancelled";
            throw new Error("Sign-in cancelled.");
        }
        if (!code || req.nextUrl.searchParams.has("error"))
            throw new Error("Invalid sign-in attempt.");
        const tokens = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.callback, grant_type: "authorization_code", code_verifier: flow.verifier }), signal: AbortSignal.timeout(8000), cache: "no-store" });
        if (!tokens.ok)
            throw new Error("Google sign-in failed.");
        const data = await tokens.json();
        if (typeof data.id_token !== "string")
            throw new Error("Missing Google identity.");
        const session = await verifyGoogleToken(data.id_token, flow.nonce);
        response = NextResponse.redirect(new URL(destination, config.origin));
        response.cookies.set(SESSION_COOKIE, signValue(session, "session"), cookieOptions(SESSION_SECONDS));
    }
    catch (error) {
        const login = new URL("/login", config.origin);
        login.searchParams.set("error", error instanceof WorkspaceAccountError ? "account" : failure);
        login.searchParams.set("next", destination);
        response = NextResponse.redirect(login);
        response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
    }
    response.cookies.set(FLOW_COOKIE, "", cookieOptions(0));
    response.headers.set("Cache-Control", "no-store");
    return response;
}
