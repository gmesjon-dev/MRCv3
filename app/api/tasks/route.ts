import { desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { activityLogs, tasks } from '@/db/schema';
import { authorizationResponse, requireAuthorizedUser } from '@/lib/authorization';

export async function GET() {
  try {
    await requireAuthorizedUser('tasks.view');
    const records = await getDb().select().from(tasks).where(isNull(tasks.deletedAt)).orderBy(desc(tasks.createdAt)).limit(100);
    return Response.json({ data: records });
  } catch (error) { return authorizationResponse(error); }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAuthorizedUser('tasks.create');
    const payload = await request.json() as Record<string, unknown>;
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (title.length < 3 || title.length > 180) return Response.json({ error: 'Título inválido.' }, { status: 422 });
    const required = ['clientId', 'taskTypeId', 'statusId', 'priorityId'];
    if (required.some((key) => typeof payload[key] !== 'string' || !payload[key])) return Response.json({ error: 'Campos obrigatórios ausentes.' }, { status: 422 });
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await getDb().batch([
      getDb().insert(tasks).values({ id, title, description: typeof payload.description === 'string' ? payload.description.slice(0, 20_000) : null, clientId: String(payload.clientId), projectId: typeof payload.projectId === 'string' ? payload.projectId : null, assigneeId: typeof payload.assigneeId === 'string' ? payload.assigneeId : null, createdById: actor.id, taskTypeId: String(payload.taskTypeId), statusId: String(payload.statusId), priorityId: String(payload.priorityId), workflowId: typeof payload.workflowId === 'string' ? payload.workflowId : null, dueAt: typeof payload.dueAt === 'string' ? payload.dueAt : null, createdAt: now, updatedAt: now }),
      getDb().insert(activityLogs).values({ id: crypto.randomUUID(), actorId: actor.id, entityType: 'task', entityId: id, action: 'task.created', after: JSON.stringify({ title }), createdAt: now }),
    ]);
    const [created] = await getDb().select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) { return authorizationResponse(error); }
}
