import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import apiService from '../services/api.service';
import { DataItem, PreferenceResponse } from '../types/data.types';

export function DataForm() {
  const [formData, setFormData] = useState<DataItem>({
    id: 0,
    name: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: PreferenceResponse = await apiService.submitForm(formData);
      console.log(response);
      setShowSuccess(true);
      setFormData({ id: 0, name: '' }); // Reset form
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'id' ? Number(value) : value,
    }));
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Add New Item
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            name="id"
            label="ID"
            type="number"
            value={formData.id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            required
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">Item added successfully!</Alert>
      </Snackbar>
    </>
  );
} 