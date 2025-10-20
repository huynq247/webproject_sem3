import React from 'react';
import { Container, Typography } from '@mui/material';
import { GlassContainer, GradientText } from '../../components/common/GlassContainer';

const AnalyticsPageNew: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <GlassContainer>
        <GradientText variant="primary" component="h1">
          <Typography variant="h4" component="div">
            Analytics Dashboard
          </Typography>
        </GradientText>
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
          Analytics features will be implemented here.
        </Typography>
      </GlassContainer>
    </Container>
  );
};

export default AnalyticsPageNew;