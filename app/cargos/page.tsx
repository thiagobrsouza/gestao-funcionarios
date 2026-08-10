import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import CargoModal from "./CargoModal";
import { createCargo, updateCargo, deleteCargo } from "./actions";

export default async function CargosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const [items, total, departamentos] = await Promise.all([
    prisma.cargo.findMany({
      orderBy: { id: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { departamento: true },
    }),
    prisma.cargo.count(),
    prisma.departamento.findMany({ orderBy: { nome: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Cargos</h1>
        {departamentos.length > 0 ? (
          <CargoModal mode="create" departamentos={departamentos} action={createCargo} />
        ) : (
          <span className="text-sm text-gray-500">
            Cadastre um{" "}
            <Link href="/departamentos" className="text-blue-600 hover:underline">
              departamento
            </Link>{" "}
            antes de criar um cargo.
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.id}</td>
                <td className="px-4 py-3">{c.nome}</td>
                <td className="px-4 py-3">{c.departamento.nome}</td>
                <td className="px-4 py-3">{formatDate(c.criadoEm)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <CargoModal
                      mode="edit"
                      cargo={c}
                      departamentos={departamentos}
                      action={updateCargo.bind(null, c.id)}
                    />
                    <DeleteButton
                      id={c.id}
                      action={deleteCargo}
                      confirmMessage={`Excluir o cargo "${c.nome}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum cargo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/cargos" />
    </div>
  );
}
