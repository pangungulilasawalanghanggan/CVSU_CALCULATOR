import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoEnabled, loginDestination, readSession, SESSION_COOKIE } from "../../lib/auth";
import DemoSignInButton from "../../components/DemoSignInButton";
import Image from "next/image";
import styles from "./login.module.css";
export const dynamic = "force-dynamic";
export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
    const destination = loginDestination(searchParams.next);
    if (readSession(cookies().get(SESSION_COOKIE)?.value)) redirect(destination);
    const configured = demoEnabled();
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
              <p className="section-label mt-6 mb-2">Localhost study demo</p>
              <h1 id="login-title" className="text-3xl font-extrabold text-forest-900">Try the calculators</h1>
              <p className="mt-2 text-sm text-ink-soft">Continue with the sample CvSU student profile.</p>
              <DemoSignInButton configured={configured} destination={destination}/>
              <p className="mt-5 text-sm text-ink-soft">Simulated sign-in only. No Google account, password, registration, or OAuth setup is needed. Demo Student and demo@cvsu.edu.ph are sample details.</p>
              {!configured && <p role="alert" className="mt-4 text-sm text-red-700">This demo is disabled in production. Run npm run dev on localhost.</p>}
            </div>
          </section>
        </div>
      </div>
    );
}
