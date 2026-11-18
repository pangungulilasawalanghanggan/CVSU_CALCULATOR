const nextConfig = {
    reactStrictMode: true,
    distDir: process.env.CVSU_AUDIT_BUILD === "1" ? ".next-audit-build" : ".next",
        outputFileTracingIncludes: {
            "/api/grade": ["./build/grading", "./build/grading.exe", "./bin/grading", "./bin/grading.exe"],
            "/api/gwa": ["./build/grading", "./build/grading.exe", "./bin/grading", "./bin/grading.exe"],
        },
};
export default nextConfig;
