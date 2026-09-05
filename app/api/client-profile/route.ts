import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { clientOperations, clients, clientStatuses } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { decodeStringList, isResultStatus, parseStringList, platformOptions } from '@/lib/operations';
import { requireWorkAccess } from '@/lib/work-access';

function clean(value: unknown, maximum = 2_000) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) || null : null;
}

function cleanHttpUrl(value: unknown) {
  const candidate = clean(value, 2_000);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return Response.json({ error: 'Cliente não informado.' }, { status: 422 });
    const [record] = await getDb().select({
      id: clients.id, name: clients.name, company: clients.company, email: clients.email, phone: clients.phone,
      website: clients.website, instagram: clients.instagram, joinedAt: clients.joinedAt, notes: clients.notes,
      status: clientStatuses.name, statusColor: clientStatuses.color,
      tier: clientOperations.tier, analystName: clientOperations.analystName, managerNames: clientOperations.managerNames,
      resultStatus: clientOperations.resultStatus, platforms: clientOperations.platforms,
      dailyBudgetCents: clientOperations.dailyBudgetCents, intakeFormUrl: clientOperations.intakeFormUrl,
      operationNotes: clientOperations.operationNotes, googleCheckedAt: clientOperations.googleCheckedAt,
      metaCheckedAt: clientOperations.metaCheckedAt, socialCheckedAt: clientOperations.socialCheckedAt,
    }).from(clients).innerJoin(clientStatuses, eq(clients.statusId, clientStatuses.id))
      .leftJoin(clientOperations, eq(clients.id, clientOperations.clientId)).where(eq(clients.id, id)).limit(1);
    if (!record) return Response.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    return Response.json({ data: { ...record, tier: record.tier ?? 'Prata', resultStatus: record.resultStatus ?? 'pending', managerNames: decodeStringList(record.managerNames), platforms: decodeStringList(record.platforms) }, viewer });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin && viewer.department !== 'trafego') return Response.json({ error: 'Apenas administradores e gestores de tráfego podem alterar esta ficha.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const clientId = clean(payload.clientId, 80);
    if (!clientId) return Response.json({ error: 'Cliente não informado.' }, { status: 422 });
    const [client] = await getDb().select({ id: clients.id }).from(clients).where(eq(clients.id, clientId)).limit(1);
    if (!client) return Response.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    const resultStatus = isResultStatus(payload.resultStatus) ? payload.resultStatus : 'pending';
    const platforms = parseStringList(payload.platforms, platformOptions.map((item) => item.value));
    const managerNames = parseStringList(payload.managerNames).map((item) => item.slice(0, 100)).slice(0, 12);
    const dailyBudget = typeof payload.dailyBudget === 'number' ? payload.dailyBudget : Number(payload.dailyBudget);
    const now = new Date().toISOString();
    const values = {
      clientId, tier: clean(payload.tier, 30) ?? 'Prata', analystName: clean(payload.analystName, 100),
      managerNames: JSON.stringify(managerNames), resultStatus, platforms: JSON.stringify(platforms),
      dailyBudgetCents: Number.isFinite(dailyBudget) && dailyBudget >= 0 ? Math.round(dailyBudget * 100) : null,
      intakeFormUrl: cleanHttpUrl(payload.intakeFormUrl), operationNotes: clean(payload.operationNotes, 10_000),
      googleCheckedAt: clean(payload.googleCheckedAt, 10), metaCheckedAt: clean(payload.metaCheckedAt, 10),
      socialCheckedAt: clean(payload.socialCheckedAt, 10), updatedById: viewer.userId, updatedAt: now,
    };
    await getDb().insert(clientOperations).values({ ...values, createdAt: now }).onConflictDoUpdate({ target: clientOperations.clientId, set: values });
    return Response.json({ data: { ...values, dailyBudgetCents: values.dailyBudgetCents } });
  } catch (error) {
    return authorizationResponse(error);
  }
}
