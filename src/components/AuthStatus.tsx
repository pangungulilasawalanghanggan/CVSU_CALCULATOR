"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export default function AuthStatus() {
    const [user, setUser] = useState<{
        name: string;
        email: string;
    } | null>(null);
    const pathname = usePathname();
    useEffect(() => {
        const controller = new AbortController();
        setUser(null);
        fetch("/api/auth/session", { cache: "no-store", signal: controller.signal }).then(r => r.json()).then(data => setUser(data.user)).catch(() => { });
        return () => controller.abort();
    }, [pathname]);
    return user ? <div className="flex flex-wrap items-center gap-3">
    <Link className="text-sm font-semibold text-forest-800" href="/grade">Grade Calculator</Link>
    <Link className="text-sm font-semibold text-forest-800" href="/gwa">GWA Calculator</Link>
    <Link className="text-sm font-semibold text-forest-800" href="/grading-system">Grading System</Link>
    <form action="/api/auth/logout" method="post"><button className="btn-secondary btn-sm" type="submit">Sign out</button></form>
  </div> : <Link href="/login" className="btn-primary btn-sm">Sign in</Link>;
}
