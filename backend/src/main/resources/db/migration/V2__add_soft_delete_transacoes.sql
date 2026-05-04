-- V2: Adiciona coluna para Exclusão Lógica (Soft Delete)
ALTER TABLE transacoes ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;