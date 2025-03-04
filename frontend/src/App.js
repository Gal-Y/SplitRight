import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import HomePage from './pages/HomePage';
import GroupPage from './pages/GroupPage';
import LoadTestPage from './pages/LoadTestPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Layout from './components/Layout';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4dabf5',
      light: '#6fbaf7',
      dark: '#3886c7',
    },
    secondary: {
      main: '#536dfe',
      light: '#758aff',
      dark: '#3d5afe',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#29b6f6',
    },
    success: {
      main: '#66bb6a',
    },
    text: {
      primary: '#e3f2fd',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.8), rgba(19, 47, 76, 1))',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
            width: 8,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#959595",
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups/:groupId" element={<GroupPage />} />
          <Route path="/load-test" element={<LoadTestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App; 