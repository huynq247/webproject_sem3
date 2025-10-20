import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Glass Background Wrapper
export const GlassBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      background: '#1e3c72',
      py: 4
    }}
  >
    {children}
  </Box>
);

// Glass Header Component
export const GlassHeader: React.FC<{ 
  icon: string;
  title: string; 
  subtitle: string;
  children?: React.ReactNode;
}> = ({ icon, title, subtitle, children }) => (
  <Paper 
    elevation={8}
    sx={{ 
      mb: 4,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      border: '1px solid rgba(255,255,255,0.3)',
      p: 3
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
            background: 'linear-gradient(45deg, #1e3c72, #2a5298, #19547b, #1e3c72)',
            backgroundSize: '300% 300%',
            animation: 'gradient 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            '@keyframes gradient': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            }
          }}
        >
          {icon} {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#5A5A5A', fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Box>
      {children}
    </Box>
  </Paper>
);

// Glass Card/Paper Component
export const GlassPaper: React.FC<{ 
  children: React.ReactNode;
  elevation?: number;
}> = ({ children, elevation = 8 }) => (
  <Paper 
    elevation={elevation}
    sx={{
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 3,
    }}
  >
    {children}
  </Paper>
);

// Glass Stats Card
export const GlassStatsCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  value: string | number;
  label: string;
}> = ({ icon, iconColor, value, label }) => (
  <Paper 
    elevation={6}
    sx={{
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 3,
      color: 'white',
      p: 2,
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        background: 'rgba(255, 255, 255, 0.25)',
        boxShadow: '0 12px 40px rgba(255, 107, 107, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }}
  >
    <Box display="flex" alignItems="center">
      <Box 
        sx={{ 
          mr: 2,
          color: iconColor,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontSize: '1.5rem'
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ 
          opacity: 0.9,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Glass Button
export const GlassButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
  boxShadow: '0 3px 5px 2px rgba(30, 60, 114, .3)',
  borderRadius: 25,
  padding: '8px 24px',
  '&:hover': {
    background: 'linear-gradient(45deg, #19547b 30%, #1e3c72 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 4px rgba(30, 60, 114, .3)',
  },
  transition: 'all 0.3s ease'
}));

// Glass List Item Styles
export const getGlassListItemStyles = (index: number) => ({
  py: 2,
  px: 3,
  borderRadius: 2,
  mb: 1,
  mx: 1,
  background: index % 2 === 0 
    ? 'linear-gradient(90deg, rgba(30,60,114,0.6) 0%, rgba(42,82,152,0.4) 100%)'
    : 'linear-gradient(90deg, rgba(25,84,123,0.6) 0%, rgba(30,60,114,0.4) 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  cursor: 'pointer',
  '&:hover': {
    background: 'linear-gradient(90deg, rgba(30,60,114,0.3) 0%, rgba(42,82,152,0.2) 100%)',
    transform: 'translateX(8px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  transition: 'all 0.3s ease'
});

// Glass Avatar Styles
export const getGlassAvatarStyles = (gradientColors: string[]) => ({
  background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
  width: 48,
  height: 48,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  border: '2px solid rgba(255,255,255,0.5)',
});

// Glass Typography for dark backgrounds
export const getGlassTextStyles = (index: number) => ({
  color: index % 2 === 1 ? 'rgba(255,255,255,0.95)' : 'inherit',
  textShadow: index % 2 === 1 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
});
