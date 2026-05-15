import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create base theme with modern design and responsive settings
const baseTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Purple accent
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:960px)': {
        fontSize: '2.5rem',
      },
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:960px)': {
        fontSize: '2rem',
      },
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:960px)': {
        fontSize: '1.75rem',
      },
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.9375rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  spacing: 8, // Base spacing unit
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          minHeight: 44,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.6s, height 0.6s',
          },
          '&:hover': {
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:hover::before': {
            width: '300px',
            height: '300px',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '@media (max-width:600px)': {
            minHeight: 48,
            padding: '12px 24px',
            fontSize: '16px',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 12px 24px -8px rgba(37, 99, 235, 0.5)',
            transform: 'translateY(-3px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
          },
        },
        sizeSmall: {
          minHeight: 36,
          padding: '6px 16px',
          fontSize: '0.875rem',
          '@media (max-width:600px)': {
            minHeight: 40,
            padding: '8px 18px',
          },
        },
        sizeLarge: {
          minHeight: 52,
          padding: '14px 32px',
          fontSize: '1rem',
          '@media (max-width:600px)': {
            minHeight: 56,
            padding: '16px 36px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid transparent',
          '&:hover': {
            boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.25), 0 10px 20px -8px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-8px)',
            borderColor: 'rgba(37, 99, 235, 0.2)',
          },
          '@media (max-width:600px)': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '@media (max-width:600px)': {
            borderRadius: 8,
          },
        },
        elevation1: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        },
        elevation2: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        elevation3: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            minHeight: 44,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2563eb',
                borderWidth: 2,
              },
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: '#2563eb',
              },
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
            },
            '@media (max-width:600px)': {
              minHeight: 48,
            },
          },
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            '@media (max-width:600px)': {
              fontSize: '16px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          },
        },
        clickable: {
          '&:hover': {
            backgroundColor: '#2563eb',
            color: 'white',
          },
        },
        filled: {
          '&:hover': {
            filter: 'brightness(1.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            transform: 'translateX(8px)',
            paddingLeft: '24px',
          },
        },
        button: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.16)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          borderRadius: 10,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            transform: 'scale(1.1) rotate(5deg)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          },
          '@media (max-width:600px)': {
            minWidth: 48,
            minHeight: 48,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderBottom: '1px solid #e2e8f0',
          '@media (max-width:600px)': {
            padding: '12px 8px',
            fontSize: '0.875rem',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#475569',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 32,
          borderRadius: 16,
          '@media (max-width:600px)': {
            margin: 16,
            maxHeight: 'calc(100% - 32px)',
            borderRadius: 12,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          '@media (max-width:960px)': {
            width: '80%',
            maxWidth: 320,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.06)',
            transform: 'scale(1.005)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)',
            cursor: 'pointer',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
        head: {
          '&:hover': {
            backgroundColor: 'transparent',
            transform: 'none',
            boxShadow: 'none',
            cursor: 'default',
          },
        },
      },
    },
  },
});

// Apply responsive font sizes
export const theme = responsiveFontSizes(baseTheme);
