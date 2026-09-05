import { asc } from 'drizzle-orm';
import { getDb } from '@/db';
import { clients, clientStatuses } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { requireWorkAccess } from '@/lib/work-access';

export async function GET() {
  try {
    await requireWorkAccess();
    return Response.json({ data: await getDb().select().from(clients).orderBy(asc(clients.name)) });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin) return Response.json({ error: 'Apenas administradores podem cadastrar clientes.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (name.length < 2 || name.length > 180) return Response.json({ error: 'Informe um nome entre 2 e 180 caracteres.' }, { status: 422 });
    const db = getDb();
    let [status] = await db.select().from(clientStatuses).orderBy(asc(clientStatuses.position)).limit(1);
    if (!status) {
      status = { id: crypto.randomUUID(), name: 'Ativo', color: '#22c55e', position: 0, isClosed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await db.insert(clientStatuses).values(status);
    }
    const now = new Date().toISOString();
    const record = { id: crypto.randomUUID(), name, company: typeof payload.company === 'string' ? payload.company.trim().slice(0, 180) || null : null, email: typeof payload.email === 'string' ? payload.email.trim().slice(0, 254) || null : null, phone: typeof payload.phone === 'string' ? payload.phone.trim().slice(0, 40) || null : null, website: null, instagram: null, ownerId: viewer.userId, statusId: status.id, joinedAt: now.slice(0, 10), notes: null, logoUrl: null, createdAt: now, updatedAt: now };
    await db.insert(clients).values(record);
    return Response.json({ data: record }, { status: 201 });
  } catch (error) {
    return authorizationResponse(error);
  }
}
