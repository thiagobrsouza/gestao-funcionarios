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

function parseInput(formData: FormData) {
  const nome = formData.get("nome")?.toString().trim();
  const cpfRaw = formData.get("cpf")?.toString() ?? "";
  const cpf = cpfRaw.replace(/\D/g, "");
  const salarioRaw = formData.get("salario")?.toString();
  const salario = salarioRaw ? Number(salarioRaw) : NaN;
  const dataAdmissaoRaw = formData.get("dataAdmissao")?.toString();
  const cargoIdRaw = formData.get("cargoId")?.toString();
  const cargoId = cargoIdRaw ? Number(cargoIdRaw) : NaN;

  if (!nome) return { error: "Nome é obrigatório." };
  if (cpf.length !== 11) return { error: "CPF deve conter 11 dígitos." };
  if (!salarioRaw || Number.isNaN(salario) || salario < 0) {
    return { error: "Salário inválido." };
  }
  if (!dataAdmissaoRaw) return { error: "Data de admissão é obrigatória." };
  if (!cargoIdRaw || Number.isNaN(cargoId)) return { error: "Cargo é obrigatório." };

  return {
    nome,
    cpf,
    salario,
    dataAdmissao: new Date(dataAdmissaoRaw),
    cargoId,
  };
}

export async function createFuncionario(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseInput(formData);
  if (parsed.error) return { error: parsed.error };

  try {
    await prisma.funcionario.create({
      data: {
        nome: parsed.nome!,
        cpf: parsed.cpf!,
        salario: parsed.salario!,
        dataAdmissao: parsed.dataAdmissao!,
        cargoId: parsed.cargoId!,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um funcionário com esse CPF." };
    }
    throw err;
  }

  await logAction(await currentUsername(), `Criou o funcionário "${parsed.nome}"`);
  revalidatePath("/funcionarios");
  return { success: true };
}

export async function updateFuncionario(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseInput(formData);
  if (parsed.error) return { error: parsed.error };

  try {
    await prisma.funcionario.update({
      where: { id },
      data: {
        nome: parsed.nome!,
        cpf: parsed.cpf!,
        salario: parsed.salario!,
        dataAdmissao: parsed.dataAdmissao!,
        cargoId: parsed.cargoId!,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um funcionário com esse CPF." };
    }
    throw err;
  }

  await logAction(await currentUsername(), `Atualizou o funcionário "${parsed.nome}"`);
  revalidatePath("/funcionarios");
  return { success: true };
}

export async function deleteFuncionario(id: number) {
  const funcionario = await prisma.funcionario.findUnique({ where: { id } });

  await prisma.funcionario.delete({ where: { id } });

  await logAction(
    await currentUsername(),
    `Excluiu o funcionário "${funcionario?.nome ?? id}"`
  );
  revalidatePath("/funcionarios");
}
