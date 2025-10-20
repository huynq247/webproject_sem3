import { createTheme } from '@mui/material/styles';

// Clean Bright Professional Theme - Sáng, dễ nhìn, contrast cao
export const brightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',      // Blue chuyên nghiệp
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',      // Purple accent
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',   // Trắng xám nhẹ
      paper: '#ffffff',     // Trắng tinh
    },
    text: {
      primary: '#0f172a',   // Đen đậm rõ ràng
      secondary: '#475569', // Xám đậm
    },
    success: {
      main: '#10b981',      // Green tươi
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',      // Orange rõ ràng
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',      // Red rõ ràng
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6',      // Blue info
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.2,
      color: '#0f172a',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#0f172a',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#0f172a',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0f172a',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0f172a',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0f172a',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#1e293b',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#475569',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none' as const,
    },
  },
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
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 8px 16px rgba(0,0,0,0.14)',
    '0 12px 24px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 20px 40px rgba(0,0,0,0.2)',
    '0 24px 48px rgba(0,0,0,0.22)',
    '0 28px 56px rgba(0,0,0,0.24)',
    '0 32px 64px rgba(0,0,0,0.26)',
    '0 36px 72px rgba(0,0,0,0.28)',
    '0 40px 80px rgba(0,0,0,0.3)',
    '0 44px 88px rgba(0,0,0,0.32)',
    '0 48px 96px rgba(0,0,0,0.34)',
    '0 52px 104px rgba(0,0,0,0.36)',
    '0 56px 112px rgba(0,0,0,0.38)',
    '0 60px 120px rgba(0,0,0,0.4)',
    '0 64px 128px rgba(0,0,0,0.42)',
    '0 68px 136px rgba(0,0,0,0.44)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          fontFamily: '"Inter", sans-serif',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#f1f5f9',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            background: '#94a3b8',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-2px)',
            borderColor: '#cbd5e1',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1d4ed8',
          },
        },
        containedSecondary: {
          backgroundColor: '#7c3aed',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#6d28d9',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#e2e8f0',
          color: '#0f172a',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#2563eb',
            backgroundColor: '#eff6ff',
          },
        },
        text: {
          color: '#475569',
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            '& fieldset': {
              borderColor: '#e2e8f0',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#2563eb',
              fontWeight: 600,
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#0f172a',
            fontWeight: 500,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        colorPrimary: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #93c5fd',
        },
        colorSecondary: {
          backgroundColor: '#f3e8ff',
          color: '#6b21a8',
          border: '1px solid #d8b4fe',
        },
        colorSuccess: {
          backgroundColor: '#d1fae5',
          color: '#065f46',
          border: '1px solid #6ee7b7',
        },
        colorWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fcd34d',
        },
        colorError: {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          margin: '2px 8px',
          color: '#475569',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
          },
          '&.Mui-selected': {
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            fontWeight: 600,
            borderLeft: '4px solid #2563eb',
            '&:hover': {
              backgroundColor: '#bfdbfe',
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          height: '8px',
          backgroundColor: '#e2e8f0',
        },
        bar: {
          borderRadius: '8px',
          backgroundColor: '#2563eb',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: '#d1fae5',
          color: '#065f46',
          border: '1px solid #6ee7b7',
        },
        standardError: {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
        },
        standardWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fcd34d',
        },
        standardInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #93c5fd',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: '8px',
        },
      },
    },
  },
});

export default brightTheme;
