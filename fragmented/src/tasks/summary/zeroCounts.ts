export function zeroCounts<T extends string>(
  values: readonly T[]
): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<
    T,
    number
  >;
}
