import Link from "next/link";
import TRANSMUTATION from "../../lib/transmutation.json";
const SAMPLE_WEIGHTS = [
    { name: "Midterm Exam", lecture: "20%", lab: "—" },
    { name: "Final Exam", lecture: "20%", lab: "—" },
    { name: "Outputs / Assignments", lecture: "25%", lab: "—" },
    { name: "Quizzes / Long Exams", lecture: "15%", lab: "—" },
    { name: "Class Participation", lecture: "10%", lab: "—" },
    { name: "Attendance", lecture: "10%", lab: "—" },
    { name: "Lab Exercises / Activities / Reports", lecture: "—", lab: "50%" },
    { name: "Practical Exam", lecture: "—", lab: "30%" },
    { name: "Attendance / Class Participation", lecture: "—", lab: "20%" },
];
export default function GradingSystemPage() {
    return (<div className="hero-wash min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 lg:py-14 guide-content">
        
        <div className="mb-10 guide-heading workspace-heading">
          <p className="section-label mb-2">Reference</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight">
            CvSU Grading System
          </h1>
          
        </div>

        
        <section className="card p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-forest-900 mb-1">
            Grade Transmutation Reference
          </h2>
          

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-mint-100 text-left text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <th className="pb-3 pr-4">Percentage</th>
                  <th className="pb-3 pr-4">Grade</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {TRANSMUTATION.map((row) => (<tr key={row.grade} className="border-b border-mint-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-ink">{row.range}</td>
                    <td className="py-3 pr-4 font-bold text-forest-800">{row.grade}</td>
                    <td className="py-3 text-ink-soft">{row.remark || "—"}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </section>

        
        <section className="card p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-forest-900 mb-1">
            How GWA Is Calculated
          </h2>
          

          <div className="bg-mint-50 rounded-xl p-5 mb-5">
            <p className="font-mono text-sm sm:text-base text-forest-900 font-semibold text-center">
              GWA = Σ (grade × units) ÷ total units
            </p>
          </div>

          <p className="text-sm font-bold text-ink mb-2">Example</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mint-100 text-left text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4 text-center">Grade</th>
                  <th className="pb-2 pr-4 text-center">Units</th>
                  <th className="pb-2 text-right">Grade × Units</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-mint-50">
                  <td className="py-2.5 pr-4">IT 101</td>
                  <td className="py-2.5 pr-4 text-center">1.50</td>
                  <td className="py-2.5 pr-4 text-center">3</td>
                  <td className="py-2.5 text-right">4.50</td>
                </tr>
                <tr className="border-b border-mint-50">
                  <td className="py-2.5 pr-4">Math 101</td>
                  <td className="py-2.5 pr-4 text-center">2.00</td>
                  <td className="py-2.5 pr-4 text-center">3</td>
                  <td className="py-2.5 text-right">6.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">PE 1</td>
                  <td className="py-2.5 pr-4 text-center">1.25</td>
                  <td className="py-2.5 pr-4 text-center">2</td>
                  <td className="py-2.5 text-right">2.50</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-ink">
            Total weighted = 4.50 + 6.00 + 2.50 = <strong>13.00</strong>
            <br />
            Total units = 3 + 3 + 2 = <strong>8</strong>
            <br />
            GWA = 13.00 ÷ 8 = <strong className="text-forest-800">1.625</strong> (before rounding)
          </p>
        </section>

        
        <section className="card p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-forest-900 mb-1">
            Sample Component Weights
          </h2>
          

          <table className="w-full text-sm" aria-label="Lecture and laboratory percentage breakdown">
            <colgroup><col style={{ width: "58%" }}/><col style={{ width: "22%" }}/><col style={{ width: "20%" }}/></colgroup>
            <thead><tr className="border-b-2 border-mint-100 text-left text-xs font-bold text-ink-soft"><th scope="col">Component</th><th scope="col" className="text-right">Lecture</th><th scope="col" className="text-right" aria-label="Laboratory">Lab</th></tr></thead>
            <tbody>{SAMPLE_WEIGHTS.map(row => <tr key={row.name} className="border-b border-mint-100"><td className="align-top text-ink">{row.name}</td><td className="whitespace-nowrap text-right align-top font-semibold text-forest-800">{row.lecture}</td><td className="whitespace-nowrap text-right align-top font-semibold text-forest-800">{row.lab}</td></tr>)}</tbody>
            <tfoot><tr className="border-t-2 border-mint-100 font-bold text-forest-900"><th scope="row" className="text-left">Total</th><td className="whitespace-nowrap text-right">100%</td><td className="whitespace-nowrap text-right">100%</td></tr></tfoot>
          </table>

          <p className="mt-5 text-sm text-ink-soft">
            When a subject has both Lecture and Laboratory, the final grade is a
            weighted combination based on credit units (e.g. 40% Lec / 60% Lab, 50/50,
            etc.). The Grade Calculator lets you set this ratio.
          </p>
        </section>

        
        <div className="flex flex-wrap gap-3 guide-actions">
          <Link href="/grade" className="btn-primary">
            Open Grade Calculator
          </Link>
          <Link href="/gwa" className="btn-outline">
            Open GWA Calculator
          </Link>
        </div>
      </div>
    </div>);
}
