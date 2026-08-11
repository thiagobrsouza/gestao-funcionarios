"use client";

import { useActionState, useState } from "react";
import { changeOwnPassword, type ActionState } from "./actions";

const initialState: ActionState = {};

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changeOwnPassword, initialState);
  const [handledState, setHandledState] = useState(state);
  const [formKey, setFormKey] = useState(0);

  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setFormKey((k) => k + 1);
  }

  return (
    <form
      key={formKey}
      action={formAction}
      className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 max-w-sm"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha atual
        </label>
        <input
          type="password"
          name="senhaAtual"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha
        </label>
        <input
          type="password"
          name="novaSenha"
          required
          minLength={6}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar nova senha
        </label>
        <input
          type="password"
          name="confirmarSenha"
          required
          minLength={6}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600">Senha alterada com sucesso.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
