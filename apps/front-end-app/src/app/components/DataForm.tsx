import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

export function DataForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Preferences upload
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            required
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleChange}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Guest">Guest</MenuItem>
            </Select>
          </FormControl>
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
    </>
  );
} 