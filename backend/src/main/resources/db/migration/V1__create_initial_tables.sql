-- V1__create_initial_tables.sql
-- Migracao inicial do sistema financeiro.
-- Estrategia:
-- 1. UUIDs com gen_random_uuid() para chaves primarias.
-- 2. timestamptz com default now() para auditoria.
-- 3. Constraints explicitas para integridade basica dos dados.
-- 4. Indices voltados aos filtros e joins mais frequentes.

-- Extensoes recomendadas para PostgreSQL.
create extension if not exists pgcrypto;
create extension if not exists citext;

-- Funcao utilitaria para manter atualizado_em sincronizado em updates.
create or replace function set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
	new.atualizado_em = now();
	return new;
end;
$$;

-- =====================================================
-- Tabela: usuarios
-- =====================================================
create table usuarios (
	id uuid primary key default gen_random_uuid(),
	nome varchar(150) not null,
	email citext not null,
	senha_hash varchar(255) not null,
	telefone varchar(20),
	criado_em timestamptz not null default now(),
	atualizado_em timestamptz not null default now(),
	constraint usuarios_nome_nao_vazio_chk check (btrim(nome) <> ''),
	constraint usuarios_email_nao_vazio_chk check (btrim(email::text) <> ''),
	constraint usuarios_senha_hash_nao_vazio_chk check (btrim(senha_hash) <> ''),
	constraint usuarios_telefone_nao_vazio_chk check (telefone is null or btrim(telefone) <> ''),
	constraint usuarios_email_unique unique (email),
	constraint usuarios_telefone_unique unique (telefone)
);

create trigger trg_usuarios_set_atualizado_em
before update on usuarios
for each row
execute function set_atualizado_em();

-- =====================================================
-- Tabela: contas
-- =====================================================
create table contas (
	id uuid primary key default gen_random_uuid(),
	nome varchar(120) not null,
	tipo varchar(30) not null,
	saldo_atual numeric(19, 2) not null default 0,
	criado_em timestamptz not null default now(),
	constraint contas_nome_nao_vazio_chk check (btrim(nome) <> ''),
	constraint contas_tipo_formato_chk check (btrim(tipo) <> '' and tipo = upper(btrim(tipo)))
);

-- =====================================================
-- Tabela: contas_usuarios
-- Compartilhamento de contas entre usuarios.
-- =====================================================
create table contas_usuarios (
	conta_id uuid not null,
	usuario_id uuid not null,
	permissao varchar(20) not null,
	constraint contas_usuarios_pk primary key (conta_id, usuario_id),
	constraint contas_usuarios_permissao_formato_chk check (
		btrim(permissao) <> '' and permissao = upper(btrim(permissao))
	),
	constraint contas_usuarios_conta_fk foreign key (conta_id)
		references contas (id)
		on delete cascade,
	constraint contas_usuarios_usuario_fk foreign key (usuario_id)
		references usuarios (id)
		on delete cascade
);

-- =====================================================
-- Tabela: categorias
-- =====================================================
create table categorias (
	id uuid primary key default gen_random_uuid(),
	nome varchar(120) not null,
	tipo varchar(20) not null,
	cor varchar(9),
	criado_em timestamptz not null default now(),
	constraint categorias_nome_nao_vazio_chk check (btrim(nome) <> ''),
	constraint categorias_tipo_valido_chk check (tipo in ('RECEITA', 'DESPESA')),
	constraint categorias_cor_hex_chk check (
		cor is null or cor ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$'
	),
	constraint categorias_nome_tipo_unique unique (nome, tipo)
);

-- =====================================================
-- Tabela: transacoes
-- Observacao: usuario_id e categoria_id usam RESTRICT para evitar
-- perda de historico financeiro por remocao de entidades referenciais.
-- =====================================================
create table transacoes (
	id uuid primary key default gen_random_uuid(),
	conta_id uuid not null,
	usuario_id uuid not null,
	categoria_id uuid not null,
	valor numeric(19, 2) not null,
	data_transacao date not null,
	descricao varchar(500),
	status varchar(30) not null,
	recorrente boolean not null default false,
	criado_em timestamptz not null default now(),
	constraint transacoes_valor_diferente_zero_chk check (valor <> 0),
	constraint transacoes_descricao_nao_vazia_chk check (descricao is null or btrim(descricao) <> ''),
	constraint transacoes_status_formato_chk check (
		btrim(status) <> '' and status = upper(btrim(status))
	),
	constraint transacoes_conta_fk foreign key (conta_id)
		references contas (id)
		on delete cascade,
	constraint transacoes_usuario_fk foreign key (usuario_id)
		references usuarios (id)
		on delete restrict,
	constraint transacoes_categoria_fk foreign key (categoria_id)
		references categorias (id)
		on delete restrict
);

-- =====================================================
-- Tabela: tags
-- =====================================================
create table tags (
	id uuid primary key default gen_random_uuid(),
	nome varchar(80) not null,
	constraint tags_nome_nao_vazio_chk check (btrim(nome) <> ''),
	constraint tags_nome_unique unique (nome)
);

-- =====================================================
-- Tabela: transacao_tags
-- Relacionamento N:N entre transacoes e tags.
-- =====================================================
create table transacao_tags (
	transacao_id uuid not null,
	tag_id uuid not null,
	constraint transacao_tags_pk primary key (transacao_id, tag_id),
	constraint transacao_tags_transacao_fk foreign key (transacao_id)
		references transacoes (id)
		on delete cascade,
	constraint transacao_tags_tag_fk foreign key (tag_id)
		references tags (id)
		on delete cascade
);

-- =====================================================
-- Indices adicionais para busca e relacionamento.
-- =====================================================

-- Facilita listagem de contas por usuario.
create index idx_contas_usuarios_usuario_id
	on contas_usuarios (usuario_id);

-- Facilita filtros por tipo de categoria.
create index idx_categorias_tipo
	on categorias (tipo);

-- Facilita buscas por data independente de conta ou usuario.
create index idx_transacoes_data_transacao
	on transacoes (data_transacao desc);

-- Facilita extratos e consultas por conta ordenadas por data.
create index idx_transacoes_conta_data
	on transacoes (conta_id, data_transacao desc);

-- Facilita consultas por usuario que criou a transacao.
create index idx_transacoes_usuario_data
	on transacoes (usuario_id, data_transacao desc);

-- Facilita joins e filtros por categoria.
create index idx_transacoes_categoria_id
	on transacoes (categoria_id);

-- Facilita encontrar todas as transacoes associadas a uma tag.
create index idx_transacao_tags_tag_id
	on transacao_tags (tag_id);