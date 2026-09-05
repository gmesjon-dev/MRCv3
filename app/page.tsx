import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  FolderKanban,
  FileText,
  Gauge,
  LayoutDashboard,
  Inbox,
  Menu,
  Plus,
  Search,
  Settings2,
  Users,
  UsersRound,
} from 'lucide-react';
import Image from 'next/image';
import { requireAuthenticatedUser } from '@/lib/access-auth';

const navItems = [
  { label: 'Visão geral', icon: LayoutDashboard, active: true, href: '/' },
  { label: 'Minhas tarefas', icon: CircleDot, href: '/tarefas' },
  { label: 'Entradas', icon: Inbox, href: '/entradas' },
  { label: 'Briefings', icon: FileText, href: '/briefings' },
  { label: 'Verificação de tráfego', icon: Gauge, href: '/trafego' },
  { label: 'Clientes', icon: UsersRound, href: '/clientes' },
  { label: 'Serviços', icon: BriefcaseBusiness, href: '/servicos' },
  { label: 'Equipe', icon: Users, href: '/equipe' },
  { label: 'Projetos', icon: FolderKanban, href: '/projetos' },
  { label: 'Calendário', icon: CalendarDays, href: '/calendario' },
];

const metrics = [
  { label: 'Clientes ativos', value: '24', note: '+2 este mês', dot: 'bg-amber-400' },
  { label: 'Tarefas abertas', value: '68', note: '12 para hoje', dot: 'bg-sky-500' },
  { label: 'Em andamento', value: '19', note: '7 colaboradores', dot: 'bg-amber-500' },
  { label: 'Atrasadas', value: '6', note: 'Requer atenção', dot: 'bg-rose-500', danger: true },
];

const tasks = [
  { title: 'Campanha de primavera', client: 'Aurora Studio', due: 'Hoje, 16:00', status: 'Em produção', owner: 'ML', color: 'bg-amber-100 text-amber-800' },
  { title: 'Landing page — lançamento', client: 'Nexo Tecnologia', due: 'Hoje, 18:30', status: 'Aguardando aprovação', owner: 'RS', color: 'bg-amber-100 text-amber-700' },
  { title: 'Criativos para Meta Ads', client: 'Casa Oliva', due: 'Amanhã', status: 'Alteração solicitada', owner: 'JC', color: 'bg-rose-100 text-rose-700' },
  { title: 'Calendário editorial — setembro', client: 'Verdejar', due: '04 set', status: 'Briefing enviado', owner: 'AM', color: 'bg-sky-100 text-sky-700' },
];

