import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSession, SESSION_COOKIE } from "../lib/auth";
export default function RequireLogin({ children, destination = "/grade" }: {
    children: React.ReactNode;
    destination?: string;
}) {
    if (!readSession(cookies().get(SESSION_COOKIE)?.value))
        redirect(`/login?next=${encodeURIComponent(destination)}`);
    return <>{children}</>;
}
