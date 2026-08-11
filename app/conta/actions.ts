"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/log";

export type ActionState = { error?: string; success?: boolean };

export async function changeOwnPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sessão expirada. Faça login novamente." };

  const senhaAtual = formData.get("senhaAtual")?.toString();
  const novaSenha = formData.get("novaSenha")?.toString();
  const confirmarSenha = formData.get("confirmarSenha")?.toString();

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return { error: "Preencha todos os campos." };
  }
  if (novaSenha.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  }
  if (novaSenha !== confirmarSenha) {
    return { error: "A confirmação não confere com a nova senha." };
  }

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (!user) return { error: "Usuário não encontrado." };

  const valid = await bcrypt.compare(senhaAtual, user.passwordHash);
  if (!valid) return { error: "Senha atual incorreta." };

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await logAction(user.username, "Alterou a própria senha");
  return { success: true };
}