const people = [
  { name: 'Marina Lima', role: 'Design', initials: 'ML', open: 7, active: 3, late: 1, percent: 74 },
  { name: 'Rafael Souza', role: 'Web', initials: 'RS', open: 5, active: 2, late: 0, percent: 58 },
  { name: 'João Costa', role: 'Tráfego', initials: 'JC', open: 8, active: 2, late: 2, percent: 82 },
];

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await requireAuthenticatedUser('/');
  const firstName = user.displayName.split(/\s|@/)[0] || 'você';
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-white/10 bg-[#111111] text-white lg:flex">
        <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5">
          <Image src="/mrc-logo.png" alt="Logo do Grupo MRC Digital" width={40} height={40} className="size-10 rounded-xl object-cover shadow-lg shadow-black/20" />
          <div><p className="text-[14px] font-bold tracking-tight">Grupo MRC</p><p className="text-[10px] uppercase tracking-[0.18em] text-amber-300">Digital</p></div>
        </div>
        <nav className="flex-1 px-3 py-5" aria-label="Navegação principal">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          <div className="space-y-1">
            {navItems.map(({ label, icon: Icon, active, href }) => (
              <a key={label} href={href} className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition ${active ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon className={`size-[17px] ${active ? 'text-amber-300' : ''}`} />{label}
                {label === 'Minhas tarefas' && <span className="ml-auto rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-200">12</span>}
              </a>
            ))}
          </div>
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Gestão</p>
          <a href="/administracao" className="flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-slate-400 hover:bg-white/5 hover:text-white"><Settings2 className="size-[17px]" /> Administração</a>
        </nav>
        <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-300 text-xs font-bold">LG</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">Luiz Gustavo</p><p className="truncate text-[10px] text-slate-400">Administrador</p></div><ChevronDown className="size-4 text-slate-500" /></div>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button className="grid size-9 place-items-center rounded-lg border border-slate-200 lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button>
          <div className="relative hidden w-full max-w-md sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-16 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100" placeholder="Buscar tarefas, clientes, projetos..." /><kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</kbd></div>
          <div className="ml-auto flex items-center gap-2"><button className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Notificações"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" /></button><a href="/entradas?nova=1" className="flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-3.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-200 hover:bg-amber-300"><Plus className="size-4" /><span className="hidden sm:inline">Nova entrada</span></a></div>
        </header>

        <div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
          <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="mb-1 text-xs font-semibold text-amber-700">TERÇA-FEIRA, 1 DE SETEMBRO</p><h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Bom dia, {firstName} <span aria-hidden>👋</span></h1><p className="mt-1 text-sm text-slate-500">Aqui está o ritmo da agência hoje.</p></div>
            <button className="flex h-9 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm sm:self-auto"><CalendarDays className="size-4" /> Esta semana <ChevronDown className="size-3.5" /></button>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
            {metrics.map((metric) => <article key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"><div className="flex items-start justify-between"><p className="text-xs font-semibold text-slate-500">{metric.label}</p><span className={`size-2 rounded-full ${metric.dot}`} /></div><p className="mt-3 text-[30px] font-bold tracking-[-0.04em]">{metric.value}</p><p className={`mt-1 text-[11px] font-medium ${metric.danger ? 'text-rose-600' : 'text-slate-400'}`}>{metric.note}</p></article>)}
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.75fr)]">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold">Prioridades de hoje</h2><p className="mt-0.5 text-[11px] text-slate-400">4 tarefas precisam da sua atenção</p></div><button className="text-xs font-semibold text-amber-700">Ver todas</button></div>
              <div>{tasks.map((task) => <div key={task.title} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"><div className="flex min-w-0 items-center gap-3"><button className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-slate-300 hover:border-amber-400" aria-label={`Concluir ${task.title}`} /><div className="min-w-0"><p className="truncate text-[13px] font-semibold">{task.title}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{task.client}</p></div></div><span className={`w-fit rounded-lg px-2 py-1 text-[10px] font-semibold ${task.color}`}>{task.status}</span><div className="flex items-center justify-between gap-3 sm:justify-end"><span className="flex items-center gap-1 text-[11px] text-slate-500"><Clock3 className="size-3.5" /> {task.due}</span><span className="grid size-7 place-items-center rounded-full bg-slate-900 text-[9px] font-bold text-white">{task.owner}</span></div></div>)}</div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Carga da equipe</h2><p className="mt-0.5 text-[11px] text-slate-400">Quem está fazendo o quê</p></div><button className="text-xs font-semibold text-amber-700">Detalhes</button></div>
              <div className="mt-5 space-y-5">{people.map((person) => <div key={person.name}><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">{person.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-semibold">{person.name}</p><p className="text-[10px] text-slate-400">{person.role}</p></div><span className="text-[10px] font-medium text-slate-500">{person.open} abertas</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300" style={{ width: `${person.percent}%` }} /></div></div></div><div className="ml-12 mt-2 flex gap-3 text-[10px] text-slate-400"><span>{person.active} em andamento</span><span className={person.late ? 'text-rose-500' : ''}>{person.late} atrasadas</span></div></div>)}</div>
            </section>
          </div>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200/80 bg-[#181818] p-5 text-white"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Fluxo de trabalho</h2><p className="mt-0.5 text-[11px] text-slate-400">Distribuição das tarefas abertas</p></div><CheckCircle2 className="size-5 text-amber-300" /></div><div className="mt-6 flex h-28 items-end gap-3">{[42, 68, 51, 84, 62, 37, 56].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-amber-500 to-yellow-300/90" style={{ height: `${height}%` }} />)}</div><div className="mt-3 flex justify-between text-[9px] uppercase tracking-wider text-slate-500"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div></article>
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Próximos prazos</h2><p className="mt-0.5 text-[11px] text-slate-400">Entregas nos próximos 5 dias</p></div><CalendarDays className="size-5 text-slate-400" /></div><div className="mt-5 grid grid-cols-5 gap-2 text-center">{['HOJE', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day, index) => <div key={day} className={`rounded-xl border px-1 py-3 ${index === 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-100'}`}><p className="text-[9px] font-semibold text-slate-400">{day}</p><p className="mt-1 text-lg font-bold">{index + 1}</p><span className={`mx-auto mt-2 block size-1.5 rounded-full ${index < 3 ? 'bg-amber-400' : 'bg-slate-200'}`} /></div>)}</div></article>
          </section>
        </div>
      </div>
    </main>
  );
}
