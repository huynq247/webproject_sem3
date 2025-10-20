import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Light Background Wrapper - Bright, easy to read
export const GlassBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #e8f2ff 100%)',
      py: 4
    }}
  >
    {children}
  </Box>
);

// Header Component - Clean and readable
export const GlassHeader: React.FC<{ 
  icon: string;
  title: string; 
  subtitle: string;
  children?: React.ReactNode;
}> = ({ icon, title, subtitle, children }) => (
  <Paper 
    elevation={3}
    sx={{ 
      mb: 4,
      background: '#ffffff',
      borderRadius: 3,
      border: '1px solid rgba(168, 184, 240, 0.2)',
      p: 3,
      boxShadow: '0 4px 20px rgba(168, 184, 240, 0.15)',
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontSize: '2.5rem', 
            mb: 1,
            color: '#7b8ec8',
            fontWeight: 700,
          }}
        >
          {icon} {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Box>
      {children}
    </Box>
  </Paper>
);

// Clean Card/Paper Component
export const GlassPaper: React.FC<{ 
  children: React.ReactNode;
  elevation?: number;
}> = ({ children, elevation = 2 }) => (
  <Paper 
    elevation={elevation}
    sx={{
      background: '#ffffff',
      border: '1px solid rgba(168, 184, 240, 0.2)',
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(168, 184, 240, 0.1)',
    }}
  >
    {children}
  </Paper>
);

// Clean Stats Card - Light and readable
export const GlassStatsCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  value: string | number;
  label: string;
}> = ({ icon, iconColor, value, label }) => (
  <Paper 
    elevation={2}
    sx={{
      background: '#ffffff',
      border: '1px solid rgba(168, 184, 240, 0.2)',
      borderRadius: 3,
      p: 2,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
        borderColor: '#a8b8f0',
      },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(168, 184, 240, 0.1)',
    }}
  >
    <Box display="flex" alignItems="center">
      <Box 
        sx={{ 
          mr: 2,
          color: iconColor,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold',
          fontSize: '1.5rem',
          color: '#1F2937',
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#6B7280',
        }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Modern Button
export const GlassButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #a8b8f0 0%, #7b8ec8 100%)',
  boxShadow: '0 4px 12px rgba(168, 184, 240, 0.3)',
  borderRadius: 12,
  padding: '10px 28px',
  color: '#ffffff',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, #7b8ec8 0%, #6674a8 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(168, 184, 240, 0.4)',
  },
  transition: 'all 0.3s ease'
}));

// Light List Item Styles - Clean and readable
export const getGlassListItemStyles = (index: number) => ({
  py: 2,
  px: 3,
  borderRadius: 2,
  mb: 1,
  mx: 1,
  background: '#ffffff',
  border: '1px solid rgba(168, 184, 240, 0.2)',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(168, 184, 240, 0.08)',
    transform: 'translateX(8px)',
    boxShadow: '0 4px 15px rgba(168, 184, 240, 0.15)',
    borderColor: '#a8b8f0',
  },
  transition: 'all 0.3s ease'
});

// Avatar Styles
export const getGlassAvatarStyles = (gradientColors: string[]) => ({
  background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
  width: 48,
  height: 48,
  boxShadow: '0 4px 12px rgba(168, 184, 240, 0.2)',
  border: '2px solid #ffffff',
});

// Typography for light backgrounds
export const getGlassTextStyles = (index: number) => ({
  color: '#1F2937',
});
