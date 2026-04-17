export function filterSearchText(search: string | undefined): string | undefined {
  return search?.toLocaleLowerCase();
}
