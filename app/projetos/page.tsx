import { ProjectsView } from '@/components/module-views';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function ProjectsPage() { return <WorkspaceShell active="projetos" eyebrow="Portfólio" title="Projetos" subtitle="Acompanhe entregas, prazos e progresso em todos os clientes." actionLabel="Novo projeto"><ProjectsView /></WorkspaceShell>; }
