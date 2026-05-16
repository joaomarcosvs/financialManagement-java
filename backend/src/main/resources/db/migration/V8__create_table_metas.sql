CREATE TABLE metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    categoria_id UUID NOT NULL,
    valor_limite NUMERIC(15, 2) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT metas_valor_limite_positivo_chk CHECK (valor_limite > 0),
    CONSTRAINT metas_usuario_fk FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT metas_categoria_fk FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    CONSTRAINT metas_usuario_categoria_unique UNIQUE (usuario_id, categoria_id)
);

CREATE INDEX idx_metas_usuario_id
ON metas (usuario_id);