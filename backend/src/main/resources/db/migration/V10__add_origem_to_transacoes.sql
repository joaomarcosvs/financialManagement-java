-- V10: Adiciona coluna de origem para rastreamento da fonte da transacao

ALTER TABLE transacoes
    ADD COLUMN origem VARCHAR(20) NOT NULL DEFAULT 'MANUAL';

ALTER TABLE transacoes
    ADD CONSTRAINT transacoes_origem_valido_chk
    CHECK (origem IN ('MANUAL', 'WHATSAPP', 'IMPORTACAO'));

CREATE INDEX idx_transacoes_origem
    ON transacoes (origem);
