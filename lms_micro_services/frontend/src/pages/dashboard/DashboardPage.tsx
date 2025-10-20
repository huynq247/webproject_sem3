import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School,
  Assignment,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services/content.service';
import { assignmentService } from '../../services/assignment.service';
import { 
  GlassBackground, 
  GlassHeader, 
  GlassPaper, 
  GlassStatsCard 
} from '../../components/common/GlassTheme';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: contentService.getCourses,
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentService.getAssignments({ page: 1, size: 10 }),
  });

  const analyticsData = { total_students: 0, completion_rate: 0 };

  // Role-based stats
  const getStatsForRole = () => {
    const baseStats = [
      {
        title: 'Total Courses',
        value: coursesData?.courses?.length || 0,
        icon: <School />,
        color: 'primary',
      },
      {
        title: 'Total Assignments',
        value: assignmentsData?.assignments?.length || 0,
        icon: <Assignment />,
        color: 'secondary',
      },
    ];

    if (user?.role?.toUpperCase() === 'ADMIN') {
      return [
        ...baseStats,
        {
          title: 'Total Students',
          value: analyticsData?.total_students || 0,
          icon: <Person />,
          color: 'info',
        },
        {
          title: 'Total Teachers',
          value: 3, // Hardcoded for now, will implement user service later
          icon: <Person />,
          color: 'warning',
        },
      ];
    } else if (user?.role?.toUpperCase() === 'TEACHER') {
      return [
        ...baseStats,
        {
          title: 'My Students',
          value: analyticsData?.total_students || 0,
          icon: <Person />,
          color: 'info',
        },
        {
          title: 'Completion Rate',
          value: `${analyticsData?.completion_rate || 0}%`,
          icon: <DashboardIcon />,
          color: 'success',
        },
      ];
    } else {
      // STUDENT
      return [
        ...baseStats,
        {
          title: 'Completed',
          value: `${analyticsData?.completion_rate || 0}%`,
          icon: <DashboardIcon />,
          color: 'success',
        },
        {
          title: 'In Progress',
          value: assignmentsData?.assignments?.filter((a: any) => a.status === 'in_progress')?.length || 0,
          icon: <Assignment />,
          color: 'warning',
        },
      ];
    }
  };

  const stats = getStatsForRole();

  return (
    <GlassBackground>
      <Container maxWidth="lg">
        <GlassHeader
          icon="📊"
          title="Dashboard"
          subtitle={`Welcome back, ${user?.full_name || user?.username}!`}
        >
          <Chip 
            label={user?.role?.toUpperCase()} 
            sx={{
              background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)',
            }}
          />
        </GlassHeader>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 3, 
          mb: 4 
        }}>
          {stats.map((stat, index) => (
            <GlassStatsCard
              key={index}
              icon={stat.icon}
              iconColor={stat.color === 'primary' ? '#1e3c72' : stat.color === 'secondary' ? '#2a5298' : '#87CEEB'}
              value={stat.value}
              label={stat.title}
            />
          ))}
        </Box>

        {/* Recent Activity */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3 
        }}>
          <GlassPaper>
            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: 'bold'
                }}
              >
                Recent Courses
              </Typography>
              {coursesData?.courses?.slice(0, 3).map((course: any) => (
                <Box key={course.id} sx={{ 
                  mb: 2, 
                  p: 2, 
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {course.description}
                  </Typography>
                </Box>
              )) || <Typography sx={{ 
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)'
              }}>No courses available</Typography>}
            </Box>
          </GlassPaper>

          <GlassPaper>
            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: 'bold'
                }}
              >
                Recent Assignments
              </Typography>
              {assignmentsData?.assignments?.slice(0, 3).map((assignment: any) => (
                <Box key={assignment.id} sx={{ 
                  mb: 2,
                  p: 2, 
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    {assignment.title}
                  </Typography>
                  <Chip 
                    label={assignment.content_type} 
                    size="small" 
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </Box>
              )) || <Typography sx={{ 
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)'
              }}>No assignments available</Typography>}
            </Box>
          </GlassPaper>
        </Box>
      </Container>
    </GlassBackground>
  );
};

export default DashboardPage;
