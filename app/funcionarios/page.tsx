import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { parseSort } from "@/lib/sorting";
import { formatBRL, formatCPF, formatDateOnly } from "@/lib/format";
import Pagination from "@/components/Pagination";
import SortableHeader from "@/components/SortableHeader";
import DeleteButton from "@/components/DeleteButton";
import FuncionarioModal from "./FuncionarioModal";
import { createFuncionario, updateFuncionario, deleteFuncionario } from "./actions";

const SORTABLE_FIELDS = [
  "id",
  "nome",
  "cpf",
  "cargo",
  "salario",
  "dataAdmissao",
  "dataDesligamento",
] as const;

export default async function FuncionariosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string }>;
}) {
  const { page: pageParam, sort: sortParam, dir: dirParam } = await searchParams;
  const page = parsePage(pageParam);
  const { field: sort, dir } = parseSort(sortParam, dirParam, SORTABLE_FIELDS, "id");

  const orderBy = sort === "cargo" ? { cargo: { nome: dir } } : { [sort]: dir };

  const [items, total, cargos] = await Promise.all([
    prisma.funcionario.findMany({
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { cargo: true },
    }),
    prisma.funcionario.count(),
    prisma.cargo.findMany({ orderBy: { nome: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Funcionários</h1>
        {cargos.length > 0 ? (
          <FuncionarioModal mode="create" cargos={cargos} action={createFuncionario} />
        ) : (
          <span className="text-sm text-gray-500">
            Cadastre um{" "}
            <Link href="/cargos" className="text-blue-600 hover:underline">
              cargo
            </Link>{" "}
            antes de criar um funcionário.
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <SortableHeader label="ID" field="id" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Nome" field="nome" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="CPF" field="cpf" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Cargo" field="cargo" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Salário" field="salario" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Admissão" field="dataAdmissao" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3">
                <SortableHeader label="Status" field="dataDesligamento" currentField={sort} currentDir={dir} basePath="/funcionarios" />
              </th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{f.id}</td>
                <td className="px-4 py-3">{f.nome}</td>
                <td className="px-4 py-3">{formatCPF(f.cpf)}</td>
                <td className="px-4 py-3">{f.cargo.nome}</td>
                <td className="px-4 py-3">{formatBRL(f.salario.toString())}</td>
                <td className="px-4 py-3">{formatDateOnly(f.dataAdmissao)}</td>
                <td className="px-4 py-3">
                  {f.dataDesligamento ? (
                    <span className="inline-flex items-center gap-1 text-red-700">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Desligado em {formatDateOnly(f.dataDesligamento)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Ativo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <FuncionarioModal
                      mode="edit"
                      funcionario={{
                        id: f.id,
                        nome: f.nome,
                        cpf: f.cpf,
                        salario: f.salario.toString(),
                        dataAdmissao: f.dataAdmissao,
                        dataDesligamento: f.dataDesligamento,
                        cargoId: f.cargoId,
                      }}
                      cargos={cargos}
                      action={updateFuncionario.bind(null, f.id)}
                    />
                    <DeleteButton
                      id={f.id}
                      action={deleteFuncionario}
                      confirmMessage={`Excluir o funcionário "${f.nome}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Nenhum funcionário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/funcionarios"
        extraParams={{ sort, dir }}
      />
    </div>
  );
}
