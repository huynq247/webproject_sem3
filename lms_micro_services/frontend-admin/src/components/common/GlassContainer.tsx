import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface GlassContainerProps extends BoxProps {
  children: React.ReactNode;
  blur?: number;
  opacity?: number;
  gradient?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  blur = 20,
  opacity = 0.85,
  gradient = false,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        background: gradient 
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.9) 100%)'
          : `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 4px 16px 0 rgba(168, 184, 240, 0.15)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

interface GradientTextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  component?: React.ElementType;
  sx?: any;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  variant = 'primary',
  component = 'span',
  sx,
}) => {
  const gradients = {
    primary: 'linear-gradient(135deg, #a8b8f0 0%, #b19cd9 100%)',
    secondary: 'linear-gradient(135deg, #f5c2e7 0%, #f1afe1 100%)',
    success: 'linear-gradient(135deg, #68d391 0%, #9ae6b4 100%)',
    warning: 'linear-gradient(135deg, #fbb040 0%, #ffc071 100%)',
    error: 'linear-gradient(135deg, #fc8181 0%, #feb2b2 100%)',
  };

  const Component = component;

  return (
    <Component
      sx={{
        background: gradients[variant],
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 700,  // Bolder text
        ...sx,
      }}
    >
      {children}
    </Component>
  );
};

export default GlassContainer;
