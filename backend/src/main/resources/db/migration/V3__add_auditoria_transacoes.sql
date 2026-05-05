-- V3: Adiciona coluna de auditoria de atualizacao para transacoes

ALTER TABLE transacoes
    ADD COLUMN atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER trg_transacoes_set_atualizado_em
BEFORE UPDATE ON transacoes
FOR EACH ROW
EXECUTE FUNCTION set_atualizado_em();