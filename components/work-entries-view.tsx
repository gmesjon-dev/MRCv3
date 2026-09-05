'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, CircleAlert, Clock3, Plus, Route } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { departmentOptions, isDepartmentKey, type DepartmentKey } from '@/lib/work-entry';

type Entry = { id: string; title: string; details: string | null; clientName: string | null; sourceDepartment: DepartmentKey; targetDepartment: DepartmentKey; workDate: string; status: string };
type Viewer = { isAdmin: boolean; department: DepartmentKey | null; displayName: string };

const labelByKey = Object.fromEntries(departmentOptions.map((item) => [item.key, item.label])) as Record<DepartmentKey, string>;

export function WorkEntriesView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [active, setActive] = useState<DepartmentKey>('social_media');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const response = await fetch('/api/work-entries');
    const body = await response.json() as { data?: Entry[]; viewer?: Viewer; error?: string };
    if (!response.ok) setError(body.error ?? 'Não foi possível carregar as entradas.');
    else {
      setEntries(body.data ?? []);
      setViewer(body.viewer ?? null);
      if (body.viewer?.department) setActive(body.viewer.department);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    const params = new URLSearchParams(window.location.search);
    if (params.get('nova') === '1') setOpen(true);
    const requestedDepartment = params.get('setor');
    if (isDepartmentKey(requestedDepartment)) setActive(requestedDepartment);
  }, []);

  const tabs = viewer?.isAdmin ? departmentOptions : departmentOptions.filter((item) => item.key === viewer?.department);
  const grouped = useMemo(() => {
    const result = new Map<string, Map<string, Map<string, Entry[]>>>();
    for (const entry of entries.filter((item) => item.targetDepartment === active)) {
      const [year, month, day] = entry.workDate.split('-');
      if (!result.has(year)) result.set(year, new Map());
      if (!result.get(year)!.has(month)) result.get(year)!.set(month, new Map());
      if (!result.get(year)!.get(month)!.has(day)) result.get(year)!.get(month)!.set(day, []);
      result.get(year)!.get(month)!.get(day)!.push(entry);
    }
    return result;
  }, [entries, active]);

  async function createEntry(form: FormData) {
    setSaving(true);
    setError('');
    const response = await fetch('/api/work-entries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    const body = await response.json() as { data?: Entry; error?: string };
    if (!response.ok) setError(body.error ?? 'Não foi possível criar a entrada.');
    else if (body.data) {
      setEntries((current) => [body.data!, ...current]);
      setActive(body.data.targetDepartment);
      setOpen(false);
      history.replaceState(null, '', '/entradas');
    }
    setSaving(false);
  }

  return <>
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {tabs.map((item) => <button key={item.key} onClick={() => setActive(item.key)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${active === item.key ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{item.label}<span className="ml-2 rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px]">{entries.filter((entry) => entry.targetDepartment === item.key).length}</span></button>)}
      </div>
      <button onClick={() => setOpen(true)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-bold text-slate-950"><Plus className="size-4" /> Nova entrada</button>
    </div>

    {error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><CircleAlert className="size-4" />{error}</div>}
    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando entradas…</div> : grouped.size === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Route className="mx-auto size-8 text-amber-500" /><h2 className="mt-3 text-base font-bold">Nenhuma entrada para {labelByKey[active]}</h2><p className="mt-1 text-sm text-slate-500">Use a tag {departmentOptions.find((item) => item.key === active)?.tag} para encaminhar um novo trabalho para esta aba.</p></div> : <div className="space-y-5">
      {[...grouped].map(([year, months]) => <section key={year} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 border-b bg-[#181818] px-5 py-3 text-white"><CalendarDays className="size-4 text-amber-300" /><h2 className="text-sm font-bold">{year}</h2></div><div className="divide-y">{[...months].map(([month, days]) => <details key={month} open className="group"><summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-sm font-bold"><ChevronDown className="size-4 transition group-open:rotate-180" />{new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(Number(year), Number(month) - 1, 1))}</summary><div className="border-t bg-slate-50/60 px-4 py-3 sm:px-5">{[...days].map(([day, dayEntries]) => <div key={day} className="grid gap-3 border-b border-slate-200 py-4 last:border-0 sm:grid-cols-[68px_1fr]"><div><span className="block text-2xl font-black text-slate-900">{day}</span><span className="text-[10px] font-semibold uppercase text-slate-400">{new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(new Date(`${year}-${month}-${day}T12:00:00`))}</span></div><div className="space-y-2">{dayEntries.map((entry) => <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-bold">{entry.title}</h3><p className="mt-1 text-xs text-slate-500">{entry.clientName || 'Sem cliente informado'}</p></div><span className="rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-900">{departmentOptions.find((item) => item.key === entry.targetDepartment)?.tag}</span></div>{entry.details && <p className="mt-3 text-sm leading-relaxed text-slate-600">{entry.details}</p>}<div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400"><Clock3 className="size-3.5" />Enviado por {labelByKey[entry.sourceDepartment]}</div></article>)}</div></div>)}</div></details>)}</div></section>)}
    </div>}

    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Nova entrada</DialogTitle><DialogDescription>A tag de destino define em qual aba o trabalho aparecerá.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); void createEntry(new FormData(event.currentTarget)); }} className="space-y-4"><label className="block text-sm font-semibold">Título<input name="title" required minLength={3} maxLength={180} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-amber-400" placeholder="Ex.: Criativos da campanha de setembro" /></label><div className="grid gap-4 sm:grid-cols-2">{viewer?.isAdmin && <label className="block text-sm font-semibold">Origem<select name="sourceDepartment" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal">{departmentOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>}<label className="block text-sm font-semibold">Tag de destino<select name="targetDepartment" defaultValue={active} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal">{departmentOptions.map((item) => <option key={item.key} value={item.key}>{item.tag}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Cliente<input name="clientName" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 font-normal" placeholder="Nome do cliente" /></label><label className="block text-sm font-semibold">Data<input name="workDate" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 font-normal" /></label></div><label className="block text-sm font-semibold">Orientações<textarea name="details" rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 font-normal" placeholder="Descreva o que precisa ser feito." /></label><DialogFooter><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold">Cancelar</button><button disabled={saving} type="submit" className="h-10 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? 'Salvando…' : 'Criar entrada'}</button></DialogFooter></form></DialogContent></Dialog>
  </>;
}
