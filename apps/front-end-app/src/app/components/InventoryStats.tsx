import { useEffect, useState } from 'react';
import { Paper, Typography, Stack } from '@mui/material';
import apiService from '../services/api.service';
import { InventoryStatsType } from '@org/shared-types';

export function InventoryStats() {
  const [stats, setStats] = useState<InventoryStatsType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiService.getInventoryStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load inventory statistics');
        console.error('Error loading stats:', err);
      }
    };

    loadStats();
  }, []);

  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={4} justifyContent="space-around">
        <Stack>
          <Typography variant="h6" color="text.secondary">Total Line Items</Typography>
          <Typography variant="h4">{stats?.totalItems || "Loading..."}</Typography>
        </Stack>
        <Stack>
          <Typography variant="h6" color="text.secondary">Total Volume</Typography>
          <Typography variant="h4">{stats?.totalVolume ? Math.round(stats.totalVolume) : "Loading..."} tons</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
} 