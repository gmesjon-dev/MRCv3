import { and, eq, isNull, or } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/access-auth';
import { getDb } from '@/db';
import { departments, roles, users } from '@/db/schema';
import { AuthorizationError } from '@/lib/authorization';
import { departmentFromRole, isAdminRole } from '@/lib/work-entry';

export async function requireWorkAccess() {
  const identity = await getAuthenticatedUser();
  if (!identity) throw new AuthorizationError(401, 'Sessão necessária.');

  const [record] = await getDb().select({
    id: users.id,
    roleName: roles.name,
    departmentName: departments.name,
  }).from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(and(eq(users.status, 'active'), or(eq(users.externalAuthId, identity.userId), and(isNull(users.externalAuthId), eq(users.email, identity.email.toLowerCase())))))
    .limit(1);

  if (!record) throw new AuthorizationError(403, 'Usuário sem acesso ao workspace.');

  await getDb().update(users).set({ externalAuthId: identity.userId, lastSeenAt: new Date().toISOString() }).where(and(eq(users.id, record.id), isNull(users.externalAuthId)));

  const admin = isAdminRole(record.roleName);
  const department = departmentFromRole(record.roleName, record.departmentName);
  if (!admin && !department) throw new AuthorizationError(403, 'Seu setor ainda não foi configurado.');
  return { userId: record.id, isAdmin: admin, department, displayName: identity.displayName };
}
