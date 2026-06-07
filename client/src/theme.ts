import { createTheme, PaletteMode } from '@mui/material';
import type {} from '@mui/x-data-grid/themeAugmentation';


export const getTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#6366f1' : '#4f46e5', // Deep Indigo
        light: isDark ? '#818cf8' : '#6366f1',
        dark: isDark ? '#4f46e5' : '#3730a3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#fbbf24' : '#f59e0b', // Amber
        light: isDark ? '#fcd34d' : '#fbbf24',
        dark: isDark ? '#d97706' : '#b45309',
        contrastText: '#0f172a',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f8fafc', // Rich dark slate vs soft light grey
        paper: isDark ? '#111827' : '#ffffff',   // Dark vs white card surface
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        active: isDark ? '#94a3b8' : '#475569',
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      },
    },
    typography: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.25rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '1.75rem',
        letterSpacing: '-0.015em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '0.875rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#1f2937 #0b0f19' : '#cbd5e1 #f8fafc',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#0b0f19' : '#f8fafc',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#1f2937' : '#cbd5e1',
              borderRadius: '4px',
              '&:hover': {
                background: isDark ? '#374151' : '#94a3b8',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            background: isDark
              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            backgroundImage: 'none',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
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
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            transition: 'all 0.2s',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          },
          head: {
            fontWeight: 600,
            backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
            color: isDark ? '#f1f5f9' : '#0f172a',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            },
          },
        },
      } as any,
    },
  });
};
