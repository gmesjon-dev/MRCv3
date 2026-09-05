import { TrafficVerificationView } from '@/components/traffic-verification-view';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function TrafficPage() {
  return <WorkspaceShell active="trafego" eyebrow="Gestor de Tráfego" title="Verificação de clientes" subtitle="Acompanhe Google, Meta, resultados e os próximos ajustes de cada conta." actionLabel="Nova entrada" actionHref="/entradas?nova=1"><TrafficVerificationView /></WorkspaceShell>;
}
