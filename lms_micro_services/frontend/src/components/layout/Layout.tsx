import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard,
  School,
  Assignment,
  Quiz,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlassButton } from '../common/GlassTheme';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { text: 'Courses', icon: <School />, path: '/courses', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { text: 'Lessons', icon: <School />, path: '/lessons', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { text: 'Assignments', icon: <Assignment />, path: '/assignments', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { text: 'Flashcards', icon: <Quiz />, path: '/decks', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    { text: 'All Flashcards', icon: <Quiz />, path: '/flashcards', roles: ['ADMIN'] },
    { text: 'User Management', icon: <Dashboard />, path: '/users', roles: ['ADMIN', 'TEACHER'] },
    { text: 'Analytics', icon: <Dashboard />, path: '/analytics', roles: ['ADMIN', 'TEACHER'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role?.toUpperCase() || '')
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(30, 60, 114, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(30,60,114,0.8) 0%, rgba(42,82,152,0.6) 50%, rgba(255,215,0,0.3) 100%)',
            zIndex: -1,
          },
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #FFD700, #FFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: '1.5rem'
            }}
          >
            🎓 Learning Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Welcome, {user?.full_name || user?.username} ({user?.role})
            </Typography>
            <Button 
              onClick={handleLogout} 
              startIcon={<ExitToApp />}
              size="small"
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255,107,107,0.3)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, rgba(30,60,114,0.9) 0%, rgba(255,215,0,0.3) 100%)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    margin: 1,
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: location.pathname === item.path 
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: location.pathname === item.path 
                      ? '1px solid rgba(255,255,255,0.5)'
                      : '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateX(4px)',
                      boxShadow: '4px 4px 15px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === item.path ? '#FFD700' : 'rgba(255,255,255,0.8)',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontWeight: 600,
                        color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.9)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      } 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
          p: 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
