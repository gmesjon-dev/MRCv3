import { TasksBoard } from '@/components/tasks-board';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  return <WorkspaceShell active="tarefas" eyebrow="Produção" title="Minhas tarefas" subtitle="Organize suas entregas, mova o trabalho pelo fluxo e acompanhe aprovações sem perder contexto."><TasksBoard /></WorkspaceShell>;
}
