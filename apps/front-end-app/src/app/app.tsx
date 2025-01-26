import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { DataTable } from './components/DataTable';
import { DataForm } from './components/DataForm';

const theme = createTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Vanilla Steel Full Stack Code Challenge (by Alex Tarnavsky)
            </Typography>
            <Button color="inherit" component={Link} to="/table">
              Inventory
            </Button>
            <Button color="inherit" component={Link} to="/form">
              Preferences
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/table" element={<DataTable />} />
            <Route path="/form" element={<DataForm />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
