"use client";

import { useTransition } from "react";

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
      className="text-red-600 hover:underline disabled:opacity-50 text-sm"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
