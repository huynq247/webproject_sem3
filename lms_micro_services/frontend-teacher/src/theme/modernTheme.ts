import { createTheme } from '@mui/material/styles';

// Modern Soft Glass Morphism Theme with Light Tones
export const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#a8b8f0',  // Lighter blue-purple
      light: '#c5d2f5',
      dark: '#8ca3eb',
      contrastText: '#1a202c',
    },
    secondary: {
      main: '#f5c2e7',  // Lighter pink
      light: '#f8d4ed',
      dark: '#f1afe1',
      contrastText: '#1a202c',
    },
    background: {
      default: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #e8f2ff 100%)',
      paper: 'rgba(255, 255, 255, 0.85)',
    },
    text: {
      primary: '#1a202c',  // Darker for better contrast
      secondary: '#2d3748',
    },
    success: {
      main: '#68d391',  // Lighter green
      light: '#9ae6b4',
      dark: '#48bb78',
    },
    warning: {
      main: '#fbb040',  // Lighter orange
      light: '#ffc071',
      dark: '#ed8936',
    },
    error: {
      main: '#fc8181',  // Lighter red
      light: '#feb2b2',
      dark: '#f56565',
    },
    info: {
      main: '#63b3ed',  // Lighter blue
      light: '#90cdf4',
      dark: '#4299e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,  // Bolder
      lineHeight: 1.2,
      background: 'linear-gradient(135deg, #a8b8f0 0%, #8ca3eb 50%, #b19cd9 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,  // Bolder
      lineHeight: 1.3,
      color: '#1a202c',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,  // Bolder
      lineHeight: 1.3,
      color: '#1a202c',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,  // Bolder
      lineHeight: 1.4,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,  // Bold
      lineHeight: 1.4,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,  // Bold
      lineHeight: 1.4,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 500,  // Medium weight for better readability
      lineHeight: 1.6,
      color: '#2d3748',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 500,  // Medium weight
      lineHeight: 1.6,
      color: '#4a5568',
    },
    button: {
      fontWeight: 600,  // Bold buttons
      letterSpacing: '0.02em',
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
    '0 8px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    '0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 8px -5px rgba(0, 0, 0, 0.05)',
    '0 12px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.06)',
    '0 14px 30px -5px rgba(0, 0, 0, 0.14), 0 10px 12px -5px rgba(0, 0, 0, 0.07)',
    '0 16px 35px -5px rgba(0, 0, 0, 0.16), 0 12px 14px -5px rgba(0, 0, 0, 0.08)',
    '0 18px 40px -5px rgba(0, 0, 0, 0.18), 0 14px 16px -5px rgba(0, 0, 0, 0.09)',
    '0 20px 45px -5px rgba(0, 0, 0, 0.2), 0 16px 18px -5px rgba(0, 0, 0, 0.1)',
    '0 22px 50px -5px rgba(0, 0, 0, 0.15), 0 18px 20px -5px rgba(0, 0, 0, 0.08)',
    '0 24px 55px -5px rgba(0, 0, 0, 0.15), 0 20px 22px -5px rgba(0, 0, 0, 0.08)',
    '0 26px 60px -5px rgba(0, 0, 0, 0.15), 0 22px 24px -5px rgba(0, 0, 0, 0.08)',
    '0 28px 65px -5px rgba(0, 0, 0, 0.15), 0 24px 26px -5px rgba(0, 0, 0, 0.08)',
    '0 30px 70px -5px rgba(0, 0, 0, 0.15), 0 26px 28px -5px rgba(0, 0, 0, 0.08)',
    '0 32px 75px -5px rgba(0, 0, 0, 0.15), 0 28px 30px -5px rgba(0, 0, 0, 0.08)',
    '0 34px 80px -5px rgba(0, 0, 0, 0.15), 0 30px 32px -5px rgba(0, 0, 0, 0.08)',
    '0 36px 85px -5px rgba(0, 0, 0, 0.15), 0 32px 34px -5px rgba(0, 0, 0, 0.08)',
    '0 38px 90px -5px rgba(0, 0, 0, 0.15), 0 34px 36px -5px rgba(0, 0, 0, 0.08)',
    '0 40px 95px -5px rgba(0, 0, 0, 0.15), 0 36px 38px -5px rgba(0, 0, 0, 0.08)',
    '0 42px 100px -5px rgba(0, 0, 0, 0.15), 0 38px 40px -5px rgba(0, 0, 0, 0.08)',
    '0 44px 105px -5px rgba(0, 0, 0, 0.15), 0 40px 42px -5px rgba(0, 0, 0, 0.08)',
    '0 46px 110px -5px rgba(0, 0, 0, 0.15), 0 42px 44px -5px rgba(0, 0, 0, 0.08)',
    '0 48px 115px -5px rgba(0, 0, 0, 0.15), 0 44px 46px -5px rgba(0, 0, 0, 0.08)',
    '0 50px 120px -5px rgba(0, 0, 0, 0.15), 0 46px 48px -5px rgba(0, 0, 0, 0.08)',
  ],
  components: {
    // Global CSS with softer background
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #e8f2ff 100%)',
          minHeight: '100vh',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 400,
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#a8b8f0 #f8faff',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#f8faff',
          borderRadius: '10px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, #a8b8f0 0%, #b19cd9 100%)',
          borderRadius: '10px',
        },
      },
    },
    // AppBar with softer glass effect
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(168, 184, 240, 0.2)',
          boxShadow: '0 4px 16px 0 rgba(168, 184, 240, 0.15)',
          color: '#1a202c',
        },
      },
    },
    // Paper with softer glass morphism
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 16px 0 rgba(168, 184, 240, 0.1)',
          borderRadius: '20px',
        },
      },
    },
    // Cards with softer hover effects
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px 0 rgba(168, 184, 240, 0.2)',
            border: '1px solid rgba(168, 184, 240, 0.3)',
          },
        },
      },
    },
    // Buttons with softer gradient and glass effect
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '12px 28px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.02em',
        },
        contained: {
          background: 'linear-gradient(135deg, #a8b8f0 0%, #b19cd9 100%)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 12px 0 rgba(168, 184, 240, 0.3)',
          color: '#1a202c',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #b19cd9 0%, #a8b8f0 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px 0 rgba(168, 184, 240, 0.4)',
          },
        },
        outlined: {
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(135deg, #a8b8f0 0%, #b19cd9 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
          backdropFilter: 'blur(10px)',
          color: '#1a202c',
          fontWeight: 600,
          '&:hover': {
            background: 'rgba(168, 184, 240, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Text fields with softer glass effect
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            fontWeight: 500,
            '& fieldset': {
              borderColor: 'rgba(168, 184, 240, 0.3)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(168, 184, 240, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a8b8f0',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 600,
            color: '#4a5568',
            '&.Mui-focused': {
              color: '#a8b8f0',
              fontWeight: 700,
            },
          },
        },
      },
    },
    // Chips with gradient
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#ffffff',
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, #48bb78 0%, #68d391 100%)',
          color: '#ffffff',
        },
        colorWarning: {
          background: 'linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)',
          color: '#ffffff',
        },
        colorError: {
          background: 'linear-gradient(135deg, #f56565 0%, #fc8181 100%)',
          color: '#ffffff',
        },
      },
    },
    // Drawer with glass effect
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    // List items with hover effects
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 8px',
          '&:hover': {
            background: 'rgba(102, 126, 234, 0.1)',
            backdropFilter: 'blur(10px)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
            borderLeft: '4px solid #667eea',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
            },
          },
        },
      },
    },
    // FAB with gradient
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 20px 0 rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 12px 30px 0 rgba(102, 126, 234, 0.6)',
          },
        },
      },
    },
    // Dialog with glass effect
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
        },
      },
    },
    // Linear Progress with gradient
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.3)',
        },
        bar: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
        },
      },
    },
  },
});

export default modernTheme;
