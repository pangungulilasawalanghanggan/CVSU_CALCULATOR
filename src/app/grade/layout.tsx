import RequireLogin from "../../components/RequireLogin";
export default function GradeLayout({ children }: {
    children: React.ReactNode;
}) {
    return <RequireLogin destination="/grade">{children}</RequireLogin>;
}
export const dynamic = "force-dynamic";
