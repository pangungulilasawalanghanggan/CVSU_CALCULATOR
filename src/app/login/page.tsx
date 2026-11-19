import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, loginDestination, readSession, SESSION_COOKIE } from "../../lib/auth";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import Image from "next/image";
import styles from "./login.module.css";
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
    return (
      <div className={`${styles.page} hero-wash login-page`}>
        <div className={styles.frame}>
          <div className={styles.toolbar}>
            <Link href="/" className={styles.backHome}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 6 6m-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>Back to home</span>
            </Link>
          </div>
          <section className={`card ${styles.card}`} aria-labelledby="login-title">
            <div className={styles.content}>
              <Image src="/brand-wordmark.png" alt="GradeOverview" width={810} height={230} className={styles.wordmark} />
              <p className="section-label mt-6 mb-2">Welcome, CvSU</p>
              <h1 id="login-title" className="text-3xl font-extrabold text-forest-900">Sign in to calculate</h1>
              <p className="mt-2 text-sm text-ink-soft">Use your CvSU Google Workspace account to continue.</p>
              {searchParams.error && <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>}
              <GoogleSignInButton configured={configured} destination={destination}/>
              {!configured && <div role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Google sign-in is being configured. Please check back shortly.</div>}
              <p className="mt-5 text-sm text-ink-soft">CvSU accounts only. No separate registration or password needed.</p>
            </div>
          </section>
        </div>
      </div>
    );
}
