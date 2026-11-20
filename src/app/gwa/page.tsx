"use client";
import { useState, useEffect, useRef } from "react";
import { isSavedSubjects, isSubject, MAX_SUBJECTS } from "../../lib/validation";
import { SubjectActions, SubjectEditor } from "../../components/SubjectActions";
import MobileGWAView from "../../components/MobileGWAView";
interface Subject {
    name: string;
    units: number;
    grade: number;
}
function formatGrade(g: number) {
    return g.toFixed(2);
}
const STORAGE_KEY = "cvsu-local-demo-gwa-subjects";
export default function GWACalculatorPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [name, setName] = useState("");
    const [units, setUnits] = useState(3);
    const [grade, setGrade] = useState(1.75);
    const [loaded, setLoaded] = useState(false);
    const [storageError, setStorageError] = useState("");
    const [canSave, setCanSave] = useState(false);
    const [formError, setFormError] = useState("");
    const [notice, setNotice] = useState("");
    const [compact, setCompact] = useState(false);
    const [mobileAddOpen, setMobileAddOpen] = useState(false);
    const [editing, setEditing] = useState<{
        index: number;
        subject: Subject;
    } | null>(null);
    const subjectList = useRef<HTMLDivElement>(null);
    const subjectScrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [subjectScrollIdle, setSubjectScrollIdle] = useState(true);
    const [listOverflows, setListOverflows] = useState(false);
    useEffect(() => () => {
        if (subjectScrollIdleTimer.current)
            clearTimeout(subjectScrollIdleTimer.current);
    }, []);
    function handleSubjectListScroll() {
        setSubjectScrollIdle(false);
        if (subjectScrollIdleTimer.current)
            clearTimeout(subjectScrollIdleTimer.current);
        subjectScrollIdleTimer.current = setTimeout(() => setSubjectScrollIdle(true), 2600);
    }
    useEffect(() => {
        const media = window.matchMedia("(max-width: 899px), (max-width: 1279px) and (max-height: 819px), (max-height: 699px)");
        const update = () => { setCompact(media.matches); if (!media.matches)
            setMobileAddOpen(false); };
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    useEffect(() => {
        const list = subjectList.current;
        if (!list) {
            setListOverflows(false);
            return;
        }
        const measure = () => setListOverflows(list.scrollHeight > list.clientHeight + 1);
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        if (list.firstElementChild)
            observer.observe(list.firstElementChild);
        measure();
        return () => observer.disconnect();
    }, [subjects, compact]);
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed: unknown = JSON.parse(saved);
                if (!isSavedSubjects(parsed))
                    throw new Error("Invalid saved subjects");
                setSubjects(parsed);
            }
            setCanSave(true);
        }
        catch {
            setStorageError("Saved subjects could not be loaded. Existing saved data has been preserved and automatic saving is paused. Export or repair this browser's saved data before continuing.");
        }
        setLoaded(true);
    }, []);
    useEffect(() => {
        if (!loaded || !canSave)
            return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
        }
        catch {
            setCanSave(false);
            setStorageError("Your browser could not save these subjects. Automatic saving is paused. Keep a separate copy before closing this page.");
        }
    }, [subjects, loaded, canSave]);
    const [gwa, setGwa] = useState(0);
    const [honors, setHonors] = useState("");
    const [cppError, setCppError] = useState("");
    const [pending, setPending] = useState(false);
    const [retry, setRetry] = useState(0);
    const [authExpired, setAuthExpired] = useState(false);
    useEffect(() => {
        if (subjects.length === 0) {
            setGwa(0);
            setHonors("");
            setCppError("");
            setPending(false);
            return;
        }
        let cancelled = false;
        const controller = new AbortController();
        setPending(true);
        async function callCpp() {
            setCppError("");
            setAuthExpired(false);
            try {
                const res = await fetch("/api/gwa", {
                    signal: controller.signal,
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subjects: subjects.map((s) => ({ grade: s.grade, units: s.units })),
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    if (!cancelled) {
                        setAuthExpired(res.status === 401);
                        setCppError(res.status === 401 ? "Your session has expired. Please sign in again." : data.error || "Could not calculate right now. Please try again.");
                    }
                    return;
                }
                if (!cancelled) {
                    setGwa(Number(data.gwa));
                    setHonors(String(data.honors));
                }
            }
            catch (e) {
                if (!cancelled) {
                    setCppError("Could not calculate right now. Check your connection and try again.");
                }
            }
            finally {
                if (!cancelled)
                    setPending(false);
            }
        }
        callCpp();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [subjects, retry]);
    function addSubject() {
        setNotice("");
        if (!name.trim()) {
            setFormError("Enter a subject name first.");
            return;
        }
        if (!isSubject({ grade, units })) {
            setFormError("Choose a valid grade and enter units greater than zero.");
            return;
        }
        if (subjects.length >= MAX_SUBJECTS) {
            setFormError(`You can save up to ${MAX_SUBJECTS} subjects.`);
            return;
        }
        setFormError("");
        setNotice("Subject added.");
        setSubjects([
            ...subjects,
            {
                name: name.trim(),
                units: Number(units),
                grade: Number(grade),
            },
        ]);
        setName("");
        setUnits(3);
        setGrade(1.75);
        setMobileAddOpen(false);
    }
    function removeSubject(index: number) {
        setNotice("Subject removed.");
        setSubjects(current => current.filter((_, i) => i !== index));
    }
    function clearAll() {
        if (window.confirm("Clear all saved subjects from this browser?")) {
            setSubjects([]);
            setNotice("");
        }
    }
    const subjectForm = (<div className="card p-6 mb-6 gwa-form">
          <h2 className="text-lg font-bold text-forest-900 mb-4">Add a Subject</h2>
          {formError && <p role="alert" className="mb-3 text-sm text-red-700">{formError}</p>}
          {notice && <p role="status" className="mb-3 text-sm text-forest-800">{notice}</p>}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label htmlFor="subject-name" className="block text-sm font-medium text-ink mb-1.5">
                Subject name
              </label>
              <input id="subject-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="DCIT 26 - Application Development and Emerging Technologies" onKeyDown={(e) => e.key === "Enter" && addSubject()}/>
            </div>
            <div>
              <label htmlFor="subject-units" className="block text-sm font-medium text-ink mb-1.5">
                Units
              </label>
              <input id="subject-units" type="text" inputMode="numeric" value={units === 0 ? "" : String(units)} onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
                setUnits(0);
                return;
            }
            if (/^\d*$/.test(v)) {
                const n = parseInt(v, 10);
                if (!isNaN(n))
                    setUnits(n);
            }
        }} onBlur={() => {
            if (units < 1)
                setUnits(1);
            if (units > 6)
                setUnits(6);
        }} className="input-field" placeholder="3"/>
            </div>
            <div>
              <label htmlFor="subject-grade" className="block text-sm font-medium text-ink mb-1.5">
                Final Grade
              </label>
              <select id="subject-grade" value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="select-field">
                <option value={1.0}>1.00</option>
                <option value={1.25}>1.25</option>
                <option value={1.5}>1.50</option>
                <option value={1.75}>1.75</option>
                <option value={2.0}>2.00</option>
                <option value={2.25}>2.25</option>
                <option value={2.5}>2.50</option>
                <option value={2.75}>2.75</option>
                <option value={3.0}>3.00</option>
                <option value={4.0}>4.00</option>
                <option value={5.0}>5.00</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={addSubject} className="btn-primary w-full">
                Add subject
              </button>
            </div>
          </div>
        </div>);
    const subjectsCard = (<div className="card p-6 mb-6 gwa-subjects">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-forest-900">
              Your Subjects ({subjects.length})
            </h2>
            {subjects.length > 0 && (<button type="button" onClick={clearAll} className="text-sm font-semibold text-red-600 hover:underline">
                Clear all
              </button>)}
          </div>

          {subjects.length === 0 ? (<p className="text-sm text-ink-soft py-6 text-center">
              No subjects yet. Add one above to start computing your GWA.
            </p>) : (<div ref={subjectList} className={`subject-list${subjects.length > 3 ? ` subject-list-scroll${subjectScrollIdle ? " subject-list-idle" : ""}` : ""}`} onScroll={subjects.length > 3 ? handleSubjectListScroll : undefined} role="region" aria-label="Saved subjects" tabIndex={0}>
              <table className="w-full text-sm">
                <colgroup><col style={{ width: "40%" }}/><col style={{ width: "18%" }}/><col style={{ width: "20%" }}/><col style={{ width: "22%" }}/></colgroup>
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-mint-100 text-left text-xs font-bold uppercase tracking-wider text-ink-soft">
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4 text-center">Units</th>
                    <th className="pb-3 pr-4 text-center">Grade</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (<tr key={i} className="border-b border-mint-50 last:border-0">
                      <td className="py-3.5 pr-4 font-medium text-ink"><span className="line-clamp-2 break-words" title={s.name}>{s.name}</span></td>
                      <td className="py-3.5 pr-4 text-center text-ink-soft">{s.units}</td>
                      <td className="py-3.5 pr-4 text-center font-semibold text-forest-800">
                        {formatGrade(s.grade)}
                      </td>
                      <td className="py-3.5 text-right">
                        <SubjectActions name={s.name} onEdit={() => setEditing({ index: i, subject: s })} onRemove={() => removeSubject(i)}/>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
          <p className="subject-scroll-hint text-xs text-ink-soft" aria-hidden={!listOverflows}>{listOverflows ? "Scroll to view more subjects." : ""}</p>
        </div>);
    const resultCard = (<div className="card p-7 sm:p-8 border-2 border-mint-100 gwa-result">
          <h2 className="font-bold text-forest-900 mb-4">GWA Result</h2>
          {cppError && (<div className="mb-4 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
              {cppError}
              {authExpired ? <a href="/login?next=%2Fgwa" className="mt-2 inline-block font-semibold underline">Sign in again</a> : <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-2 font-semibold underline">Try again</button>}
            </div>)}

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div>
              <p className="text-sm text-ink-soft">General Weighted Average</p>
              <p className="text-3xl font-extrabold text-forest-900 mt-1 tracking-tight">
                {subjects.length === 0 || pending || cppError ? "—" : formatGrade(gwa)}
              </p>
            </div>
            {subjects.length > 0 && !pending && !cppError && (<div>
                <p className="text-sm text-ink-soft">Latin Honors Estimate</p>
                <p className={`mt-1.5 inline-block px-4 py-1.5 rounded-full text-sm font-bold ${honors === "No Latin Honors"
                ? "bg-gray-100 text-gray-600"
                : "bg-mint-50 text-forest-800"}`}>
                  {honors}
                </p>
              </div>)}
          </div>

          {subjects.length > 0 && (<div className="mt-5 pt-5 border-t border-mint-100 text-sm text-ink-soft">
              <p>
                Formula: GWA = Σ (grade × units) ÷ total units
              </p>
              <p className="mt-1">
                Total units:{" "}
                <span className="font-semibold text-ink">
                  {subjects.reduce((sum, s) => sum + s.units, 0)}
                </span>
              </p>
            </div>)}
        </div>);
    const honorsCard = (<div className="mt-6 card p-5 gwa-honors">
          <h2 className="font-bold text-forest-900 mb-3">Latin Honors Guide</h2>
          <ul className="text-sm text-ink-soft space-y-1.5">
            <li>
              <span className="font-semibold text-forest-800">Summa Cum Laude</span> — GWA ≤ 1.20
            </li>
            <li>
              <span className="font-semibold text-forest-800">Magna Cum Laude</span> — GWA ≤ 1.45
            </li>
            <li>
              <span className="font-semibold text-forest-800">Cum Laude</span> — GWA ≤ 1.75
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink-soft">
            Note: Official Latin honors also require no grade lower than 2.50 (or similar)
            and a minimum number of units. Always verify with the Registrar.
          </p>
        </div>);
    const editor = editing && <SubjectEditor subject={editing.subject} onCancel={() => setEditing(null)} onSave={updated => {
            setSubjects(current => current.map((subject, index) => index === editing.index ? updated : subject));
            setNotice("Subject updated.");
            setEditing(null);
        }}/>;
    if (compact)
        return <><MobileGWAView result={subjects.length === 0 || pending || cppError ? "—" : formatGrade(gwa)} honors={subjects.length && !cppError ? honors : ""} pending={pending} error={cppError} expired={authExpired} storageError={storageError} onRetry={() => setRetry(value => value + 1)} addOpen={mobileAddOpen} onAdd={() => setMobileAddOpen(true)} onCloseAdd={() => setMobileAddOpen(false)} subjectForm={subjectForm} subjectsCard={subjectsCard} honorsCard={honorsCard}/>{editor}</>;
    return (<div className="hero-wash min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14 gwa-content">
        
        <div className="mb-8 gwa-heading workspace-heading">
          <p className="section-label mb-2">Multiple Subjects</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight">
            GWA Calculator
          </h1>
          
        </div>

        
        {storageError && <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 gwa-storage">{storageError}</p>}
        {subjectForm}

        
        {subjectsCard}

        
        {resultCard}

        
        {honorsCard}
        {editor}
      </div>
    </div>);
}
