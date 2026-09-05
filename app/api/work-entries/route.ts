import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { workEntries } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { isDepartmentKey } from '@/lib/work-entry';
import { requireWorkAccess } from '@/lib/work-access';

export async function GET() {
  try {
    const viewer = await requireWorkAccess();
    const query = getDb().select().from(workEntries);
    const data = viewer.isAdmin
      ? await query.orderBy(desc(workEntries.workDate), desc(workEntries.createdAt)).limit(500)
      : await query.where(eq(workEntries.targetDepartment, viewer.department!)).orderBy(desc(workEntries.workDate), desc(workEntries.createdAt)).limit(500);
    return Response.json({ data, viewer });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    const payload = await request.json() as Record<string, unknown>;
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const target = payload.targetDepartment;
    const requestedSource = payload.sourceDepartment;
    const workDate = typeof payload.workDate === 'string' ? payload.workDate : '';
    if (title.length < 3 || title.length > 180) return Response.json({ error: 'Informe um título entre 3 e 180 caracteres.' }, { status: 422 });
    if (!isDepartmentKey(target)) return Response.json({ error: 'Selecione a tag da equipe responsável.' }, { status: 422 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) return Response.json({ error: 'Informe uma data válida.' }, { status: 422 });
    const source = viewer.isAdmin && isDepartmentKey(requestedSource) ? requestedSource : viewer.department;
    if (!source) return Response.json({ error: 'Não foi possível identificar o setor de origem.' }, { status: 422 });

    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      title,
      details: typeof payload.details === 'string' ? payload.details.trim().slice(0, 10_000) || null : null,
      clientName: typeof payload.clientName === 'string' ? payload.clientName.trim().slice(0, 180) || null : null,
      serviceId: typeof payload.serviceId === 'string' && payload.serviceId ? payload.serviceId : null,
      sourceDepartment: source,
      targetDepartment: target,
      workDate,
      status: 'pending',
      createdById: viewer.userId,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().insert(workEntries).values(record);
    return Response.json({ data: record }, { status: 201 });
  } catch (error) {
    return authorizationResponse(error);
  }
}
