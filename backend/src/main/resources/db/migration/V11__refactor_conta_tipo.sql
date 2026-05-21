-- V11__refactor_conta_tipo.sql
-- Refactors account type from (DEBITO/CREDITO/POUPANCA) to
-- tipo (CORRENTE/POUPANCA) + modalidade (DEBITO/CREDITO/DEBITO_CREDITO).

ALTER TABLE contas
    ADD COLUMN modalidade VARCHAR(20);

-- Migrate: DEBITO and CREDITO become CORRENTE with the respective modalidade
UPDATE contas SET tipo = 'CORRENTE', modalidade = 'DEBITO'  WHERE tipo = 'DEBITO';
UPDATE contas SET tipo = 'CORRENTE', modalidade = 'CREDITO' WHERE tipo = 'CREDITO';
-- POUPANCA stays as POUPANCA, modalidade remains NULL

-- Enforce valid values
ALTER TABLE contas
    DROP CONSTRAINT IF EXISTS contas_tipo_formato_chk;

ALTER TABLE contas
    ADD CONSTRAINT contas_tipo_valido_chk CHECK (tipo IN ('CORRENTE', 'POUPANCA'));

ALTER TABLE contas
    ADD CONSTRAINT contas_modalidade_valido_chk
    CHECK (modalidade IS NULL OR modalidade IN ('DEBITO', 'CREDITO', 'DEBITO_CREDITO'));

ALTER TABLE contas
    ADD CONSTRAINT contas_modalidade_regra_chk
    CHECK (
        (tipo = 'POUPANCA' AND modalidade IS NULL)
        OR (tipo = 'CORRENTE' AND modalidade IS NOT NULL)
    );
