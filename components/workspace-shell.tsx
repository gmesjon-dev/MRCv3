import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  Inbox,
  FileText,
  Menu,
  Plus,
  Search,
  Settings2,
  Gauge,
  Users,
  UsersRound,
} from 'lucide-react';
import { ACCESS_LOGOUT_PATH, requireAuthenticatedUser } from '@/lib/access-auth';

const navigation = [
  { key: 'dashboard', label: 'Visão geral', href: '/', icon: LayoutDashboard },
  { key: 'tarefas', label: 'Minhas tarefas', href: '/tarefas', icon: CircleDot, count: 12 },
  { key: 'entradas', label: 'Entradas', href: '/entradas', icon: Inbox },
  { key: 'briefings', label: 'Briefings', href: '/briefings', icon: FileText },
  { key: 'trafego', label: 'Verificação de tráfego', href: '/trafego', icon: Gauge },
  { key: 'clientes', label: 'Clientes', href: '/clientes', icon: UsersRound },
  { key: 'servicos', label: 'Serviços', href: '/servicos', icon: BriefcaseBusiness },
  { key: 'equipe', label: 'Equipe', href: '/equipe', icon: Users },
  { key: 'projetos', label: 'Projetos', href: '/projetos', icon: FolderKanban },
  { key: 'calendario', label: 'Calendário', href: '/calendario', icon: CalendarDays },
  { key: 'relatorios', label: 'Relatórios', href: '/relatorios', icon: ChartNoAxesCombined },
];

export async function WorkspaceShell({ active, eyebrow, title, subtitle, children, actionLabel = 'Nova tarefa', actionHref = '/entradas?nova=1' }: { active: string; eyebrow: string; title: string; subtitle: string; children: ReactNode; actionLabel?: string; actionHref?: string }) {
  const route = active === 'dashboard' ? '/' : `/${active}`;
  const user = await requireAuthenticatedUser(route);
  const initials = user.displayName.split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-white/10 bg-[#111111] text-white lg:flex">
        <a href="/" className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5">
          <Image src="/mrc-logo.png" alt="Logo do Grupo MRC Digital" width={40} height={40} className="size-10 rounded-xl object-cover shadow-lg shadow-black/20" />
          <span><span className="block text-[14px] font-bold tracking-tight">Grupo MRC</span><span className="block text-[10px] uppercase tracking-[0.18em] text-amber-300">Digital</span></span>
        </a>
        <nav className="flex-1 px-3 py-5" aria-label="Navegação principal">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          <div className="space-y-1">{navigation.map(({ key, label, href, icon: Icon, count }) => <a key={key} href={href} className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition ${active === key ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className={`size-[17px] ${active === key ? 'text-amber-300' : ''}`} />{label}{count ? <span className="ml-auto rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-200">{count}</span> : null}</a>)}</div>
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Gestão</p>
          <a href="/administracao" className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium ${active === 'administracao' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Settings2 className="size-[17px]" /> Administração</a>
        </nav>
        <a href={ACCESS_LOGOUT_PATH} className="m-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-300 text-xs font-bold">{initials || 'MRC'}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user.displayName}</p><p className="truncate text-[10px] text-slate-400">Administrador · sair</p></div><ChevronDown className="size-4 text-slate-500" /></div></a>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button className="grid size-9 place-items-center rounded-lg border border-slate-200 lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button>
          <div className="relative hidden w-full max-w-md sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-16 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" placeholder="Buscar tarefas, clientes, projetos..." /><kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</kbd></div>
          <div className="ml-auto flex items-center gap-2"><button className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Notificações"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" /></button><a href={actionHref} className="flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-3.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-200"><Plus className="size-4" /><span className="hidden sm:inline">{actionLabel}</span></a></div>
        </header>
        <div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
          <section className="mb-7"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p></section>
          {children}
        </div>
      </div>
    </main>
  );
}
