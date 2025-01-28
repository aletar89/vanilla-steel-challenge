import { Box } from '@mui/material';
import { InventoryStats } from './InventoryStats';
import { DataTable } from './DataTable';

export function Inventory() {
  return (
    <Box>
      <InventoryStats />
      <DataTable />
    </Box>
  );
} 