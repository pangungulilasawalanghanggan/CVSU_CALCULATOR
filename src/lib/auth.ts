import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
export const SESSION_COOKIE = "cvsu_local_demo_session";
export const SESSION_SECONDS = 8 * 60 * 60;
export interface Session { sub: string; email: string; name: string; domain: string; exp: number; picture?: string; }
const state = globalThis as typeof globalThis & { cvsuDemoSecret?: Buffer };
function secret() { return state.cvsuDemoSecret ||= randomBytes(32); }
export function demoEnabled() { return process.env.NODE_ENV !== "production" && !process.env.VERCEL; }
export function localOrigin(value: string): string | null {
    try {
        const url = new URL(value);
        return demoEnabled() && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? url.origin : null;
    } catch { return null; }
}
export function loginDestination(value: unknown): string {
    return typeof value === "string" && ["/grade", "/gwa", "/grading-system"].includes(value) ? value : "/grade";
}
export function signValue(value: object, purpose: "session" = "session"): string {
    if (!demoEnabled()) throw new Error("Demo access is disabled in production.");
    const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
    return payload + "." + createHmac("sha256", secret()).update(purpose + "." + payload).digest("base64url");
}
export function createDemoSession() {
    return signValue({ sub: "local-demo", name: "Demo Student", email: "demo@cvsu.edu.ph", domain: "cvsu.edu.ph", exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS });
}
export function readSession(raw: string | undefined): Session | null {
    if (!demoEnabled() || !raw || raw.length > 4096) return null;
    try {
        const parts = raw.split(".");
        if (parts.length !== 2) return null;
        const expected = createHmac("sha256", secret()).update("session." + parts[0]).digest();
        const actual = Buffer.from(parts[1], "base64url");
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
        const value = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
        if (!value || value.sub !== "local-demo" || value.email !== "demo@cvsu.edu.ph" || value.name !== "Demo Student" || value.domain !== "cvsu.edu.ph" || !Number.isFinite(value.exp) || value.exp <= Date.now() / 1000) return null;
        return value as Session;
    } catch { return null; }
}
export function cookieOptions(maxAge: number) { return { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/", maxAge }; }
