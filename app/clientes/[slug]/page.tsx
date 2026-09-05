import { ClientProfileView } from '@/components/client-profile-view';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default async function ClientWorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WorkspaceShell active="clientes" eyebrow="Workspace do cliente" title="Ficha do cliente" subtitle="Informações operacionais, responsáveis e verificações em uma única visão." actionLabel="Novo briefing" actionHref="/briefings?novo=1"><ClientProfileView clientId={slug} /></WorkspaceShell>;
}
