"use client";
import { useState, useMemo, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
const LECTURE_DEFAULTS = {
    midterm: 20,
    finalExam: 20,
    outputs: 25,
    quizzes: 15,
    participation: 10,
    attendance: 10,
};
const LAB_DEFAULTS = {
    exercises: 50,
    practical: 30,
    labAttendance: 20,
};
type SubjectType = "lecture" | "laboratory" | "both";
interface ScoredItem {
    id: number;
    score: number;
    outOf: number;
}
let nextId = 1;
function makeItem(): ScoredItem {
    return { id: nextId++, score: 0, outOf: 100 };
}
function avgFromItems(items: ScoredItem[]): number {
    if (items.length === 0)
        return 0;
    let totalScore = 0;
    let totalOutOf = 0;
    for (let i = 0; i < items.length; i++) {
        totalScore += items[i].score;
        totalOutOf += items[i].outOf;
    }
    if (totalOutOf === 0)
        return 0;
    return Math.round((totalScore / totalOutOf) * 10000) / 100;
}
function pct(score: number, outOf: number): number {
    if (outOf === 0)
        return 0;
    return Math.round((score / outOf) * 10000) / 100;
}
function NumberInput({ value, onChange, className = "input-field text-center", placeholder = "", min, max, ariaLabel, }: {
    value: number;
    onChange: (n: number) => void;
    className?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    ariaLabel?: string;
}) {
    const [text, setText] = useState(() => String(value));
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (!focused) {
            setText(String(value));
        }
    }, [value, focused]);
    return (<input type="text" inputMode="decimal" className={className} placeholder={placeholder} aria-label={ariaLabel} value={text} onFocus={(e) => {
            setFocused(true);
            e.target.select();
        }} onChange={(e) => {
            const t = e.target.value;
            if (t !== "" && !/^\d*\.?\d*$/.test(t))
                return;
            if (t === "" || t === ".") {
                setText(t);
                return;
            }
            const normalized = t.replace(/^0+(?=\d|\.)/, "").replace(/^\./, "0.");
            let n = parseFloat(normalized);
            if (!Number.isFinite(n))
                return;
            if (min !== undefined && n < min)
                n = min;
            if (max !== undefined && n > max) {
                n = max;
                setText(String(max));
            }
            else {
                setText(normalized);
            }
            onChange(n);
        }} onBlur={() => {
            setFocused(false);
            let n = parseFloat(text);
            if (text === "" || !Number.isFinite(n)) {
                n = min !== undefined ? min : 0;
            }
            if (min !== undefined && n < min)
                n = min;
            if (max !== undefined && n > max)
                n = max;
            setText(String(n));
            onChange(n);
        }}/>);
}
function SingleScoreRow({ label, score, setScore, outOf, setOutOf, weight, setWeight, maxWeight, }: {
    label: string;
    score: number;
    setScore: (v: number) => void;
    outOf: number;
    setOutOf: (v: number) => void;
    weight: number;
    setWeight: (v: number) => void;
    maxWeight: number;
}) {
    const percent = pct(score, outOf);
    function handleScore(n: number) {
        if (n > outOf)
            n = outOf;
        if (n < 0)
            n = 0;
        setScore(n);
    }
    function handleOutOf(n: number) {
        if (n < 1)
            n = 1;
        if (n > 250)
            n = 250;
        setOutOf(n);
        if (score > n)
            setScore(n);
    }
    function handleWeight(n: number) {
        if (n < 0)
            n = 0;
        if (n > maxWeight)
            n = maxWeight;
        setWeight(n);
    }
    return (<div className="grid grid-cols-12 gap-2 sm:gap-3 items-center py-2 border-b border-mint-50 last:border-0">
      <div className="col-span-12 sm:col-span-3 text-sm font-medium text-ink">
        {label}
      </div>
      <div className="col-span-4 sm:col-span-2">
        <span className="mb-1 block text-xs text-ink-soft sm:hidden">Score</span>
        <NumberInput value={score} onChange={handleScore} min={0} max={outOf} placeholder="Score" ariaLabel={`${label} score`}/>
      </div>
      <div className="col-span-1 flex justify-center text-ink-soft text-sm">/</div>
      <div className="col-span-3 sm:col-span-2">
        <span className="mb-1 block text-xs text-ink-soft sm:hidden">Out of</span>
        <NumberInput value={outOf} onChange={handleOutOf} min={1} max={250} placeholder="Out of" ariaLabel={`${label} maximum score`}/>
      </div>
      <div className="col-span-4 sm:col-span-2 flex items-center gap-1">
        <div className="min-w-0 flex-1"><span className="mb-1 block text-xs text-ink-soft sm:hidden">Weight</span><NumberInput value={weight} onChange={handleWeight} min={0} max={maxWeight} ariaLabel={`${label} weight percentage`}/></div>
        <span className="text-xs text-ink-soft">%</span>
      </div>
      <div className="col-span-12 sm:col-span-2 text-right text-sm font-semibold text-forest-700">
        {percent.toFixed(1)}%
      </div>
    </div>);
}
function MultiItemSection({ title, itemLabel, items, setItems, weight, setWeight, avgPct, maxWeight, }: {
    title: string;
    itemLabel: string;
    items: ScoredItem[];
    setItems: Dispatch<SetStateAction<ScoredItem[]>>;
    weight: number;
    setWeight: (v: number) => void;
    avgPct: number;
    maxWeight: number;
}) {
    const [scrollIdle, setScrollIdle] = useState(true);
    const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasScrollableList = (title === "Outputs / Assignments" || title === "Quizzes / Long Exams") && items.length > 2;
    useEffect(() => () => {
        if (scrollIdleTimer.current)
            clearTimeout(scrollIdleTimer.current);
    }, []);
    function handleItemsScroll() {
        setScrollIdle(false);
        if (scrollIdleTimer.current)
            clearTimeout(scrollIdleTimer.current);
        scrollIdleTimer.current = setTimeout(() => setScrollIdle(true), 2600);
    }
    function updateItem(id: number, field: "score" | "outOf", value: number) {
        setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
    }
    function addItem() {
        setItems([...items, makeItem()]);
    }
    function removeItem(id: number) {
        if (items.length <= 1)
            return;
        setItems(items.filter((item) => item.id !== id));
    }
    return (<div className="border border-mint-100 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-forest-900">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-soft">Weight</span>
            <NumberInput value={weight} onChange={(n) => {
            if (n < 0)
                n = 0;
            if (n > maxWeight)
                n = maxWeight;
            setWeight(n);
        }} min={0} max={maxWeight} ariaLabel={`${title} weight percentage`} className="input-field w-16 text-center py-1.5 text-sm"/>
            <span className="text-xs text-ink-soft">%</span>
          </div>
          <span className="text-sm font-semibold text-forest-700 bg-mint-50 px-2.5 py-1 rounded-full">
            Avg {avgPct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft px-1">
        <div className="col-span-3">Item</div>
        <div className="col-span-3 text-center">Score</div>
        <div className="col-span-1"></div>
        <div className="col-span-3 text-center">Out of</div>
        <div className="col-span-2 text-right">%</div>
      </div>

      <div className={`grade-multi-items ${hasScrollableList ? `grade-multi-items-scroll${scrollIdle ? " grade-multi-items-idle" : ""}` : ""}`} onScroll={hasScrollableList ? handleItemsScroll : undefined} role={hasScrollableList ? "region" : undefined} aria-label={hasScrollableList ? `${title} items` : undefined} tabIndex={hasScrollableList ? 0 : undefined}>
      {items.map((item, index) => {
            const itemPct = pct(item.score, item.outOf);
            return (<div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-mint-50/40 rounded-lg px-2 py-2">
            <div className="col-span-12 sm:col-span-3 text-sm font-medium text-ink">
              {itemLabel} {index + 1}
            </div>
            <div className="col-span-4 sm:col-span-3">
              <NumberInput value={item.score} onChange={(n) => {
                    if (n > item.outOf)
                        n = item.outOf;
                    if (n < 0)
                        n = 0;
                    updateItem(item.id, "score", n);
                }} min={0} max={item.outOf} className="input-field text-center py-2" placeholder="Score" ariaLabel={`${itemLabel} ${index + 1} score`}/>
            </div>
            <div className="col-span-1 flex justify-center text-ink-soft">/</div>
            <div className="col-span-4 sm:col-span-3">
              <NumberInput value={item.outOf} onChange={(n) => {
                    if (n < 1)
                        n = 1;
                    if (n > 250)
                        n = 250;
                    updateItem(item.id, "outOf", n);
                    if (item.score > n)
                        updateItem(item.id, "score", n);
                }} min={1} max={250} className="input-field text-center py-2" placeholder="Out of" ariaLabel={`${itemLabel} ${index + 1} maximum score`}/>
            </div>
            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
              <span className="text-sm font-semibold text-forest-700">
                {itemPct.toFixed(1)}%
              </span>
              {items.length > 1 && (<button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-bold p-1" title="Remove">
                  ✕
                </button>)}
            </div>
          </div>);
        })}
      </div>

      <button type="button" onClick={addItem} className="btn-secondary btn-sm text-xs w-full sm:w-auto">
        + Add another
      </button>
    </div>);
}
export default function GradeCalculatorPage() {
    const [subjectType, setSubjectType] = useState<SubjectType>("lecture");
    const [lecMidterm, setLecMidterm] = useState(0);
    const [lecMidtermOut, setLecMidtermOut] = useState(100);
    const [lecFinal, setLecFinal] = useState(0);
    const [lecFinalOut, setLecFinalOut] = useState(100);
    const [lecPart, setLecPart] = useState(0);
    const [lecPartOut, setLecPartOut] = useState(100);
    const [lecAtt, setLecAtt] = useState(0);
    const [lecAttOut, setLecAttOut] = useState(100);
    const [outputs, setOutputs] = useState<ScoredItem[]>(() => [makeItem()]);
    const [quizzes, setQuizzes] = useState<ScoredItem[]>(() => [makeItem()]);
    const [wMidterm, setWMidterm] = useState(LECTURE_DEFAULTS.midterm);
    const [wFinal, setWFinal] = useState(LECTURE_DEFAULTS.finalExam);
    const [wOutputs, setWOutputs] = useState(LECTURE_DEFAULTS.outputs);
    const [wQuizzes, setWQuizzes] = useState(LECTURE_DEFAULTS.quizzes);
    const [wPart, setWPart] = useState(LECTURE_DEFAULTS.participation);
    const [wAtt, setWAtt] = useState(LECTURE_DEFAULTS.attendance);
    const [labExercises, setLabExercises] = useState<ScoredItem[]>(() => [makeItem()]);
    const [labPractical, setLabPractical] = useState(0);
    const [labPracticalOut, setLabPracticalOut] = useState(100);
    const [labAtt, setLabAtt] = useState(0);
    const [labAttOut, setLabAttOut] = useState(100);
    const [wExercises, setWExercises] = useState(LAB_DEFAULTS.exercises);
    const [wPractical, setWPractical] = useState(LAB_DEFAULTS.practical);
    const [wLabAtt, setWLabAtt] = useState(LAB_DEFAULTS.labAttendance);
    const [lecShare, setLecShare] = useState(40);
    const labShare = 100 - lecShare;
    const lecWeightTotal = wMidterm + wFinal + wOutputs + wQuizzes + wPart + wAtt;
    const labWeightTotal = wExercises + wPractical + wLabAtt;
    const outputsPct = useMemo(() => avgFromItems(outputs), [outputs]);
    const quizzesPct = useMemo(() => avgFromItems(quizzes), [quizzes]);
    const labExercisesPct = useMemo(() => avgFromItems(labExercises), [labExercises]);
    const midtermPct = pct(lecMidterm, lecMidtermOut);
    const finalPct = pct(lecFinal, lecFinalOut);
    const partPct = pct(lecPart, lecPartOut);
    const attPct = pct(lecAtt, lecAttOut);
    const practicalPct = pct(labPractical, labPracticalOut);
    const labAttPct = pct(labAtt, labAttOut);
    const lecturePercent = useMemo(() => {
        const totalWeight = wMidterm + wFinal + wOutputs + wQuizzes + wPart + wAtt;
        if (totalWeight === 0)
            return 0;
        const weighted = (midtermPct * wMidterm +
            finalPct * wFinal +
            outputsPct * wOutputs +
            quizzesPct * wQuizzes +
            partPct * wPart +
            attPct * wAtt) /
            totalWeight;
        return Math.round(weighted * 100) / 100;
    }, [
        midtermPct, finalPct, outputsPct, quizzesPct, partPct, attPct,
        wMidterm, wFinal, wOutputs, wQuizzes, wPart, wAtt,
    ]);
    const labPercent = useMemo(() => {
        const totalWeight = wExercises + wPractical + wLabAtt;
        if (totalWeight === 0)
            return 0;
        const weighted = (labExercisesPct * wExercises +
            practicalPct * wPractical +
            labAttPct * wLabAtt) /
            totalWeight;
        return Math.round(weighted * 100) / 100;
    }, [labExercisesPct, practicalPct, labAttPct, wExercises, wPractical, wLabAtt]);
    const finalPercent = useMemo(() => {
        if (subjectType === "lecture")
            return lecturePercent;
        if (subjectType === "laboratory")
            return labPercent;
        return (Math.round(((lecturePercent * lecShare + labPercent * labShare) / 100) * 100) / 100);
    }, [subjectType, lecturePercent, labPercent, lecShare, labShare]);
    const [grade, setGrade] = useState(5.0);
    const [remark, setRemark] = useState("Failed");
    const [cppError, setCppError] = useState("");
    const [pending, setPending] = useState(true);
    const [retry, setRetry] = useState(0);
    const [authExpired, setAuthExpired] = useState(false);
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        setPending(true);
        const timer = setTimeout(async () => {
            setCppError("");
            setAuthExpired(false);
            try {
                const res = await fetch("/api/grade", {
                    signal: controller.signal,
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ percentage: finalPercent }),
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
                    setGrade(Number(data.grade));
                    setRemark(String(data.remark));
                }
            }
            catch {
                if (!cancelled) {
                    setCppError("Could not calculate right now. Check your connection and try again.");
                }
            }
            finally {
                if (!cancelled)
                    setPending(false);
            }
        }, 300);
        return () => {
            cancelled = true;
            controller.abort();
            clearTimeout(timer);
        };
    }, [finalPercent, retry]);
    const remarkColor = pending || cppError ? "text-gray-700 bg-gray-100" : remark === "Passed"
        ? "text-forest-800 bg-mint-50"
        : remark === "Conditional"
            ? "text-amber-700 bg-amber-50"
            : "text-red-700 bg-red-50";
    function resetAll() {
        setLecMidterm(0);
        setLecMidtermOut(100);
        setLecFinal(0);
        setLecFinalOut(100);
        setLecPart(0);
        setLecPartOut(100);
        setLecAtt(0);
        setLecAttOut(100);
        setOutputs([makeItem()]);
        setQuizzes([makeItem()]);
        setLabExercises([makeItem()]);
        setLabPractical(0);
        setLabPracticalOut(100);
        setLabAtt(0);
        setLabAttOut(100);
        setWMidterm(LECTURE_DEFAULTS.midterm);
        setWFinal(LECTURE_DEFAULTS.finalExam);
        setWOutputs(LECTURE_DEFAULTS.outputs);
        setWQuizzes(LECTURE_DEFAULTS.quizzes);
        setWPart(LECTURE_DEFAULTS.participation);
        setWAtt(LECTURE_DEFAULTS.attendance);
        setWExercises(LAB_DEFAULTS.exercises);
        setWPractical(LAB_DEFAULTS.practical);
        setWLabAtt(LAB_DEFAULTS.labAttendance);
        setLecShare(40);
    }
    return (<div className="hero-wash min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 lg:py-14 grade-content">
        <div className="mb-8 grade-heading workspace-heading">
          <p className="section-label mb-2">Single Subject</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight">
            Grade Calculator
          </h1>
          
        </div>

        
        <div className="card p-6 mb-6 grade-setup">
          <h2 className="font-bold text-forest-900 mb-3">Subject Type</h2>
          <div className="flex flex-wrap gap-2">
            {([
            { id: "lecture" as const, label: "Lecture only" },
            { id: "laboratory" as const, label: "Laboratory only" },
            { id: "both" as const, label: "Lecture + Laboratory" },
        ]).map((opt) => (<button key={opt.id} type="button" onClick={() => setSubjectType(opt.id)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${subjectType === opt.id
                ? "bg-forest-800 text-white shadow-sm"
                : "bg-white border border-mint-200 text-forest-800 hover:bg-mint-50"}`}>
                {opt.label}
              </button>))}
          </div>

          {subjectType === "both" && (<div className="mt-5 pt-5 border-t border-mint-100">
              <p className="text-sm font-medium text-ink mb-2">
                How much does Lecture contribute to the final grade?
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input type="range" min={20} max={80} step={5} value={lecShare} onChange={(e) => setLecShare(Number(e.target.value))} className="w-48 accent-forest-800"/>
                <span className="text-sm font-semibold text-forest-800">
                  Lecture {lecShare}% · Lab {labShare}%
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Common cases: 40/60, 60/40, 50/50, 30/70 (check your syllabus credit units)
              </p>
            </div>)}
        </div>

        
        {(subjectType === "lecture" || subjectType === "both") && (<div className="card p-6 mb-6 space-y-6 lecture-components">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-forest-900">Lecture Components</h2>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${lecWeightTotal === 100
                ? "text-green-800 bg-green-50"
                : lecWeightTotal === 0
                    ? "text-red-800 bg-red-50"
                    : "text-amber-800 bg-amber-50"}`}>
                  Weights: {lecWeightTotal}%
                  {lecWeightTotal !== 100 ? " (must be 100%)" : ""}
                </span>
                <span className="text-sm font-semibold text-forest-700 bg-mint-50 px-3 py-1 rounded-full">
                  {lecturePercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft mb-1 px-1">
                <div className="col-span-3">Component</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-1"></div>
                <div className="col-span-2 text-center">Out of</div>
                <div className="col-span-2 text-center">Weight %</div>
                <div className="col-span-2 text-right">%</div>
              </div>
              <SingleScoreRow label="Midterm Exam" score={lecMidterm} setScore={setLecMidterm} outOf={lecMidtermOut} setOutOf={setLecMidtermOut} weight={wMidterm} setWeight={setWMidterm} maxWeight={100 - (wFinal + wOutputs + wQuizzes + wPart + wAtt)}/>
              <SingleScoreRow label="Final Exam" score={lecFinal} setScore={setLecFinal} outOf={lecFinalOut} setOutOf={setLecFinalOut} weight={wFinal} setWeight={setWFinal} maxWeight={100 - (wMidterm + wOutputs + wQuizzes + wPart + wAtt)}/>
              <SingleScoreRow label="Class Participation" score={lecPart} setScore={setLecPart} outOf={lecPartOut} setOutOf={setLecPartOut} weight={wPart} setWeight={setWPart} maxWeight={100 - (wMidterm + wFinal + wOutputs + wQuizzes + wAtt)}/>
              <SingleScoreRow label="Attendance" score={lecAtt} setScore={setLecAtt} outOf={lecAttOut} setOutOf={setLecAttOut} weight={wAtt} setWeight={setWAtt} maxWeight={100 - (wMidterm + wFinal + wOutputs + wQuizzes + wPart)}/>
            </div>

            <MultiItemSection title="Outputs / Assignments" itemLabel="Output" items={outputs} setItems={setOutputs} weight={wOutputs} setWeight={setWOutputs} avgPct={outputsPct} maxWeight={100 - (wMidterm + wFinal + wQuizzes + wPart + wAtt)}/>

            <MultiItemSection title="Quizzes / Long Exams" itemLabel="Quiz" items={quizzes} setItems={setQuizzes} weight={wQuizzes} setWeight={setWQuizzes} avgPct={quizzesPct} maxWeight={100 - (wMidterm + wFinal + wOutputs + wPart + wAtt)}/>
          </div>)}

        
        {(subjectType === "laboratory" || subjectType === "both") && (<div className="card p-6 mb-6 space-y-6 laboratory-components">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-forest-900">Laboratory Components</h2>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${labWeightTotal === 100
                ? "text-green-800 bg-green-50"
                : labWeightTotal === 0
                    ? "text-red-800 bg-red-50"
                    : "text-amber-800 bg-amber-50"}`}>
                  Weights: {labWeightTotal}%
                  {labWeightTotal !== 100 ? " (must be 100%)" : ""}
                </span>
                <span className="text-sm font-semibold text-forest-700 bg-mint-50 px-3 py-1 rounded-full">
                  {labPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <MultiItemSection title="Lab Exercises / Activities / Reports" itemLabel="Exercise" items={labExercises} setItems={setLabExercises} weight={wExercises} setWeight={setWExercises} avgPct={labExercisesPct} maxWeight={100 - (wPractical + wLabAtt)}/>

            <div>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft mb-1 px-1">
                <div className="col-span-3">Component</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-1"></div>
                <div className="col-span-2 text-center">Out of</div>
                <div className="col-span-2 text-center">Weight %</div>
                <div className="col-span-2 text-right">%</div>
              </div>
              <SingleScoreRow label="Practical Exam" score={labPractical} setScore={setLabPractical} outOf={labPracticalOut} setOutOf={setLabPracticalOut} weight={wPractical} setWeight={setWPractical} maxWeight={100 - (wExercises + wLabAtt)}/>
              <SingleScoreRow label="Attendance / Participation" score={labAtt} setScore={setLabAtt} outOf={labAttOut} setOutOf={setLabAttOut} weight={wLabAtt} setWeight={setWLabAtt} maxWeight={100 - (wExercises + wPractical)}/>
            </div>
          </div>)}

        
        <div className="card p-7 sm:p-8 border-2 border-mint-100 grade-result">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-forest-900">Grade Result</h2>
            <button type="button" onClick={resetAll} className="btn-secondary btn-sm">Reset all</button>
          </div>
          {cppError && (<div className="mb-4 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
              {cppError}
              {authExpired ? <a href="/login?next=%2Fgrade" className="mt-2 inline-block font-semibold underline">Sign in again</a> : <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-2 font-semibold underline">Try again</button>}
            </div>)}

          <div className="grade-result-values">
            <div>
              <p className="text-sm text-ink-soft">Final Percentage</p>
              <p className="mt-1 flex min-h-10 items-center text-3xl font-extrabold text-forest-900">
                {finalPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-ink-soft">CvSU Grade</p>
              <p className="mt-1 flex min-h-10 items-center text-3xl font-extrabold text-forest-900">
                {pending || cppError ? "—" : grade.toFixed(2)}
              </p>
            </div>
            <div className="result-remark">
              <p className="text-sm text-ink-soft">Remark</p>
              <div className="mt-1 flex min-h-10 items-center"><p className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${remarkColor}`}>{pending ? "Calculating…" : cppError ? "Unavailable" : remark}</p></div>
            </div>
          </div>

          {subjectType === "both" && (<div className="mt-5 pt-5 border-t border-mint-100 text-sm text-ink-soft">
              Lecture: {lecturePercent.toFixed(1)}% × {lecShare}% ={" "}
              {((lecturePercent * lecShare) / 100).toFixed(2)}
              &nbsp;·&nbsp; Lab: {labPercent.toFixed(1)}% × {labShare}% ={" "}
              {((labPercent * labShare) / 100).toFixed(2)}
            </div>)}

        </div>
      </div>
    </div>);
}
