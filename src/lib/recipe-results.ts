export const RECIPE_RESULT_LIMIT = 80;
export const RECIPE_CANDIDATE_LIMIT = 240;
export const RECIPE_SUGGESTION_LIMIT = 12;
export const RECIPE_SUGGESTION_CANDIDATE_LIMIT = 200;

export function uniqueRecipeRows<T extends { id: number }>(...groups: T[][]): T[] {
  const seen = new Set<number>();
  const result: T[] = [];

  for (const group of groups) {
    for (const row of group) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      result.push(row);
    }
  }

  return result;
}

export function facetValues(values: Array<string | null>): string[] {
  const labels = new Set<string>();
  for (const value of values) {
    const label = value?.trim();
    if (label) labels.add(label);
  }

  return [...labels].sort((a, b) => a.localeCompare(b));
}
