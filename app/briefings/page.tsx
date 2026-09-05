import { BriefingsView } from '@/components/briefings-view';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function BriefingsPage() {
  return <WorkspaceShell active="briefings" eyebrow="Social Media → Designer" title="Briefings" subtitle="Copies, orientações e referências prontas para a criação das imagens." actionLabel="Novo briefing" actionHref="/briefings?novo=1"><BriefingsView /></WorkspaceShell>;
}
