import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { clientOperations, clients } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { decodeStringList, isResultStatus, parseStringList, platformOptions } from '@/lib/operations';
import { requireWorkAccess } from '@/lib/work-access';

export async function GET() {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin && viewer.department !== 'trafego') return Response.json({ error: 'Esta área é exclusiva para Gestor de Tráfego.' }, { status: 403 });
    const rows = await getDb().select({ id: clients.id, name: clients.name, company: clients.company, resultStatus: clientOperations.resultStatus, platforms: clientOperations.platforms, googleCheckedAt: clientOperations.googleCheckedAt, metaCheckedAt: clientOperations.metaCheckedAt, operationNotes: clientOperations.operationNotes }).from(clients).leftJoin(clientOperations, eq(clients.id, clientOperations.clientId)).orderBy(asc(clients.name));
    return Response.json({ data: rows.map((row) => ({ ...row, resultStatus: row.resultStatus ?? 'pending', platforms: decodeStringList(row.platforms) })), viewer });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin && viewer.department !== 'trafego') return Response.json({ error: 'Esta área é exclusiva para Gestor de Tráfego.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const clientId = typeof payload.clientId === 'string' ? payload.clientId : '';
    if (!clientId) return Response.json({ error: 'Cliente não informado.' }, { status: 422 });
    const [existing] = await getDb().select().from(clientOperations).where(eq(clientOperations.clientId, clientId)).limit(1);
    const now = new Date().toISOString();
    const allowedPlatforms = platformOptions.map((item) => item.value);
    const values = {
      clientId,
      tier: existing?.tier ?? 'Prata', analystName: existing?.analystName ?? null, managerNames: existing?.managerNames ?? '[]',
      resultStatus: isResultStatus(payload.resultStatus) ? payload.resultStatus : existing?.resultStatus ?? 'pending',
      platforms: JSON.stringify(parseStringList(payload.platforms ?? decodeStringList(existing?.platforms ?? '[]'), allowedPlatforms)),
      dailyBudgetCents: existing?.dailyBudgetCents ?? null, intakeFormUrl: existing?.intakeFormUrl ?? null,
      operationNotes: typeof payload.operationNotes === 'string' ? payload.operationNotes.trim().slice(0, 10_000) || null : existing?.operationNotes ?? null,
      googleCheckedAt: typeof payload.googleCheckedAt === 'string' ? payload.googleCheckedAt || null : existing?.googleCheckedAt ?? null,
      metaCheckedAt: typeof payload.metaCheckedAt === 'string' ? payload.metaCheckedAt || null : existing?.metaCheckedAt ?? null,
      socialCheckedAt: existing?.socialCheckedAt ?? null, updatedById: viewer.userId, updatedAt: now,
    };
    await getDb().insert(clientOperations).values({ ...values, createdAt: existing?.createdAt ?? now }).onConflictDoUpdate({ target: clientOperations.clientId, set: values });
    return Response.json({ data: { ...values, platforms: JSON.parse(values.platforms) } });
  } catch (error) {
    return authorizationResponse(error);
  }
}
