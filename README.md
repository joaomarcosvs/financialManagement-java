# Financial Management

Aplicação full stack para gestão financeira pessoal, com autenticação JWT, dashboard analítico, controle de contas, extrato transacional, categorias customizadas e metas de gastos.

## Visão geral

O projeto evoluiu de uma base backend para um produto web funcional, com frontend em AngularJS 1.x consumindo APIs protegidas por JWT. Hoje a aplicação já cobre o fluxo principal de uso financeiro: autenticação, lançamento e edição de transações, análise visual, gestão de contas, preferências de privacidade e planejamento por metas.

## Principais funcionalidades

- autenticação e cadastro de usuário;
- dashboard com saldo consolidado, resumo mensal, composição de gastos e acompanhamento financeiro por faixa de competência;
- extrato com cadastro, edição e exclusão de transações, incluindo suporte a recorrência já existente no domínio;
- gestão de contas financeiras;
- categorias globais e categorias customizadas por usuário, com cor e validações de uso;
- painel de configurações com modo de privacidade e preferências da aplicação;
- área de perfil e segurança;
- módulo de metas de gastos com criação, edição, exclusão e acompanhamento por categoria.

## Stack

### Backend

- Java 17
- Spring Boot 4
- Spring Security com JWT
- Spring Data JPA
- Flyway
- PostgreSQL
- Lombok

### Frontend

- AngularJS 1.8
- Angular UI Router
- Tailwind CSS
- Chart.js
- http-server para desenvolvimento local

## Estrutura do projeto

- `backend/`: API REST, segurança, regras de negócio e migrations do banco.
- `frontend/`: aplicação AngularJS com views, controllers, services, filtros e diretivas.
- `docs/`: documentação visual e diagramas do produto.

## Como executar localmente

### Pré-requisitos

- Java 17
- Node.js 18+
- PostgreSQL

### 1. Banco de dados

Crie o banco PostgreSQL e ajuste as credenciais em `backend/src/main/resources/application.properties` conforme seu ambiente.

Exemplo de base esperada hoje:

- banco: `financial_db`
- host: `localhost:5432`

### 2. Backend

No Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

No macOS ou Linux:

```bash
cd backend
./mvnw spring-boot:run
```

API disponível em `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Aplicação disponível em `http://localhost:4200`.

## Módulos entregues

| Módulo | Status | Destaques |
| --- | --- | --- |
| Autenticação | concluído | login, cadastro, JWT, interceptor e proteção de rotas |
| Dashboard | concluído | resumo mensal, doughnut por categoria, linha de acompanhamento financeiro e modo privacidade |
| Contas | concluído | cadastro, listagem e gestão visual das contas |
| Extrato | concluído | listagem mensal, criação, edição e exclusão com modal padrão |
| Categorias | concluído | CRUD de categorias customizadas e distinção entre globais e pessoais |
| Perfil e segurança | concluído | atualização de dados e preferências do usuário |
| Metas | concluído | metas nomeadas, progresso mensal, edição e exclusão |

## API principal

| Módulo | Rotas principais |
| --- | --- |
| Autenticação | `POST /api/v1/auth/login` |
| Usuários | `POST /api/v1/usuarios`, `GET /api/v1/usuarios/{id}` |
| Contas | `/api/v1/contas` |
| Categorias | `/api/v1/categorias` |
| Transações | `/api/v1/transacoes` |
| Dashboard | `/api/v1/dashboard/usuario/{usuarioId}`, `GET /api/v1/dashboard/tendencias` |
| Metas | `/api/v1/metas`, `GET /api/v1/metas/progresso` |

## Banco de dados e migrations

- as migrations oficiais ficam em `backend/src/main/resources/db/migration`;
- o projeto usa Flyway com política append-only para evolução de schema;
- o banco atual cobre usuários, contas, categorias, transações, auditoria e metas.

## Status do produto

O fluxo principal construído nas issues `#13` a `#27` já está implementado no frontend e no backend. O próximo ciclo natural do projeto é preparação de deploy, endurecimento operacional e ampliação da cobertura de testes.

## Documentação visual

O diagrama abaixo representa a visão funcional do sistema, preservando os principais atores e casos de uso do produto.

- Fonte editável: [docs/diagrama-casos-de-uso.drawio](docs/diagrama-casos-de-uso.drawio)
- Imagem exportada: [docs/diagrama-casos-de-uso.svg](docs/diagrama-casos-de-uso.svg)

![Diagrama de casos de uso do Financial Management](docs/diagrama-casos-de-uso.svg)

## Roadmap sugerido

- preparação de deploy e publicação em produção;
- ampliação de testes automatizados no backend e no frontend;
- evolução de observabilidade, CI/CD e hardening de configuração;
- futuras integrações complementares, como canais externos e automações.