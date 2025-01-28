export function sharedTypes(): string {
  return 'shared-types';
}

export interface Database {
  inventory: InventoryRow;
}

export interface InventoryRow {
  id: number;
  product_number: string;
  material: string;
  form: string;
  choice: string;
  grade: string;
  finish: string | null;
  surface: string | null;
  quantity: number;
  weight_t: number;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  thickness_mm: number | null;
  outer_diameter_mm: number | null;
  wall_thickness_mm: number | null;
  web_thickness_mm : number | null;
  flange_thickness_mm: number | null;
  certificates: string | null;
  location: string | null;
}

export interface InventoryStatsType {
  totalItems: number;
  totalVolume: number;
}