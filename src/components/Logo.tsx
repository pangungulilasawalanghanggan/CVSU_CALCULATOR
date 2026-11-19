import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" aria-label="GradeOverview — CvSU Grade & GWA Calculator" className="inline-flex shrink-0 items-center">
      <Image
        src="/brand-wordmark.png"
        alt="GradeOverview"
        width={810}
        height={230}
        className="h-auto w-[10.5rem] sm:w-[11rem]"
      />
    </Link>
  );
}
