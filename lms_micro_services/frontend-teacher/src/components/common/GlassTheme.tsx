import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { currentTheme } from '../../theme/colors.config';
import { ThemeUtils } from '../../theme/utils';

// Glass Background Wrapper
export const GlassBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
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
    elevation={0}
    sx={{ 
      mb: 4,
      backgroundColor: '#ffffff',
      borderRadius: 3,
      border: '1px solid #e2e8f0',
      p: 3,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
            color: '#0f172a',
            fontWeight: 600,
          }}
        >
          {icon} {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
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
}> = ({ children, elevation = 0 }) => (
  <Paper 
    elevation={elevation}
    sx={{
      backgroundColor: '#ffffff',
      borderRadius: 3,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
    elevation={0}
    sx={{
      backgroundColor: '#ffffff',
      borderRadius: 3,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      p: 2,
    }}
  >
    <Box display="flex" alignItems="center">
      <Box 
        sx={{
          fontSize: '2rem',
          color: iconColor,
          mr: 2,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ 
          fontSize: '1.5rem',
          color: '#0f172a',
          fontWeight: 600,
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#64748b',
        }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Glass Button
export const GlassButton = styled(Button)(({ theme }) => ({
  ...ThemeUtils.getButton.primary(),
}));

// Glass List Item Styles
export const getGlassListItemStyles = (index: number) => ThemeUtils.getListItem(index);

// Glass Avatar Styles
export const getGlassAvatarStyles = (gradientColors: string[]) => ThemeUtils.getAvatar(gradientColors);

// Glass Typography for light backgrounds
export const getGlassTextStyles = (index: number) => ThemeUtils.getText.withShadow();
