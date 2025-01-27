import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import apiService from '../services/api.service';
import { Inventory } from '@org/shared-types';


export function DataTable() {
  const [inventory, setInventory] = useState<Inventory[]>([]);

  useEffect(() => {
    apiService.getInventory().then(setInventory);
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Inventory Data</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Number</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Form</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Weight (t)</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((row) => (
              <TableRow key={row.productNumber}>
                <TableCell>{row.productNumber}</TableCell>
                <TableCell>{row.material}</TableCell>
                <TableCell>{row.form}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.weight}</TableCell>
                <TableCell>{row.location || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
} 