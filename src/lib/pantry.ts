// Shared client-side shape for rows returned by GET /api/items, so pages and
// components stay in sync with the API instead of re-declaring drifting copies.
export interface PantryItem {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryIcon: string | null;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  status?: string;
  costEstimate: number | null;
  notes: string | null;
  createdAt: string;
}

// Unit options offered by the add/edit item forms.
export const PANTRY_UNITS = [
  "count",
  "lbs",
  "oz",
  "cups",
  "bag",
  "box",
  "container",
  "carton",
  "bunch",
  "loaf",
  "cans",
] as const;
