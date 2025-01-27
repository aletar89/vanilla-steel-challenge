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
import { InventoryRow } from '@org/shared-types';

export function DataTable() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);

  useEffect(() => {
    apiService.getInventory().then(setInventory);
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Inventory Data</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product Number</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Form</TableCell>
              <TableCell>Choice</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Finish</TableCell>
              <TableCell>Surface</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Weight (t)</TableCell>
              <TableCell>Length (mm)</TableCell>
              <TableCell>Width (mm)</TableCell>
              <TableCell>Height (mm)</TableCell>
              <TableCell>Thickness (mm)</TableCell>
              <TableCell>Outer Diameter (mm)</TableCell>
              <TableCell>Wall Thickness (mm)</TableCell>
              <TableCell>Web Thickness (mm)</TableCell>
              <TableCell>Flange Thickness (mm)</TableCell>
              <TableCell>Certificates</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((row) => (
              <TableRow key={row.product_number}>
                <TableCell>{row.product_number}</TableCell>
                <TableCell>{row.material}</TableCell>
                <TableCell>{row.form}</TableCell>
                <TableCell>{row.choice}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>{row.finish || '-'}</TableCell>
                <TableCell>{row.surface || '-'}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.weight}</TableCell>
                <TableCell>{row.length_mm || '-'}</TableCell>
                <TableCell>{row.width_mm || '-'}</TableCell>
                <TableCell>{row.height_mm || '-'}</TableCell>
                <TableCell>{row.thickness_mm || '-'}</TableCell>
                <TableCell>{row.outer_diameter_mm || '-'}</TableCell>
                <TableCell>{row.wall_thickness_mm || '-'}</TableCell>
                <TableCell>{row.web_thickness_mm || '-'}</TableCell>
                <TableCell>{row.flange_thickness_mm || '-'}</TableCell>
                <TableCell>{row.certificates || '-'}</TableCell>
                <TableCell>{row.location || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
} 