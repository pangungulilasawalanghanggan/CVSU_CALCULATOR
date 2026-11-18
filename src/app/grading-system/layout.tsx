import RequireLogin from "../../components/RequireLogin";
export default function GradingSystemLayout({ children }: {
    children: React.ReactNode;
}) {
    return <RequireLogin destination="/grading-system">{children}</RequireLogin>;
}
export const dynamic = "force-dynamic";
