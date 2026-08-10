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

function parseInput(formData: FormData): { nome?: string; departamentoId?: number; error?: string } {
  const nome = formData.get("nome")?.toString().trim();
  const departamentoIdRaw = formData.get("departamentoId")?.toString();
  const departamentoId = departamentoIdRaw ? Number(departamentoIdRaw) : NaN;

  if (!nome) return { error: "Nome é obrigatório." };
  if (!departamentoIdRaw || Number.isNaN(departamentoId)) {
    return { error: "Departamento é obrigatório." };
  }

  return { nome, departamentoId };
}

export async function createCargo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseInput(formData);
  if (parsed.error) return { error: parsed.error };

  try {
    await prisma.cargo.create({
      data: { nome: parsed.nome!, departamentoId: parsed.departamentoId! },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um cargo com esse nome." };
    }
    throw err;
  }

  revalidatePath("/cargos");
  return { success: true };
}

export async function updateCargo(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseInput(formData);
  if (parsed.error) return { error: parsed.error };

  try {
    await prisma.cargo.update({
      where: { id },
      data: { nome: parsed.nome!, departamentoId: parsed.departamentoId! },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um cargo com esse nome." };
    }
    throw err;
  }

  revalidatePath("/cargos");
  return { success: true };
}

export async function deleteCargo(id: number) {
  try {
    await prisma.cargo.delete({ where: { id } });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: unknown }).code === "P2003"
    ) {
      throw new Error(
        "Não é possível excluir: existem funcionários vinculados a este cargo."
      );
    }
    throw err;
  }

  revalidatePath("/cargos");
}
