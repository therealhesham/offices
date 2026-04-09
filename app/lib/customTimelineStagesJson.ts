/**
 * يضمن أن JSON المراحل المخصصة يُقرأ ككائن { field: { ... } } وليس مصفوفة أو نصاً خاماً.
 */
export function normalizeCustomStagesPrev(
  raw: unknown
): Record<string, Record<string, unknown>> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown;
      if (p && typeof p === 'object' && !Array.isArray(p)) {
        return p as Record<string, Record<string, unknown>>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, Record<string, unknown>>;
  }
  return {};
}
