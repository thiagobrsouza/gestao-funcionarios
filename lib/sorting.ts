export type SortDir = "asc" | "desc";

export function parseSort<T extends string>(
  sortParam: string | undefined,
  dirParam: string | undefined,
  allowed: readonly T[],
  fallbackField: T,
  fallbackDir: SortDir = "asc"
): { field: T; dir: SortDir } {
  const field = (allowed as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as T)
    : fallbackField;
  const dir: SortDir = dirParam === "desc" ? "desc" : dirParam === "asc" ? "asc" : fallbackDir;
  return { field, dir };
}
