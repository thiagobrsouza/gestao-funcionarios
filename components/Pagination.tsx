import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  basePath,
  extraParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(extraParams);
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-600">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={prevDisabled}
          className={
            prevDisabled
              ? "px-3 py-1 rounded border border-gray-200 text-gray-300 pointer-events-none"
              : "px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          }
        >
          Anterior
        </Link>
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={nextDisabled}
          className={
            nextDisabled
              ? "px-3 py-1 rounded border border-gray-200 text-gray-300 pointer-events-none"
              : "px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          }
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}
