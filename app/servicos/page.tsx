import { ServicesView } from '@/components/services-view';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  return <WorkspaceShell active="servicos" eyebrow="Catálogo" title="Serviços" subtitle="Cadastre os serviços oferecidos e associe cada um ao setor responsável." actionLabel="Novo serviço" actionHref="/servicos?novo=1"><ServicesView /></WorkspaceShell>;
}
