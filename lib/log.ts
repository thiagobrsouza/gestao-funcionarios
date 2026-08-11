import { prisma } from "@/lib/prisma";

export async function logAction(usuario: string, descricao: string) {
  await prisma.log.create({ data: { usuario, descricao } });
}
