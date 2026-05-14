ALTER TABLE contas
ADD COLUMN icone VARCHAR(50);

ALTER TABLE contas
ADD CONSTRAINT contas_icone_nao_vazio_chk
CHECK (icone IS NULL OR btrim(icone) <> '');