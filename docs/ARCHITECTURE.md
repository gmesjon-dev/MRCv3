# Grupo MRC Digital — arquitetura do sistema

## 1. Leitura do produto

O Grupo MRC Digital usa este sistema operacional interno para organizar a agência. O eixo principal não é a tarefa isolada, e sim a cadeia **cliente → projeto → solicitação/briefing → tarefa → produção → aprovação → alteração ou conclusão**. Cargos, departamentos, permissões, prioridades, status, módulos e campos personalizados são dados administráveis.

## 2. Arquitetura

- Interface: React, TypeScript, Tailwind CSS e componentes acessíveis reutilizáveis.
- Aplicação: App Router com páginas renderizadas no servidor e ilhas interativas no cliente.
- API: handlers de rota e serviços por domínio; toda mutação repete a autorização no servidor.
- Dados: Drizzle ORM sobre banco relacional D1/SQLite no Sites. O modelo permanece relacional e pode ser migrado para PostgreSQL/Prisma caso a implantação final exija infraestrutura própria.
- Arquivos: bytes em R2; metadados, autoria e vínculos no banco relacional.
- Identidade: autenticação segura da plataforma, com identidade externa mapeada para `User` interno.
- Auditoria: `ActivityLog` imutável para usuários comuns, com estado anterior/posterior em JSON.

## 3. Estrutura de pastas

```text
app/                 rotas, layouts e endpoints
components/          shell, módulos e componentes reutilizáveis
components/ui/       controles acessíveis de baixo nível
db/                  schema, acesso ao banco e migrations
docs/                arquitetura e decisões
hooks/               comportamento reutilizável do cliente
lib/                 autorização, validação, dados e utilitários
public/              identidade e arquivos públicos
types/               contratos de domínio
```

## 4. Modelo de dados

Identidade e autorização: `User`, `Role`, `Permission`, `RolePermission`, `Department`.

Operação: `Client`, `ClientStatus`, `ClientModule`, `ClientOperation`, `Project`, `Task`, `TaskType`, `TaskStatus`, `Priority`, `Workflow`, `WorkflowStep`, `Service`, `WorkEntry`.

Colaboração: `Briefing`, `CreativeBriefing`, `Comment`, `CommentMention`, `Attachment`, `Checklist`, `ChecklistItem`, `Tag`, `TaskTag`, `TaskWatcher`.

Plataforma: `Notification`, `ActivityLog`, `CustomField`, `CustomFieldValue`, `PlatformSetting`.

Índices cobrem consultas críticas: tarefas por responsável/status, prazos, cliente/projeto, notificações não lidas e histórico por entidade.

## 5. Telas

1. Acesso e recuperação de conta.
2. Dashboard geral e dashboard pessoal.
3. Minhas tarefas: lista, Kanban, semana e filtros.
4. Clientes e workspace do cliente com módulos configuráveis.
5. Projetos e progresso por projeto.
6. Briefings e solicitações por tipo.
7. Detalhe da tarefa: descrição, checklist, comentários, anexos e histórico.
8. Equipe, perfil e “fazendo agora”.
9. Calendário diário, semanal e mensal.
10. Carga de trabalho e relatórios.
11. Notificações e busca global.
12. Administração de usuários, funções, permissões, departamentos, tipos, status, prioridades, tags, campos e identidade visual.

## 6. Componentes reutilizáveis

`AppShell`, `Sidebar`, `GlobalSearch`, `NotificationCenter`, `MetricCard`, `StatusBadge`, `PriorityBadge`, `UserAvatar`, `FilterBar`, `TaskCard`, `TaskTable`, `KanbanBoard`, `CalendarGrid`, `TaskDrawer`, `CommentComposer`, `ChecklistEditor`, `ActivityTimeline`, `AttachmentUploader`, `WorkloadMeter`, `PermissionMatrix`, `EmptyState` e `ConfirmDialog`.

## 7. Autenticação

Rotas internas exigem identidade autenticada. O ID externo é mapeado para um usuário interno; assim, identidade e cargo/permissões ficam separados. A API rejeita requisições sem identidade, usuários inativos e ações sem permissão. Saída de sessão usa o fluxo da plataforma. Recuperação e políticas de credencial ficam sob responsabilidade do provedor de identidade, evitando armazenamento de senhas pela aplicação.

## 8. RBAC

Permissões usam chaves estáveis como `clients.view`, `tasks.create`, `tasks.update.any`, `reports.view` e `admin.users.manage`. Cada função recebe uma matriz de permissões. O frontend oculta ações indisponíveis, mas a decisão autoritativa ocorre sempre no servidor. Funções como Designer e Social Media são registros iniciais editáveis.

## 9. Fluxo de tarefas

Cada tarefa aponta opcionalmente para um workflow. `WorkflowStep` ordena os status, marca etapas que exigem aprovação e pode limitar a transição a uma função. Uma transição válida atualiza a tarefa, cria notificação e grava auditoria na mesma unidade lógica. “Solicitar alteração” exige comentário; “Aprovar” pode concluir ou avançar ao próximo passo conforme o workflow.

## 10. Segurança e produção

- validação de payloads e limites no servidor;
- consultas parametrizadas pelo ORM;
- autorização em toda leitura e mutação;
- uploads com tipo/tamanho validados e chave não previsível;
- proteção do provedor contra CSRF e abuso de login;
- versionamento otimista da tarefa para evitar sobrescritas concorrentes;
- exclusão lógica de tarefas e trilha de auditoria;
- rate limit por identidade/IP para endpoints sensíveis;
- sem segredos no cliente ou no repositório.

## 11. Etapas de entrega

Fase 1 estabelece base, banco, identidade e shell. Fases 2–5 entregam administração, clientes, projetos, tarefas, briefings e colaboração. Fases 6–8 adicionam visões, painéis, notificações e customização. Fase 9 conclui responsividade, acessibilidade, testes de autorização, carga, segurança e observabilidade.
