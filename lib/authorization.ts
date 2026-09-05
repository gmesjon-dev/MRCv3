import { and, eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/access-auth';
import { getDb } from '@/db';
import { permissions, rolePermissions, users } from '@/db/schema';

export class AuthorizationError extends Error {
  constructor(public status: 401 | 403, message: string) { super(message); }
}

export async function requireAuthorizedUser(permissionKey?: string) {
  const identity = await getAuthenticatedUser();
  if (!identity) throw new AuthorizationError(401, 'Sessão necessária.');

  const db = getDb();
  const [user] = await db.select().from(users).where(and(eq(users.externalAuthId, identity.userId), eq(users.status, 'active'))).limit(1);
  if (!user) throw new AuthorizationError(403, 'Usuário sem acesso ao workspace.');
  if (!permissionKey) return user;

  const [grant] = await db.select({ allowed: rolePermissions.allowed }).from(rolePermissions).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)).where(and(eq(rolePermissions.roleId, user.roleId), eq(permissions.key, permissionKey), eq(rolePermissions.allowed, true))).limit(1);
  if (!grant) throw new AuthorizationError(403, 'Você não tem permissão para esta ação.');
  return user;
}

export function authorizationResponse(error: unknown) {
  if (error instanceof AuthorizationError) return Response.json({ error: error.message }, { status: error.status });
  console.error('Unexpected authorization or data access failure', error);
  return Response.json({ error: 'Não foi possível concluir a operação.' }, { status: 500 });
}
