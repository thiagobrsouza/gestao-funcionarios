import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import UsuarioModal from "./UsuarioModal";
import { createUser, updateUser, deleteUser } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  user: "Usuário",
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { id: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
        <UsuarioModal mode="create" action={createUser} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role] ?? u.role}</td>
                <td className="px-4 py-3">{formatDate(u.criadoEm)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <UsuarioModal
                      mode="edit"
                      usuario={u}
                      action={updateUser.bind(null, u.id)}
                    />
                    <DeleteButton
                      id={u.id}
                      action={deleteUser}
                      confirmMessage={`Excluir o usuário "${u.username}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/usuarios" />
    </div>
  );
}
