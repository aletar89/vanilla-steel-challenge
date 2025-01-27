export function sharedTypes(): string {
  return 'shared-types';
}

import { ColumnType } from 'kysely';

export interface Database {
  inventory: InventoryTable;
}

export interface InventoryTable {
  id: ColumnType<number>;
  productNumber: string;
  material: string;
  form: string;
  choice: string;
  grade: string;
  finish: string | null;
  surface: string | null;
  quantity: number;
  weight: number;
  length: number | null;
  width: number | null;
  height: number | null;
  thickness: number | null;
  outerDiameter: number | null;
  wallThickness: number | null;
  webThickness: number | null;
  flangeThickness: number | null;
  certificates: string | null;
  location: string | null;
  createdAt: ColumnType<Date>;
  updatedAt: ColumnType<Date>;
}

export type Inventory = Omit<InventoryTable, 'createdAt' | 'updatedAt'>;