export const departmentOptions = [
  { key: 'social_media', label: 'Social Media', tag: 'SOCIAL MEDIA' },
  { key: 'designer', label: 'Designer', tag: 'DESIGNER' },
  { key: 'trafego', label: 'Gestor de Tráfego', tag: 'TRÁFEGO' },
  { key: 'web', label: 'Web', tag: 'WEB' },
] as const;

export type DepartmentKey = (typeof departmentOptions)[number]['key'];

export function isDepartmentKey(value: unknown): value is DepartmentKey {
  return typeof value === 'string' && departmentOptions.some((item) => item.key === value);
}

export function departmentFromRole(roleName: string | null, departmentName: string | null): DepartmentKey | null {
  const value = `${roleName ?? ''} ${departmentName ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (value.includes('social') || value.includes('conteudo')) return 'social_media';
  if (value.includes('designer') || value.includes('design')) return 'designer';
  if (value.includes('trafego') || value.includes('performance')) return 'trafego';
  if (value.includes('web') || value.includes('desenvolvimento')) return 'web';
  return null;
}

export function isAdminRole(roleName: string | null): boolean {
  return /admin/i.test(roleName ?? '');
}

export function canViewDepartment(
  isAdmin: boolean,
  viewerDepartment: DepartmentKey | null,
  targetDepartment: DepartmentKey,
): boolean {
  return isAdmin || viewerDepartment === targetDepartment;
}
