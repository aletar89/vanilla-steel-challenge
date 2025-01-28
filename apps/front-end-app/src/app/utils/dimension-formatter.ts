import { PreferenceMatchRow } from '@org/shared-types';

export const getDimensions = (row: PreferenceMatchRow): string => {
  const dimensions = [];
  if (row.length_mm) dimensions.push(`L: ${row.length_mm}mm`);
  if (row.width_mm) dimensions.push(`W: ${row.width_mm}mm`);
  if (row.height_mm) dimensions.push(`H: ${row.height_mm}mm`);
  if (row.thickness_mm) dimensions.push(`T: ${row.thickness_mm}mm`);
  if (row.outer_diameter_mm) dimensions.push(`OD: ${row.outer_diameter_mm}mm`);
  if (row.wall_thickness_mm) dimensions.push(`Wt: ${row.wall_thickness_mm}mm`);
  if (row.web_thickness_mm) dimensions.push(`Tw: ${row.web_thickness_mm}mm`);
  if (row.flange_thickness_mm) dimensions.push(`Tf: ${row.flange_thickness_mm}mm`);
  return dimensions.join(', ') || 'N/A';
}; 