import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = "admin";
  const password = "4dm!n2026";
  const passwordHash = await bcrypt.hash(password, 10);

  // "update: {}" garante que o usuário exista sem sobrescrever a senha
  // em restarts futuros do container (ex.: depois que o admin a trocar).
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash, role: "admin" },
  });

  console.log(`Usuário "${username}" pronto.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
