"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "@/lib/log";

export type ActionState = { error?: string; success?: boolean };

function isUniqueConstraintError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
}

async function currentUsername() {
  const session = await auth();
  return session?.user?.name ?? "desconhecido";
}

export async function createDepartamento(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nome = formData.get("nome")?.toString().trim();
  if (!nome) return { error: "Nome é obrigatório." };

  try {
    await prisma.departamento.create({ data: { nome } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um departamento com esse nome." };
    }
    throw err;
  }

  await logAction(await currentUsername(), `Criou o departamento "${nome}"`);
  revalidatePath("/departamentos");
  return { success: true };
}

export async function updateDepartamento(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nome = formData.get("nome")?.toString().trim();
  if (!nome) return { error: "Nome é obrigatório." };

  try {
    await prisma.departamento.update({ where: { id }, data: { nome } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um departamento com esse nome." };
    }
    throw err;
  }

  await logAction(await currentUsername(), `Atualizou o departamento "${nome}"`);
  revalidatePath("/departamentos");
  return { success: true };
}

export async function deleteDepartamento(id: number) {
  const departamento = await prisma.departamento.findUnique({ where: { id } });

  try {
    await prisma.departamento.delete({ where: { id } });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: unknown }).code === "P2003"
    ) {
      throw new Error(
        "Não é possível excluir: existem cargos vinculados a este departamento."
      );
    }
    throw err;
  }

  await logAction(
    await currentUsername(),
    `Excluiu o departamento "${departamento?.nome ?? id}"`
  );
  revalidatePath("/departamentos");
}
