"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import AuthStatus from "./AuthStatus";
const LINKS = [
    { href: "/", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/#about", label: "About Us" },
];
export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeHash, setActiveHash] = useState("");
    useEffect(() => {
        const syncHash = () => setActiveHash(pathname === "/" ? window.location.hash : "");
        syncHash();
        window.addEventListener("hashchange", syncHash);
        window.addEventListener("popstate", syncHash);
        return () => {
            window.removeEventListener("hashchange", syncHash);
            window.removeEventListener("popstate", syncHash);
        };
    }, [pathname]);
    function isActive(href: string) {
        return href.startsWith("/#")
            ? pathname === "/" && activeHash === href.slice(1)
            : pathname === href && !activeHash;
    }
    function selectLink(href: string) {
        setActiveHash(href.startsWith("/#") ? href.slice(1) : "");
        setOpen(false);
    }
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);
    return (<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || open
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-mint-100"
            : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-[72px] flex items-center justify-between">
        <Logo />

        
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (<Link key={link.href} href={link.href} onClick={() => selectLink(link.href)} aria-current={active ? (link.href.includes("#") ? "location" : "page") : undefined} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${active
                    ? "bg-mint-50 text-forest-800"
                    : "text-ink-soft hover:text-forest-800 hover:bg-mint-50/60"}`}>
                {link.label}
              </Link>);
        })}
        </nav>

        <div className="hidden md:block"><AuthStatus /></div>

        
        <button type="button" className="md:hidden p-2 rounded-xl text-forest-800 hover:bg-mint-50" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-menu">
          {open ? (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>) : (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16"/>
            </svg>)}
        </button>
      </div>

      
      {open && (<div id="mobile-menu" className="md:hidden bg-white border-t border-mint-100 px-4 py-4 space-y-1">
          {LINKS.map((link) => {
                const active = isActive(link.href);
                return (<Link key={link.href} href={link.href} onClick={() => selectLink(link.href)} aria-current={active ? (link.href.includes("#") ? "location" : "page") : undefined} className={`block px-4 py-3 rounded-xl text-sm font-semibold ${active ? "bg-mint-50 text-forest-800" : "text-ink-soft"}`}>
                {link.label}
              </Link>);
            })}
          <AuthStatus />
        </div>)}
    </header>);
}
