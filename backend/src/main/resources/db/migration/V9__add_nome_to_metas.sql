ALTER TABLE metas
ADD COLUMN nome VARCHAR(150);

UPDATE metas m
SET nome = c.nome
FROM categorias c
WHERE c.id = m.categoria_id
  AND (m.nome IS NULL OR btrim(m.nome) = '');

ALTER TABLE metas
ALTER COLUMN nome SET NOT NULL;

ALTER TABLE metas
ADD CONSTRAINT metas_nome_nao_vazio_chk CHECK (btrim(nome) <> '');