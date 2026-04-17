export function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}
