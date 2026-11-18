"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
interface Props {
    count: number;
    units: number;
    result: string;
    honors: string;
    pending: boolean;
    error: string;
    expired: boolean;
    storageError: string;
    onRetry: () => void;
    addOpen: boolean;
    onAdd: () => void;
    onCloseAdd: () => void;
    subjectForm: ReactNode;
    subjectsCard: ReactNode;
    honorsCard: ReactNode;
}
export default function MobileGWAView(props: Props) {
    const addDialog = useRef<HTMLDialogElement>(null);
    const honorsDialog = useRef<HTMLDialogElement>(null);
    const [honorsOpen, setHonorsOpen] = useState(false);
    const [inlineAdd, setInlineAdd] = useState(false);
    useEffect(() => {
        const media = window.matchMedia("(min-width: 480px) and (min-height: 760px)");
        const update = () => setInlineAdd(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    useEffect(() => { if (inlineAdd && props.addOpen)
        props.onCloseAdd(); }, [inlineAdd, props.addOpen, props.onCloseAdd]);
    useEffect(() => { if (props.addOpen)
        addDialog.current?.showModal();
    else
        addDialog.current?.close(); }, [props.addOpen]);
    useEffect(() => { if (honorsOpen)
        honorsDialog.current?.showModal();
    else
        honorsDialog.current?.close(); }, [honorsOpen]);
    useEffect(() => {
        if (!props.addOpen && !honorsOpen)
            return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previous; };
    }, [props.addOpen, honorsOpen]);
    return <div className="hero-wash gwa-mobile">
    <div className="gwa-mobile-content">
      <div className="workspace-heading shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="section-label">Multiple Subjects</p><h1 className="font-extrabold text-forest-900 tracking-tight">GWA Calculator</h1><p className="mt-1 text-xs text-ink-soft">{props.count} {props.count === 1 ? "subject" : "subjects"} · {props.units} {props.units === 1 ? "unit" : "units"}</p></div>
        {!inlineAdd && <button type="button" onClick={props.onAdd} className="btn-primary btn-sm shrink-0" aria-label="Add subject">+ Add</button>}
      </div>
      
      </div>
      {props.storageError && <p role="alert" className="shrink-0 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{props.storageError}</p>}
      {inlineAdd && <div className="gwa-inline-add shrink-0">{props.subjectForm}</div>}
      {props.subjectsCard}
      <section className="card gwa-mobile-summary" aria-label="GWA result summary">
        <div className="grid grid-cols-2 items-start gap-3">
          <div><p className="text-xs text-ink-soft">Your GWA</p><p className="mt-1 text-3xl font-extrabold text-forest-900">{props.result}</p></div>
          <div><button type="button" onClick={() => setHonorsOpen(true)} className="text-xs font-medium text-forest-800 underline decoration-dotted underline-offset-4" aria-label="View Latin honors guide">Latin Honors Estimate ⓘ</button><p className="mt-2 text-sm font-semibold text-forest-900">{props.pending ? "Calculating…" : props.honors || "—"}</p></div>
        </div>
        {props.error && <div role="alert" className="mt-2 text-xs text-red-700">{props.error} {props.expired ? <a href="/login?next=%2Fgwa" className="font-semibold underline">Sign in again</a> : <button type="button" onClick={props.onRetry} className="font-semibold underline">Try again</button>}</div>}
      </section>
      <p className="shrink-0 text-center text-[.65rem] text-ink-soft">Saved in this browser, including after sign-out.</p>
    </div>
    <dialog ref={addDialog} onClose={props.onCloseAdd} aria-label="Add a subject" className="gwa-mobile-add m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-mint-100 bg-white p-5 text-ink shadow-2xl backdrop:bg-black/40">
      <button type="button" onClick={() => addDialog.current?.close()} aria-label="Close add subject" className="absolute right-3 top-3 rounded-lg p-2 text-ink-soft hover:bg-mint-50">✕</button>
      {!inlineAdd && props.subjectForm}
    </dialog>
    <dialog ref={honorsDialog} onClose={() => setHonorsOpen(false)} aria-label="Latin honors guide" className="gwa-mobile-honors m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-mint-100 bg-white p-5 text-ink shadow-2xl backdrop:bg-black/40">
      <button type="button" onClick={() => honorsDialog.current?.close()} aria-label="Close honors guide" className="absolute right-3 top-3 rounded-lg p-2 text-ink-soft hover:bg-mint-50">✕</button>
      {props.honorsCard}
    </dialog>
  </div>;
}
