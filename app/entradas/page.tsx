import { WorkEntriesView } from '@/components/work-entries-view';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function EntriesPage() {
  return <WorkspaceShell active="entradas" eyebrow="Fluxo entre equipes" title="Entradas" subtitle="Encaminhe demandas pela tag do setor e acompanhe tudo por ano, mês e dia." actionLabel="Nova entrada" actionHref="/entradas?nova=1"><WorkEntriesView /></WorkspaceShell>;
}
