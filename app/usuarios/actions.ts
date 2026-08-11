"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string; success?: boolean };

function isUniqueConstraintError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
  return session;
}

function parseRole(formData: FormData): string | { error: string } {
  const role = formData.get("role")?.toString();
  if (role !== "admin" && role !== "user") return { error: "Papel inválido." };
  return role;
}

export async function createUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();
  const confirmarSenha = formData.get("confirmarSenha")?.toString();
  const role = parseRole(formData);

  if (!username) return { error: "Usuário é obrigatório." };
  if (typeof role === "object") return role;
  if (!password || password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (password !== confirmarSenha) {
    return { error: "A confirmação não confere com a senha." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({ data: { username, passwordHash, role } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um usuário com esse nome." };
    }
    throw err;
  }

  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUser(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const username = formData.get("username")?.toString().trim();
  const role = parseRole(formData);
  const novaSenha = formData.get("novaSenha")?.toString();
  const confirmarSenha = formData.get("confirmarSenha")?.toString();

  if (!username) return { error: "Usuário é obrigatório." };
  if (typeof role === "object") return role;

  const isSelf = Number(session.user.id) === id;
  if (isSelf && role !== "admin") {
    return { error: "Você não pode remover seu próprio papel de administrador." };
  }

  const data: { username: string; role: string; passwordHash?: string } = {
    username,
    role,
  };

  if (novaSenha) {
    if (novaSenha.length < 6) {
      return { error: "A nova senha deve ter pelo menos 6 caracteres." };
    }
    if (novaSenha !== confirmarSenha) {
      return { error: "A confirmação não confere com a nova senha." };
    }
    data.passwordHash = await bcrypt.hash(novaSenha, 10);
  }

  try {
    await prisma.user.update({ where: { id }, data });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: "Já existe um usuário com esse nome." };
    }
    throw err;
  }

  revalidatePath("/usuarios");
  return { success: true };
}

export async function deleteUser(id: number) {
  const session = await requireAdmin();

  if (Number(session.user.id) === id) {
    throw new Error("Você não pode excluir sua própria conta.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/usuarios");
}
