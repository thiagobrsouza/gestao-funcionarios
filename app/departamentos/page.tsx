import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { parseSort } from "@/lib/sorting";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/Pagination";
import SortableHeader from "@/components/SortableHeader";
import DeleteButton from "@/components/DeleteButton";
import DepartamentoModal from "./DepartamentoModal";
import { createDepartamento, updateDepartamento, deleteDepartamento } from "./actions";

const SORTABLE_FIELDS = ["id", "nome", "criadoEm"] as const;

export default async function DepartamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string }>;
}) {
  const { page: pageParam, sort: sortParam, dir: dirParam } = await searchParams;
  const page = parsePage(pageParam);
  const { field: sort, dir } = parseSort(sortParam, dirParam, SORTABLE_FIELDS, "id");

  const [items, total] = await Promise.all([
    prisma.departamento.findMany({
      orderBy: { [sort]: dir },
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
              <th className="px-4 py-3">
                <SortableHeader label="ID" field="id" currentField={sort} currentDir={dir} basePath="/departamentos" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Nome" field="nome" currentField={sort} currentDir={dir} basePath="/departamentos" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Criado em" field="criadoEm" currentField={sort} currentDir={dir} basePath="/departamentos" />
              </th>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/departamentos"
        extraParams={{ sort, dir }}
      />
    </div>
  );
}
