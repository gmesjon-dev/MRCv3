import { and, asc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { activityLogs, departments, roles, users } from '@/db/schema';
import { authorizationResponse } from '@/lib/authorization';
import { accessRoleFromNames, accessRoleOptions, isAccessRoleKey, type AccessRoleKey } from '@/lib/user-management';
import { requireWorkAccess } from '@/lib/work-access';

const clean = (value: unknown, maximum: number) => typeof value === 'string' ? value.trim().slice(0, maximum) : '';
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function ensureRole(roleKey: AccessRoleKey) {
  const db = getDb();
  const option = accessRoleOptions.find((item) => item.key === roleKey)!;
  let [role] = await db.select().from(roles).where(eq(roles.name, option.label)).limit(1);
  const now = new Date().toISOString();
  if (!role) {
    role = { id: crypto.randomUUID(), name: option.label, description: `Acesso de ${option.label}`, isSystem: true, active: true, createdAt: now, updatedAt: now };
    await db.insert(roles).values(role);
  }
  let departmentId: string | null = null;
  if (option.department) {
    let [department] = await db.select().from(departments).where(eq(departments.name, option.department)).limit(1);
    if (!department) {
      department = { id: crypto.randomUUID(), name: option.department, description: `Equipe de ${option.label}`, color: '#fbbf24', active: true, createdAt: now, updatedAt: now };
      await db.insert(departments).values(department);
    }
    departmentId = department.id;
  }
  return { roleId: role.id, departmentId };
}

export async function GET() {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin) return Response.json({ error: 'Apenas administradores podem gerenciar usuários.' }, { status: 403 });
    const data = await getDb().select({ id: users.id, name: users.name, email: users.email, status: users.status, joinedAt: users.joinedAt, roleName: roles.name, departmentName: departments.name }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).leftJoin(departments, eq(users.departmentId, departments.id)).orderBy(asc(users.name));
    return Response.json({ data: data.map((item) => ({ ...item, roleKey: accessRoleFromNames(item.roleName, item.departmentName) })) });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin) return Response.json({ error: 'Apenas administradores podem cadastrar usuários.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const name = clean(payload.name, 140); const email = clean(payload.email, 254).toLowerCase(); const roleKey = payload.roleKey;
    if (name.length < 2 || !validEmail(email) || !isAccessRoleKey(roleKey)) return Response.json({ error: 'Preencha nome, e-mail válido e função.' }, { status: 422 });
    const [duplicate] = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (duplicate) return Response.json({ error: 'Já existe um usuário com este e-mail.' }, { status: 409 });
    const access = await ensureRole(roleKey); const now = new Date().toISOString();
    const record = { id: crypto.randomUUID(), externalAuthId: null, email, name, avatarUrl: null, roleId: access.roleId, departmentId: access.departmentId, phone: clean(payload.phone, 40) || null, joinedAt: now.slice(0, 10), status: 'active', lastSeenAt: null, createdAt: now, updatedAt: now };
    await getDb().insert(users).values(record);
    await getDb().insert(activityLogs).values({ id: crypto.randomUUID(), actorId: viewer.userId, entityType: 'user', entityId: record.id, action: 'created', after: JSON.stringify({ name, email, roleKey }), metadata: null, before: null, ipHash: null, createdAt: now });
    return Response.json({ data: { ...record, roleKey, roleName: accessRoleOptions.find((item) => item.key === roleKey)!.label, departmentName: accessRoleOptions.find((item) => item.key === roleKey)!.department } }, { status: 201 });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin) return Response.json({ error: 'Apenas administradores podem editar usuários.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>;
    const id = clean(payload.id, 80); const name = clean(payload.name, 140); const email = clean(payload.email, 254).toLowerCase(); const roleKey = payload.roleKey; const status = payload.status === 'inactive' ? 'inactive' : 'active';
    if (!id || name.length < 2 || !validEmail(email) || !isAccessRoleKey(roleKey)) return Response.json({ error: 'Dados do usuário inválidos.' }, { status: 422 });
    const [existing] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
    if (!existing) return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    const [duplicate] = await getDb().select({ id: users.id }).from(users).where(and(eq(users.email, email))).limit(1);
    if (duplicate && duplicate.id !== id) return Response.json({ error: 'Este e-mail já está sendo usado.' }, { status: 409 });
    if (id === viewer.userId && status === 'inactive') return Response.json({ error: 'Você não pode remover o próprio acesso.' }, { status: 409 });
    const access = await ensureRole(roleKey); const now = new Date().toISOString();
    await getDb().update(users).set({ name, email, roleId: access.roleId, departmentId: access.departmentId, phone: clean(payload.phone, 40) || null, status, updatedAt: now }).where(eq(users.id, id));
    await getDb().insert(activityLogs).values({ id: crypto.randomUUID(), actorId: viewer.userId, entityType: 'user', entityId: id, action: 'updated', before: JSON.stringify({ name: existing.name, email: existing.email, status: existing.status }), after: JSON.stringify({ name, email, roleKey, status }), metadata: null, ipHash: null, createdAt: now });
    return Response.json({ data: { id, name, email, phone: clean(payload.phone, 40) || null, roleKey, roleName: accessRoleOptions.find((item) => item.key === roleKey)!.label, departmentName: accessRoleOptions.find((item) => item.key === roleKey)!.department, status } });
  } catch (error) {
    return authorizationResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const viewer = await requireWorkAccess();
    if (!viewer.isAdmin) return Response.json({ error: 'Apenas administradores podem remover usuários.' }, { status: 403 });
    const payload = await request.json() as Record<string, unknown>; const id = clean(payload.id, 80);
    if (!id) return Response.json({ error: 'Usuário não informado.' }, { status: 422 });
    if (id === viewer.userId) return Response.json({ error: 'Você não pode remover o próprio acesso.' }, { status: 409 });
    const [existing] = await getDb().select({ id: users.id, name: users.name, status: users.status }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    const now = new Date().toISOString();
    await getDb().update(users).set({ status: 'inactive', updatedAt: now }).where(eq(users.id, id));
    await getDb().insert(activityLogs).values({ id: crypto.randomUUID(), actorId: viewer.userId, entityType: 'user', entityId: id, action: 'access_removed', before: JSON.stringify({ status: existing.status }), after: JSON.stringify({ status: 'inactive' }), metadata: JSON.stringify({ preservedHistory: true }), ipHash: null, createdAt: now });
    return Response.json({ data: { id, status: 'inactive' } });
  } catch (error) {
    return authorizationResponse(error);
  }
}
