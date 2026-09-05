import { AdminView } from '@/components/module-views';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function AdminPage() { return <WorkspaceShell active="administracao" eyebrow="Configurações" title="Administração" subtitle="Personalize pessoas, permissões, estrutura, workflows e identidade da plataforma." actionLabel="Ação rápida"><AdminView /></WorkspaceShell>; }
