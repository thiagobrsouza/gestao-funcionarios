#!/bin/sh
set -e

echo "Aplicando migrations do banco..."
npx prisma migrate deploy

echo "Garantindo usuário administrador..."
npm run db:seed

echo "Iniciando aplicação..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
