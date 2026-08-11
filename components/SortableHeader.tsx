import Link from "next/link";
import type { SortDir } from "@/lib/sorting";

export default function SortableHeader({
  label,
  field,
  currentField,
  currentDir,
  basePath,
}: {
  label: string;
  field: string;
  currentField: string;
  currentDir: SortDir;
  basePath: string;
}) {
  const isActive = currentField === field;
  const nextDir: SortDir = isActive && currentDir === "asc" ? "desc" : "asc";

  return (
    <Link
      href={`${basePath}?sort=${field}&dir=${nextDir}`}
      className="inline-flex items-center gap-1 hover:text-blue-600"
    >
      {label}
      <span className="text-[10px] w-3 inline-block">
        {isActive ? (currentDir === "asc" ? "▲" : "▼") : ""}
      </span>
    </Link>
  );
}
