import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, loginDestination, readSession, SESSION_COOKIE } from "../../lib/auth";
import GoogleSignInButton from "../../components/GoogleSignInButton";
export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams: pendingParams }: {
    searchParams: Promise<{
        error?: string;
        next?: string;
    }>;
}) {
    const searchParams = await pendingParams;
    const destination = loginDestination(searchParams.next);
    if (readSession((await cookies()).get(SESSION_COOKIE)?.value))
        redirect(destination);
    const errors: Record<string, string> = {
        signin: "Sign-in could not be completed or has expired. Please try again.",
        account: "Please use your CvSU Google Workspace account. Personal Google accounts cannot access these tools.",
        cancelled: "Sign-in was cancelled. You can try again whenever you’re ready.",
    };
    const errorMessage = typeof searchParams.error === "string" && Object.hasOwn(errors, searchParams.error) ? errors[searchParams.error] : errors.signin;
    let configured = true;
    try {
        authConfig();
    }
    catch {
        configured = false;
    }
    return (<div className="hero-wash min-h-[70vh] px-4 py-16">
      <div className="card mx-auto max-w-md p-8 sm:p-10">
        <p className="section-label mb-3">Welcome, CvSU</p>
        <h1 className="text-3xl font-extrabold text-forest-900">Sign in to calculate</h1>
        
        {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
        <GoogleSignInButton configured={configured} destination={destination}/>
        {!configured && <div role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Google sign-in is being configured. Please check back shortly.</div>}
        <p className="mt-5 text-xs text-ink-soft">CvSU accounts only. No separate registration or password needed.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-forest-800 hover:underline">← Back to home</Link>
      </div>
    </div>);
}
