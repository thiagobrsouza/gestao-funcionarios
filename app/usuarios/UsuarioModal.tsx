"use client";

import { useActionState, useState } from "react";
import Modal from "@/components/Modal";
import type { ActionState } from "./actions";

const initialState: ActionState = {};

export default function UsuarioModal({
  mode,
  usuario,
  action,
}: {
  mode: "create" | "edit";
  usuario?: { id: number; username: string; role: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setOpen(false);
  }

  return (
    <>
      {mode === "create" ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Novo
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-blue-600 hover:underline text-sm"
        >
          Editar
        </button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Novo Usuário" : "Editar Usuário"}
      >
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <input
              name="username"
              defaultValue={usuario?.username}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Papel
            </label>
            <select
              name="role"
              defaultValue={usuario?.role ?? "user"}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === "create" ? "Senha" : "Nova senha"}
            </label>
            <input
              type="password"
              name={mode === "create" ? "password" : "novaSenha"}
              required={mode === "create"}
              placeholder={mode === "edit" ? "Deixe em branco para manter a atual" : undefined}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input
              type="password"
              name="confirmarSenha"
              required={mode === "create"}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
