import Link from "next/link";
import TeamProfiles from "../components/TeamProfiles";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSession, SESSION_COOKIE } from "../lib/auth";
import TRANSMUTATION from "../lib/transmutation.json";
const FEATURED_GRADE_ROW = TRANSMUTATION.find((row) => row.grade === "1.75");
export default function HomePage() {
    if (readSession(cookies().get(SESSION_COOKIE)?.value))
        redirect("/grade");
    return (<>
      
      <section className="hero-wash">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-label mb-4">Cavite State University</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-forest-900 tracking-tight leading-[1.15]">
              Grade & GWA Calculator
            </h1>
            <p className="mt-5 text-lg text-ink-soft max-w-2xl leading-relaxed">
              Convert your raw scores into CvSU grade equivalents (1.00–5.00)
              and compute your General Weighted Average in seconds. Built for students
              and faculty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary">
                Sign in with your CvSU account
              </Link>
              <Link href="#features" className="btn-outline">
                Explore features
              </Link>
            </div>
          </div>
          <aside aria-label="Example CvSU grade conversion" className="card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-forest-900">From percentage to grade</h2>
              <span className="shrink-0 rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-forest-800">Example</span>
            </div>
            <div className="mt-7 grid grid-cols-[max-content_auto_minmax(0,1fr)] items-center gap-4">
              <div className="min-w-0">
                <p className="text-sm text-ink-soft">Percentage range</p>
                <p className="mt-2 whitespace-nowrap text-xl font-extrabold tracking-tight text-forest-900">{FEATURED_GRADE_ROW?.range ?? "—"}%</p>
              </div>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-700">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm text-ink-soft">CvSU grade</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-forest-900">{FEATURED_GRADE_ROW?.grade ?? "—"}</p>
              </div>
            </div>
            <p className="mt-6 border-t border-mint-100 pt-4 text-sm leading-relaxed text-ink-soft">
              A percentage in this range maps to the grade shown.
            </p>
          </aside>
        </div>
      </section>

      
      <section id="features" className="py-16 lg:py-20 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="section-label text-center mb-3">What you can do</p>
          <h2 className="text-3xl font-extrabold text-forest-900 text-center tracking-tight">
            Everything you need for grades
          </h2>

          <div className="feature-cards mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="card p-7 hover:shadow-float transition">
              <div className="icon-chip bg-mint-50 text-forest-800 mb-5">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-forest-900">Grade Calculator</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Enter quizzes, exams, attendance, and lab scores. Get your final
                percentage, CvSU grade, and Pass/Fail remark instantly.
              </p>
              <Link href="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 hover:underline">
                Sign in to calculate →
              </Link>
            </div>

            
            <div className="card p-7 hover:shadow-float transition">
              <div className="icon-chip bg-mint-50 text-forest-800 mb-5">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19V5M4 19h16M8 15l3-4 3 3 4-6"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-forest-900">GWA Calculator</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Add multiple subjects with units and grades. Compute your General
                Weighted Average and see a Latin honors estimate.
              </p>
              <Link href="/login?next=%2Fgwa" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 hover:underline">
                Sign in to compute GWA →
              </Link>
            </div>

            
            <div className="card feature-card-guide p-7 hover:shadow-float transition md:col-span-2 lg:col-span-1">
              <div className="icon-chip bg-mint-50 text-forest-800 mb-5">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6v6l4 2M12 3a9 9 0 100 18 9 9 0 000-18z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-forest-900">Grading System</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Learn how CvSU converts percentages to grades, how GWA is calculated,
                and see sample lecture & laboratory percentage breakdowns.
              </p>
              <Link href="/login?next=%2Fgrading-system" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 hover:underline">
                Sign in to view guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section id="about" className="py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="card p-8 sm:p-10">
            <p className="section-label mb-3">About Us</p>
            <h2 className="text-3xl font-extrabold text-forest-900">Meet the developers</h2>
            <p className="mt-4 text-ink-soft leading-relaxed">The student team behind the CvSU Grade & GWA Calculator. We built this project to help our university community understand subject grades and weighted averages.</p>
            <TeamProfiles />
            <p className="mt-3 text-sm text-ink-soft">Sign in with your CvSU Google account to use the tools. Always confirm your course grading policy and official results with your instructor or the Registrar.</p>
            <Link href="/login" className="btn-primary mt-6">Get started</Link>
          </div>
        </div>
      </section>
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="card bg-mint-50/60 border-mint-100 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="icon-chip bg-white text-forest-800 shadow-sm shrink-0">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-forest-900 text-lg">Tip for students</h3>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed max-w-2xl">
                Percentages and component weights can differ per syllabus. Always check
                your course outline. You can adjust the percentage weights in the
                Grade Calculator to match your subject.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>);
}
