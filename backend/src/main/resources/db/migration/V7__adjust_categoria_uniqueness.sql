ALTER TABLE categorias
DROP CONSTRAINT IF EXISTS categorias_nome_tipo_unique;

ALTER TABLE categorias
DROP CONSTRAINT IF EXISTS categorias_nome_tipo_usuario_unique;

DROP INDEX IF EXISTS categorias_nome_tipo_usuario_unique;

CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id
ON categorias (usuario_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_globais_nome_tipo_unique
ON categorias (nome, tipo)
WHERE usuario_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_usuario_nome_tipo_unique
ON categorias (usuario_id, nome, tipo)
WHERE usuario_id IS NOT NULL;