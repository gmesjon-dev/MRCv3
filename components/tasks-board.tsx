'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronDown, Clock3, Filter, LayoutList, Plus, Rows3, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Status = 'A fazer' | 'Em andamento' | 'Aguardando aprovação' | 'Alteração solicitada' | 'Concluído';
type Task = { id: number; title: string; client: string; project: string; owner: string; due: string; priority: 'Normal' | 'Alta' | 'Urgente'; status: Status; progress: number };

const initialTasks: Task[] = [
  { id: 1, title: 'Calendário editorial — setembro', client: 'Verdejar', project: 'Redes sociais', owner: 'AM', due: 'Hoje', priority: 'Alta', status: 'A fazer', progress: 1 },
  { id: 2, title: 'Campanha de primavera', client: 'Aurora Studio', project: 'Campanha sazonal', owner: 'ML', due: 'Hoje, 16:00', priority: 'Urgente', status: 'Em andamento', progress: 4 },
  { id: 3, title: 'Landing page — lançamento', client: 'Nexo Tecnologia', project: 'Novo produto', owner: 'RS', due: 'Hoje, 18:30', priority: 'Alta', status: 'Aguardando aprovação', progress: 6 },
  { id: 4, title: 'Criativos para Meta Ads', client: 'Casa Oliva', project: 'Performance', owner: 'JC', due: 'Amanhã', priority: 'Urgente', status: 'Alteração solicitada', progress: 3 },
  { id: 5, title: 'Configurar conversão Google Ads', client: 'Lumina', project: 'Aquisição', owner: 'JC', due: '04 set', priority: 'Normal', status: 'Em andamento', progress: 2 },
  { id: 6, title: 'Revisar apresentação comercial', client: 'Atlas Co.', project: 'Institucional', owner: 'ML', due: '05 set', priority: 'Normal', status: 'Concluído', progress: 5 },
];

const statuses: Status[] = ['A fazer', 'Em andamento', 'Aguardando aprovação', 'Alteração solicitada', 'Concluído'];
const statusTone: Record<Status, string> = { 'A fazer': 'bg-slate-400', 'Em andamento': 'bg-amber-400', 'Aguardando aprovação': 'bg-amber-500', 'Alteração solicitada': 'bg-rose-500', Concluído: 'bg-emerald-500' };

