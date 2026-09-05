import { CalendarView } from '@/components/module-views';
import { WorkspaceShell } from '@/components/workspace-shell';

export const dynamic = 'force-dynamic';

export default function CalendarPage() { return <WorkspaceShell active="calendario" eyebrow="Planejamento" title="Calendário" subtitle="Visualize prazos e entregas da agência por dia, semana ou mês."><CalendarView /></WorkspaceShell>; }
