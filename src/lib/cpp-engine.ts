import { execFile } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
export function findBinary(root = process.cwd(), platform: string = process.platform): string {
    const filename = platform === "win32" ? "grading.exe" : "grading";
    for (const folder of ["build", "bin"]) {
        const binary = path.join(root, folder, filename);
        try {
            if (statSync(binary).isFile())
                return binary;
        }
        catch { }
    }
    throw new Error("C++ engine unavailable. Run npm run build:cpp on the server platform.");
}
export function runCpp(binary: string, args: string[], timeout = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            execFile(binary, args, { timeout, maxBuffer: 16 * 1024, windowsHide: true, encoding: "utf8" }, (error, stdout) => {
                if (error)
                    reject(new Error("C++ engine execution failed. Check its permissions, platform, and build."));
                else
                    resolve(stdout);
            });
        }
        catch {
            reject(new Error("C++ engine execution failed. Check its permissions, platform, and build."));
        }
    });
}
export function parseResult(output: string, mode: "grade" | "gwa"): {
    value: number;
    label: string;
} {
    const match = /^(\d+\.\d{2}) (Passed|Conditional|Failed|Summa Cum Laude|Magna Cum Laude|Cum Laude|No Latin Honors)\r?\n?$/.exec(output);
    if (!match)
        throw new Error("C++ engine returned an invalid response.");
    const value = Number(match[1]);
    const labels = mode === "grade" ? ["Passed", "Conditional", "Failed"] : ["Summa Cum Laude", "Magna Cum Laude", "Cum Laude", "No Latin Honors"];
    if (value < 1 || value > 5 || !labels.includes(match[2]))
        throw new Error("C++ engine returned an invalid result.");
    return { value, label: match[2] };
}
