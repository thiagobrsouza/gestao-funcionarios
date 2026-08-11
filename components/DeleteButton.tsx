"use client";

import { useTransition } from "react";
import { TrashIcon } from "@/components/icons";

export default function DeleteButton({
  id,
  action,
  confirmMessage,
}: {
  id: number;
  action: (id: number) => Promise<void>;
  confirmMessage: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        await action(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir.");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="Excluir"
      title="Excluir"
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}
