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
  LinearProgress,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import apiService, { SortOrder } from '../services/api.service';
import { InventoryRow } from '@org/shared-types';
import { getDimensions } from '../utils/dimension-formatter';

export function DataTable() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [formChoiceSort, setFormChoiceSort] = useState<SortOrder | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setShowLongLoadingMessage(false);
    
    // Start a timer to show the message if loading takes more than 3 seconds
    const loadingMessageTimer = setTimeout(() => {
      setShowLongLoadingMessage(true);
    }, 3000);

    try {
      const response = await apiService.getInventory(
        page + 1, 
        rowsPerPage, 
        formChoiceSort
      );
      setInventory(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      clearTimeout(loadingMessageTimer);
      setIsLoading(false);
    }
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

  return (
    <>
      <Typography variant="h4" gutterBottom>Inventory Data</Typography>
      <TableContainer component={Paper}>
        <Box sx={{ width: '100%', position: 'relative' }}>
          {isLoading && (
            <Box sx={{ width: '100%', position: 'absolute', top: 0, zIndex: 1 }}>
              <LinearProgress />
            </Box>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product Number</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={!!formChoiceSort}
                    direction={formChoiceSort}
                    onClick={handleFormChoiceSort}
                    disabled={isLoading}
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
                <TableRow 
                  key={row.product_number}
                  sx={{ opacity: isLoading ? 0.5 : 1 }}
                >
                  <TableCell>{row.product_number}</TableCell>
                  <TableCell>{`${row.form} ${row.choice}`}</TableCell>
                  <TableCell>{`${row.grade} ${row.surface || ''}`}</TableCell>
                  <TableCell>{row.finish || '-'}</TableCell>
                  <TableCell>{getDimensions(row)}</TableCell>
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
            disabled={isLoading}
          />
        </Box>
      </TableContainer>

      <Snackbar
        open={showLongLoadingMessage}
        onClose={() => setShowLongLoadingMessage(false)}
        autoHideDuration={6000}
      >
        <Alert severity="info" onClose={() => setShowLongLoadingMessage(false)}>
          The backend may have been spun down due to inactivity. The first request could take up to 1 minute.
        </Alert>
      </Snackbar>
    </>
  );
} 