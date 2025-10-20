import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Bright Background Wrapper - Sáng, dễ nhìn
export const GlassBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      background: '#f8fafc', // Trắng xám nhẹ thay vì xanh tối
      py: 4
    }}
  >
    {children}
  </Box>
);

// Bright Header Component
export const GlassHeader: React.FC<{ 
  icon: string;
  title: string; 
  subtitle: string;
  children?: React.ReactNode;
}> = ({ icon, title, subtitle, children }) => (
  <Paper 
    elevation={2}
    sx={{ 
      mb: 4,
      background: '#ffffff', // Trắng tinh
      borderRadius: 4,
      border: '1px solid #e2e8f0',
      p: 3,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
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
            color: '#0f172a', // Đen đậm
            fontWeight: 800,
          }}
        >
          {icon} {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Box>
      {children}
    </Box>
  </Paper>
);

// Bright Card/Paper Component
export const GlassPaper: React.FC<{ 
  children: React.ReactNode;
  elevation?: number;
}> = ({ children, elevation = 1 }) => (
  <Paper 
    elevation={elevation}
    sx={{
      background: 'transparent',
      border: 'none',
      borderRadius: 4,
      boxShadow: 'none',
    }}
  >
    {children}
  </Paper>
);

// Bright Stats Card
export const GlassStatsCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  value: string | number;
  label: string;
}> = ({ icon, iconColor, value, label }) => (
  <Paper 
    elevation={1}
    sx={{
      background: '#ffffff', // Trắng tinh
      border: '1px solid #e2e8f0',
      borderRadius: 4,
      color: '#0f172a', // Đen đậm
      p: 3,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        transform: 'translateY(-2px)',
        borderColor: '#cbd5e1',
      },
    }}
  >
    <Box display="flex" alignItems="center">
      <Box 
        sx={{ 
          mr: 2,
          color: iconColor,
          fontSize: '2.5rem'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          fontSize: '2rem',
          color: '#0f172a'
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#64748b',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Bright Button - Professional blue
export const GlassButton = styled(Button)(({ theme }) => ({
  background: '#2563eb',
  color: '#ffffff',
  boxShadow: 'none',
  borderRadius: 10,
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    background: '#1d4ed8',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  transition: 'all 0.2s ease-in-out'
}));

// Bright List Item Styles
export const getGlassListItemStyles = (index: number) => ({
  py: 2,
  px: 3,
  borderRadius: 3,
  mb: 1,
  mx: 1,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  '&:hover': {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
    transform: 'translateX(4px)',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  transition: 'all 0.2s ease-in-out'
});

// Bright Avatar Styles
export const getGlassAvatarStyles = (gradientColors: string[]) => ({
  background: gradientColors[0] || '#2563eb',
  width: 48,
  height: 48,
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  border: '2px solid #e2e8f0',
});

// Bright Typography
export const getGlassTextStyles = (index: number) => ({
  color: '#0f172a',
  fontWeight: 500,
});
