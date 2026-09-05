import { ClientsView } from '@/components/clients-view';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function ClientsPage() { return <WorkspaceShell active="clientes" eyebrow="Relacionamento" title="Clientes" subtitle="Acesse o workspace, os projetos e todas as entregas de cada conta." actionLabel="Novo cliente" actionHref="/clientes?novo=1"><ClientsView /></WorkspaceShell>; }
