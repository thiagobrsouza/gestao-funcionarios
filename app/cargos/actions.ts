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

  await logAction(await currentUsername(), `Criou o cargo "${parsed.nome}"`);
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

  await logAction(await currentUsername(), `Atualizou o cargo "${parsed.nome}"`);
  revalidatePath("/cargos");
  return { success: true };
}

export async function deleteCargo(id: number) {
  const cargo = await prisma.cargo.findUnique({ where: { id } });

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

  await logAction(await currentUsername(), `Excluiu o cargo "${cargo?.nome ?? id}"`);
  revalidatePath("/cargos");
}
