import { TeamView } from '@/components/module-views';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function TeamPage() { return <WorkspaceShell active="equipe" eyebrow="Pessoas" title="Equipe" subtitle="Veja a carga, os atrasos e o trabalho em andamento de cada colaborador." actionLabel="Novo usuário"><TeamView /></WorkspaceShell>; }
