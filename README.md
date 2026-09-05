# Grupo MRC Digital

Sistema operacional interno da agência. Arquitetura completa em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Stack: [vinext](https://github.com/cloudflare/vinext) (Next.js App Router reimplementado sobre Vite) rodando em Cloudflare Workers, com D1 (SQLite) via Drizzle ORM, R2 para arquivos, e Cloudflare Access para autenticação.

## Desenvolvimento local

Requer Node.js 22+ e pnpm.

```bash
pnpm install
cp .dev.vars.example .dev.vars   # edite LOCAL_DEV_USER_EMAIL com seu e-mail
pnpm dev
```

Sem o Cloudflare Access na frente do Worker localmente, `LOCAL_DEV_USER_EMAIL` simula um usuário autenticado (só funciona em build de desenvolvimento, nunca em produção).

## Deploy no Cloudflare — configuração inicial (uma vez só)

### 1. Cloudflare: crie os recursos

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create mrc-digital-db
pnpm exec wrangler r2 bucket create mrc-digital-files
```

Copie o `database_id` retornado pelo primeiro comando para `wrangler.jsonc` (campo `d1_databases[0].database_id`).

### 2. Cloudflare Access: proteja o Worker

No painel Cloudflare Zero Trust → Access → Applications, crie uma aplicação apontando para o domínio que vai servir o Worker (custom domain; `*.workers.dev` não é recomendado para produção). Defina a política de quem pode entrar (e-mails da equipe, domínio do Google Workspace, etc.).

Depois de criar a aplicação, copie:
- **Team domain** (ex: `suaempresa.cloudflareaccess.com`) → `wrangler.jsonc` em `vars.CF_ACCESS_TEAM_DOMAIN`.
- **Application Audience (AUD) Tag** (na página da aplicação) → `vars.CF_ACCESS_AUD`.

### 3. Rode as migrations do banco

```bash
pnpm exec wrangler d1 migrations apply DB --remote
```

### 4. Bootstrap do primeiro administrador

Não existe tela de cadastro — o primeiro usuário precisa ser inserido direto no banco. Rode (substituindo e-mail e nome):

```bash
pnpm exec wrangler d1 execute DB --remote --command "
INSERT INTO roles (id, name, created_at, updated_at) VALUES ('role_admin', 'Administrador', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO users (id, external_auth_id, email, name, role_id, status, created_at, updated_at)
VALUES ('user_admin', 'voce@suaempresa.com.br', 'voce@suaempresa.com.br', 'Seu Nome', 'role_admin', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO permissions (id, key, name, module, created_at, updated_at) VALUES
  ('perm_tasks_view', 'tasks.view', 'Ver tarefas', 'tasks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('perm_tasks_create', 'tasks.create', 'Criar tarefas', 'tasks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO role_permissions (role_id, permission_id, allowed) VALUES
  ('role_admin', 'perm_tasks_view', 1),
  ('role_admin', 'perm_tasks_create', 1);
"
```

`external_auth_id` precisa ser exatamente o e-mail com que você vai entrar pelo Cloudflare Access. A maioria das rotas (`lib/work-access.ts`) só depende do nome da função (`Administrador` dá acesso total); só as rotas de tarefas (`app/api/tasks`) usam chaves de permissão explícitas — adicione novas linhas em `permissions`/`role_permissions` conforme criar mais funções e telas administráveis (ver seção 8 de [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).

### 5. GitHub: crie o repositório e envie o código

Este ambiente não tem `git` instalado — rode isto no seu computador (ou peça para eu rodar assim que `git` estiver disponível no PATH):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### 6. GitHub Actions: adicione os secrets

Em Settings → Secrets and variables → Actions, no repositório, adicione:
- `CLOUDFLARE_API_TOKEN` — crie em dash.cloudflare.com/profile/api-tokens usando o template **Edit Cloudflare Workers**.
- `CLOUDFLARE_ACCOUNT_ID` — está na URL do painel Cloudflare (`dash.cloudflare.com/<account-id>`) ou em `wrangler whoami`.

### Pronto: deploy automático

A partir daqui, todo `git push` para `main` roda [.github/workflows/deploy.yml](.github/workflows/deploy.yml): instala dependências, builda, aplica migrations pendentes no D1 remoto e publica o Worker.

Para rodar manualmente do seu computador: `pnpm run deploy`.
