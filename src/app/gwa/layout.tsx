import RequireLogin from "../../components/RequireLogin";
export default function GWALayout({ children }: {
    children: React.ReactNode;
}) {
    return <RequireLogin destination="/gwa">{children}</RequireLogin>;
}
export const dynamic = "force-dynamic";
