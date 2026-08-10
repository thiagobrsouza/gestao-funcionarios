"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: boolean };

function isUniqueConstraintError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
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

  revalidatePath("/departamentos");
  return { success: true };
}

export async function deleteDepartamento(id: number) {
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

  revalidatePath("/departamentos");
}
