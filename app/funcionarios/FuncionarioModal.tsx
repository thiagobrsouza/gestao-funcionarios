"use client";

import { useActionState, useState } from "react";
import Modal from "@/components/Modal";
import { EditIcon } from "@/components/icons";
import { maskCPF } from "@/lib/format";
import type { ActionState } from "./actions";

const initialState: ActionState = {};

function toDateInputValue(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function FuncionarioModal({
  mode,
  funcionario,
  cargos,
  action,
}: {
  mode: "create" | "edit";
  funcionario?: {
    id: number;
    nome: string;
    cpf: string;
    salario: string | number;
    dataAdmissao: Date;
    dataDesligamento: Date | null;
    cargoId: number;
  };
  cargos: { id: number; nome: string }[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [cpf, setCpf] = useState("");
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setOpen(false);
  }

  function openModal() {
    setCpf(funcionario?.cpf ? maskCPF(funcionario.cpf) : "");
    setOpen(true);
  }

  return (
    <>
      {mode === "create" ? (
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Novo
        </button>
      ) : (
        <button
          onClick={openModal}
          aria-label="Editar"
          title="Editar"
          className="text-blue-600 hover:text-blue-800"
        >
          <EditIcon className="w-5 h-5" />
        </button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Novo Funcionário" : "Editar Funcionário"}
      >
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              name="nome"
              defaultValue={funcionario?.nome}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <input
              name="cpf"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salário (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="salario"
              defaultValue={funcionario?.salario?.toString()}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de admissão
            </label>
            <input
              type="date"
              name="dataAdmissao"
              defaultValue={toDateInputValue(funcionario?.dataAdmissao)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desligamento
            </label>
            <input
              type="date"
              name="dataDesligamento"
              defaultValue={toDateInputValue(funcionario?.dataDesligamento ?? undefined)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco se o funcionário ainda está ativo.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <select
              name="cargoId"
              defaultValue={funcionario?.cargoId ?? ""}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="" disabled>
                Selecione um cargo
              </option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
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
