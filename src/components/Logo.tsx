import Link from "next/link";
export default function Logo() {
    return (<Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
        <span className="text-white font-extrabold text-sm tracking-tight">CvSU</span>
      </div>
      <div className="leading-tight">
        <p className="font-extrabold text-forest-900 text-[0.95rem]">Grade & GWA</p>
        <p className="text-[0.7rem] text-ink-soft font-medium">Calculator</p>
      </div>
    </Link>);
}
