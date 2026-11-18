export const MAX_SUBJECTS = 100;
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isPercentage(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}
export function isSubject(value: unknown): value is Record<string, unknown> & {
    grade: number;
    units: number;
} {
    return isRecord(value) && typeof value.grade === "number" && Number.isFinite(value.grade)
        && value.grade >= 1 && value.grade <= 5 && typeof value.units === "number"
        && Number.isFinite(value.units) && value.units > 0 && value.units <= Number.MAX_SAFE_INTEGER;
}
export function isSavedSubjects(value: unknown): value is {
    name: string;
    grade: number;
    units: number;
}[] {
    return Array.isArray(value) && value.length <= MAX_SUBJECTS && value.every((subject) => isSubject(subject) && isRecord(subject) && typeof subject.name === "string" && subject.name.trim().length > 0);
}
