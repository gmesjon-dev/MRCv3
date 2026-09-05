import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { creativeBriefings } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { requireWorkAccess } from '@/lib/work-access';

const statuses = ['new', 'in_progress', 'review', 'done'] as const;
const isStatus = (value: unknown): value is (typeof statuses)[number] => typeof value === 'string' && statuses.includes(value as (typeof statuses)[number]);
const clean = (value: unknown, maximum: number) => typeof value === 'string' ? value.trim().slice(0, maximum) : '';

export async function GET() {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin && !['social_media', 'designer'].includes(viewer.department ?? '')) return Response.json({ error: 'Esta área é exclusiva para Social Media e Designer.' }, { status: 403 });
    return Response.json({ data: await getDb().select().from(creativeBriefings).orderBy(desc(creativeBriefings.dueDate), desc(creativeBriefings.createdAt)).limit(500), viewer });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin && viewer.department !== 'social_media') return Response.json({ error: 'Apenas Social Media e administradores podem criar briefings.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const title = clean(payload.title, 180); const clientName = clean(payload.clientName, 180);
    const copyText = clean(payload.copyText, 20_000); const dueDate = clean(payload.dueDate, 10);
    if (title.length < 3 || !clientName || !copyText) return Response.json({ error: 'Preencha título, cliente e copy.' }, { status: 422 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return Response.json({ error: 'Informe um prazo válido.' }, { status: 422 });
    const now = new Date().toISOString();
    const record = { id: crypto.randomUUID(), title, clientName, format: clean(payload.format, 60) || 'Post', copyText, visualDirections: clean(payload.visualDirections, 10_000) || null, references: clean(payload.references, 4_000) || null, targetDepartment: 'designer', dueDate, status: 'new', createdById: viewer.userId, createdAt: now, updatedAt: now };
    await getDb().insert(creativeBriefings).values(record);
    return Response.json({ data: record }, { status: 201 });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin && viewer.department !== 'designer') return Response.json({ error: 'Apenas Designer e administradores podem atualizar o andamento.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const id = clean(payload.id, 80); const status = payload.status;
    if (!id || !isStatus(status)) return Response.json({ error: 'Atualização inválida.' }, { status: 422 });
    await getDb().update(creativeBriefings).set({ status, updatedAt: new Date().toISOString() }).where(eq(creativeBriefings.id, id));
    return Response.json({ data: { id, status } });
  } catch (error) {
    return authorizationResponse(error);
  }
}
