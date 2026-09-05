import { asc } from 'drizzle-orm';
import { getDb } from '@/db';
import { services } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { isDepartmentKey } from '@/lib/work-entry';
import { requireWorkAccess } from '@/lib/work-access';

export async function GET() {
  try {
    await requireWorkAccess();
    return Response.json({ data: await getDb().select().from(services).orderBy(asc(services.name)) });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin) return Response.json({ error: 'Apenas administradores podem cadastrar serviços.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (name.length < 2 || name.length > 120) return Response.json({ error: 'Informe um nome entre 2 e 120 caracteres.' }, { status: 422 });
    if (!isDepartmentKey(payload.departmentKey)) return Response.json({ error: 'Selecione o setor responsável.' }, { status: 422 });
    const now = new Date().toISOString();
    const record = { id: crypto.randomUUID(), name, description: typeof payload.description === 'string' ? payload.description.trim().slice(0, 2_000) || null : null, departmentKey: payload.departmentKey, active: true, createdById: viewer.userId, createdAt: now, updatedAt: now };
    await getDb().insert(services).values(record);
    return Response.json({ data: record }, { status: 201 });
  } catch (error) {
    return authorizationResponse(error);
  }
}
