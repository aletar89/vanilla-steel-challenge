import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import apiService from '../services/api.service';
import { PreferenceMatchRow } from '@org/shared-types';
import { getDimensions } from '../utils/dimension-formatter';

export function DataForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PreferenceMatchRow[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.uploadCSV(file);
      setResults(response.data);
      if (response.data.length > 0) {
        setShowSuccess(true);
      } else {
        setError('No matching items found');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to process the CSV file. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Upload Preferences CSV
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file-upload">
            <Button variant="contained" component="span">
              Choose CSV File
            </Button>
          </label>
          {file && (
            <Typography variant="body1">
              Selected file: {file.name}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!file || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload and Process'}
          </Button>
        </Box>
      </Paper>

      {results.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Matching Inventory Items
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Number</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Form</TableCell>
                  <TableCell>Choice</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Dimensions</TableCell>
                  <TableCell>Weight (t)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.product_number}</TableCell>
                    <TableCell>{row.material}</TableCell>
                    <TableCell>{row.form}</TableCell>
                    <TableCell>{row.choice}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{getDimensions(row)}</TableCell>
                    <TableCell>{row.weight_t}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">Preferences processed and matching items found!</Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
} 