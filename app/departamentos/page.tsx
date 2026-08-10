import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import DepartamentoModal from "./DepartamentoModal";
import { createDepartamento, updateDepartamento, deleteDepartamento } from "./actions";

export default async function DepartamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const [items, total] = await Promise.all([
    prisma.departamento.findMany({
      orderBy: { id: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.departamento.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Departamentos</h1>
        <DepartamentoModal mode="create" action={createDepartamento} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{d.id}</td>
                <td className="px-4 py-3">{d.nome}</td>
                <td className="px-4 py-3">{formatDate(d.criadoEm)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <DepartamentoModal
                      mode="edit"
                      departamento={d}
                      action={updateDepartamento.bind(null, d.id)}
                    />
                    <DeleteButton
                      id={d.id}
                      action={deleteDepartamento}
                      confirmMessage={`Excluir o departamento "${d.nome}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhum departamento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/departamentos" />
    </div>
  );
}