export function TasksBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<'kanban' | 'lista'>('kanban');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);
  const filtered = useMemo(() => tasks.filter((task) => `${task.title} ${task.client}`.toLowerCase().includes(query.toLowerCase())), [tasks, query]);

  function moveTask(id: number, status: Status) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task));
  }

  function addTask(form: FormData) {
    const title = String(form.get('title') || '').trim();
    if (!title) return;
    setTasks((current) => [{ id: Date.now(), title, client: String(form.get('client')), project: 'Solicitação avulsa', owner: 'LG', due: String(form.get('due') || 'Sem prazo'), priority: 'Normal', status: 'A fazer', progress: 0 }, ...current]);
    setOpen(false);
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:flex-row sm:items-center">
        <div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => setView('kanban')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${view === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><Rows3 className="size-4" /> Kanban</button><button onClick={() => setView('lista')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${view === 'lista' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><LayoutList className="size-4" /> Lista</button></div>
        <div className="relative sm:ml-auto sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar tarefas" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" /></div>
        <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600"><Filter className="size-4" /> Filtros <ChevronDown className="size-3" /></button>
        <button onClick={() => setOpen(true)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-semibold text-slate-950"><Plus className="size-4" /> Nova tarefa</button>
      </div>

      {view === 'kanban' ? (
        <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
          {statuses.map((status) => <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moveTask(Number(event.dataTransfer.getData('task')), status)} className="min-h-[430px] min-w-[260px] rounded-2xl bg-slate-100/80 p-3"><div className="mb-3 flex items-center gap-2 px-1"><span className={`size-2 rounded-full ${statusTone[status]}`} /><h2 className="text-xs font-bold">{status}</h2><span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">{filtered.filter((task) => task.status === status).length}</span></div><div className="space-y-3">{filtered.filter((task) => task.status === status).map((task) => <article key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData('task', String(task.id))} onClick={() => setSelected(task)} className="cursor-grab rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"><div className="flex items-start justify-between gap-2"><span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${task.priority === 'Urgente' ? 'bg-rose-50 text-rose-600' : task.priority === 'Alta' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span><span className="grid size-6 place-items-center rounded-full bg-slate-900 text-[8px] font-bold text-white">{task.owner}</span></div><h3 className="mt-3 text-xs font-semibold leading-relaxed">{task.title}</h3><p className="mt-1 text-[10px] text-slate-400">{task.client} · {task.project}</p><div className="mt-4 flex items-center justify-between"><span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock3 className="size-3" /> {task.due}</span><span className="text-[9px] font-medium text-slate-400">{task.progress}/6</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(task.progress / 6) * 100}%` }} /></div></article>)}</div></section>)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="grid grid-cols-[minmax(0,1fr)_140px_150px_100px] gap-4 border-b bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>Tarefa</span><span>Status</span><span>Prazo</span><span>Responsável</span></div>{filtered.map((task) => <button key={task.id} onClick={() => setSelected(task)} className="grid w-full grid-cols-[minmax(0,1fr)_140px_150px_100px] items-center gap-4 border-b px-5 py-4 text-left last:border-0 hover:bg-slate-50"><span><span className="block text-xs font-semibold">{task.title}</span><span className="mt-0.5 block text-[10px] text-slate-400">{task.client}</span></span><span className="text-[10px] font-semibold">{task.status}</span><span className="text-[11px] text-slate-500">{task.due}</span><span className="text-[11px] font-semibold">{task.owner}</span></button>)}</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Nova tarefa</DialogTitle><DialogDescription>Registre a solicitação e atribua o próximo responsável.</DialogDescription></DialogHeader><form action={addTask} className="space-y-4"><label className="block text-xs font-semibold">Título<input name="title" required className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-amber-400" placeholder="O que precisa ser feito?" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold">Cliente<select name="client" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"><option>Aurora Studio</option><option>Nexo Tecnologia</option><option>Casa Oliva</option></select></label><label className="block text-xs font-semibold">Prazo<input name="due" type="date" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 font-normal" /></label></div><DialogFooter className="mt-6"><button type="button" onClick={() => setOpen(false)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold">Cancelar</button><button type="submit" className="h-9 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-slate-950">Criar tarefa</button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={Boolean(selected)} onOpenChange={(value) => !value && setSelected(null)}><DialogContent className="sm:max-w-xl">{selected && <><DialogHeader><DialogTitle>{selected.title}</DialogTitle><DialogDescription>{selected.client} · {selected.project}</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-3"><Info label="Status" value={selected.status} /><Info label="Prazo" value={selected.due} /><Info label="Prioridade" value={selected.priority} /></div><div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between text-xs font-semibold"><span>Checklist de produção</span><span>{selected.progress} de 6</span></div><div className="mt-3 space-y-2">{['Conferir briefing', 'Criar primeira versão', 'Revisar conteúdo'].map((item, index) => <div key={item} className="flex items-center gap-2 text-xs text-slate-600"><span className={`grid size-4 place-items-center rounded border ${index < selected.progress ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-300'}`}>{index < selected.progress && <Check className="size-3" />}</span>{item}</div>)}</div></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold">Atividade recente</p><p className="mt-2 text-[11px] leading-relaxed text-slate-500"><strong className="text-slate-700">Marina</strong> mudou o status para {selected.status} · há 28 min</p></div><DialogFooter><button onClick={() => setSelected(null)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold">Fechar</button><button className="flex h-9 items-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-slate-950"><CalendarDays className="size-4" /> Atualizar tarefa</button></DialogFooter></>}</DialogContent></Dialog>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold text-slate-700">{value}</p></div>;
}
