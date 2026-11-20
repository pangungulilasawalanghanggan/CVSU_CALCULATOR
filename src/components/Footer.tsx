import Logo from "./Logo";
import Link from "next/link";
export default function Footer() {
    return (<footer className="bg-mint-50 border-t border-mint-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Logo />
        <p className="text-xs text-ink-soft text-center">
          © 2026 CvSU Grade & GWA Calculator · Cavite State University · Academic Project
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-ink-soft">
          <Link href="/#features" className="hover:text-forest-800">
            Features
          </Link>
          <Link href="/#about" className="hover:text-forest-800">
            About Us
          </Link>
          <Link href="/login" className="hover:text-forest-800">
            Sign in
          </Link>
        </div>
      </div>
    </footer>);
}
