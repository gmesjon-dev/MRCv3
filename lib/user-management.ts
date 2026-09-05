export const accessRoleOptions = [
  { key: 'admin', label: 'Administrador', department: null },
  { key: 'social_media', label: 'Social Media', department: 'Conteúdo' },
  { key: 'designer', label: 'Designer', department: 'Design' },
  { key: 'trafego', label: 'Gestor de Tráfego', department: 'Performance' },
  { key: 'web', label: 'Web', department: 'Desenvolvimento Web' },
] as const;

export type AccessRoleKey = (typeof accessRoleOptions)[number]['key'];

export function isAccessRoleKey(value: unknown): value is AccessRoleKey {
  return typeof value === 'string' && accessRoleOptions.some((item) => item.key === value);
}

export function accessRoleFromNames(roleName: string, departmentName: string | null): AccessRoleKey {
  const value = `${roleName} ${departmentName ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (value.includes('admin')) return 'admin';
  if (value.includes('social') || value.includes('conteudo')) return 'social_media';
  if (value.includes('designer') || value.includes('design')) return 'designer';
  if (value.includes('trafego') || value.includes('performance')) return 'trafego';
  return 'web';
}
