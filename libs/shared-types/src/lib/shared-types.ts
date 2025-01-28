import { Generated } from 'kysely';

export function sharedTypes(): string {
  return 'shared-types';
}

export interface Database {
  inventory: InventoryRow;
  preferences: PreferenceRow;
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

export interface PaginatedInventory {
  data: InventoryRow[];
  total: number;
}

export interface InventoryStatsType {
  totalItems: number;
  totalVolume: number;
}

export interface PreferenceRow {
  id: Generated<number>;
  filename: string;
  timestamp: string;
  material: string;
  form: string;
  grade: string;
  choice: string | null;
  min_width: number | null;
  max_width: number | null;
  min_thickness: number | null;
  max_thickness: number | null;
}

export type PreferenceMatchRow = Omit<InventoryRow, 'id' | 'finish' | 'surface' | 'quantity'| 'location' | 'certificates'>