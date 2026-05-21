-- V12__seed_categorias_padrao.sql
-- Inserts global default categories (usuario_id IS NULL).
-- These are visible to every user via CategoriaService.listarPorUsuario().
-- Uses NOT EXISTS to skip categories that already exist globally.

INSERT INTO categorias (id, nome, tipo, cor, criado_em, usuario_id)
SELECT gen_random_uuid(), v.nome, v.tipo, v.cor, NOW(), NULL
FROM (VALUES
    ('Alimentação',   'DESPESA', '#ef4444'),
    ('Moradia',       'DESPESA', '#f97316'),
    ('Transporte',    'DESPESA', '#eab308'),
    ('Saúde',         'DESPESA', '#22c55e'),
    ('Educação',      'DESPESA', '#3b82f6'),
    ('Lazer',         'DESPESA', '#a855f7'),
    ('Vestuário',     'DESPESA', '#ec4899'),
    ('Tecnologia',    'DESPESA', '#06b6d4'),
    ('Assinaturas',   'DESPESA', '#8b5cf6'),
    ('Restaurante',   'DESPESA', '#f59e0b'),
    ('Mercado',       'DESPESA', '#10b981'),
    ('Outros',        'DESPESA', '#71717a'),
    ('Salário',       'RECEITA', '#10b981'),
    ('Freelance',     'RECEITA', '#22c55e'),
    ('Investimentos', 'RECEITA', '#3b82f6'),
    ('Outros',        'RECEITA', '#6b7280')
) AS v(nome, tipo, cor)
WHERE NOT EXISTS (
    SELECT 1 FROM categorias c
    WHERE c.nome = v.nome
      AND c.tipo = v.tipo
      AND c.usuario_id IS NULL
);
