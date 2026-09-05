import { ReportsView } from '@/components/module-views';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function ReportsPage() { return <WorkspaceShell active="relatorios" eyebrow="Inteligência" title="Relatórios" subtitle="Meça produtividade, prazo, volume e qualidade do fluxo por período."><ReportsView /></WorkspaceShell>; }
