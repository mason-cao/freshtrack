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

export interface PantryCategory {
  id: number;
  name: string;
  icon: string;
  defaultShelfLifeDays: number;
}
