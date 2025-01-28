import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import apiService, { SortField, SortOrder } from '../services/api.service';
import { InventoryRow } from '@org/shared-types';

export function DataTable() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [formChoiceSort, setFormChoiceSort] = useState<SortOrder | undefined>(undefined);

  const fetchInventory = useCallback(async () => {
    const response = await apiService.getInventory(
      page + 1, 
      rowsPerPage, 
      formChoiceSort
    );
    setInventory(response.data);
    setTotal(response.total);
  }, [page, rowsPerPage, formChoiceSort]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFormChoiceSort = () => {
    if (formChoiceSort === undefined) {
      setFormChoiceSort('asc');
    } else if (formChoiceSort === 'asc') {
      setFormChoiceSort('desc'); 
    } else {
      setFormChoiceSort(undefined);
    }
    setPage(0);
  };

  const formatDimensions = (row: InventoryRow): string => {
    const dimensions = [];
    if (row.length_mm) dimensions.push(`L=${row.length_mm}`);
    if (row.width_mm) dimensions.push(`W=${row.width_mm}`);
    if (row.height_mm) dimensions.push(`H=${row.height_mm}`);
    if (row.thickness_mm) dimensions.push(`T=${row.thickness_mm}`);
    if (row.outer_diameter_mm) dimensions.push(`OD=${row.outer_diameter_mm}`);
    if (row.wall_thickness_mm) dimensions.push(`Wt=${row.wall_thickness_mm}`);
    if (row.web_thickness_mm) dimensions.push(`Tw=${row.web_thickness_mm}`);
    if (row.flange_thickness_mm) dimensions.push(`Tf=${row.flange_thickness_mm}`);
    return dimensions.join(', ') || '-';
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Inventory Data</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product Number</TableCell>
              <TableCell>
                <TableSortLabel
                  active={!!formChoiceSort}
                  direction={formChoiceSort}
                  onClick={handleFormChoiceSort}
                >
                  Form & Choice
                </TableSortLabel>
              </TableCell>
              <TableCell>Grade & Surface</TableCell>
              <TableCell>Finish</TableCell>
              <TableCell>Dimensions (mm)</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>
                Total Weight (t) ↓
              </TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((row) => (
              <TableRow key={row.product_number}>
                <TableCell>{row.product_number}</TableCell>
                <TableCell>{`${row.form} ${row.choice}`}</TableCell>
                <TableCell>{`${row.grade} ${row.surface || ''}`}</TableCell>
                <TableCell>{row.finish || '-'}</TableCell>
                <TableCell>{formatDimensions(row)}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.weight_t}</TableCell>
                <TableCell>{row.location || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={Number(total)}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </>
  );
} 