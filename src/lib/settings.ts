export function readBoolean(key: string): boolean {
  try { return JSON.parse(localStorage.getItem(key) ?? 'false') === true; }
  catch { return false; }
}

export function readIds(key: string): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is number => Number.isInteger(id)))] : [];
  } catch { return []; }
}

export function saveSetting(key: string, value: string): void {
  try { localStorage.setItem(key, value); }
  catch { /* Storage may be unavailable; the current study session still works. */ }
}
