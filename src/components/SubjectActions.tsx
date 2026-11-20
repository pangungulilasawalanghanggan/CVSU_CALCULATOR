"use client";
import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { isSubject } from "../lib/validation";
export interface SubjectDetails {
    name: string;
    units: number;
    grade: number;
}
export function SubjectActions({ name, onEdit, onRemove }: {
    name: string;
    onEdit: () => void;
    onRemove: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const trigger = useRef<HTMLButtonElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const menuId = useId();
    useLayoutEffect(() => {
        if (!open || !trigger.current || !menu.current)
            return;
        const button = trigger.current.getBoundingClientRect();
        const bounds = menu.current.getBoundingClientRect();
        const below = button.bottom + 6;
        setPosition({ left: Math.max(8, Math.min(button.right - bounds.width, innerWidth - bounds.width - 8)), top: Math.max(8, below + bounds.height <= innerHeight - 8 ? below : button.top - bounds.height - 6) });
        menu.current.querySelector<HTMLButtonElement>('button[role="menuitem"]')?.focus({ preventScroll: true });
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const dismiss = (event: PointerEvent) => {
            if (event.target instanceof Node && !trigger.current?.contains(event.target) && !menu.current?.contains(event.target))
                setOpen(false);
        };
        const close = () => setOpen(false);
        document.addEventListener("pointerdown", dismiss);
        window.addEventListener("resize", close);
        window.addEventListener("scroll", close, true);
        return () => { document.removeEventListener("pointerdown", dismiss); window.removeEventListener("resize", close); window.removeEventListener("scroll", close, true); };
    }, [open]);
    function choose(action: () => void) { setOpen(false); trigger.current?.focus({ preventScroll: true }); action(); }
    return <>
    <button ref={trigger} type="button" aria-label={`Actions for ${name}`} title="Edit or remove subject" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => setOpen(value => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-forest-800 transition-colors hover:bg-mint-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700">
      <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/></svg>
    </button>
    {open && createPortal(<div ref={menu} id={menuId} role="menu" aria-label={`Subject actions for ${name}`} style={{ position: "fixed", ...position, zIndex: 60 }} onKeyDown={event => {
                if (event.key === "Escape" || event.key === "Tab") {
                    if (event.key === "Escape")
                        event.preventDefault();
                    setOpen(false);
                    trigger.current?.focus();
                }
                if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                    event.preventDefault();
                    const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]') || []);
                    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
                    buttons[next]?.focus();
                }
            }} className="w-40 rounded-xl border border-mint-100 bg-white p-1.5 text-left shadow-xl">
      <button type="button" role="menuitem" onClick={() => choose(onEdit)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-forest-900 hover:bg-mint-50 focus:bg-mint-50 focus:outline-none">Edit</button>
      <button type="button" role="menuitem" onClick={() => choose(onRemove)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50 focus:bg-red-50 focus:outline-none">Remove</button>
    </div>, document.body)}
  </>;
}
export function SubjectEditor({ subject, onSave, onCancel }: {
    subject: SubjectDetails;
    onSave: (value: SubjectDetails) => void;
    onCancel: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const fieldId = useId();
    const [name, setName] = useState(subject.name);
    const [units, setUnits] = useState(String(subject.units));
    const [grade, setGrade] = useState(subject.grade);
    const [error, setError] = useState("");
    useEffect(() => { dialog.current?.showModal(); }, []);
    return <dialog ref={dialog} aria-labelledby={`${fieldId}-title`} onClose={onCancel} onClick={event => {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)
                dialog.current?.close();
        }} className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-mint-100 bg-white p-6 text-ink shadow-2xl backdrop:bg-black/40">
    <form onSubmit={event => {
            event.preventDefault();
            const updated = { name: name.trim(), units: Number(units), grade };
            if (!updated.name || !isSubject(updated)) {
                setError("Enter a subject name, a valid grade, and positive units.");
                return;
            }
            dialog.current?.close();
            onSave(updated);
        }}>
      <h2 id={`${fieldId}-title`} className="text-xl font-bold text-forest-900">Edit subject</h2>
      
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <label htmlFor={`${fieldId}-name`} className="mb-1 mt-5 block text-sm font-medium">Subject name</label>
      <input id={`${fieldId}-name`} autoFocus required className="input-field" value={name} onChange={event => setName(event.target.value)}/>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div><label htmlFor={`${fieldId}-units`} className="mb-1 block text-sm font-medium">Units</label><input id={`${fieldId}-units`} className="input-field" type="number" inputMode="decimal" min="0" step="any" required value={units} onChange={event => setUnits(event.target.value)}/></div>
        <div><label htmlFor={`${fieldId}-grade`} className="mb-1 block text-sm font-medium">Final Grade</label><select id={`${fieldId}-grade`} className="select-field" value={grade} onChange={event => setGrade(Number(event.target.value))}>{![1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 4, 5].includes(subject.grade) && <option value={subject.grade}>{subject.grade.toFixed(2)}</option>}{[1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 4, 5].map(value => <option key={value} value={value}>{value.toFixed(2)}</option>)}</select></div>
      </div>
      <div className="mt-6 flex justify-end gap-3"><button type="button" className="btn-secondary btn-sm" onClick={() => dialog.current?.close()}>Cancel</button><button type="submit" className="btn-primary btn-sm">Save changes</button></div>
    </form>
  </dialog>;
}
