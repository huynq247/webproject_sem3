import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import { RoleBasedComponent, useRolePermission } from '../../components/common/RoleBasedComponent';

const AnalyticsPage: React.FC = () => {
  const { isAdmin } = useRolePermission();

  // Mock analytics data for now (TODO: Implement actual analytics API)
  const analyticsData = {
    total_students: 25,
    total_assignments: 12,
    completion_rate: 85,
    average_time_spent: 2.5
  };

  const adminStats = [
    {
      title: 'Total Students',
      value: analyticsData?.total_students || 0,
      icon: <People />,
      color: 'primary',
    },
    {
      title: 'Total Assignments',
      value: analyticsData?.total_assignments || 0,
      icon: <Assignment />,
      color: 'secondary',
    },
    {
      title: 'Completion Rate',
      value: `${analyticsData?.completion_rate || 0}%`,
      icon: <CheckCircle />,
      color: 'success',
    },
    {
      title: 'Avg. Study Time',
      value: `${analyticsData?.average_time_spent || 0}h`,
      icon: <TrendingUp />,
      color: 'info',
    },
  ];

  const teacherStats = [
    {
      title: 'My Students',
      value: analyticsData?.total_students || 0,
      icon: <People />,
      color: 'primary',
    },
    {
      title: 'Assignments Created',
      value: analyticsData?.total_assignments || 0,
      icon: <Assignment />,
      color: 'secondary',
    },
    {
      title: 'Class Completion Rate',
      value: `${analyticsData?.completion_rate || 0}%`,
      icon: <CheckCircle />,
      color: 'success',
    },
    {
      title: 'Avg. Study Time',
      value: `${analyticsData?.average_time_spent || 0}h`,
      icon: <TrendingUp />,
      color: 'info',
    },
  ];

  return (
    <RoleBasedComponent 
      allowedRoles={['ADMIN', 'TEACHER']} 
      fallback={
        <Container maxWidth="lg">
          <Alert severity="error">Access denied. Teacher or Admin privileges required.</Alert>
        </Container>
      }
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {isAdmin() ? 'System-wide Analytics' : 'Teaching Analytics'}
        </Typography>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 3, 
          mb: 4 
        }}>
          {(isAdmin() ? adminStats : teacherStats).map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Admin-only section */}
        <RoleBasedComponent allowedRoles={['ADMIN']}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              System Administration
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 3 
            }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Distribution
                  </Typography>
                  <Typography variant="body2">
                    Students: {analyticsData?.total_students || 0}
                  </Typography>
                  <Typography variant="body2">
                    Teachers: 3
                  </Typography>
                  <Typography variant="body2">
                    Admins: 1
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Health
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    All services operational
                  </Typography>
                  <Typography variant="body2">
                    Uptime: 99.9%
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Storage Usage
                  </Typography>
                  <Typography variant="body2">
                    Database: 250MB / 10GB
                  </Typography>
                  <Typography variant="body2">
                    Files: 150MB / 5GB
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </RoleBasedComponent>
      </Container>
    </RoleBasedComponent>
  );
};

export default AnalyticsPage;
