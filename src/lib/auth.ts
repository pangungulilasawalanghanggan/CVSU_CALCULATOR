import { createHash, createHmac, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";
import { isRecord } from "./validation";
export const SESSION_COOKIE = "cvsu_session";
export const FLOW_COOKIE = "cvsu_oauth";
export const SESSION_SECONDS = 8 * 60 * 60;
export interface Session {
    sub: string;
    email: string;
    name: string;
    domain: string;
    exp: number;
    picture?: string;
}
export function googlePicture(value: unknown): string | undefined {
    if (typeof value !== "string" || value.length > 1024)
        return undefined;
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" || !/^lh\d+\.googleusercontent\.com$/.test(url.hostname) || url.username || url.password)
            return undefined;
        return url.toString();
    }
    catch {
        return undefined;
    }
}
const LOGIN_DESTINATIONS = ["/grade", "/gwa", "/grading-system"];
export function loginDestination(value: unknown): string {
    return typeof value === "string" && LOGIN_DESTINATIONS.includes(value) ? value : "/grade";
}
export class WorkspaceAccountError extends Error {
    constructor() { super("A CvSU Google Workspace account is required."); this.name = "WorkspaceAccountError"; }
}
export function authConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const secret = process.env.AUTH_SECRET;
    if (!clientId || !clientSecret || !secret || Buffer.byteLength(secret) < 32)
        throw new Error("Google login is not configured.");
    const appUrl = new URL(process.env.APP_URL || "http://localhost:3000");
    const local = ["localhost", "127.0.0.1"].includes(appUrl.hostname);
    if ((!local && appUrl.protocol !== "https:") || (local && !["http:", "https:"].includes(appUrl.protocol)) || appUrl.username || appUrl.password || appUrl.pathname !== "/" || appUrl.search || appUrl.hash)
        throw new Error("APP_URL must be a trusted origin; HTTPS is required outside localhost.");
    if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:")
        throw new Error("Production login requires HTTPS.");
    const domains = (process.env.CVSU_ALLOWED_DOMAINS || "cvsu.edu.ph").split(",").map(d => d.trim().toLowerCase()).filter(Boolean);
    if (!domains.length || domains.some(d => !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(d) || d.includes("..")))
        throw new Error("Invalid allowed Workspace domains.");
    return { clientId, clientSecret, secret, origin: appUrl.origin, domains, secure: appUrl.protocol === "https:", callback: `${appUrl.origin}/api/auth/callback` };
}
export function signValue(value: object, purpose: "session" | "flow"): string {
    const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${payload}.${createHmac("sha256", authConfig().secret).update(`${purpose}.${payload}`).digest("base64url")}`;
}
export function readValue(raw: string | undefined, purpose: "session" | "flow"): Record<string, unknown> | null {
    if (!raw || raw.length > 4096)
        return null;
    try {
        const parts = raw.split(".");
        if (parts.length !== 2)
            return null;
        const expected = createHmac("sha256", authConfig().secret).update(`${purpose}.${parts[0]}`).digest();
        const actual = Buffer.from(parts[1], "base64url");
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
            return null;
        const value: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
        if (!isRecord(value) || typeof value.exp !== "number" || value.exp <= Date.now() / 1000)
            return null;
        return value;
    }
    catch {
        return null;
    }
}
export function readSession(raw: string | undefined): Session | null {
    const session = readValue(raw, "session");
    if (!session || typeof session.sub !== "string" || !session.sub || typeof session.email !== "string" || typeof session.name !== "string" || typeof session.domain !== "string")
        return null;
    const domain = session.email.split("@");
    if (domain.length !== 2 || !domain[0] || domain[1] !== session.domain || !authConfig().domains.includes(session.domain))
        return null;
    return { ...session, picture: googlePicture(session.picture) } as unknown as Session;
}
export function createFlow(destination: unknown = "/grade") {
    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    return { state, nonce, verifier, destination: loginDestination(destination), exp: Math.floor(Date.now() / 1000) + 600 };
}
export function authorizationUrl(flow: ReturnType<typeof createFlow>): string {
    const config = authConfig();
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.callback, response_type: "code", scope: "openid email profile", state: flow.state, nonce: flow.nonce, code_challenge: createHash("sha256").update(flow.verifier).digest("base64url"), code_challenge_method: "S256", prompt: "select_account", hd: config.domains[0] }).toString();
    return url.toString();
}
export async function verifyGoogleToken(token: string, nonce: string): Promise<Session> {
    const config = authConfig();
    if (token.length > 16384)
        throw new Error("Invalid identity token.");
    const parts = token.split(".");
    if (parts.length !== 3)
        throw new Error("Invalid identity token.");
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!isRecord(header) || header.alg !== "RS256" || typeof header.kid !== "string" || !isRecord(claims))
        throw new Error("Invalid identity token.");
    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok)
        throw new Error("Google identity verification unavailable.");
    const jwks: unknown = await response.json();
    if (!isRecord(jwks) || !Array.isArray(jwks.keys))
        throw new Error("Invalid Google signing keys.");
    const key = jwks.keys.find(k => isRecord(k) && k.kid === header.kid && k.kty === "RSA" && k.alg === "RS256" && k.use === "sig");
    if (!key || !verify("RSA-SHA256", Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key, format: "jwk" }), Buffer.from(parts[2], "base64url")))
        throw new Error("Invalid Google signature.");
    const now = Math.floor(Date.now() / 1000);
    if (!["https://accounts.google.com", "accounts.google.com"].includes(String(claims.iss)) || claims.aud !== config.clientId || (claims.azp !== undefined && claims.azp !== config.clientId) || typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp <= now || typeof claims.iat !== "number" || !Number.isFinite(claims.iat) || claims.iat > now + 60 || claims.iat > claims.exp || claims.nonce !== nonce || typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 255 || claims.email_verified !== true || typeof claims.email !== "string" || claims.email.length > 254)
        throw new Error("Invalid Google identity claims.");
    if (typeof claims.hd !== "string")
        throw new WorkspaceAccountError();
    const email = claims.email.toLowerCase();
    const domain = claims.hd.toLowerCase();
    if (!config.domains.includes(domain) || email.split("@").length !== 2 || !email.split("@")[0] || email.split("@")[1] !== domain)
        throw new WorkspaceAccountError();
    return { sub: claims.sub, email, name: typeof claims.name === "string" ? claims.name.slice(0, 100) : "CvSU member", domain, picture: googlePicture(claims.picture), exp: now + SESSION_SECONDS };
}
export function cookieOptions(maxAge: number) {
    return { httpOnly: true, secure: authConfig().secure, sameSite: "lax" as const, path: "/", maxAge };
}
