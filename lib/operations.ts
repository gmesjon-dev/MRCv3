export const resultOptions = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bom' },
  { value: 'attention', label: 'Atenção' },
  { value: 'poor', label: 'Ruim' },
  { value: 'pending', label: 'Pendente' },
] as const;

export const platformOptions = [
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
  { value: 'social', label: 'Social Media' },
] as const;

export type ResultStatus = (typeof resultOptions)[number]['value'];
export type PlatformKey = (typeof platformOptions)[number]['value'];

export function isResultStatus(value: unknown): value is ResultStatus {
  return typeof value === 'string' && resultOptions.some((item) => item.value === value);
}

export function parseStringList(value: unknown, allowed?: readonly string[]): string[] {
  const list = Array.isArray(value) ? value : [];
  return [...new Set(list.filter((item): item is string => typeof item === 'string' && (!allowed || allowed.includes(item))))];
}

export function decodeStringList(value: string | null): string[] {
  try {
    return parseStringList(JSON.parse(value ?? '[]'));
  } catch {
    return [];
  }
}
