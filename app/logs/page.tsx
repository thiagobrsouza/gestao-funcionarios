import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { parseSort } from "@/lib/sorting";
import { formatDate, formatTime } from "@/lib/format";
import Pagination from "@/components/Pagination";
import SortableHeader from "@/components/SortableHeader";

const SORTABLE_FIELDS = ["criadoEm", "descricao", "usuario"] as const;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const { page: pageParam, sort: sortParam, dir: dirParam } = await searchParams;
  const page = parsePage(pageParam);
  const { field: sort, dir } = parseSort(sortParam, dirParam, SORTABLE_FIELDS, "criadoEm", "desc");

  const [items, total] = await Promise.all([
    prisma.log.findMany({
      orderBy: { [sort]: dir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.log.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Logs</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <SortableHeader label="Data" field="criadoEm" currentField={sort} currentDir={dir} basePath="/logs" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Horário" field="criadoEm" currentField={sort} currentDir={dir} basePath="/logs" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Descrição" field="descricao" currentField={sort} currentDir={dir} basePath="/logs" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Usuário" field="usuario" currentField={sort} currentDir={dir} basePath="/logs" />
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr key={log.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{formatDate(log.criadoEm)}</td>
                <td className="px-4 py-3">{formatTime(log.criadoEm)}</td>
                <td className="px-4 py-3">{log.descricao}</td>
                <td className="px-4 py-3">{log.usuario}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhum log registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/logs"
        extraParams={{ sort, dir }}
      />
    </div>
  );
}
