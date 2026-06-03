import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const gold = '#c9a96e';
const darkBg = '#0a0a0a';
const cardBg = '#1a1a1a';
const borderColor = 'rgba(255,255,255,0.08)';

const baseTheme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
  },

  // ── Dark palette ────────────────────────────────────────────────────────────
  palette: {
    mode: 'dark',
    action: {
      hover: 'rgba(201,169,110,0.06)',
      selected: 'rgba(201,169,110,0.12)',
      focus: 'rgba(201,169,110,0.08)',
      disabledBackground: 'rgba(255,255,255,0.06)',
    },
    primary: {      main: gold,
      light: '#d4b87e',
      dark: '#b8935a',
      contrastText: '#0a0a0a',
    },
    secondary: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0284c7',
      contrastText: '#0a0a0a',
    },
    success:  { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning:  { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error:    { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    info:     { main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7' },
    background: {
      default: darkBg,
      paper: cardBg,
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255,255,255,0.55)',
      disabled: 'rgba(255,255,255,0.25)',
    },
    divider: borderColor,
  },

  // ── Typography ──────────────────────────────────────────────────────────────
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: '3rem', lineHeight: 1.2 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.25 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    body1: { fontSize: '0.9rem', lineHeight: 1.65 },
    body2: { fontSize: '0.82rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
  },

  spacing: 8,
  shape: { borderRadius: 0 }, // Sharp corners like the landing page

  shadows: [
    'none',
    '0 1px 4px rgba(0,0,0,0.4)',
    '0 2px 8px rgba(0,0,0,0.4)',
    '0 4px 12px rgba(0,0,0,0.4)',
    '0 8px 24px rgba(0,0,0,0.4)',
    '0 12px 32px rgba(0,0,0,0.5)',
    '0 16px 40px rgba(0,0,0,0.5)',
    '0 20px 48px rgba(0,0,0,0.5)',
    '0 24px 56px rgba(0,0,0,0.5)',
    '0 28px 64px rgba(0,0,0,0.5)',
    '0 32px 72px rgba(0,0,0,0.5)',
    '0 36px 80px rgba(0,0,0,0.5)',
    '0 40px 88px rgba(0,0,0,0.5)',
    '0 44px 96px rgba(0,0,0,0.5)',
    '0 48px 104px rgba(0,0,0,0.5)',
    '0 52px 112px rgba(0,0,0,0.5)',
    '0 56px 120px rgba(0,0,0,0.5)',
    '0 60px 128px rgba(0,0,0,0.5)',
    '0 64px 136px rgba(0,0,0,0.5)',
    '0 68px 144px rgba(0,0,0,0.5)',
    '0 72px 152px rgba(0,0,0,0.5)',
    '0 76px 160px rgba(0,0,0,0.5)',
    '0 80px 168px rgba(0,0,0,0.5)',
    '0 84px 176px rgba(0,0,0,0.5)',
    '0 88px 184px rgba(0,0,0,0.5)',
  ] as any,

  components: {
    // ── CssBaseline: dark body ─────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: darkBg, color: 'white' },
      },
    },

    // ── Card ──────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 0,
          boxShadow: 'none',
          transition: 'border-color 0.3s ease, transform 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(201,169,110,0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    // ── Paper ─────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: cardBg,
          backgroundImage: 'none',
          borderRadius: 0,
        },
      },
    },

    // ── Table ─────────────────────────────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${borderColor}`,
          color: 'rgba(255,255,255,0.75)',
          padding: '14px 16px',
          fontSize: '0.85rem',
        },
        head: {
          backgroundColor: '#111',
          color: 'rgba(255,255,255,0.45)',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderBottom: `1px solid ${borderColor}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(201,169,110,0.06) !important',
          },
          '&:last-child td': { borderBottom: 0 },
        },
        head: {
          '&:hover': { backgroundColor: 'transparent !important' },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { backgroundColor: 'transparent' },
      },
    },

    // ── TextField / Input ─────────────────────────────────────────────────
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            backgroundColor: 'rgba(255,255,255,0.03)',
            color: 'white',
            '& fieldset': { borderColor: borderColor },
            '&:hover fieldset': { borderColor: gold },
            '&.Mui-focused fieldset': { borderColor: gold, borderWidth: 1 },
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
          '& .MuiInputLabel-root.Mui-focused': { color: gold },
          '& .MuiInputBase-input': { color: 'white' },
          '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: 'rgba(255,255,255,0.03)',
          color: 'white',
          '& fieldset': { borderColor: borderColor },
          '&:hover fieldset': { borderColor: gold },
          '&.Mui-focused fieldset': { borderColor: gold, borderWidth: 1 },
        },
        input: { color: 'white' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.4)',
          '&.Mui-focused': { color: gold },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: 'rgba(255,255,255,0.4)' },
      },
    },

    // ── Button ────────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          minHeight: 42,
          transition: 'all 0.3s ease',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedPrimary: {
          backgroundColor: gold,
          color: darkBg,
          '&:hover': { backgroundColor: '#b8935a' },
        },
        outlinedPrimary: {
          borderColor: gold,
          color: gold,
          '&:hover': { backgroundColor: 'rgba(201,169,110,0.08)', borderColor: gold },
        },
        sizeSmall: { minHeight: 34, fontSize: '0.7rem', padding: '6px 14px' },
        sizeLarge: { minHeight: 50, fontSize: '0.82rem', padding: '14px 28px' },
      },
    },

    // ── Chip ──────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 500,
          fontSize: '0.72rem',
          letterSpacing: '0.05em',
          height: 24,
        },
      },
    },

    // ── Dialog ────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111',
          border: `1px solid ${borderColor}`,
          borderRadius: 0,
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: 'white',
          borderBottom: `1px solid ${borderColor}`,
          fontFamily: '"Playfair Display", Georgia, serif',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { color: 'rgba(255,255,255,0.75)' },
        dividers: { borderColor: borderColor },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { borderTop: `1px solid ${borderColor}`, padding: '16px 24px' },
      },
    },

    // ── Menu / Dropdown ───────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111',
          border: `1px solid ${borderColor}`,
          borderRadius: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.85rem',
          '&:hover': { backgroundColor: 'rgba(201,169,110,0.08)', color: gold },
          '&.Mui-selected': { backgroundColor: 'rgba(201,169,110,0.12)', color: gold },
        },
      },
    },

    // ── Divider ───────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: borderColor },
      },
    },

    // ── Alert ─────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid`,
        },
        standardError:   { backgroundColor: 'rgba(239,68,68,0.08)',   borderColor: 'rgba(239,68,68,0.25)',   color: '#f87171' },
        standardWarning: { backgroundColor: 'rgba(245,158,11,0.08)',  borderColor: 'rgba(245,158,11,0.25)',  color: '#fbbf24' },
        standardSuccess: { backgroundColor: 'rgba(16,185,129,0.08)',  borderColor: 'rgba(16,185,129,0.25)',  color: '#34d399' },
        standardInfo:    { backgroundColor: 'rgba(56,189,248,0.08)',  borderColor: 'rgba(56,189,248,0.25)',  color: '#7dd3fc' },
      },
    },

    // ── Tabs ──────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          '&.Mui-selected': { color: gold },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: gold, height: 2 },
      },
    },

    // ── FormControl / Select ──────────────────────────────────────────────
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.4)',
          '&.Mui-focused': { color: gold },
        },
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#222',
          border: `1px solid ${borderColor}`,
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.75rem',
          borderRadius: 0,
        },
        arrow: { color: '#222' },
      },
    },

    // ── IconButton ────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          color: 'rgba(255,255,255,0.5)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(201,169,110,0.1)',
            color: gold,
          },
        },
      },
    },

    // ── Avatar ────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(201,169,110,0.15)',
          color: gold,
          borderRadius: 0,
          fontWeight: 700,
        },
      },
    },

    // ── LinearProgress ────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 0,
        },
        bar: { borderRadius: 0 },
      },
    },

    // ── Pagination ────────────────────────────────────────────────────────
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.5)',
          borderRadius: 0,
          '&.Mui-selected': { backgroundColor: gold, color: darkBg },
          '&:hover': { backgroundColor: 'rgba(201,169,110,0.1)', color: gold },
        },
      },
    },

    // ── AppBar ────────────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: `1px solid ${borderColor}`,
        },
      },
    },

    // ── ListItemButton ────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          transition: 'all 0.2s ease',
          '&:hover': { backgroundColor: 'rgba(201,169,110,0.06)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(201,169,110,0.12)',
            '&:hover': { backgroundColor: 'rgba(201,169,110,0.16)' },
          },
        },
      },
    },
  },
});

export const theme = responsiveFontSizes(baseTheme);
