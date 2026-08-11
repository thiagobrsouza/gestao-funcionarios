-- Promove o usuário "admin" pré-existente (criado antes do campo "role"
-- existir) para role = 'admin'. Em bancos novos não há efeito.
UPDATE "users" SET "role" = 'admin' WHERE "username" = 'admin';
